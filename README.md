# Wanderlist ✈️

A modern, frontend-only web application for maintaining your travel locations list.

## Features

- ✅ **Add Travel Locations** - Easily add new destinations to your list
- ✅ **Remove Locations** - Delete locations you no longer need
- ✅ **Edit Locations** - Update location names, descriptions, and priorities
- ✅ **Drag & Drop Rearrangement** - Reorder locations by dragging and dropping
- ✅ **Optional Descriptions** - Add notes and details about each location
- ✅ **Sorting Options** - Sort by date added, name (A-Z), or priority
- ✅ **Browser Persistence** - All data is saved in localStorage
- ✅ **Theme Switching** - Toggle between light and dark themes
- ✅ **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices

## How to Use

1. **Open the Application**
   - Simply open `index.html` in your web browser
   - No server or installation required!

2. **Add a Location**
   - Type a location name in the input field
   - Click "Add Location" or press Enter

3. **Edit a Location**
   - Click the "Edit" button on any location card
   - Update the name, description, or priority
   - Click "Save Changes"

4. **Remove a Location**
   - Click the "Delete" button on any location card
   - Confirm the deletion

5. **Rearrange Locations**
   - Click and drag any location card to a new position
   - Drop it where you want it

6. **Sort Locations**
   - Use the "Sort by" dropdown to organize your list:
     - **Date Added**: Most recent first
     - **Name (A-Z)**: Alphabetical order
     - **Priority**: High → Medium → Low

7. **Change Theme**
   - Click the theme toggle button (🌙/☀️) in the top right
   - Your preference is saved automatically

## Data Storage

All your locations are automatically saved in your browser's localStorage. This means:
- Your data persists even after closing the browser
- Data is stored locally on your device
- No internet connection required after initial load

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Technologies Used

- Pure HTML5, CSS3, and JavaScript
- No frameworks or dependencies
- Modern CSS with CSS Variables for theming
- HTML5 Drag and Drop API
- LocalStorage API for persistence

## File Structure

```
Wanderlist/
├── index.html    # Main HTML structure
├── styles.css    # All styling and themes
├── script.js     # Application logic
└── README.md     # This file
```

Enjoy organizing your travel adventures! 🌍

