"""Parse Strava/GPX activities — no Excel; saves JSON + prints fields for app logging."""

import csv
import hashlib
import json
import zipfile
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IMPORTS_DIR = ROOT / "imports" / "runs"
PROCESSED_DIR = ROOT / "imports" / "processed"
ACTIVITIES_JSON = PROCESSED_DIR / "activities.json"

RUN_TYPES = {"run", "virtual run", "virtualrun", "trail run", "trailrun"}


def format_duration(seconds: int) -> str:
    seconds = int(seconds)
    h, rem = divmod(seconds, 3600)
    m, s = divmod(rem, 60)
    if h:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m}:{s:02d}"


def calc_pace(distance_km: float, seconds: int) -> str:
    if distance_km <= 0 or seconds <= 0:
        return ""
    sec_per_km = seconds / distance_km
    return f"{int(sec_per_km // 60)}:{int(sec_per_km % 60):02d}/km"


def calc_speed_kmh(speed_ms: float) -> str:
    if not speed_ms:
        return ""
    return f"{speed_ms * 3.6:.1f} km/h"


def make_activity(
    *,
    activity_id,
    date: str,
    start_time: str,
    activity_type: str,
    name: str,
    distance_km: float,
    seconds: int,
    source: str,
    pace_or_speed: str = "",
    cadence="",
    elevation_m="",
    hr_avg="",
    calories="",
) -> dict:
    if not pace_or_speed and distance_km > 0 and seconds > 0:
        if activity_type.lower() in {"ride", "virtual ride", "ebikeride"}:
            speed_ms = (distance_km * 1000) / seconds
            pace_or_speed = calc_speed_kmh(speed_ms)
        else:
            pace_or_speed = calc_pace(distance_km, seconds)

    return {
        "activity_id": str(activity_id),
        "date": date,
        "start_time": start_time,
        "activity_type": activity_type,
        "name": name,
        "distance_km": round(distance_km, 2),
        "time": format_duration(seconds),
        "seconds": seconds,
        "pace_or_speed": pace_or_speed,
        "cadence": str(int(float(cadence))) if cadence not in ("", None) else "",
        "elevation_m": int(float(elevation_m)) if elevation_m not in ("", None) else "",
        "hr_avg": int(float(hr_avg)) if hr_avg not in ("", None) else "",
        "calories": int(float(calories)) if calories not in ("", None) else "",
        "source": source,
    }


def parse_duration_value(raw: str) -> int:
    if not raw:
        return 0
    raw = str(raw).strip()
    if raw.replace(".", "", 1).isdigit():
        return int(float(raw))
    parts = raw.split(":")
    try:
        parts = [int(float(p)) for p in parts]
    except ValueError:
        return 0
    if len(parts) == 3:
        return parts[0] * 3600 + parts[1] * 60 + parts[2]
    if len(parts) == 2:
        return parts[0] * 60 + parts[1]
    return 0


def parse_datetime_raw(date_raw: str) -> tuple[str, str]:
    for fmt in (
        "%b %d, %Y, %I:%M:%S %p",
        "%Y-%m-%d %H:%M:%S",
        "%m/%d/%Y %H:%M:%S",
        "%Y-%m-%d",
    ):
        try:
            dt = datetime.strptime(date_raw.strip(), fmt)
            return dt.strftime("%Y-%m-%d"), dt.strftime("%H:%M")
        except ValueError:
            continue
    if len(date_raw) >= 10:
        return date_raw[:10], ""
    return "", ""


def parse_strava_csv_row(row: dict, source: str = "Strava CSV") -> dict | None:
    norm = {k.strip().lower(): (v or "").strip() for k, v in row.items()}
    date_raw = norm.get("activity date", norm.get("date", ""))
    if not date_raw:
        return None
    date_str, start_time = parse_datetime_raw(date_raw)
    if not date_str:
        return None

    activity_type = norm.get("activity type", norm.get("type", "Unknown")) or "Unknown"
    name = norm.get("activity name", norm.get("name", activity_type))
    dist_raw = norm.get("distance", "0").replace(",", "")
    try:
        dist_val = float(dist_raw)
    except ValueError:
        dist_val = 0
    distance_km = dist_val / 1000 if dist_val > 50 else dist_val
    seconds = parse_duration_value(norm.get("moving time") or norm.get("elapsed time") or "0")
    activity_id = norm.get("activity id", norm.get("id", "")) or hashlib.md5(
        f"{date_str}-{name}-{distance_km}".encode()
    ).hexdigest()[:12]

    avg_speed_raw = norm.get("average speed", "")
    pace_or_speed = ""
    if activity_type.lower() in {"ride", "virtual ride", "ebikeride"}:
        try:
            pace_or_speed = calc_speed_kmh(float(avg_speed_raw))
        except ValueError:
            pass

    return make_activity(
        activity_id=activity_id,
        date=date_str,
        start_time=start_time,
        activity_type=activity_type,
        name=name,
        distance_km=distance_km,
        seconds=seconds,
        source=source,
        pace_or_speed=pace_or_speed,
        cadence=norm.get("average cadence", ""),
        elevation_m=norm.get("elevation gain", ""),
        hr_avg=norm.get("average heart rate", ""),
        calories=norm.get("calories", ""),
    )


