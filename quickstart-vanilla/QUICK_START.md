# Quick Start Guide - Vanilla JavaScript Version

## Getting Started in 5 Minutes

### 1. Build the Project
```bash
# From the root directory of the project
npm run build:quickstart-vanilla
```

### 2. Start the Server
```bash
# From the root directory
npm start
```

### 3. Open in Browser
```
http://localhost:3000/quickstart-vanilla/public/
```

### 4. Use the Application
1. **Select Microphone**: Choose your mic and see the level indicator
2. **Select Camera**: Choose your camera and see the preview
3. **Join Room**: Enter room name and your name
4. **Video Chat**: You're in! Click thumbnails to pin participants

## File Overview

### Main Files to Understand
- **[src/index.js](src/index.js)** - Application entry point and flow
- **[src/joinroom.js](src/joinroom.js)** - Core video chat logic
- **[public/index.html](public/index.html)** - HTML structure
- **[public/index.css](public/index.css)** - Styles

### Helper Files
- **[src/selectmedia.js](src/selectmedia.js)** - Device selection
- **[src/selectroom.js](src/selectroom.js)** - Room name input
- **[src/browser.js](src/browser.js)** - Browser utilities
- **[src/miclevel.js](src/miclevel.js)** - Audio level indicator
- **[src/showerror.js](src/showerror.js)** - Error display
- **[src/userfriendlyerror.js](src/userfriendlyerror.js)** - Error messages
- **[src/togglepip.js](src/togglepip.js)** - Picture-in-picture

## Key Code Patterns

### DOM Selection
```javascript
// Get element by ID
const button = document.getElementById('leave-room');

// Query selector (first match)
const video = modal.querySelector('video');

// Query selector all (all matches)
const videos = document.querySelectorAll('video');
```

### Event Handlers
```javascript
// Add event listener
button.addEventListener('click', handleClick);

// Remove event listener
button.removeEventListener('click', handleClick);

// Function must be named to remove it later
function handleClick() {
  console.log('Clicked!');
}
```

### DOM Manipulation
```javascript
// Create element
const div = document.createElement('div');
div.className = 'participant';
div.id = 'participant-1';

// Set content
div.innerHTML = '<p>Content</p>';
div.textContent = 'Text only';

// Add to page
container.appendChild(div);

// Remove from page
div.remove();
```

### Styles and Classes
```javascript
// Add/remove classes
element.classList.add('active');
element.classList.remove('inactive');
element.classList.toggle('hidden');

// Check class
if (element.classList.contains('active')) { }

// Set style
element.style.opacity = '0.5';
element.style.display = 'none';
```

### Attributes
```javascript
// Get attribute
const identity = element.getAttribute('data-identity');

// Set attribute
element.setAttribute('data-identity', 'John');

// Remove attribute
element.removeAttribute('data-identity');
```

## Common Tasks

### How to Test the App

**Option 1: Two Browser Windows**
1. Open two browser windows
2. Join the same room in both
3. You'll see yourself from two perspectives

**Option 2: Two Devices**
1. Get your computer's local IP (e.g., 192.168.1.5)
2. Computer: http://localhost:3000/quickstart-vanilla/public/
3. Phone: http://192.168.1.5:3000/quickstart-vanilla/public/

### How to Debug

**Browser Console:**
```javascript
// The room is available in the console
room
room.localParticipant
room.participants
room.state

// Check tracks
room.localParticipant.videoTracks
room.localParticipant.audioTracks
```

**Enable Verbose Logging:**
Already enabled in [joinroom.js](src/joinroom.js):
```javascript
const logger = Logger.getLogger('twilio-video');
logger.setLevel('debug');
```

### How to Modify

**Change Video Resolution:**
In [index.js](src/index.js):
```javascript
video: { height: 1080, frameRate: 30, width: 1920 }
```

**Change Room Type:**
Set in Twilio Console, not in code

**Add Your Own Features:**
1. Study the existing code
2. Add new functions
3. Hook them into the flow
4. Rebuild: `npm run build:quickstart-vanilla`

## Learning Path

### Beginner Level
1. Read [README.md](README.md) - Understanding the project
2. Study [src/browser.js](src/browser.js) - Simple utilities
3. Study [src/index.js](src/index.js) - Main flow
4. Review [JQUERY_TO_VANILLA.md](JQUERY_TO_VANILLA.md) - Conversion patterns

### Intermediate Level
1. Study [src/selectmedia.js](src/selectmedia.js) - Device handling
2. Study [src/joinroom.js](src/joinroom.js) - Core video logic
3. Experiment with modifying the code
4. Try adding simple features

### Advanced Level
1. Study all the Twilio SDK methods used
2. Check out the [examples](../examples/) folder
3. Read [Twilio Video docs](https://www.twilio.com/docs/video/javascript)
4. Build your own custom application

## Troubleshooting

### Build Errors
```bash
# Clean and rebuild
npm run clean:quickstart-vanilla
npm run build:quickstart-vanilla
```

### Can't Access on Mobile
- Ensure devices are on the same network
- Use computer's local IP, not localhost
- Check firewall settings

### Permission Errors
- Click "Allow" when browser asks
- Check browser settings (camera/mic permissions)
- Use HTTPS or localhost (required for getUserMedia)

### Video Not Showing
- Check browser console for errors
- Ensure camera LED is on
- Try refreshing the page
- Check if camera works in other apps

## Next Steps

1. **Understand the Code**: Read through all files with comments
2. **Experiment**: Modify small things and see what happens
3. **Build Features**: Try adding new functionality
4. **Learn Twilio**: Explore the Twilio Video SDK documentation
5. **Create Your App**: Use this as a foundation for your project

## Resources

- **This Project Documentation**
  - [README.md](README.md) - Comprehensive guide
  - [JQUERY_TO_VANILLA.md](JQUERY_TO_VANILLA.md) - Conversion reference
  
- **Twilio Documentation**
  - [JavaScript SDK](https://www.twilio.com/docs/video/javascript)
  - [Best Practices](https://www.twilio.com/docs/video/build-js-video-application-recommendations-and-best-practices)
  - [API Reference](https://sdk.twilio.com/js/video/releases/2.27.0/docs/)

- **JavaScript Learning**
  - [MDN Web Docs](https://developer.mozilla.org/)
  - [JavaScript.info](https://javascript.info/)

## Questions?

Every function in this project is heavily commented. If something is unclear:
1. Read the comments in the code
2. Check the README.md
3. Look at JQUERY_TO_VANILLA.md for conversion patterns
4. Search Twilio documentation
5. Compare with the original jQuery version
