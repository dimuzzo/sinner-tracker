import json
import datetime
import urllib.request
import os

# ─────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────
API_KEY = os.getenv("API_KEY", "").strip()
HOST    = "tennis-api-atp-wta-itf.p.rapidapi.com"
HEADERS = {
    'X-RapidAPI-Key': API_KEY,
    'X-RapidAPI-Host': HOST,
    'User-Agent': 'SinnerTrackerBot/13.0'
}

SINNER_ID = 47275
RIVALS = {
    "Carlos Alcaraz": 68074,
    "Novak Djokovic": 5992,
    "Alexander Zverev": 24008
}

ROUND_MAP = {
    1: "Q1", 2: "Q2", 3: "Q3", 4: "1st Round", 5: "2nd Round", 6: "3rd Round",
    7: "4th Round", 8: "Round Robin", 9: "Quarterfinals", 10: "Semifinals", 
    11: "Bronze Medal", 12: "Final", 24: "Quarterfinals"
}

TOURNAMENT_NAME_MAP = {
    "wimbledon": "Wimbledon", "roland garros": "Roland Garros", "australian open": "Australian Open",
    "us open": "US Open", "monte-carlo": "Monte-Carlo Masters", "monte carlo": "Monte-Carlo Masters",
    "madrid": "Madrid Open", "internazionali": "Internazionali d'Italia", "rome": "Internazionali d'Italia",
    "canadian": "Canadian Open", "toronto": "Canadian Open", "montreal": "Canadian Open",
    "cincinnati": "Cincinnati Open", "shanghai": "Shanghai Masters", "paris": "Paris Masters",
    "indian wells": "Indian Wells Open", "miami": "Miami Open",
}

TOURNAMENT_COUNTRY_MAP = {
    "Wimbledon": "GBR", "Roland Garros": "FRA", "Australian Open": "AUS", "US Open": "USA",
    "Monte-Carlo Masters": "MON", "Madrid Open": "ESP", "Internazionali d'Italia": "ITA",
    "Canadian Open": "CAN", "Cincinnati Open": "USA", "Shanghai Masters": "CHN",
    "Paris Masters": "FRA", "Indian Wells Open": "USA", "Miami Open": "USA",
}

def api_call(endpoint_path):
    url = f"https://{HOST}{endpoint_path}"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            res = json.loads(resp.read().decode('utf-8'))
            
            # Anti soft error: if the response is a dict with a "message" key but no "data" key, treat it as an error
            if isinstance(res, dict) and "message" in res and "data" not in res:
                print(f"[API SOFT ERROR] {endpoint_path}: {res['message']}")
                return None
                
            return res.get('data', res)
    except Exception as e:
        print(f"[API ERROR] {endpoint_path}: {e}")
        return None

def calculate_pct(part, total):
    if not total or total == 0: return 0
    return round((part / total) * 100, 1)

def normalize_tournament_name(raw_name):
    if not raw_name: return raw_name
    lower = raw_name.lower()
    for key, clean in TOURNAMENT_NAME_MAP.items():
        if key in lower: return clean
    return raw_name.split(' - ')[0].strip()

def build_datetime(date_str, time_str=None):
    if not date_str: return None
    if 'T' in date_str and len(date_str) > 10: return date_str
    if time_str and time_str not in ('00:00', '00:00:00', '0:00'):
        return f"{date_str[:10]}T{time_str[:5]}:00Z"
    return f"{date_str[:10]}T00:00:00Z"

def extract_match_info(match, fallback_tournament=None):
    p1_id = str(match.get('player1Id') or match.get('player1_id') or (match.get('player1') or {}).get('id') or '')
    p2_id = str(match.get('player2Id') or match.get('player2_id') or (match.get('player2') or {}).get('id') or '')
    sinner_str = str(SINNER_ID)

    if sinner_str not in (p1_id, p2_id): return None
    opp = (match.get('player2') or {}).get('name') or match.get('player2Name') or 'TBD' if p1_id == sinner_str else (match.get('player1') or {}).get('name') or match.get('player1Name') or 'TBD'
    raw_t = match.get('tournament') or match.get('tournamentName') or (match.get('tournamentInfo') or {}).get('name') or fallback_tournament or 'TBD'
    t_name = normalize_tournament_name(raw_t)
    t_country = TOURNAMENT_COUNTRY_MAP.get(t_name) or (match.get('tournamentInfo') or {}).get('countryAcr') or 'ITA'
    r_id = match.get('roundId') or match.get('round_id')
    r_name = ROUND_MAP.get(r_id) or match.get('round') or match.get('roundName') or 'TBD'
    raw_date = match.get('date') or match.get('startDate') or match.get('matchDate') or match.get('scheduled')
    raw_time = match.get('time') or match.get('startTime') or match.get('matchTime') or match.get('scheduledTime')
    return {"opponent": opp, "tournament": t_name, "round": r_name, "countryAcr": t_country, "date": build_datetime(raw_date, raw_time)}

