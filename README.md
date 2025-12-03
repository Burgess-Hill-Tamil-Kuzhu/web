# Burgess Hill Tamil Kuzhu Registration App

A simple web application for event registration, managing entries via Google Sheets.

## Features
- **Public Registration Form**: Allows users to register with Name, Mobile, Adults, Kids, and Meal preferences.
- **Admin Dashboard**: Secure (password-protected) area to view, edit, and delete registrations.
- **Google Sheets Integration**: All data is stored in a Google Sheet for easy management and export.

## Setup Instructions

### 1. Google Sheet & Apps Script Setup

This application uses Google Sheets as a database. Follow these steps to set it up:

1.  **Create a Google Sheet**:
    - Go to [Google Sheets](https://sheets.google.com) and create a new blank spreadsheet.
    - Name it something like "Burgess Hill Event Registrations".
    - Rename the first sheet tab to `Sheet1` (if it isn't already).

2.  **Open Apps Script**:
    - In the Google Sheet, go to **Extensions** > **Apps Script**.
    - This will open a new tab with a code editor.

3.  **Add the Script Code**:
    - Delete any existing code in the `Code.gs` file.
    - Copy the entire content of the `google_apps_script.js` file from this project.
    - Paste it into the Apps Script editor.
    - Click the **Save** icon (floppy disk).

4.  **Initialize Headers**:
    - In the toolbar dropdown (next to "Debug"), select the `setup` function.
    - Click **Run**.
    - You will be asked to **Review Permissions**. Click it, choose your Google account, click **Advanced**, and then **Go to (Script Name) (unsafe)** (it is safe, it's your own script).
    - Click **Allow**.
    - Once finished, check your Google Sheet. You should see headers: `id`, `timestamp`, `name`, `mobile`, `adults`, `kids`, `nonVeg`, `veg`.

5.  **Deploy as Web App**:
    - Click the blue **Deploy** button > **New deployment**.
    - Click the "Select type" gear icon > **Web app**.
    - **Description**: `v1` (or any description).
    - **Execute as**: `Me` (your email address).
    - **Who has access**: `Anyone` (**Crucial**: This allows the public form to submit data without logging in).
    - Click **Deploy**.

6.  **Get the URL**:
    - Copy the **Web App URL** (it ends with `/exec`).

### 2. Connect Frontend

1.  Open `script.js` in your project folder.
2.  Find the variable `GOOGLE_SCRIPT_URL` (it appears in two places: one for the Registration Form and one for the Admin Dashboard).
3.  Replace the existing URL with your **new Web App URL** in **BOTH** places.
    - Around line 60 (Registration logic).
    - Around line 176 (Admin logic).
4.  Save `script.js`.

### 3. Admin Access

- The Admin Dashboard is located at `admin.html`.
- **Default Login**:
    - Username: `admin`
- To change the password, you need to generate a new SHA-256 hash and update the `TARGET_HASH` in `script.js` (around line 147).

### Generating a Password Hash

You can generate a SHA-256 hash for your desired password using one of the following methods:

**Method 1: Terminal (Mac/Linux)**
Open your terminal and run:
```bash
echo -n "your_new_password" | shasum -a 256
```
Copy the output string (the long sequence of characters).

**Method 2: Online Tool**
1.  Go to an online generator like [XORbin](https://xorbin.com/tools/sha256-hash-calculator) or [CyberChef](https://gchq.github.io/CyberChef/#recipe=SHA2('256')).
2.  Type your password.
3.  Copy the resulting hash.

**Update the Code**:
Paste the copied hash into `script.js`:
```javascript
const TARGET_HASH = "your_copied_hash_here";
```

## Usage

- Open `index.html` to see the landing page and registration form.
- Submitting the form will add a row to your Google Sheet.
- Log in to `admin.html` to manage entries.
