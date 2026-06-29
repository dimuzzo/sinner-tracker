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
    'X-RapidAPI-Key':  API_KEY,
    'X-RapidAPI-Host': HOST,
    'User-Agent':      'SinnerTrackerBot/11.0'
}

SINNER_ID = 47275
RIVALS = {
    "Carlos Alcaraz":   68074,
    "Novak Djokovic":   5992,
    "Alexander Zverev": 24008
}

# Round IDs → human-readable labels
ROUND_MAP = {
    1: "Q1", 2: "Q2", 3: "Q3",
    4: "1st Round",   5: "2nd Round",  6: "3rd Round",
    7: "4th Round",   8: "Round Robin", 9: "Quarterfinals",
    10: "Semifinals", 11: "Bronze Medal", 12: "Final",
    24: "Quarterfinals"
}

# Tournament-name overrides: cleans up API names
TOURNAMENT_NAME_MAP = {
    "wimbledon":               "Wimbledon",
    "roland garros":           "Roland Garros",
    "australian open":         "Australian Open",
    "us open":                 "US Open",
    "monte-carlo":             "Monte-Carlo Masters",
    "monte carlo":             "Monte-Carlo Masters",
    "madrid":                  "Madrid Open",
    "internazionali":          "Internazionali d'Italia",
    "rome":                    "Internazionali d'Italia",
    "canadian":                "Canadian Open",
    "toronto":                 "Canadian Open",
    "montreal":                "Canadian Open",
    "cincinnati":              "Cincinnati Open",
    "shanghai":                "Shanghai Masters",
    "paris":                   "Paris Masters",
    "indian wells":            "Indian Wells Open",
    "miami":                   "Miami Open",
}

# countryAcr overrides for known tournaments
TOURNAMENT_COUNTRY_MAP = {
    "Wimbledon":               "GBR",
    "Roland Garros":           "FRA",
    "Australian Open":         "AUS",
    "US Open":                 "USA",
    "Monte-Carlo Masters":     "MON",
    "Madrid Open":             "ESP",
    "Internazionali d'Italia": "ITA",
    "Canadian Open":           "CAN",
    "Cincinnati Open":         "USA",
    "Shanghai Masters":        "CHN",
    "Paris Masters":           "FRA",
    "Indian Wells Open":       "USA",
    "Miami Open":              "USA",
}

# ─────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────
def api_call(endpoint_path):
    url = f"https://{HOST}{endpoint_path}"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            res = json.loads(resp.read().decode('utf-8'))
            return res.get('data', res)
    except Exception as e:
        print(f"  [API ERROR] {endpoint_path}: {e}")
        return None

def calculate_pct(part, total):
    if not total or total == 0:
        return 0
    return round((part / total) * 100, 1)

def normalize_tournament_name(raw_name):
    """Apply name overrides so display names are always clean."""
    if not raw_name:
        return raw_name
    lower = raw_name.lower()
    for key, clean in TOURNAMENT_NAME_MAP.items():
        if key in lower:
            return clean
    # Generic cleanup: drop " - City" suffix
    return raw_name.split(' - ')[0].strip()

def build_datetime(date_str, time_str=None):
    """
    Combine a date string (YYYY-MM-DD or ISO) with an optional time string (HH:MM or HH:MM:SS).
    Returns an ISO-8601 string in UTC, or best-effort.
    """
    if not date_str:
        return None
    # If already a full ISO string with time, return as-is
    if 'T' in date_str and len(date_str) > 10:
        return date_str
    # date_str is just YYYY-MM-DD
    if time_str and time_str not in ('00:00', '00:00:00', '0:00'):
        return f"{date_str[:10]}T{time_str[:5]}:00Z"
    return f"{date_str[:10]}T00:00:00Z"

