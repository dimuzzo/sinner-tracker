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
    'User-Agent': 'SinnerTrackerBot/10.0'
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
        print("1/8 Syncing Ranking & ATP Points...")
        URL_RANKING = "/tennis/v2/atp/ranking/singles/"
        rankings = api_call(URL_RANKING)
        if rankings:
            for r in rankings:
                if r.get('player', {}).get('id') == SINNER_ID:
                    db['ranking'] = r.get('position', db.get('ranking'))
                    db['total_points'] = r.get('point', db.get('total_points'))
                    break

        print("2/8 Syncing Win/Loss & Fox Stats...")
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

        print("3/8 Syncing Next Match...")
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

        print("4/8 Syncing H2H...")
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

        print("5/8 Syncing Recent Form...")
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

        print("6/8 Syncing Surface Mastery...")
        surface_data = api_call(f"/tennis/v2/atp/player/surface-summary/{SINNER_ID}")
        surfaces_db = {"Hard": 0, "Clay": 0, "Grass": 0}
        
        if surface_data and isinstance(surface_data, list) and len(surface_data) > 0:
            current_year_data = surface_data[0].get('surfaces', [])
            for s in current_year_data:
                name = s.get("court", "")
                wins = int(s.get("courtWins", 0))
                if "hard" in name.lower():
                    surfaces_db["Hard"] += wins
                elif "clay" in name.lower():
                    surfaces_db["Clay"] += wins
                elif "grass" in name.lower():
                    surfaces_db["Grass"] += wins
        db['surface_mastery'] = surfaces_db

        print("7/8 Syncing Tournament Roadmap...")
        now = datetime.datetime.now(datetime.timezone.utc)
        current_year = now.year
        elite_schedule = [
            {"name": "Monte-Carlo Masters", "date": f"{current_year}-04-12T00:00:00Z", "court": "Clay", "country": "MON"},
            {"name": "Madrid Open", "date": f"{current_year}-04-24T00:00:00Z", "court": "Clay", "country": "ESP"},
            {"name": "Internazionali d'Italia", "date": f"{current_year}-05-08T00:00:00Z", "court": "Clay", "country": "ITA"},
            {"name": "Roland Garros", "date": f"{current_year}-05-26T00:00:00Z", "court": "Clay", "country": "FRA"},
            {"name": "Halle Open", "date": f"{current_year}-06-17T00:00:00Z", "court": "Grass", "country": "GER"},
            {"name": "Wimbledon", "date": f"{current_year}-07-01T00:00:00Z", "court": "Grass", "country": "GBR"},
            {"name": "Canadian Open", "date": f"{current_year}-08-06T00:00:00Z", "court": "Hard", "country": "CAN"},
            {"name": "Cincinnati Open", "date": f"{current_year}-08-12T00:00:00Z", "court": "Hard", "country": "USA"},
            {"name": "US Open", "date": f"{current_year}-08-26T00:00:00Z", "court": "Hard", "country": "USA"},
            {"name": "China Open", "date": f"{current_year}-09-26T00:00:00Z", "court": "Hard", "country": "CHN"},
            {"name": "Shanghai Masters", "date": f"{current_year}-10-02T00:00:00Z", "court": "Hard", "country": "CHN"},
            {"name": "Paris Masters", "date": f"{current_year}-10-28T00:00:00Z", "court": "I.hard", "country": "FRA"},
            {"name": "ATP Finals Turin", "date": f"{current_year}-11-10T00:00:00Z", "court": "I.hard", "country": "ITA"}
        ]
        roadmap = []
        for t in elite_schedule:
            t_date = datetime.datetime.strptime(t["date"][:10], "%Y-%m-%d").replace(tzinfo=datetime.timezone.utc)
            if t_date >= now:
                roadmap.append(t)
        db['roadmap'] = roadmap[:5]

        print("8/8 Syncing Pigeon & Nemesis...")
        # NEW: Fetch interesting H2H, handle API typo
        h2h_data = api_call(f"/tennis/v2/atp/player/intersting-h2h/{SINNER_ID}")
        
        pigeon = {"name": "TBD", "diff": -999, "wins": 0, "losses": 0}
        nemesis = {"name": "TBD", "diff": 999, "wins": 0, "losses": 0}

        if h2h_data and isinstance(h2h_data, list):
            for match in h2h_data:
                p1 = match.get("player1", {})
                p2 = match.get("player2", {})
                
                # Determine who is Sinner and who is the opponent
                if p1.get("id") == SINNER_ID:
                    sinner_wins = p1.get("wins", 0)
                    opp_wins = p2.get("wins", 0)
                    opp_name = p2.get("name", "Unknown")
                else:
                    sinner_wins = p2.get("wins", 0)
                    opp_wins = p1.get("wins", 0)
                    opp_name = p1.get("name", "Unknown")

                diff = sinner_wins - opp_wins

                # Pigeon: Highest positive difference
                if diff > pigeon["diff"]:
                    pigeon = {"name": opp_name, "diff": diff, "wins": sinner_wins, "losses": opp_wins}
                
                # Nemesis: Lowest negative difference
                if diff < nemesis["diff"]:
                    nemesis = {"name": opp_name, "diff": diff, "wins": sinner_wins, "losses": opp_wins}

        db['special_h2h'] = {
            "pigeon": pigeon,
            "nemesis": nemesis
        }

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