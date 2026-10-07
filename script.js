const KEY = "mySavingsApp";
let state = { goal: 0, deadline: "", items: [] };

try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && Array.isArray(s.items)) state = Object.assign(state, s); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };
const $ = id => document.getElementById(id);
const fmt = n => "KSh " + Number(n).toLocaleString("en-KE");
const balance = (items = state.items) => items.reduce((t, i) => t + (i.type === "add" ? i.amount : -i.amount), 0);

function daysLeft() {
  if (!state.deadline) return null;
  const end = new Date(state.deadline + "T23:59:59");
  return Math.ceil((end - Date.now()) / 86400000);
}

function dailyTarget() {
  const remaining = state.goal - balance();
  if (state.goal <= 0 || !state.deadline || remaining <= 0) return null;
  const days = daysLeft();
  if (days <= 0) return { late: true, remaining };
  return { daily: Math.ceil(remaining / days), weekly: Math.ceil(remaining / days * 7), days, remaining };
}

function miniBtn(label, fn) {
  const b = document.createElement("button");
  b.className = "mini"; b.textContent = label; b.onclick = fn;
  return b;
}

function renderHistory() {
  const ul = $("history");
  ul.innerHTML = "";
  if (!state.items.length) { ul.innerHTML = '<li class="small">No transactions yet. Add your first savings above.</li>'; return; }
  state.items.map((it, idx) => ({ it, idx })).reverse().forEach(({ it: i, idx }) => {
    const li = document.createElement("li");
    const left = document.createElement("div");
    const note = document.createElement("div");
    note.className = "note"; note.textContent = i.note || (i.type === "add" ? "Savings" : "Withdrawal");
    const date = document.createElement("div");
    date.className = "date"; date.textContent = new Date(i.date).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" });
    left.append(note, date);
    const right = document.createElement("div");
    right.className = "right";
    const amt = document.createElement("div");
    amt.className = i.type === "add" ? "plus" : "minus";
    amt.textContent = (i.type === "add" ? "+ " : "− ") + fmt(i.amount);
    const acts = document.createElement("div");
    acts.className = "acts";
    acts.append(miniBtn("Edit", () => editItem(idx)), miniBtn("Delete", () => deleteItem(idx)));
    right.append(amt, acts);
    li.append(left, right);
    ul.append(li);
  });
}

function renderMonthly() {
  const months = {};
  state.items.forEach(i => {
    const d = new Date(i.date);
    const k = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
    months[k] = months[k] || { add: 0, out: 0 };
    months[k][i.type] += i.amount;
  });
  const keys = Object.keys(months).sort().reverse();
  const box = $("monthly");
  if (!keys.length) { box.innerHTML = '<p class="small">Your monthly summary appears after your first transaction.</p>'; return; }
  const max = Math.max(1, ...keys.map(k => Math.max(months[k].add, months[k].out)));
  box.innerHTML = keys.map(k => {
    const [y, m] = k.split("-");
    const name = new Date(y, m - 1).toLocaleString("en-KE", { month: "long", year: "numeric" });
    const { add, out } = months[k];
    const row = (label, val, color) =>
      `<div class="mrow"><span>${label}</span><div><div class="mbar" style="width:${Math.round(val / max * 100)}%;background:${color}"></div></div><span class="mval">${fmt(val)}</span></div>`;
    return `<div class="month"><div class="mname">${name}</div>${row("Saved", add, "var(--green)")}${row("Withdrawn", out, "var(--red)")}<div class="mnet">Net: ${add - out < 0 ? "−" : ""}${fmt(Math.abs(add - out))}</div></div>`;
  }).join("");
}

const dayNum = ts => { const d = new Date(ts); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000); };

function streaks() {
  const days = [...new Set(state.items.filter(i => i.type === "add").map(i => dayNum(i.date)))].sort((a, b) => a - b);
  let best = 0, run = 0;
  days.forEach((d, k) => { run = (k > 0 && d === days[k - 1] + 1) ? run + 1 : 1; best = Math.max(best, run); });
  const set = new Set(days), t = dayNum(Date.now()), savedToday = set.has(t);
  let cur = 0, d = savedToday ? t : t - 1;
  while (set.has(d)) { cur++; d--; }
  return { cur, best, savedToday };
}

function renderStreak() {
  const s = streaks();
  $("streakMain").textContent = s.cur > 0 ? "🔥 " + s.cur + "-day streak" : "Start your saving streak";
  let sub = s.savedToday ? "You've saved today. Come back tomorrow to keep it going."
    : (s.cur > 0 ? "Save something today to keep your streak alive." : "Save any amount today to start.");
  if (s.best > 0) sub += " Best streak: " + s.best + (s.best === 1 ? " day." : " days.");
  $("streakSub").textContent = sub;
}