def extract_match_info(match, fallback_tournament=None):
    """
    Extract a clean next_match dict from a fixture object.
    Tries multiple field name patterns the API uses inconsistently.
    """
    # ── Player ID detection ──
    p1_id = str(match.get('player1Id') or match.get('player1_id') or
                (match.get('player1') or {}).get('id') or '')
    p2_id = str(match.get('player2Id') or match.get('player2_id') or
                (match.get('player2') or {}).get('id') or '')
    sinner_str = str(SINNER_ID)

    if sinner_str not in (p1_id, p2_id):
        return None  # Not Sinner's match

    # ── Opponent name ──
    if p1_id == sinner_str:
        opp = (match.get('player2') or {}).get('name') or match.get('player2Name') or 'TBD'
    else:
        opp = (match.get('player1') or {}).get('name') or match.get('player1Name') or 'TBD'

    # ── Tournament name ──
    raw_t = (match.get('tournament') or
             match.get('tournamentName') or
             (match.get('tournamentInfo') or {}).get('name') or
             fallback_tournament or 'TBD')
    t_name = normalize_tournament_name(raw_t)

    # ── Country ──
    t_country = TOURNAMENT_COUNTRY_MAP.get(t_name) or \
                (match.get('tournamentInfo') or {}).get('countryAcr') or 'ITA'

    # ── Round ──
    r_id   = match.get('roundId') or match.get('round_id')
    r_name = ROUND_MAP.get(r_id) or match.get('round') or match.get('roundName') or 'TBD'

    # ── Date + Time ──
    raw_date = (match.get('date') or match.get('startDate') or
                match.get('matchDate') or match.get('scheduled'))
    raw_time = (match.get('time') or match.get('startTime') or
                match.get('matchTime') or match.get('scheduledTime'))
    match_dt = build_datetime(raw_date, raw_time)

    return {
        "opponent":   opp,
        "tournament": t_name,
        "round":      r_name,
        "countryAcr": t_country,
        "date":       match_dt,
    }

