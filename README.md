# 💰 My Savings

A simple savings tracker that runs in your browser. Set a goal, add savings, withdraw when you must, and build a daily saving habit. Built with plain HTML, CSS and JavaScript, with no frameworks and no server.

## Features

- **Savings goal and deadline:** set a target amount (KSh) and the date you want to reach it.
- **Daily target:** shows how much to save per day and per week to hit your goal on time.
- **Add savings:** record an amount with a note about what you're saving for.
- **Withdraw:** record withdrawals, with a confirmation that shows your new balance and how many days of saving it sets you back. You can't withdraw more than you've saved.
- **Saving streak:** counts consecutive days you've saved, with your best streak.
- **Monthly summary:** saved vs withdrawn per month, with bars and the net amount.
- **History:** every transaction with date and time. Edit or delete any entry.
- **PIN lock:** optional 4 to 6 digit PIN. The app locks on open and after a minute away.
- **Export and backup:** download history as CSV, back up all data as a file, and restore it later.

## Project files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure |
| `style.css` | Styling |
| `script.js` | App logic |
| `README.md` | This guide |

## How to run

1. Put `index.html`, `style.css` and `script.js` in the same folder.
2. Open the folder in VS Code and start **Live Server** (or just double-click `index.html`).

## How to use

1. Enter your goal amount and deadline, then click **Set Goal**.
2. Add money under **Add Savings** whenever you save.
3. Use **Withdraw** only when necessary, and read the confirmation before you accept.
4. Check your streak and daily target to stay on track.
5. Set a PIN under **Security** to keep your savings private.

## Backup and restore

- **Export CSV** downloads your history for Excel or Google Sheets.
- **Backup** saves everything (goal, deadline, history) as a `.json` file.
- **Restore** loads a backup file and replaces the current data.

Make a backup regularly. Your data is stored in your browser, so clearing browser data erases it.

## Put it online (GitHub Pages)

1. Create a public repository on GitHub, for example `my-savings`.
2. Upload `index.html`, `style.css` and `script.js`.
3. Go to **Settings → Pages**, choose the `main` branch and `/ (root)`, then save.
4. Open `https://YOUR-USERNAME.github.io/my-savings/` and use **Add to Home screen** on your phone.

Each device keeps its own data and PIN. To move data between devices, use **Backup** and **Restore**.

## Good to know

- Data is saved with `localStorage`, so it stays in the browser and device where you entered it.
- The PIN keeps casual snoopers out but is not bank-level security.
- If you forget your PIN, **Forgot PIN?** erases the app's data in that browser so you can start again. Restore from a backup afterwards.
- Currency is Kenyan shillings (KSh).
-