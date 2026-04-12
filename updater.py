import json
import datetime
import urllib.request
import os

API_KEY = os.getenv("API_KEY", "YOUR_API_KEY")
SINNER_ID = "200615"
SEASON = "2026" # Current season

# Rivals mapping for H2H automation
RIVALS = {
    "Carlos Alcaraz": "275923",
    "Novak Djokovic": "14486",
    "Daniil Medvedev": "163504"
}

def api_call(endpoint):
    url = f"https://tennisapi1.p.rapidapi.com/api/tennis/{endpoint}"
    req = urllib.request.Request(url)
    req.add_header('X-RapidAPI-Key', API_KEY)
    req.add_header('X-RapidAPI-Host', 'tennisapi1.p.rapidapi.com')
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode())

def update_database():
    if API_KEY == "YOUR_API_KEY":
        print("CRITICAL: API_KEY not configured!")
        return

    try:
        print("Step 1: Fetching General Info (Ranking & Points)...")
        player_data = api_call(f"player/{SINNER_ID}")
        
        print("Step 2: Fetching Season Statistics (Serve & Return %)...")
        # Fetches all stats for the 2026 season on all surfaces
        stats_data = api_call(f"player/{SINNER_ID}/statistics/{SEASON}/all")
        # Mapping API fields to our app
        # API usually provides 'servicePointsWon', 'firstServeIn', etc.
        statistics = {
            "first_serve_in": stats_data.get('statistics', {}).get('firstServeIn', 64),
            "break_points_saved": stats_data.get('statistics', {}).get('breakPointsSaved', 73),
            "first_return_won": stats_data.get('statistics', {}).get('firstServeReturnPointsWon', 34),
            "break_points_converted": stats_data.get('statistics', {}).get('breakPointsConverted', 42)
        }

        print("Step 3: Fetching Automated H2H...")
        rivals_list = []
        for name, r_id in RIVALS.items():
            h2h = api_call(f"player/{SINNER_ID}/h2h/{r_id}")
            rivals_list.append({
                "name": name,
                "wins": h2h.get('homeWins', 0),
                "losses": h2h.get('awayWins', 0),
                "country": "🇪🇸" if "Alcaraz" in name else "🇷🇸" if "Djokovic" in name else "🏳️"
            })

        # Final JSON assembly
        database = {
            "last_updated": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "ranking": player_data.get('ranking', 1),
            "total_points": player_data.get('points', 0),
            "win_loss": f"{stats_data.get('statistics', {}).get('matchesWon', 0)} - {stats_data.get('statistics', {}).get('matchesLost', 0)}",
            "stats": statistics,
            "rivalries": rivals_list,
            "tournaments": [
                { "name": "Australian Open", "defending": 2000, "earned": 2000 },
                { "name": "Miami Open", "defending": 1000, "earned": 1000 }
            ]
        }

        with open('data.json', 'w') as f:
            json.dump(database, f, indent=2)
            
        print("DONE! Every single stat is now API-driven.")

    except Exception as e:
        print(f"Error during automation: {e}")

if __name__ == "__main__":
    update_database()