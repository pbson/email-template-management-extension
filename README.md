# Teacher Mail Assist Extension

This repository contains a Chrome extension designed to help teachers manage email templates and reminders efficiently.

## Getting Started

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/pbson/email-template-management-extension.git
    cd email-template-management-extension
    ```

2. Install dependencies:
    ```bash
    npm install

3. Create .env file:
    ```bash
    cp example.env .env

4. Build the project ( The build is in Watch mode so it will stay in the background, as long as the dist folder is created, you\'re good to go )
    ```bash
    npm run build

### Load the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable "Developer mode" by toggling the switch in the top right corner.
3. Click on the "Load unpacked" button.
4. Select the `dist` folder from the project directory. The extension should now be loaded and ready to use.

## Usage

Once the extension is loaded in Chrome, you can:

1. Click on the extension icon in the Chrome toolbar to open the schedule calendar.
2. Use the Add new case button on Outlook to manage your email templates.
