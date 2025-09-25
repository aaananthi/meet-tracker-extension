# Installation & Usage Guide

## Installation Steps

1. **Prepare the Extension**
   - Make sure all files are in the `meet-attendance-tracker` folder
   - Create icon PNG files (see `icons/README.md` for instructions)

2. **Load Extension in Chrome**
   - Open Chrome browser
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `meet-attendance-tracker` folder
   - The extension should now appear in your toolbar

## Usage Instructions

### Step 1: Join a Google Meet
- Go to meet.google.com
- Join any meeting (create a test meeting if needed)

### Step 2: Open Participants Panel
- In the Google Meet, click the "People" button (usually at bottom right)
- This opens the participants list panel
- **Keep this panel open** during the meeting

### Step 3: Start Tracking
- Click the extension icon in your Chrome toolbar
- The popup will show:
  - Status indicator (green = tracking, yellow = not tracking)
  - Attendance list in join order
  - Total participant count

### Step 4: Monitor Attendance
- The extension automatically checks for new participants every 3 seconds
- New participants are added to the list in join order (not alphabetical)
- Each participant shows their name and join time

## Features

- **Join Order Tracking**: Shows participants in the order they joined
- **Real-time Updates**: Checks every 3 seconds for new participants
- **Persistent Storage**: Attendance list is saved even if popup is closed
- **Easy Controls**: Refresh and Clear buttons
- **Status Indicators**: Visual feedback on tracking status

## Troubleshooting

### "Not tracking" status
- Make sure you're on a Google Meet page
- Ensure the participants panel is open
- Try refreshing the Google Meet page
- Click "Refresh" in the extension popup

### No participants showing
- The participants panel must be visible in Google Meet
- Try scrolling in the participants list
- Some meetings may have different layouts - this is version 1.0

### Extension not working
- Check that you're on `meet.google.com`
- Reload the extension: go to `chrome://extensions/`, find the extension, click the reload button
- Check browser console for errors (F12 → Console tab)

## Version 1.0 Limitations

- Requires participants panel to be open
- May not work with all Google Meet layouts
- No export functionality (coming in future versions)
- Basic participant detection (may miss some edge cases)

## Next Steps

This is version 1.0 focusing on core functionality. Future versions could include:
- Export to CSV
- Better participant detection
- Meeting notes integration
- Multiple meeting support
- Participant photos/avatars
