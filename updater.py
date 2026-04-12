import json
import datetime
import urllib.request
import os

# Configuration
API_KEY = os.getenv("API_KEY", "").strip()
HOST = "tennis-api-atp-wta-itf.p.rapidapi.com"
HEADERS = {
    'X-RapidAPI-Key': API_KEY,
    'X-RapidAPI-Host': HOST,
    'User-Agent': 'SinnerTrackerBot/2.0'
}

# Matchstat IDs (Verified for 2026 context)
SINNER_ID = "47275"
RIVALS = {
    "Carlos Alcaraz": "68074",
    "Novak Djokovic": "5992",
    "Alexander Zverev": "24008"
}

def api_call(endpoint):
    url = f"https://{HOST}/tennis-api-atp-wta-itf/{endpoint}"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"API Error on {endpoint}: {e}")
        return None

def update_database():
    if not API_KEY or API_KEY == "YOUR_API_KEY":
        print("CRITICAL: API_KEY not configured!")
        return

    # Load existing data to preserve manual sections (tournaments, trophies)
    try:
        with open('data.json', 'r') as f:
            db = json.load(f)
    except:
        db = {"tournaments": [], "trophies": []}

    try:
        print("1/3 Syncing Global Stats...")
        player = api_call(f"player/{SINNER_ID}/detail")
        if player:
            db['ranking'] = player.get('current_rank', db.get('ranking', 1))
            db['total_points'] = player.get('current_points', db.get('total_points', 11500))

        # Stats for 2026 Season
        stats_resp = api_call(f"player/{SINNER_ID}/stats/2026/all")
        if stats_resp:
            db['win_loss'] = f"{stats_resp.get('matches_won', 0)} - {stats_resp.get('matches_lost', 0)}"
            db['stats'] = {
                "first_serve_in": stats_resp.get('first_serve_in_pct', 64),
                "break_points_saved": stats_resp.get('bp_saved_pct', 73),
                "first_return_won": stats_resp.get('first_serve_return_won_pct', 34),
                "break_points_converted": stats_resp.get('bp_converted_pct', 42)
            }

        print("2/3 Syncing Rivalries (H2H)...")
        new_rivalries = []
        for name, r_id in RIVALS.items():
            h2h = api_call(f"h2h/{SINNER_ID}/{r_id}")
            if h2h:
                new_rivalries.append({
                    "name": name,
                    "wins": h2h.get('player1_wins', 0),
                    "losses": h2h.get('player2_wins', 0),
                    "country": "🇪🇸" if "Alcaraz" in name else "🇷🇸" if "Djokovic" in name else "🇩🇪" if "Zverev" in name else "🏳️"
                })
        if new_rivalries:
            db['rivalries'] = new_rivalries

        print("3/3 Finalizing...")
        db['last_updated'] = datetime.datetime.now(datetime.timezone.utc).isoformat()

        with open('data.json', 'w') as f:
            json.dump(db, f, indent=2)
            
        print("SUCCESS: Dynamic stats and H2H updated. Manual sections preserved.")

    except Exception as e:
        print(f"Workflow failed: {e}")

if __name__ == "__main__":
    update_database()