function render() {
  const total = balance();
  $("total").textContent = fmt(total);
  const pct = state.goal > 0 ? Math.min(100, Math.round(total / state.goal * 100)) : 0;
  $("fill").style.width = pct + "%";
  $("pct").textContent = pct + "% saved";
  $("remaining").textContent = state.goal > 0
    ? (total >= state.goal ? "🎉 Goal reached!" : "Remaining: " + fmt(state.goal - total))
    : "Set a goal to track your progress";
  if (state.goal) $("goalInput").value = state.goal;
  if (state.deadline) $("deadlineInput").value = state.deadline;

  const t = dailyTarget(), box = $("target");
  box.className = "center target";
  if (t && t.late) {
    box.classList.add("late");
    box.textContent = "Deadline has passed. Set a new date to get a daily target.";
  } else if (t) {
    box.textContent = "Save " + fmt(t.daily) + " a day (" + fmt(t.weekly) + " a week) for the next " + t.days + " days to reach your goal.";
  } else {
    box.textContent = (state.goal > 0 && !state.deadline) ? "Add a deadline to see your daily target." : "";
  }
  renderStreak();
  renderMonthly();
  renderHistory();
}

function record(type, amtId, noteId, msgId) {
  const amount = parseFloat($(amtId).value);
  const msg = $(msgId); msg.textContent = "";
  if (!(amount > 0)) { msg.textContent = "Enter an amount greater than 0."; return; }
  if (type === "out" && amount > balance()) { msg.textContent = "You can't withdraw more than you have saved (" + fmt(balance()) + ")."; return; }
  if (type === "out") {
    const t = dailyTarget();
    let text = "Withdraw " + fmt(amount) + "?\n\nYour balance will drop to " + fmt(balance() - amount) + ".";
    if (t && t.daily) text += "\nThis sets you back about " + Math.ceil(amount / t.daily) + " day(s) of saving.";
    text += "\n\nIs this really necessary?";
    if (!confirm(text)) return;
  }
  state.items.push({ type, amount, note: $(noteId).value.trim(), date: Date.now() });
  $(amtId).value = ""; $(noteId).value = "";
  save(); render();
}

function editItem(idx) {
  const it = state.items[idx];
  const a = prompt("Amount (KSh):", it.amount);
  if (a === null) return;
  const amount = parseFloat(a);
  if (!(amount > 0)) { alert("Enter an amount greater than 0."); return; }
  const n = prompt("Note:", it.note || "");
  if (n === null) return;
  const copy = state.items.map((x, k) => k === idx ? { ...x, amount, note: n.trim() } : x);
  if (balance(copy) < 0) { alert("That change would make your balance negative."); return; }
  state.items = copy; save(); render();
}

function deleteItem(idx) {
  const it = state.items[idx];
  if (!confirm("Delete this " + (it.type === "add" ? "saving" : "withdrawal") + " of " + fmt(it.amount) + "?")) return;
  const copy = state.items.filter((_, k) => k !== idx);
  if (balance(copy) < 0) { alert("You can't delete this because your balance would go negative."); return; }
  state.items = copy; save(); render();
}

function download(name, text, type) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
const today = () => new Date().toISOString().slice(0, 10);

function exportCsv() {
  const cell = v => { v = String(v); if (/^[=+\-@]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; };
  const rows = ["Date,Type,Amount,Note"].concat(state.items.map(i =>
    [cell(new Date(i.date).toLocaleString("en-KE")), i.type === "add" ? "Saved" : "Withdrawn", i.amount, cell(i.note || "")].join(",")));
  download("my-savings-" + today() + ".csv", rows.join("\n"), "text/csv");
}

function backup() { download("my-savings-backup-" + today() + ".json", JSON.stringify(state, null, 2), "application/json"); }

function restore(file) {
  const msg = $("toolMsg"); msg.textContent = "";
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const d = JSON.parse(reader.result);
      const ok = d && Array.isArray(d.items) && d.items.every(i => (i.type === "add" || i.type === "out") && i.amount > 0 && isFinite(i.date));
      if (!ok) throw new Error("bad file");
      if (!confirm("Replace your current data with this backup (" + d.items.length + " transactions)?")) return;
      state = {
        goal: Number(d.goal) > 0 ? Number(d.goal) : 0,
        deadline: typeof d.deadline === "string" ? d.deadline : "",
        items: d.items.map(i => ({ type: i.type, amount: Number(i.amount), note: String(i.note || ""), date: Number(i.date) }))
      };
      save(); render();
    } catch (e) { msg.textContent = "That file isn't a valid backup."; }
  };
  reader.readAsText(file);
}