# ─────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────
def update_database():
    if not API_KEY or API_KEY == "YOUR_API_KEY":
        print("CRITICAL: API_KEY not configured in GitHub Secrets!")
        return

    try:
        with open('data.json', 'r') as f:
            db = json.load(f)
    except Exception:
        db = {"tournaments": [], "trophies": []}

    try:
        # 1/9 Ranking & Points 
        print("1/9 Syncing Ranking & ATP Points...")
        rankings = api_call("/tennis/v2/atp/ranking/singles/")
        if rankings:
            for r in rankings:
                if str(r.get('player', {}).get('id')) == str(SINNER_ID):
                    db['ranking']      = r.get('position', db.get('ranking'))
                    db['total_points'] = r.get('point',    db.get('total_points'))
                    break

        # 2/9 Win/Loss & Fox Stats
        print("2/9 Syncing Win/Loss & Fox Stats...")
        stats_data = api_call(f"/tennis/v2/atp/player/match-stats/{SINNER_ID}")
        if stats_data:
            serv = stats_data.get('serviceStats', {})
            rtn  = stats_data.get('rtnStats', {})
            bps  = stats_data.get('breakPointsServeStats', {})
            bpr  = stats_data.get('breakPointsRtnStats', {})
            db['stats'] = {
                "first_serve_in":       calculate_pct(serv.get('firstServeGm'),    serv.get('firstServeOfGm')),
                "break_points_saved":   calculate_pct(bps.get('breakPointSavedGm'), bps.get('breakPointFacedGm')),
                "first_return_won":     calculate_pct(rtn.get('winningOnFirstServeGm'), rtn.get('winningOnFirstServeOfGm')),
                "break_points_converted": calculate_pct(bpr.get('breakPointWonGm'), bpr.get('breakPointChanceGm'))
            }

        # 3/9 Next Match 
        print("3/9 Syncing Next Match...")
        next_match = None

        # STRATEGY A: player-specific fixtures endpoint (most reliable)
        print("  [A] Trying /fixtures/player/...")
        player_fixtures = api_call(f"/tennis/v2/atp/fixtures/player/{SINNER_ID}")
        if player_fixtures and isinstance(player_fixtures, list):
            for fix in player_fixtures:
                result = extract_match_info(fix)
                if result:
                    # Prefer a match with a real time (not midnight placeholder)
                    next_match = result
                    print(f"  [A] Found: {result['tournament']} vs {result['opponent']} on {result['date']}")
                    break

        # STRATEGY B: scan daily fixtures for the next 14 days
        # Always run this to try to get a better time than 00:00Z
        print("  [B] Scanning daily fixtures for next 14 days...")
        now         = datetime.datetime.now(datetime.timezone.utc)
        scan_date   = now
        MAX_DAYS    = 14

        for i in range(MAX_DAYS):
            date_str      = scan_date.strftime("%Y-%m-%d")
            daily_fixtures = api_call(f"/tennis/v2/atp/fixtures/{date_str}")

            if daily_fixtures and isinstance(daily_fixtures, list):
                for match in daily_fixtures:
                    result = extract_match_info(match)
                    if result:
                        # Prefer this result if:
                        # 1. We had nothing from Strategy A
                        # 2. Strategy A gave us T00:00:00Z but this has a real time
                        a_has_no_time = (not next_match or
                                         (next_match.get('date') or '').endswith('T00:00:00Z'))
                        b_has_time    = result.get('date') and not result['date'].endswith('T00:00:00Z')

                        if not next_match:
                            next_match = result
                            print(f"  [B] Found: {result['tournament']} vs {result['opponent']} on {result['date']}")
                            break
                        elif a_has_no_time and b_has_time:
                            print(f"  [B] Upgraded time: {result['date']}")
                            next_match['date'] = result['date']
                            break
                else:
                    scan_date += datetime.timedelta(days=1)
                    continue
                break  # found and not overriding, stop scanning

            scan_date += datetime.timedelta(days=1)

        if next_match:
            db['next_match'] = next_match
            print(f"  → Saved: {next_match}")
        else:
            db['next_match'] = {
                "opponent": "TBD", "tournament": "Off Season",
                "round": "TBD",    "countryAcr": "ITA", "date": None
            }
            print("  → No upcoming match found, set to Off Season.")

        # 4/9 H2H Rivalries
        print("4/9 Syncing H2H...")
        new_rivalries = []
        COUNTRY_FOR = {"Carlos Alcaraz": "ES", "Novak Djokovic": "SR", "Alexander Zverev": "DE"}
        for name, r_id in RIVALS.items():
            h2h = api_call(f"/tennis/v2/atp/h2h/info/{SINNER_ID}/{r_id}")
            p1_wins = p2_wins = 0
            if h2h and isinstance(h2h, list):
                for surface in h2h:
                    p1_wins += int(surface.get('player1wins', 0))
                    p2_wins += int(surface.get('player2wins', 0))
            new_rivalries.append({
                "name":    name,
                "wins":    p1_wins,
                "losses":  p2_wins,
                "country": COUNTRY_FOR.get(name, ''),
            })
        if new_rivalries:
            db['rivalries'] = new_rivalries

        # 5/9 Recent Form & Streak
        print("5/9 Syncing Recent Form & Fox Streak...")
        past_matches = api_call(f"/tennis/v2/atp/player/past-matches/{SINNER_ID}")
        recent_form  = []
        streak       = 0
        streak_done  = False

        if past_matches and isinstance(past_matches, list):
            for m in past_matches:
                p1      = m.get("player1", {})
                p2      = m.get("player2", {})
                is_p1   = str(p1.get("id")) == str(SINNER_ID)
                opp     = p2.get("name") if is_p1 else p1.get("name")
                is_win  = str(m.get("match_winner")) == str(SINNER_ID)

                if len(recent_form) < 5:
                    recent_form.append({"win": is_win, "opponent": opp, "result": m.get("result", "")})
                if not streak_done:
                    if is_win:
                        streak += 1
                    else:
                        streak_done = True

        db['recent_form']    = recent_form
        db['current_streak'] = streak

        # 6/9 Surface Mastery
        print("6/9 Syncing Surface Mastery...")
        surface_data = api_call(f"/tennis/v2/atp/player/surface-summary/{SINNER_ID}")
        surfaces_db  = {"Hard": 0, "Clay": 0, "Grass": 0}
        if surface_data and isinstance(surface_data, list) and len(surface_data) > 0:
            for s in surface_data[0].get('surfaces', []):
                court = s.get("court", "").lower()
                wins  = int(s.get("courtWins", 0))
                if "hard" in court:
                    surfaces_db["Hard"] += wins
                elif "clay" in court:
                    surfaces_db["Clay"] += wins
                elif "grass" in court:
                    surfaces_db["Grass"] += wins
        db['surface_mastery'] = surfaces_db

        # 7/9 Roadmap
        print("7/9 Syncing Tournament Roadmap...")
        now          = datetime.datetime.now(datetime.timezone.utc)
        current_year = now.year
        elite_schedule = [
            {"name": "Monte-Carlo Masters",     "date": f"{current_year}-04-12T00:00:00Z", "court": "Clay",   "country": "MON"},
            {"name": "Madrid Open",             "date": f"{current_year}-04-24T00:00:00Z", "court": "Clay",   "country": "ESP"},
            {"name": "Internazionali d'Italia", "date": f"{current_year}-05-08T00:00:00Z", "court": "Clay",   "country": "ITA"},
            {"name": "Roland Garros",           "date": f"{current_year}-05-26T00:00:00Z", "court": "Clay",   "country": "FRA"},
            {"name": "Halle Open",              "date": f"{current_year}-06-17T00:00:00Z", "court": "Grass",  "country": "GER"},
            {"name": "Wimbledon",               "date": f"{current_year}-06-29T00:00:00Z", "court": "Grass",  "country": "GBR"},
            {"name": "Canadian Open",           "date": f"{current_year}-08-06T00:00:00Z", "court": "Hard",   "country": "CAN"},
            {"name": "Cincinnati Open",         "date": f"{current_year}-08-12T00:00:00Z", "court": "Hard",   "country": "USA"},
            {"name": "US Open",                 "date": f"{current_year}-08-26T00:00:00Z", "court": "Hard",   "country": "USA"},
            {"name": "China Open",              "date": f"{current_year}-09-26T00:00:00Z", "court": "Hard",   "country": "CHN"},
            {"name": "Shanghai Masters",        "date": f"{current_year}-10-02T00:00:00Z", "court": "Hard",   "country": "CHN"},
            {"name": "Paris Masters",           "date": f"{current_year}-10-28T00:00:00Z", "court": "I.hard", "country": "FRA"},
            {"name": "ATP Finals Turin",        "date": f"{current_year}-11-10T00:00:00Z", "court": "I.hard", "country": "ITA"},
        ]
        db['roadmap'] = [
            t for t in elite_schedule
            if datetime.datetime.strptime(t["date"][:10], "%Y-%m-%d")
               .replace(tzinfo=datetime.timezone.utc) >= now
        ][:5]

        # 8/9 Pigeon & Nemesis
        print("8/9 Syncing Pigeon & Nemesis...")
        h2h_data = api_call(f"/tennis/v2/atp/player/intersting-h2h/{SINNER_ID}")
        pigeon  = {"name": "TBD", "diff": -999, "wins": 0, "losses": 0}
        nemesis = {"name": "TBD", "diff":  999, "wins": 0, "losses": 0}

        if h2h_data and isinstance(h2h_data, list):
            for entry in h2h_data:
                p1, p2 = entry.get("player1", {}), entry.get("player2", {})
                if str(p1.get("id")) == str(SINNER_ID):
                    s_wins, o_wins, o_name = p1.get("wins", 0), p2.get("wins", 0), p2.get("name", "Unknown")
                else:
                    s_wins, o_wins, o_name = p2.get("wins", 0), p1.get("wins", 0), p1.get("name", "Unknown")
                diff = s_wins - o_wins
                if diff > pigeon["diff"]:
                    pigeon  = {"name": o_name, "diff": diff, "wins": s_wins, "losses": o_wins}
                if diff < nemesis["diff"]:
                    nemesis = {"name": o_name, "diff": diff, "wins": s_wins, "losses": o_wins}

        db['special_h2h'] = {"pigeon": pigeon, "nemesis": nemesis}

        # 9/9 Player Bio
        print("9/9 Syncing Player Bio...")
        bio_data = api_call(f"/tennis/v2/atp/player/profile/{SINNER_ID}")
        if bio_data:
            info = bio_data.get('information', {})
            db['bio'] = {
                "turned_pro": info.get('turnedPro',  '2018'),
                "weight":     info.get('weight',     '77'),
                "height":     info.get('height',     '191'),
                "birthplace": info.get('birthplace', 'San Candido, Italy'),
                "plays":      info.get('plays',      'Right-Handed, Two-Handed Backhand'),
                "coach":      info.get('coach',      'Simone Vagnozzi, Darren Cahill'),
            }

        # 10/9 Race to Turin
        db['race_points'] = sum(t.get('earned', 0) for t in db.get('tournaments', []))

        # 11/9 Save
        db['last_updated'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        with open('data.json', 'w') as f:
            json.dump(db, f, indent=2)

        print("\nSUCCESS: data.json updated!")

    except Exception as e:
        import traceback
        print(f"\nCritical error: {e}")
        traceback.print_exc()


if __name__ == "__main__":
    update_database()