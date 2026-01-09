# Privacy Guardian 🛡️

A comprehensive privacy monitoring extension that tracks cookies, trackers, and permissions across websites, providing AI-powered privacy recommendations and a detailed dashboard for privacy analytics.

## 🌟 Features

- **Real-time Privacy Monitoring**: Track cookies, third-party trackers, and website permissions
- **AI-Powered Recommendations**: Get personalized privacy advice using Hugging Face's AI models
- **Privacy Heat Map**: Visual representation of privacy risk across visited websites
- **Comprehensive Dashboard**: Interactive charts and analytics for privacy metrics
- **Browser Extension**: Chrome extension with popup interface for quick privacy checks
- **Privacy Score Calculation**: Automated scoring based on cookies, trackers, and permissions

## 🏗️ Architecture

This project consists of three main components:

### 1. Browser Extension (`/extension`)
- **Technology**: Chrome Extension Manifest V3
- **Purpose**: Real-time privacy monitoring and data collection
- **Key Files**: `background.js`, `popup.html`, `manifest.json`

### 2. Backend Server (`/backend`)
- **Technology**: Python Flask
- **Purpose**: Data processing, AI analysis, and API endpoints
- **Key Features**: Privacy score calculation, AI advice generation

### 3. Dashboard (`/dashboard`)
- **Technology**: React.js with Chart.js
- **Purpose**: Data visualization and user interface
- **Features**: Interactive charts, privacy heat map, settings management

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 14+
- Chrome browser
- Hugging Face API key (optional, for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/privacy-guardian.git
   cd privacy-guardian
   ```

2. **Set up the backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Hugging Face API key (optional)
   ```

4. **Start the backend server**
   ```bash
   python app.py
   ```

5. **Set up the dashboard (optional)**
   ```bash
   cd ../dashboard
   npm install
   npm start
   ```

6. **Load the extension**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `/extension` folder

## 📊 API Endpoints

The backend provides the following endpoints:

- `POST /analyze` - Analyze single tab privacy data
- `POST /analyze_all_tabs` - Analyze all open tabs
- `GET /latest` - Get latest analysis results
- `GET /history` - Get historical privacy data
- `GET /visited_sites` - Get visited sites for heat map
- `POST /clear_cookies` - Clear browser cookies
- `POST /block_trackers` - Enable/disable tracker blocking

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Hugging Face API Token (optional)
HUGGINGFACE_API_KEY=your_api_key_here

# Debug mode
DEBUG=false
```

### Extension Permissions

The extension requires the following permissions:
- `cookies` - Access browser cookies
- `storage` - Store privacy data locally
- `tabs` - Monitor open tabs
- `webRequest` - Track network requests
- `browsingData` - Clear browsing data
- `<all_urls>` - Access all websites for monitoring

## 🎯 Privacy Score Calculation

The privacy score is calculated using the following formula:
```
Privacy Score = 100 - (cookies * 0.01 + trackers * 5 + permissions * 2)
```

Where:
- **Cookies**: Number of cookies on the page (weight: 0.01)
- **Trackers**: Number of third-party trackers (weight: 5)
- **Permissions**: Number of requested permissions (weight: 2)

## 📈 Data Visualization

The dashboard provides several visualizations:

- **Privacy Score Trend**: Line chart showing score over time
- **Risk Breakdown**: Doughnut chart of cookies, trackers, and permissions
- **Privacy Heat Map**: Color-coded grid of visited websites by risk level
- **AI Recommendations**: Personalized privacy advice

## 🤖 AI Integration

The project uses Hugging Face's Mistral-7B-Instruct model to generate personalized privacy recommendations based on:
- Current privacy metrics
- Browsing patterns
- Industry best practices

## 🔒 Privacy & Security

- All data processing happens locally in your browser
- No personal data is sent to external servers (except for AI analysis if enabled)
- Extension permissions are minimal and necessary for functionality
- Users have full control over data collection and storage

## 🛠️ Development

### Backend Development
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python app.py
```

### Extension Development
1. Make changes to extension files
2. Go to `chrome://extensions/`
3. Click the refresh button on your extension

### Dashboard Development
```bash
cd dashboard
npm start
```

## 🐛 Troubleshooting

### Common Issues

1. **Extension not loading**: Check that Developer mode is enabled in Chrome
2. **AI features not working**: Verify your Hugging Face API key is valid
3. **Dashboard not updating**: Ensure the backend server is running
4. **Privacy score seems off**: Check if the extension has proper permissions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributors

This project was developed by:

- **Raghav** - [GitHub Profile](https://github.com/Raghav-6509) - Main developer and project lead
- **CKhurana13** - [GitHub Profile](https://github.com/CKhurana13) - Frontend development and dashboard design with its implementation

## 🙏 Acknowledgments

- Hugging Face for providing the AI model
- Chart.js for visualization components
- Chrome Extension API documentation
- Privacy research community for best practices

## 📞 Contact

For questions or support, please open an issue on GitHub.

---

**Note**: This project is for educational and privacy awareness purposes. Always review the code and understand what data is being collected before using any privacy tool.
