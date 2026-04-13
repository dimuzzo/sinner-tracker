import json
import datetime
import urllib.request
import os

# API Configuration and Headers
API_KEY = os.getenv("API_KEY", "").strip()
HOST = "tennis-api-atp-wta-itf.p.rapidapi.com"
HEADERS = {
    'X-RapidAPI-Key': API_KEY,
    'X-RapidAPI-Host': HOST,
    'User-Agent': 'SinnerTrackerBot/5.0'
}

# Matchstat IDs (Updated for 2026)
SINNER_ID = 47275
RIVALS = {
    "Carlos Alcaraz": 68074,
    "Novak Djokovic": 5992,
    "Alexander Zverev": 24008
}

def api_call(endpoint):
    # Notice the slash is included in the endpoint variable now
    url = f"https://{HOST}{endpoint}"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode('utf-8'))
            return res.get('data', res) # Automatically extracts 'data' if it exists
    except Exception as e:
        print(f"API Error on {endpoint}: {e}")
        return None

def calculate_pct(part, total):
    if not total or total == 0: return 0
    return round((part / total) * 100)

def update_database():
    if not API_KEY or API_KEY == "YOUR_API_KEY":
        print("CRITICAL: API_KEY not configured in GitHub Secrets!")
        return

    # Load existing JSON (to protect tournaments and trophies)
    try:
        with open('data.json', 'r') as f:
            db = json.load(f)
    except:
        db = {"tournaments": [], "trophies": []}

    try:
        print("1/4 Syncing Ranking & ATP Points...")
        # Applying the /tennis/v2/atp/ prefix to the ranking endpoint
        rankings = api_call("/tennis/v2/atp/rankings/singles")
        if rankings:
            for r in rankings:
                if r.get('player', {}).get('id') == SINNER_ID:
                    db['ranking'] = r.get('position', db.get('ranking'))
                    db['total_points'] = r.get('point', db.get('total_points'))
                    break

        print("2/4 Syncing Win/Loss & Fox Stats...")
        # EXACT path from your Python snippet
        stats_data = api_call(f"/tennis/v2/atp/player/match-stats/{SINNER_ID}")
        if stats_data:
            serv = stats_data.get('serviceStats', {})
            rtn = stats_data.get('rtnStats', {})
            bps = stats_data.get('breakPointsServeStats', {})
            bpr = stats_data.get('breakPointsRtnStats', {})
            
            db['stats'] = {
                "first_serve_in": calculate_pct(serv.get('firstServeGm'), serv.get('firstServeOfGm')),
                "break_points_saved": calculate_pct(bps.get('breakPointSavedGm'), bps.get('breakPointFacedGm')),
                "first_return_won": calculate_pct(rtn.get('winningOnFirstServeGm'), rtn.get('winningOnFirstServeOfGm')),
                "break_points_converted": calculate_pct(bpr.get('breakPointWonGm'), bpr.get('breakPointChanceGm'))
            }

        print("3/4 Syncing Next Match...")
        fixtures = api_call(f"/tennis/v2/atp/player/fixtures/{SINNER_ID}")
        if fixtures and len(fixtures) > 0:
            next_m = fixtures[0]
            db['next_match'] = {
                "opponent": next_m.get('opponent_name', 'TBD'),
                "tournament": next_m.get('tournament', 'Next Tournament'),
                "round": next_m.get('round', 'TBD'),
                "date": next_m.get('date', '2026-04-24T15:00:00Z')
            }

        print("4/4 Syncing H2H...")
        new_rivalries = []
        for name, r_id in RIVALS.items():
            h2h = api_call(f"/tennis/v2/atp/h2h/{SINNER_ID}/{r_id}")
            if h2h:
                new_rivalries.append({
                    "name": name,
                    "wins": h2h.get('player1_wins', 0),
                    "losses": h2h.get('player2_wins', 0),
                    "country": "🇪🇸" if "Alcaraz" in name else "🇷🇸" if "Djokovic" in name else "🇩🇪" if "Zverev" in name else "🏳️"
                })
        if new_rivalries:
            db['rivalries'] = new_rivalries

        # Save everything
        db['last_updated'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        with open('data.json', 'w') as f:
            json.dump(db, f, indent=2)
            
        print("SUCCESS: Data JSON perfectly mapped and synchronized!")

    except Exception as e:
        print(f"Critical workflow error: {e}")

if __name__ == "__main__":
    update_database()