def gpx_moving_seconds(gpx) -> int:
    data = gpx.get_moving_data()
    return int(data.moving_time) if data and data.moving_time else 0


def gpx_activity_type(gpx) -> str:
    if not gpx.tracks:
        return "Run"
    t = (gpx.tracks[0].type or "").lower()
    if "walk" in t:
        return "Walk"
    if "cycl" in t or "bike" in t:
        return "Ride"
    if "hike" in t:
        return "Hike"
    return "Run"


def parse_gpx(path: Path, activity_type: str | None = None) -> dict | None:
    try:
        import gpxpy
    except ImportError:
        raise ImportError("Install gpxpy: pip3 install gpxpy")

    with path.open() as f:
        gpx = gpxpy.parse(f)
    if not gpx.tracks:
        return None

    distance_m = gpx.length_3d()
    seconds = gpx_moving_seconds(gpx)
    act_type = activity_type or gpx_activity_type(gpx)
    start = None
    for track in gpx.tracks:
        for seg in track.segments:
            if seg.points and seg.points[0].time:
                start = seg.points[0].time
                break
        if start:
            break

    date_str = start.strftime("%Y-%m-%d") if start else ""
    start_time = start.strftime("%H:%M") if start else ""
    name = gpx.tracks[0].name or path.stem
    activity_id = hashlib.md5(f"{path.name}-{date_str}-{distance_m}".encode()).hexdigest()[:12]

    return make_activity(
        activity_id=activity_id,
        date=date_str,
        start_time=start_time,
        activity_type=act_type,
        name=name,
        distance_km=distance_m / 1000,
        seconds=seconds,
        source="GPX",
    )


def parse_strava_csv(path: Path) -> list[dict]:
    activities = []
    with path.open(newline="", encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            act = parse_strava_csv_row(row)
            if act:
                activities.append(act)
    return activities


def parse_strava_zip(path: Path) -> list[dict]:
    source = f"Strava export ({path.name})"
    with zipfile.ZipFile(path) as zf:
        csv_names = [n for n in zf.namelist() if n.endswith("activities.csv")]
        if csv_names:
            with zf.open(csv_names[0]) as f:
                text = f.read().decode("utf-8-sig")
                activities = []
                for row in csv.DictReader(text.splitlines()):
                    act = parse_strava_csv_row(row, source=source)
                    if act:
                        activities.append(act)
                return activities

        import gpxpy
        activities = []
        for name in zf.namelist():
            if name.lower().endswith(".gpx"):
                with zf.open(name) as f:
                    gpx = gpxpy.parse(f)
                dist_m = gpx.length_3d()
                seconds = gpx_moving_seconds(gpx)
                start = None
                for track in gpx.tracks:
                    for seg in track.segments:
                        if seg.points and seg.points[0].time:
                            start = seg.points[0].time
                            break
                if start and dist_m > 0:
                    activities.append(
                        make_activity(
                            activity_id=Path(name).stem,
                            date=start.strftime("%Y-%m-%d"),
                            start_time=start.strftime("%H:%M"),
                            activity_type=gpx_activity_type(gpx),
                            name=gpx.tracks[0].name if gpx.tracks else Path(name).stem,
                            distance_km=dist_m / 1000,
                            seconds=seconds,
                            source=source,
                        )
                    )
        return activities


def _load_existing() -> dict[str, dict]:
    if not ACTIVITIES_JSON.exists():
        return {}
    try:
        data = json.loads(ACTIVITIES_JSON.read_text())
        return {a["activity_id"]: a for a in data if a.get("activity_id")}
    except (json.JSONDecodeError, OSError):
        return {}


def export_activities(activities: list[dict], verbose: bool = True) -> dict:
    """Merge into imports/processed/activities.json and print run fields for the app."""
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    merged = _load_existing()
    stats = {"saved": 0, "runs": 0, "skipped": 0, "by_type": {}}

    for act in activities:
        if not act.get("date"):
            stats["skipped"] += 1
            continue
        merged[act["activity_id"]] = {**act, "imported_at": datetime.now().isoformat(timespec="seconds")}
        stats["saved"] += 1
        t = act["activity_type"]
        stats["by_type"][t] = stats["by_type"].get(t, 0) + 1

        if act["activity_type"].lower() in RUN_TYPES and verbose:
            stats["runs"] += 1
            pace = act["pace_or_speed"].replace("/km", "") if act["pace_or_speed"] else "—"
            print(f"  → {act['date']}  {act['distance_km']} km  {act['time']}  pace {pace}")
            print(f"     Log in app: km / time / pace / cadence / RPE / knee")

    ordered = sorted(merged.values(), key=lambda a: (a.get("date", ""), a.get("start_time", "")), reverse=True)
    ACTIVITIES_JSON.write_text(json.dumps(ordered, indent=2))
    return stats
