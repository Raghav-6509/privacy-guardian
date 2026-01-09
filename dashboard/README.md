# Privacy Guardian Dashboard

A React.js dashboard for visualizing privacy metrics, featuring interactive charts, privacy heat maps, and AI-powered recommendations.

## 🚀 Quick Start

### Prerequisites
- Node.js 14+
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

The dashboard will be available at `http://localhost:3000`

## 📊 Features

### Privacy Visualizations
- **Privacy Score Trend**: Line chart showing score over time
- **Risk Breakdown**: Doughnut chart of cookies, trackers, and permissions
- **Privacy Heat Map**: Color-coded grid of visited websites by risk level
- **AI Recommendations**: Personalized privacy advice

### Interactive Elements
- Real-time data updates
- Clickable heat map cells for detailed site information
- Settings panel for customization
- Responsive design for mobile and desktop

## 🏗️ Architecture

### Key Components
- `App.js` - Main application component
- `App.css` - Styling and responsive design
- `server.js` - Development server configuration

### Dependencies
- **React.js**: Frontend framework
- **Chart.js**: Data visualization library
- **CSS3**: Styling and animations

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the dashboard directory:
```env
REACT_APP_API_URL=http://localhost:5000
```

### API Integration
The dashboard connects to the Flask backend API. Ensure the backend server is running before starting the dashboard.

## 🎨 Styling

The dashboard uses a modern, clean design with:
- Responsive grid layout
- Color-coded risk levels (green, yellow, red)
- Smooth animations and transitions
- Mobile-first design approach

## 🐛 Troubleshooting

### Common Issues
- **Dashboard not loading**: Check that the backend server is running
- **Charts not displaying**: Verify Chart.js is properly installed
- **Data not updating**: Check browser console for API errors
- **Styling issues**: Ensure all CSS files are properly linked
