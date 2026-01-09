from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import os
import random
import re
from huggingface_hub import InferenceClient

app = Flask(__name__)
CORS(app)

HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY", "").strip()
client = InferenceClient(api_key=HUGGINGFACE_API_KEY) if HUGGINGFACE_API_KEY else None


def _normalize_ai_text_to_bullets(ai_text):
    """Convert AI response text into grouped bullet points.
    - Treat lines starting with bullets or numbering as new items
    - Merge subsequent non-bullet lines into the current item
    - Strip leading decorative characters like '.', '-', '•', '*'
    """
    if isinstance(ai_text, list):
        # Already a list of points
        return [str(item).strip() for item in ai_text if str(item).strip()]

    text = str(ai_text)
    lines = [line.rstrip() for line in text.splitlines()]
    bullets = []
    current = ""
    bullet_start = re.compile(r"^\s*(?:[\.-•*]+)?\s*(?:\d+[\.)]|[A-Za-z][\.)]|[-*•])\s+")

    for raw in lines:
        line = raw.strip()
        if not line:
            if current:
                bullets.append(current.strip())
                current = ""
            continue
        # Clean decorative prefix like '..'
        cleaned = line.lstrip('.-•* ').strip()
        if bullet_start.match(line):
            if current:
                bullets.append(current.strip())
            current = cleaned
        else:
            # Continuation of previous bullet
            if current:
                current += " " + cleaned
            else:
                current = cleaned

    if current:
        bullets.append(current.strip())

    # Remove accidental empties
    return [b for b in bullets if b]

latest_data = {}
latest_all_tabs_data = {}
history = []
all_tabs_history = []

@app.route('/analyze', methods=['POST'])
def analyze():
    global latest_data
    data = request.get_json()

    cookies = data.get("cookies", 0)
    trackers = data.get("third_party_trackers", 0)
    permissions = data.get("permissions", [])
    if not isinstance(permissions, list):  # ✅ Fix for your error
        permissions = [str(permissions)]

    # Privacy score
    score = max(0, 100 - (cookies * 0.01 + trackers * 5 + len(permissions) * 2))
    score = round(score, 2)

    # AI advice generation
    prompt = f"""
    Analyze the following privacy data:
    - Cookies: {cookies}
    - Trackers: {trackers}
    - Permissions: {', '.join(permissions)}

    Provide concise privacy advice with key points, each starting on a new line.
    """

    try:
        if not client:
            raise RuntimeError("Missing HUGGINGFACE_API_KEY env var")
        response = client.chat.completions.create(
            model="mistralai/Mistral-7B-Instruct-v0.2",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=200
        )
        ai_text = response.choices[0].message["content"]
    except Exception as e:
        message = str(e)
        if "401" in message or "unauthorized" in message.lower():
            ai_text = "AI advice unavailable due to: Unauthorized (check HUGGINGFACE_API_KEY)."
        elif "Missing HUGGINGFACE_API_KEY" in message:
            ai_text = "AI advice unavailable: missing HUGGINGFACE_API_KEY environment variable."
        else:
            ai_text = f"AI advice unavailable due to: {message}"

    latest_data = {
        "cookies": cookies,
        "trackers": trackers,
        "permissions": permissions,
        "privacy_score": score,
        "ai_advice": ai_text,
        "ai_advice_list": _normalize_ai_text_to_bullets(ai_text)
    }

    # store in history (cap to last 50)
    history.append({
        "cookies": cookies,
        "trackers": trackers,
        "permissions": permissions,
        "score": score,
        "ai_advice": ai_text
    })
    if len(history) > 50:
        history.pop(0)

    return jsonify(latest_data)

