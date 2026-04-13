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
    'User-Agent': 'SinnerTrackerBot/6.0'
}

# Matchstat IDs
SINNER_ID = 47275
RIVALS = {
    "Carlos Alcaraz": 68074,
    "Novak Djokovic": 5992,
    "Alexander Zverev": 24008
}

def api_call(endpoint_path):
    url = f"https://{HOST}{endpoint_path}"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode('utf-8'))
            return res.get('data', res)
    except Exception as e:
        print(f"API Error on {endpoint_path}: {e}")
        return None

def calculate_pct(part, total):
    if not total or total == 0: return 0
    return round((part / total) * 100)

def update_database():
    if not API_KEY or API_KEY == "YOUR_API_KEY":
        print("CRITICAL: API_KEY not configured in GitHub Secrets!")
        return

    try:
        with open('data.json', 'r') as f:
            db = json.load(f)
    except:
        db = {"tournaments": [], "trophies": []}

    try:
        print("1/4 Syncing Ranking & ATP Points...")
        URL_RANKING = "/tennis/v2/atp/ranking/singles/"
        
        rankings = api_call(URL_RANKING)
        if rankings:
            for r in rankings:
                if r.get('player', {}).get('id') == SINNER_ID:
                    db['ranking'] = r.get('position', db.get('ranking'))
                    db['total_points'] = r.get('point', db.get('total_points'))
                    break

        print("2/4 Syncing Win/Loss & Fox Stats...")
        # This one is perfect and confirmed working!
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
        URL_FIXTURES = f"/tennis/v2/atp/fixtures/player/{SINNER_ID}"
        
        fixtures = api_call(URL_FIXTURES)
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
            URL_H2H = f"/tennis/v2/atp/h2h/matches/{SINNER_ID}/{r_id}"
            h2h = api_call(URL_H2H)
            
            p1_wins = 0
            p2_wins = 0
            
            if h2h:
                if isinstance(h2h, dict):
                    # If it's a summary dictionary
                    p1_wins = h2h.get('player1_wins', 0)
                    p2_wins = h2h.get('player2_wins', 0)
                elif isinstance(h2h, list):
                    # If it's a list of past matches, we count the wins manually
                    for match in h2h:
                        # Assuming the API uses 'winner_id' to indicate the winner
                        winner_id = match.get('winner_id')
                        if str(winner_id) == str(SINNER_ID):
                            p1_wins += 1
                        elif str(winner_id) == str(r_id):
                            p2_wins += 1

            new_rivalries.append({
                "name": name,
                "wins": p1_wins,
                "losses": p2_wins,
                "country": "🇪🇸" if "Alcaraz" in name else "🇷🇸" if "Djokovic" in name else "🇩🇪" if "Zverev" in name else "🏳️"
            })
            
        if new_rivalries:
            db['rivalries'] = new_rivalries

        db['last_updated'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        with open('data.json', 'w') as f:
            json.dump(db, f, indent=2)
            
        print("SUCCESS: Data JSON perfectly mapped and synchronized!")

    except Exception as e:
        print(f"Critical workflow error: {e}")

if __name__ == "__main__":
    update_database()