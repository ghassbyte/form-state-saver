# 📝 Form State Saver Extension

This Chrome extension allows users to **save and load form input states by profile**, ideal for lengthy or repetitive web forms. Perfect for QA testers, form reviewers, or anyone filling similar data repeatedly.

## ✨ Features

- ✅ Save and load form inputs by profile
- ✅ Supports:
  - Radio buttons
  - Dropdowns
  - Textboxes (excluding date fields)
  - Textareas (excluding date-related fields)
- 🔁 Reset form before loading a new profile
- 🔒 All data is stored locally using `chrome.storage.local`

## 🚫 What it excludes

- ❌ Date inputs (e.g., `dd/mm/yyyy`)
- ❌ Signature canvases or embedded iframes
- ❌ Passwords or sensitive fields

---

## 📦 Installation

1. Clone or download this repository.
2. Open **Chrome** and go to `chrome://extensions/`
3. Enable **Developer Mode** (top right).
4. Click **"Load unpacked"** and select the folder containing this extension.

---

## 🔧 How It Works

1. A small popup lets you:
   - Save the current state of the form as a named profile.
   - Load a saved profile back into the form.

2. The script targets the current page's form and stores field values under a profile name.

---

## 📁 File Structure

```
form-state-saver/
├── manifest.json        # Chrome extension config
├── popup.html           # Popup UI
├── popup.js             # Handles save/load button events
├── content.js           # Main logic injected into each page
├── styles.css           # Popup styling
└── icons/               # (Optional) Extension icon set
```
---

## 🧠 How Profiles Are Stored

Profiles are stored in `chrome.storage.local` using a key structure like:
<page_origin+pathname>::<profile_name>

Each profile contains:

- `radios[]`
- `dropdowns[]`
- `textboxes[]`
- `textareas[]`

---

## 🤖 Development Notes

- Textbox detection skips fields that:
  - Include date-like placeholders
  - Have `limitDate` class (common in date widgets)
- Fields are matched using a combination of `name`, `selector`, and `nth-of-type` when needed.

---

## 📜 License

MIT License. Free to use, modify, and share.

---

## 🙌 Credits

Created by Ghassbyte  
Feel free to fork and contribute!