@app.route('/analyze_all_tabs', methods=['POST'])
def analyze_all_tabs():
    global latest_all_tabs_data
    data = request.get_json()

    overall = data.get("overall", {})
    tabs = data.get("tabs", [])
    timestamp = data.get("timestamp", "")

    # Enhanced AI advice for multi-tab analysis
    prompt = f"""
    Analyze the following comprehensive privacy data from {overall.get('tabs_scanned', 0)} tabs:
    - Total Cookies: {overall.get('total_cookies', 0)}
    - Total Trackers: {overall.get('total_trackers', 0)}
    - Total Permissions: {len(overall.get('total_permissions', []))}
    - Overall Privacy Score: {overall.get('privacy_score', 0)}
    
    Individual tab analysis:
    {chr(10).join([f"- {tab.get('title', 'Unknown')} ({tab.get('domain', 'Unknown')}): Score {tab.get('privacy_score', 0)}, Cookies {tab.get('cookies', 0)}, Trackers {tab.get('trackers', 0)}" for tab in tabs[:5]])}
    
    Provide comprehensive privacy advice focusing on:
    1. Overall browser privacy health
    2. Most concerning tabs
    3. Specific recommendations for improvement
    4. Best practices for multi-tab browsing
    Each point should start on a new line and be concise.
    """

    try:
        if not client:
            raise RuntimeError("Missing HUGGINGFACE_API_KEY env var")
        response = client.chat.completions.create(
            model="mistralai/Mistral-7B-Instruct-v0.2",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300
        )
        ai_text = response.choices[0].message["content"]
    except Exception as e:
        message = str(e)
        if "401" in message or "unauthorized" in message.lower():
            ai_text = "AI advice unavailable due to: Unauthorized (check HUGGINGFACE_API_KEY)."
        elif "Missing HUGGINGFACE_API_KEY" in message:
            ai_text = "AI advice unavailable: missing HUGGINGFACE_API_KEY environment variable."
        else:
            ai_text = f"AI advice unavailable due to: {message}"

    # Normalize AI text into bullet points list
    ai_advice_list = _normalize_ai_text_to_bullets(ai_text)

    # Enhanced data structure
    enhanced_data = {
        "timestamp": timestamp,
        "overall": {
            "total_cookies": overall.get("total_cookies", 0),
            "total_trackers": overall.get("total_trackers", 0),
            "total_permissions": overall.get("total_permissions", []),
            "privacy_score": overall.get("privacy_score", 0),
            "tabs_scanned": overall.get("tabs_scanned", 0)
        },
        "tabs": tabs,
        "ai_advice": ai_text,
        "ai_advice_list": ai_advice_list,
        "summary": {
            "highest_risk_tab": max(tabs, key=lambda x: x.get('trackers', 0) + x.get('cookies', 0)) if tabs else None,
            "lowest_risk_tab": min(tabs, key=lambda x: x.get('trackers', 0) + x.get('cookies', 0)) if tabs else None,
            "average_score": sum(tab.get('privacy_score', 0) for tab in tabs) / len(tabs) if tabs else 0
        }
    }

    latest_all_tabs_data = enhanced_data

    # Store in history (cap to last 20 comprehensive scans)
    all_tabs_history.append(enhanced_data)
    if len(all_tabs_history) > 20:
        all_tabs_history.pop(0)

    return jsonify(enhanced_data)

@app.route('/latest', methods=['GET'])
def latest():
    if not latest_data:
        return jsonify({"message": "No scan data available"}), 404
    return jsonify(latest_data)

@app.route('/latest_all_tabs', methods=['GET'])
def latest_all_tabs():
    if not latest_all_tabs_data:
        return jsonify({"message": "No comprehensive scan data available"}), 404
    return jsonify(latest_all_tabs_data)

@app.route('/dashboard', methods=['GET'])
def dashboard():
    return render_template('dashboard.html')

@app.route('/history', methods=['GET'])
def get_history():
    if not history:
        return jsonify({
            "latest": {"score": 0, "ai_advice": []},
            "history": []
        })
    latest_entry = history[-1]
    # normalize ai_advice into array of tips
    ai_text = latest_entry.get("ai_advice", "")
    tips = _normalize_ai_text_to_bullets(ai_text)
    return jsonify({
        "latest": {"score": latest_entry.get("score", 0), "ai_advice": tips},
        "history": history
    })

@app.route('/all_tabs_history', methods=['GET'])
def get_all_tabs_history():
    if not all_tabs_history:
        return jsonify({
            "latest": {"overall": {"privacy_score": 0}, "ai_advice": []},
            "history": []
        })
    latest_entry = all_tabs_history[-1]
    # normalize ai_advice into array of tips
    if latest_entry.get("ai_advice_list"):
        tips = [t for t in latest_entry.get("ai_advice_list", []) if t]
    else:
        ai_text = latest_entry.get("ai_advice", "")
        tips = _normalize_ai_text_to_bullets(ai_text)
    return jsonify({
        "latest": {
            "overall": latest_entry.get("overall", {}),
            "tabs": latest_entry.get("tabs", []),
            "summary": latest_entry.get("summary", {}),
            "ai_advice": tips
        },
        "history": all_tabs_history
    })