$("addBtn").onclick = () => record("add", "addAmt", "addNote", "addMsg");
$("wdBtn").onclick = () => record("out", "wdAmt", "wdNote", "wdMsg");
$("setGoal").onclick = () => {
  const g = parseFloat($("goalInput").value);
  if (g > 0) { state.goal = g; state.deadline = $("deadlineInput").value; save(); render(); }
};
$("csvBtn").onclick = exportCsv;
$("backupBtn").onclick = backup;
$("restoreBtn").onclick = () => $("restoreFile").click();
$("restoreFile").onchange = e => { if (e.target.files[0]) restore(e.target.files[0]); e.target.value = ""; };
$("clearBtn").onclick = () => {
  if (confirm("Delete all savings, history and goal? This cannot be undone.")) {
    state = { goal: 0, deadline: "", items: [] }; $("goalInput").value = ""; $("deadlineInput").value = ""; save(); render();
  }
};

// ---------- PIN lock ----------
const PIN_KEY = "mySavingsPin";
const getPin = () => { try { return JSON.parse(localStorage.getItem(PIN_KEY)); } catch (e) { return null; } };

async function hashPin(pin, salt) {
  const text = salt + ":" + pin;
  if (window.crypto && crypto.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  }
  let h = 0; for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return String(h);
}

function lock() {
  document.body.classList.add("locked");
  $("lockPin").value = ""; $("lockMsg").textContent = "";
  setTimeout(() => $("lockPin").focus(), 0);
}
function unlockUI() { document.body.classList.remove("locked"); $("lockPin").value = ""; $("lockMsg").textContent = ""; }

let fails = 0, blockedUntil = 0;
async function tryUnlock() {
  const p = getPin();
  if (!p) { unlockUI(); return; }
  const wait = Math.ceil((blockedUntil - Date.now()) / 1000);
  if (wait > 0) { $("lockMsg").textContent = "Too many wrong tries. Wait " + wait + " seconds."; return; }
  const ok = (await hashPin($("lockPin").value, p.salt)) === p.hash;
  if (ok) { fails = 0; unlockUI(); return; }
  fails++;
  $("lockPin").value = "";
  if (fails >= 5) { fails = 0; blockedUntil = Date.now() + 30000; $("lockMsg").textContent = "Too many wrong tries. Wait 30 seconds."; }
  else $("lockMsg").textContent = "Wrong PIN. Try again.";
}

function updateSecurityUI() {
  const has = !!getPin();
  $("pinStatus").textContent = has ? "PIN lock is on. The app locks when you open it and after a minute away." : "No PIN set. Anyone who opens this page can see and change your savings.";
  $("savePinBtn").textContent = has ? "Change PIN" : "Set PIN";
  $("lockNowBtn").hidden = !has;
  $("removePinBtn").hidden = !has;
}

async function savePin() {
  const pin = $("newPin").value.trim(), msg = $("pinMsg");
  msg.className = "msg";
  if (!/^\d{4,6}$/.test(pin)) { msg.textContent = "PIN must be 4 to 6 digits."; return; }
  const salt = Math.random().toString(36).slice(2) + Date.now().toString(36);
  try { localStorage.setItem(PIN_KEY, JSON.stringify({ salt, hash: await hashPin(pin, salt) })); }
  catch (e) { msg.textContent = "Couldn't save the PIN in this browser."; return; }
  $("newPin").value = "";
  msg.className = "msg ok"; msg.textContent = "PIN saved. Remember it: you'll need it to open the app.";
  updateSecurityUI();
}

function removePin() {
  if (!confirm("Remove the PIN lock? Anyone who opens this page will see your savings.")) return;
  try { localStorage.removeItem(PIN_KEY); } catch (e) {}
  $("pinMsg").textContent = ""; updateSecurityUI();
}

function forgotPin() {
  if (!confirm("Forgot your PIN?\n\nThe only way in is to erase ALL savings data in this browser and remove the PIN. You can restore from a Backup file afterwards.\n\nErase everything?")) return;
  try { localStorage.removeItem(PIN_KEY); localStorage.removeItem(KEY); } catch (e) {}
  state = { goal: 0, deadline: "", items: [] };
  $("goalInput").value = ""; $("deadlineInput").value = "";
  unlockUI(); updateSecurityUI(); render();
}

let hiddenAt = 0;
document.addEventListener("visibilitychange", () => {
  if (document.hidden) hiddenAt = Date.now();
  else if (getPin() && hiddenAt && Date.now() - hiddenAt > 60000) lock();
});

$("unlockBtn").onclick = tryUnlock;
$("lockPin").onkeydown = e => { if (e.key === "Enter") tryUnlock(); };
$("forgotBtn").onclick = forgotPin;
$("savePinBtn").onclick = savePin;
$("lockNowBtn").onclick = lock;
$("removePinBtn").onclick = removePin;

if (getPin()) lock();
updateSecurityUI();
render();




    
        
    
    


