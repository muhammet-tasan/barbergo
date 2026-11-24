#!/usr/bin/env python3
"""BarberGo - per-task ntfy.sh notifications, enforced by hooks.

Rules (see docs/dev-notifications.md):
  * Default is always OFF.
  * The token `/my-notification-on` anywhere in a submitted prompt arms
    notifications for THAT task only (e.g. `/goal /my-notification-on ...`).
    `/goal` alone arms nothing.
  * The arming is bound to the prompt_id of that prompt. It is cleared when
    the task finishes (Stop hook) and ALWAYS cleared when the next prompt is
    submitted, so the next task starts off - even in the same session.
  * State is per session (.claude/notify-state/<session_id>), so parallel
    sessions never influence each other.

Usage (wired in .claude/settings.json):  notify.py prompt|stop|notification|start|end
Reads the hook's JSON from stdin. Never blocks, never raises: always exit 0.

Environment (tests / overrides):
  BARBERGO_NTFY_BASE         base URL, default https://ntfy.sh
  BARBERGO_NTFY_TOPIC        topic, default barbergo-muhammet
  BARBERGO_NOTIFY_STATE_DIR  state dir, default <repo>/.claude/notify-state
  BARBERGO_NOTIFY_GOAL_WAIT  seconds to wait for the /goal verdict, default 12
"""
import json
import os
import re
import sys
import time
import urllib.request

# Anchored to this file (not the cwd): sessions may run inside apps/mobile.
STATE_DIR = os.environ.get(
    "BARBERGO_NOTIFY_STATE_DIR",
    os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "notify-state")))
BASE = os.environ.get("BARBERGO_NTFY_BASE", "https://ntfy.sh").rstrip("/")
TOPIC = os.environ.get("BARBERGO_NTFY_TOPIC", "barbergo-muhammet")
GOAL_WAIT = float(os.environ.get("BARBERGO_NOTIFY_GOAL_WAIT", "12"))
MAX_AGE = 12 * 3600  # armed state older than this is ignored and deleted

# A standalone token: preceded/followed by whitespace or string edge, so
# `/my-notification-on` quoted in backticks or inside a path does not count.
ON_TOKEN = re.compile(r"(?:^|\s)/my-notification-on(?=\s|$)", re.I)
GOAL_TOKEN = re.compile(r"(?:^|\s)/goal(?=\s|$)", re.I)


def read_input():
    try:
        d = json.load(sys.stdin)
        return d if isinstance(d, dict) else {}
    except Exception:
        return {}


def state_path(session_id):
    safe = re.sub(r"[^A-Za-z0-9._-]", "_", str(session_id))
    return os.path.join(STATE_DIR, safe)


def clear(session_id):
    try:
        os.remove(state_path(session_id))
    except OSError:
        pass


def load_state(session_id):
    try:
        with open(state_path(session_id), encoding="utf-8") as f:
            st = json.load(f)
        if time.time() - float(st.get("armed_at", 0)) > MAX_AGE:
            clear(session_id)
            return None
        return st
    except Exception:
        return None


def send(message):
    try:
        req = urllib.request.Request(
            f"{BASE}/{TOPIC}", data=message.encode("utf-8"),
            headers={"Title": "BarberGo"}, method="POST")
        urllib.request.urlopen(req, timeout=5).read()
    except Exception:
        pass


def goal_entries(transcript_path):
    """Number of goal verdict attachments + met flag of the latest one."""
    n, met = 0, None
    try:
        with open(transcript_path, encoding="utf-8") as f:
            for line in f:
                if '"goal_status"' not in line:
                    continue
                try:
                    a = json.loads(line).get("attachment") or {}
                except Exception:
                    continue
                if a.get("type") == "goal_status" and not a.get("sentinel"):
                    n += 1
                    met = bool(a.get("met"))
    except Exception:
        pass
    return n, met


def on_prompt(d):
    sid = d.get("session_id")
    if not sid:
        return
    clear(sid)  # every new task starts OFF, even within the same session
    prompt = str(d.get("prompt", ""))
    if not ON_TOKEN.search(prompt):
        return
    os.makedirs(STATE_DIR, exist_ok=True)
    state = {"prompt_id": d.get("prompt_id"), "armed_at": time.time(),
             "goal": bool(GOAL_TOKEN.search(prompt))}
    with open(state_path(sid), "w", encoding="utf-8") as f:
        json.dump(state, f)
    print(json.dumps({"systemMessage":
                      "BarberGo: Benachrichtigungen AN (nur fuer diesen Auftrag)."}))


def on_stop(d):
    sid = d.get("session_id")
    if not sid:
        return
    st = load_state(sid)
    if not st:
        return
    if st.get("prompt_id") != d.get("prompt_id"):
        clear(sid)  # armed for some other task: never ping for this one
        return
    if st.get("goal"):
        # Multi-turn /goal run: Stop fires after every turn. The verdict is
        # written to the transcript a few seconds AFTER Stop, so wait for it.
        tp = d.get("transcript_path", "")
        before, _ = goal_entries(tp)
        deadline = time.time() + GOAL_WAIT
        while time.time() < deadline:
            n, met = goal_entries(tp)
            if n > before:
                if not met:
                    return  # goal not met yet -> task continues, stay armed
                break  # goal met -> task finished
            time.sleep(0.5)
        # verdict "met", or no verdict at all (goal cleared/aborted): finished
    clear(sid)
    send("Auftrag beendet")


def on_notification(d):
    sid = d.get("session_id")
    st = load_state(sid) if sid else None
    if not st:
        return
    # idle_prompt = Claude is merely waiting after finishing; not "needs you now".
    if str(d.get("notification_type", "")) == "idle_prompt":
        return
    send("Claude braucht deine Eingabe/Freigabe")


def on_start(d):
    sid = d.get("session_id")
    if sid and d.get("source") != "compact":
        clear(sid)
    try:  # purge leftovers of sessions that never ended cleanly
        for name in os.listdir(STATE_DIR):
            p = os.path.join(STATE_DIR, name)
            if os.path.isfile(p) and time.time() - os.path.getmtime(p) > MAX_AGE:
                os.remove(p)
    except OSError:
        pass


def on_end(d):
    if d.get("session_id"):
        clear(d["session_id"])


def main():
    event = sys.argv[1] if len(sys.argv) > 1 else ""
    handlers = {"prompt": on_prompt, "stop": on_stop, "notification": on_notification,
                "start": on_start, "end": on_end}
    d = read_input()
    try:
        if event in handlers:
            handlers[event](d)
    except Exception:
        pass
    sys.exit(0)


if __name__ == "__main__":
    main()
