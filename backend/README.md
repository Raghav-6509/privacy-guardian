# Privacy Guardian Backend

The backend server for Privacy Guardian, built with Python Flask. This server handles data processing, AI analysis, and provides API endpoints for the extension and dashboard.

## 🚀 Quick Start

### Setup
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Hugging Face API key (optional)
```

### Run Server
```bash
python app.py
```

The server will start on `http://localhost:5000`

## 📋 API Endpoints

### Privacy Analysis
- `POST /analyze` - Analyze single tab privacy data
- `POST /analyze_all_tabs` - Analyze all open tabs

### Data Retrieval
- `GET /latest` - Get latest analysis results
- `GET /history` - Get historical privacy data
- `GET /visited_sites` - Get visited sites for heat map

### Privacy Actions
- `POST /clear_cookies` - Clear browser cookies
- `POST /block_trackers` - Enable/disable tracker blocking

## 🔧 Configuration

### Environment Variables

Create a `.env` file:
```env
HUGGINGFACE_API_KEY=your_api_key_here
DEBUG=false
```

### Hugging Face Integration

The backend uses Hugging Face's Mistral-7B-Instruct model for AI-powered privacy recommendations. You can get a free API key from [Hugging Face](https://huggingface.co/settings/tokens).

## 🎯 Privacy Score Calculation

Privacy scores are calculated using:
```python
def calculate_privacy_score(cookies, trackers, permissions):
    return 100 - (cookies * 0.01 + trackers * 5 + permissions * 2)
```

## 🐛 Troubleshooting

### Common Issues
- **Port already in use**: Change the port in `app.py` or stop the conflicting service
- **AI features not working**: Verify your Hugging Face API key is valid
- **CORS errors**: Check that `flask-cors` is properly installed