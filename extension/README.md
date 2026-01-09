# Privacy Guardian Browser Extension

A Chrome extension that monitors privacy metrics in real-time, tracking cookies, third-party trackers, and website permissions.

## 🚀 Installation

### Development Mode
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select this extension folder
4. The extension icon should appear in your Chrome toolbar

### Production Mode
1. Zip the extension folder
2. Upload to Chrome Web Store (requires developer account)

## 🔧 Configuration

### Manifest Permissions
The extension requires these permissions:
- `cookies` - Access browser cookies
- `storage` - Store privacy data locally
- `tabs` - Monitor open tabs
- `webRequest` - Track network requests
- `browsingData` - Clear browsing data
- `<all_urls>` - Access all websites for monitoring

### Extension Files
- `manifest.json` - Extension configuration and permissions
- `background.js` - Background service worker
- `popup.html` - Extension popup interface
- `popup.js` - Popup functionality
- `popup.css` - Popup styling

## 📊 Data Collection

The extension collects:
- **Cookies**: All cookies set by the website
- **Third-party Trackers**: External domains making requests
- **Permissions**: Browser permissions requested by the site
- **URL**: Website address (for analysis)
- **Timestamp**: When the data was collected

## 🔒 Privacy & Security

- All data is processed locally in your browser
- No personal information is collected
- Data is only sent to your configured backend server
- Users can disable data collection at any time

## 🛠️ Development

### Testing
Open `debug.html` in Chrome to see real-time privacy data collection.

### Debugging
1. Go to `chrome://extensions/`
2. Find Privacy Guardian extension
3. Click "background page" to open DevTools
4. Check console for errors and logs

### Making Changes
1. Edit the extension files
2. Go to `chrome://extensions/`
3. Click the refresh button on your extension
4. Changes will be applied immediately