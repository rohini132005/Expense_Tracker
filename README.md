# Expense Tracker

A responsive expense tracker built with HTML, CSS, JavaScript, and Bootstrap 5.

## Features
- Add expenses with a name, amount, category, and date
- Form validation
- Total spending, expense count, and largest expense summaries
- Search expenses by name or category
- Filter expenses by category
- Edit and delete individual expenses
- Clear all expenses with confirmation
- Store changes in browser localStorage
- Responsive layout using Bootstrap

## Run the project
1. Extract the project folder.
2. Open `index.html` in a browser, or open the folder in VS Code and use Live Server.
3. Internet access is needed to load Bootstrap from its CDN.

## Note about localStorage
This assignment version writes updates to localStorage but intentionally does not load saved expenses on page refresh, matching the assignment instruction that fetching expenses after reload is not required yet.

## Git submission
Open a terminal in this folder and run:
```bash
git init
git add .
git commit -m "Build expense tracker with Bootstrap and local storage"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
git rev-parse HEAD
```
Replace `YOUR_GITHUB_REPOSITORY_URL` with your own GitHub repository URL. Copy the commit hash printed by `git rev-parse HEAD` into your assignment submission.
