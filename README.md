# Pomodoro Timer Chrome Extension

## Overview

The Pomodoro Timer Chrome Extension is a productivity tool designed to help users implement the Pomodoro Technique, a time management method developed by Francesco Cirillo. This extension allows users to work in focused intervals (typically 25 minutes) followed by short breaks, helping to improve concentration and manage time more effectively.

## Features

- **Customizable Timer**: Set work periods and break durations.
- **Background Timer**: Continues running even when the popup is closed.
- **Desktop Notifications**: Alerts users when a timer completes.
- **Interactive UI**: Start, pause, and reset timers with ease.
- **Automatic Phase Switching**: Alternates between work and break periods.
- **Long Break Option**: Implements a longer break after a set number of work periods.
- **Chrome Alarm API Integration**: Ensures reliable timer functionality.

## Technical Details

### Architecture

The extension is built using vanilla JavaScript and utilizes Chrome's extension APIs. It consists of two main components:

1. **Background Script** (`background.js`): Manages the core timer logic and handles notifications.
2. **Popup UI** (not shown in the provided code): Provides the user interface for interacting with the timer.

### Key Components

#### Background Script (`background.js`)

- **Timer Management**: 
  - `createAlarm()`: Sets up a Chrome alarm for the timer.
  - `startBackgroundTimer()`: Initiates the countdown and broadcasts updates.
  - `stopBackgroundTimer()`: Halts the active timer.

- **Notification System**: 
  - `showNotification()`: Displays a Chrome notification when a timer completes.
  - Listens for notification button clicks to start the next timer phase.

- **Message Handling**: 
  - Listens for messages from the popup to start/stop timers and handle timer completion.

### APIs Used

- `chrome.runtime`: For message passing between background and popup scripts.
- `chrome.alarms`: For creating and managing alarms.
- `chrome.notifications`: For displaying desktop notifications.

## Installation

1. Clone this repository or download the source code.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" in the top right corner.
4. Click "Load unpacked" and select the directory containing the extension files.

## Usage

1. Click on the extension icon in the Chrome toolbar to open the popup.
2. Set your desired work and break durations (if customizable).
3. Click "Start" to begin the Pomodoro timer.
4. Work until the timer completes and a notification appears.
5. Take a break when prompted, then start the next work session.

## Contributing

Contributions to improve the Pomodoro Timer Extension are welcome. Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
