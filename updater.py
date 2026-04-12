import json
import datetime
import urllib.request
import os

API_KEY = os.getenv("API_KEY", "YOUR_API_KEY") 
SINNER_PLAYER_ID = "200615"

def fetch_real_stats():
    print("Fetching from official APIs...")
    
    if API_KEY != "YOUR_API_KEY":
        try:
            url = f"https://tennisapi1.p.rapidapi.com/api/tennis/player/{SINNER_PLAYER_ID}"
            req = urllib.request.Request(url)
            req.add_header('X-RapidAPI-Key', API_KEY)
            req.add_header('X-RapidAPI-Host', 'tennisapi1.p.rapidapi.com')
            
            response = urllib.request.urlopen(req)
            data = json.loads(response.read().decode('utf-8'))
            
            return {
                "ranking": data['ranking'],
                "total_points": data['points'],
                "win_loss": "Updated via API"
            }
        except Exception as e:
            print(f"API connection error: {e}")
            return None
    else:
        print("WARNING: No API_KEY found. Using fallback data.")
        return None

def update_database():
    print("Opening local database (data.json)...")
    try:
        with open('data.json', 'r') as file:
            data = json.load(file)
    except Exception as e:
        print(f"Error reading data.json: {e}")
        return

    new_stats = fetch_real_stats()

    if new_stats:
        data['ranking'] = new_stats['ranking']
        data['total_points'] = new_stats['total_points']
    
    data['last_updated'] = datetime.datetime.now(datetime.timezone.utc).isoformat()

    print("Saving to database...")
    with open('data.json', 'w') as file:
        json.dump(data, file, indent=2)
    
    print("Update completed successfully!")

if __name__ == "__main__":
    update_database()