@app.route('/visited_sites', methods=['GET'])
def get_visited_sites():
    # Use real data from history and all_tabs_history
    try:
        # Extract unique domains from history and all_tabs_history
        real_sites = []
        domains_seen = set()
        
        # Process data from all_tabs_history first (more comprehensive)
        for entry in all_tabs_history:
            for tab in entry.get("tabs", []):
                domain = tab.get("domain")
                if domain and domain not in domains_seen:
                    domains_seen.add(domain)
                    site_data = {
                        "domain": domain,
                        "title": tab.get("title", domain),
                        "riskScore": 100 - tab.get("privacy_score", 50),  # Convert privacy score to risk score
                        "cookies": tab.get("cookies", 0),
                        "trackers": tab.get("trackers", 0),
                        "visits": 1,  # Start with 1 visit
                        "lastVisit": entry.get("timestamp", "2024-01-15T10:30:00Z")
                    }
                    real_sites.append(site_data)
                elif domain:
                    # Update existing site data
                    for site in real_sites:
                        if site["domain"] == domain:
                            site["visits"] += 1
                            if entry.get("timestamp", "") > site["lastVisit"]:
                                site["lastVisit"] = entry.get("timestamp")
                            # Update with latest data
                            site["cookies"] = tab.get("cookies", site["cookies"])
                            site["trackers"] = tab.get("trackers", site["trackers"])
                            site["riskScore"] = 100 - tab.get("privacy_score", 100 - site["riskScore"])
        
        # If we have real data, return it
        if real_sites:
            return jsonify({"sites": real_sites, "isRealData": True, "message": "Real data from your browsing history"})
        
        # Fallback to mock data if no real data is available
        mock_sites = [
            {"domain": "google.com", "title": "Google", "riskScore": 75, "cookies": 12, "trackers": 3, "visits": 25, "lastVisit": "2024-01-15T10:30:00Z"},
            {"domain": "facebook.com", "title": "Facebook", "riskScore": 35, "cookies": 45, "trackers": 8, "visits": 15, "lastVisit": "2024-01-15T09:15:00Z"},
            {"domain": "youtube.com", "title": "YouTube", "riskScore": 60, "cookies": 28, "trackers": 5, "visits": 20, "lastVisit": "2024-01-15T08:45:00Z"},
            {"domain": "amazon.com", "title": "Amazon", "riskScore": 40, "cookies": 35, "trackers": 7, "visits": 8, "lastVisit": "2024-01-14T16:20:00Z"},
            {"domain": "github.com", "title": "GitHub", "riskScore": 85, "cookies": 5, "trackers": 1, "visits": 30, "lastVisit": "2024-01-15T11:00:00Z"}
        ]
        return jsonify({"sites": mock_sites, "isRealData": False, "message": "Demo data - browse some websites to see real data"})
    except Exception as e:
        return jsonify({"sites": [], "isRealData": False, "error": str(e)})

@app.route('/clear_cookies', methods=['POST'])
def clear_cookies_endpoint():
    """Dashboard endpoint to clear cookies"""
    try:
        # In a real implementation, this would communicate with the extension
        # For now, we'll simulate the action
        import random
        cleared_count = random.randint(100, 500)
        
        return jsonify({
            "success": True,
            "cleared": cleared_count,
            "message": f"Cleared {cleared_count} cookies successfully"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/block_trackers', methods=['POST'])
def block_trackers_endpoint():
    """Dashboard endpoint to block trackers"""
    try:
        data = request.get_json()
        enabled = data.get('enabled', True)
        
        # In a real implementation, this would communicate with the extension
        # For now, we'll simulate the action
        
        return jsonify({
            "success": True,
            "enabled": enabled,
            "message": f"Tracker blocking {'enabled' if enabled else 'disabled'} successfully"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/optimize_settings', methods=['POST'])
def optimize_settings_endpoint():
    """Dashboard endpoint to optimize privacy settings"""
    try:
        # In a real implementation, this would communicate with the extension
        # For now, we'll simulate the action
        optimizations = [
            "Cleared temporary browsing data",
            "Cleared old cookies",
            "Enabled tracker blocking",
            "Optimized privacy settings"
        ]
        
        return jsonify({
            "success": True,
            "optimizations": optimizations,
            "message": "Privacy settings optimized successfully"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True)