def update_database():
    if not API_KEY or API_KEY == "YOUR_API_KEY":
        print("CRITICAL: API_KEY not configured!")
        return

    try:
        with open('data.json', 'r') as f:
            db = json.load(f)
    except Exception:
        db = {"tournaments": [], "trophies": []}

    db['api_errors'] = []

    try:
        # 1/9 Ranking
        print("1/9 Syncing Ranking...")
        rankings = api_call("/tennis/v2/atp/ranking/singles/")
        # rankings must be a non-empty list
        if rankings and isinstance(rankings, list) and len(rankings) > 0:
            for r in rankings:
                if str(r.get('player', {}).get('id')) == str(SINNER_ID):
                    db['ranking'] = r.get('position', db.get('ranking'))
                    db['total_points'] = r.get('point', db.get('total_points'))
                    break
        else:
            db['api_errors'].append('ranking')

        # 2/9 Stats
        print("2/9 Syncing Stats...")
        stats_data = api_call(f"/tennis/v2/atp/player/match-stats/{SINNER_ID}")
        # stats_data must be a non-empty list
        if stats_data and isinstance(stats_data, dict) and 'serviceStats' in stats_data:
            serv, rtn = stats_data.get('serviceStats', {}), stats_data.get('rtnStats', {})
            bps, bpr = stats_data.get('breakPointsServeStats', {}), stats_data.get('breakPointsRtnStats', {})
            db['stats'] = {
                "first_serve_in": calculate_pct(serv.get('firstServeGm'), serv.get('firstServeOfGm')),
                "break_points_saved": calculate_pct(bps.get('breakPointSavedGm'), bps.get('breakPointFacedGm')),
                "first_return_won": calculate_pct(rtn.get('winningOnFirstServeGm'), rtn.get('winningOnFirstServeOfGm')),
                "break_points_converted": calculate_pct(bpr.get('breakPointWonGm'), bpr.get('breakPointChanceGm'))
            }
        else:
            db['api_errors'].append('stats')

        # 3/9 Next Match
        print("3/9 Syncing Next Match...")
        now = datetime.datetime.now(datetime.timezone.utc)
        existing_match = db.get('next_match', {})
        next_match = None

        ms_upcoming = api_call(f"/tennis/ms/player/upcoming/{SINNER_ID}")
        if ms_upcoming:
            candidates = ms_upcoming if isinstance(ms_upcoming, list) else [ms_upcoming]
            for item in candidates:
                res = extract_match_info(item)
                if res and res.get('opponent') not in (None, '', 'TBD'):
                    next_match = res; break

        if not next_match or next_match.get('opponent') in (None, '', 'TBD'):
            ms_potential = api_call(f"/tennis/ms/player/potential-fixtures/{SINNER_ID}")
            if ms_potential:
                candidates = ms_potential if isinstance(ms_potential, list) else [ms_potential]
                for item in candidates:
                    res = extract_match_info(item)
                    if res:
                        if not next_match: next_match = res
                        elif res.get('opponent') not in (None, '', 'TBD'): next_match = res
                        if next_match.get('opponent') not in (None, '', 'TBD'): break

        if not next_match:
            player_fixtures = api_call(f"/tennis/v2/atp/fixtures/player/{SINNER_ID}")
            if player_fixtures and isinstance(player_fixtures, list):
                for fix in player_fixtures:
                    res = extract_match_info(fix)
                    if res: next_match = res; break

        needs_time = not next_match or not next_match.get('date') or next_match['date'].endswith('T00:00:00Z')
        if needs_time:
            scan_date = now
            for _ in range(14):
                daily = api_call(f"/tennis/v2/atp/fixtures/{scan_date.strftime('%Y-%m-%d')}")
                if daily and isinstance(daily, list):
                    for match in daily:
                        res = extract_match_info(match)
                        if res:
                            has_real_time = res.get('date') and not res['date'].endswith('T00:00:00Z')
                            if not next_match: next_match = res; break
                            elif has_real_time:
                                next_match['date'] = res['date']
                                if next_match.get('opponent') in (None, '', 'TBD') and res.get('opponent') not in (None, '', 'TBD'):
                                    next_match['opponent'] = res['opponent']
                                break
                    else:
                        scan_date += datetime.timedelta(days=1); continue
                    if not needs_time or (next_match and next_match.get('date') and not next_match['date'].endswith('T00:00:00Z')): break
                    scan_date += datetime.timedelta(days=1); continue
                scan_date += datetime.timedelta(days=1)

        if next_match:
            if next_match.get('opponent') in (None, '', 'TBD'):
                kept = existing_match.get('opponent')
                if kept and kept not in ('TBD', 'Unknown Player', 'Off Season'): next_match['opponent'] = kept
            if next_match.get('tournament') in (None, '', 'TBD'):
                kept_t = existing_match.get('tournament')
                if kept_t and kept_t not in ('TBD', 'Off Season'):
                    next_match['tournament'] = kept_t
                    next_match['countryAcr'] = existing_match.get('countryAcr', 'ITA')
            db['next_match'] = next_match
        else:
            if existing_match.get('tournament') not in (None, '', 'TBD', 'Off Season'): pass
            else: db['next_match'] = {"opponent": "TBD", "tournament": "Off Season", "round": "TBD", "countryAcr": "ITA", "date": None}

        # 4/9 H2H Rivalries
        print("4/9 Syncing H2H...")
        new_rivalries = []
        COUNTRY_FOR = {"Carlos Alcaraz": "ES", "Novak Djokovic": "SR", "Alexander Zverev": "DE"}
        h2h_failed = False
        for name, r_id in RIVALS.items():
            h2h = api_call(f"/tennis/v2/atp/h2h/info/{SINNER_ID}/{r_id}")
            # h2h_data must be a non-empty list
            if not h2h or not isinstance(h2h, list) or len(h2h) == 0:
                h2h_failed = True
                break
            p1_wins = p2_wins = 0
            for surface in h2h:
                p1_wins += int(surface.get('player1wins', 0))
                p2_wins += int(surface.get('player2wins', 0))
            new_rivalries.append({"name": name, "wins": p1_wins, "losses": p2_wins, "country": COUNTRY_FOR.get(name, '')})
        
        if not h2h_failed and len(new_rivalries) == len(RIVALS): 
            db['rivalries'] = new_rivalries
        else: 
            db['api_errors'].append('rivalries')

        # 5/9 Form & Streak
        print("5/9 Syncing Recent Form & Fox Streak...")
        past_matches = api_call(f"/tennis/v2/atp/player/past-matches/{SINNER_ID}")
        # past_matches must be a non-empty list
        if past_matches and isinstance(past_matches, list) and len(past_matches) > 0:
            recent_form, streak, streak_done = [], 0, False
            for m in past_matches:
                p1, p2 = m.get("player1", {}), m.get("player2", {})
                is_p1 = str(p1.get("id")) == str(SINNER_ID)
                opp = p2.get("name") if is_p1 else p1.get("name")
                is_win = str(m.get("match_winner")) == str(SINNER_ID)
                if len(recent_form) < 5: recent_form.append({"win": is_win, "opponent": opp, "result": m.get("result", "")})
                if not streak_done:
                    if is_win: streak += 1
                    else: streak_done = True
            db['recent_form'] = recent_form
            db['current_streak'] = streak
        else:
            db['api_errors'].append('recent_form')

        # 6/9 Surface Mastery
        print("6/9 Syncing Surface...")
        surface_data = api_call(f"/tennis/v2/atp/player/surface-summary/{SINNER_ID}")
        # surface_data must be a non-empty list
        if surface_data and isinstance(surface_data, list) and len(surface_data) > 0:
            surfaces_db = {"Hard": 0, "Clay": 0, "Grass": 0}
            for s in surface_data[0].get('surfaces', []):
                court, wins = s.get("court", "").lower(), int(s.get("courtWins", 0))
                if "hard" in court: surfaces_db["Hard"] += wins
                elif "clay" in court: surfaces_db["Clay"] += wins
                elif "grass" in court: surfaces_db["Grass"] += wins
            db['surface_mastery'] = surfaces_db
        else:
            db['api_errors'].append('surface_mastery')

        # 7/9 Roadmap
        print("7/9 Syncing Tournament Roadmap...")
        now          = datetime.datetime.now(datetime.timezone.utc)
        current_year = now.year
        elite_schedule = [
            {"name": "Monte-Carlo Masters", "date": f"{current_year}-04-12T00:00:00Z", "court": "Clay",   "country": "MON"},
            {"name": "Madrid Open", "date": f"{current_year}-04-24T00:00:00Z", "court": "Clay",   "country": "ESP"},
            {"name": "Internazionali d'Italia", "date": f"{current_year}-05-08T00:00:00Z", "court": "Clay",   "country": "ITA"},
            {"name": "Roland Garros", "date": f"{current_year}-05-26T00:00:00Z", "court": "Clay",   "country": "FRA"},
            {"name": "Halle Open", "date": f"{current_year}-06-17T00:00:00Z", "court": "Grass",  "country": "GER", "withdrawn": True},
            {"name": "Wimbledon", "date": f"{current_year}-06-29T00:00:00Z", "court": "Grass",  "country": "GBR"},
            {"name": "Canadian Open", "date": f"{current_year}-08-06T00:00:00Z", "court": "Hard",   "country": "CAN", "withdrawn": True},
            {"name": "Cincinnati Open", "date": f"{current_year}-08-12T00:00:00Z", "court": "Hard",   "country": "USA", "withdrawn": True},
            {"name": "US Open", "date": f"{current_year}-08-26T00:00:00Z", "court": "Hard",   "country": "USA"},
            {"name": "China Open", "date": f"{current_year}-09-26T00:00:00Z", "court": "Hard",   "country": "CHN"},
            {"name": "Shanghai Masters", "date": f"{current_year}-10-02T00:00:00Z", "court": "Hard",   "country": "CHN"},
            {"name": "Paris Masters", "date": f"{current_year}-10-28T00:00:00Z", "court": "I.hard", "country": "FRA"},
            {"name": "ATP Finals Turin", "date": f"{current_year}-11-10T00:00:00Z", "court": "I.hard", "country": "ITA"},
        ]
        db['roadmap'] = [
            t for t in elite_schedule
            if datetime.datetime.strptime(t["date"][:10], "%Y-%m-%d").replace(tzinfo=datetime.timezone.utc) >= now - datetime.timedelta(days=7)
        ][:5]

        # 8/9 Special H2H
        print("8/9 Syncing Pigeon & Nemesis...")
        h2h_data = api_call(f"/tennis/v2/atp/player/intersting-h2h/{SINNER_ID}")
        # h2h_data must be a non-empty list
        if h2h_data and isinstance(h2h_data, list) and len(h2h_data) > 0:
            pigeon = {"name": "TBD", "diff": -999, "wins": 0, "losses": 0}
            nemesis = {"name": "TBD", "diff": 999, "wins": 0, "losses": 0}
            for entry in h2h_data:
                p1, p2 = entry.get("player1", {}), entry.get("player2", {})
                if str(p1.get("id")) == str(SINNER_ID): s_wins, o_wins, o_name = p1.get("wins", 0), p2.get("wins", 0), p2.get("name", "Unknown")
                else: s_wins, o_wins, o_name = p2.get("wins", 0), p1.get("wins", 0), p1.get("name", "Unknown")
                diff = s_wins - o_wins
                if diff > pigeon["diff"]: pigeon = {"name": o_name, "diff": diff, "wins": s_wins, "losses": o_wins}
                if diff < nemesis["diff"]: nemesis = {"name": o_name, "diff": diff, "wins": s_wins, "losses": o_wins}
            db['special_h2h'] = {"pigeon": pigeon, "nemesis": nemesis}
        else:
            db['api_errors'].append('special_h2h')

        # 9/9 Player Bio
        print("9/9 Syncing Player Bio...")
        bio_data = api_call(f"/tennis/v2/atp/player/profile/{SINNER_ID}")
        if bio_data and isinstance(bio_data, dict) and 'information' in bio_data:
            info = bio_data.get('information', {})
            db['bio'] = {
                "turned_pro": info.get('turnedPro', '2018'), "weight": info.get('weight', '77'),
                "height": info.get('height', '191'), "birthplace": info.get('birthplace', 'San Candido, Italy'),
                "plays": info.get('plays', 'Right-Handed, Two-Handed Backhand'), "coach": info.get('coach', 'Simone Vagnozzi, Darren Cahill')
            }

        db['race_points'] = sum(t.get('earned', 0) for t in db.get('tournaments', []))
        db['last_updated'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        # Saving the updated database to data.json
        with open('data.json', 'w') as f:
            json.dump(db, f, indent=2)
        print("\nSUCCESS: data.json updated safely!")

    except Exception as e:
        print(f"\nCritical error: {e}")

if __name__ == "__main__":
    update_database()