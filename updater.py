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
    'User-Agent': 'SinnerTrackerBot/9.0'
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
        print("1/6 Syncing Ranking & ATP Points...")
        URL_RANKING = "/tennis/v2/atp/ranking/singles/"
        rankings = api_call(URL_RANKING)
        if rankings:
            for r in rankings:
                if r.get('player', {}).get('id') == SINNER_ID:
                    db['ranking'] = r.get('position', db.get('ranking'))
                    db['total_points'] = r.get('point', db.get('total_points'))
                    break

        print("2/6 Syncing Win/Loss & Fox Stats...")
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

        print("3/6 Syncing Next Match...")
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

        print("4/6 Syncing H2H...")
        new_rivalries = []
        for name, r_id in RIVALS.items():
            URL_H2H = f"/tennis/v2/atp/h2h/info/{SINNER_ID}/{r_id}"
            h2h = api_call(URL_H2H)
            p1_wins = 0
            p2_wins = 0
            
            if h2h and isinstance(h2h, list):
                for surface in h2h:
                    p1_wins += int(surface.get('player1wins', 0))
                    p2_wins += int(surface.get('player2wins', 0))

            new_rivalries.append({
                "name": name,
                "wins": p1_wins,
                "losses": p2_wins,
                "country": "ES" if "Alcaraz" in name else "SR" if "Djokovic" in name else "DE" if "Zverev" in name else "🏳️"
            })
            
        if new_rivalries:
            db['rivalries'] = new_rivalries

        print("5/6 Syncing Recent Form...")
        past_matches = api_call(f"/tennis/v2/atp/player/past-matches/{SINNER_ID}")
        recent_form = []
        if past_matches and isinstance(past_matches, list):
            for m in past_matches[:5]:
                p1 = m.get("player1", {})
                p2 = m.get("player2", {})
                opponent = p2.get("name") if p1.get("id") == SINNER_ID else p1.get("name")
                is_win = str(m.get("match_winner")) == str(SINNER_ID)
                recent_form.append({
                    "win": is_win,
                    "opponent": opponent,
                    "result": m.get("result", "")
                })
        db['recent_form'] = recent_form

        print("6/6 Syncing Surface Mastery...")
        # NEW: Fetch surface summary
        surface_data = api_call(f"/tennis/v2/atp/player/surface-summary/{SINNER_ID}")
        surfaces_db = {"Hard": 0, "Clay": 0, "Grass": 0}
        
        if surface_data and isinstance(surface_data, list) and len(surface_data) > 0:
            # We take the most recent year (index 0) to match YTD stats
            current_year_data = surface_data[0].get('surfaces', [])
            
            for s in current_year_data:
                name = s.get("court", "")
                wins = int(s.get("courtWins", 0))
                
                # Combine Hard and Indoor Hard
                if "hard" in name.lower():
                    surfaces_db["Hard"] += wins
                elif "clay" in name.lower():
                    surfaces_db["Clay"] += wins
                elif "grass" in name.lower():
                    surfaces_db["Grass"] += wins
        
        db['surface_mastery'] = surfaces_db

        # Calculate Race points automatically
        race_pts = sum(t.get('earned', 0) for t in db.get('tournaments', []))
        db['race_points'] = race_pts

        db['last_updated'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        with open('data.json', 'w') as f:
            json.dump(db, f, indent=2)
            
        print("SUCCESS: Data JSON perfectly mapped and synchronized!")

    except Exception as e:
        print(f"Critical workflow error: {e}")

if __name__ == "__main__":
    update_database()