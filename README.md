# Clean Notebook Screenshots

A lightweight Google Chrome Extension (Manifest V3) that effortlessly hides citation numbers on Google NotebookLM, allowing you to take clean, distraction-free screenshots.

## Features

- **Toggle Citations**: Click the extension icon in your toolbar to instantly hide or show citation pills.
- **Visual Badge**: Shows an "ON" / "OFF" badge indicating whether citations are currently hidden.
- **Dynamic Updates**: Uses MutationObservers to handle citations in dynamically loaded chat messages without requiring page reloads.

## Installation (Unpacked)

Since this extension is not yet published on the Chrome Web Store, you can install it manually in Developer Mode:

1. Clone or download this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle in the top right corner.
4. Click the **Load unpacked** button in the top left.
5. Select the folder containing these extension files.
6. The extension is now installed! We recommend "pinning" it to your toolbar for easy access.

## Usage

1. Open [Google NotebookLM](https://notebooklm.google.com/).
2. You will notice citations are hidden by default (the extension badge says "ON").
3. To reveal citations, simply click the extension icon (the badge will change to "OFF").
4. Take your clean screenshots!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
