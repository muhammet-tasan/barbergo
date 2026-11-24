#!/usr/bin/env python3
"""Tests .claude/hooks/notify.py: default-off, per-task arming, auto-reset,
consecutive tasks in one session, /goal runs, parallel sessions, session reset.
Uses a local mock ntfy server - sends NO real pushes.
Run: python3 scripts/test-notifications.py
"""
import http.server, json, os, subprocess, sys, tempfile, threading, time

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
HOOK = os.path.join(REPO, ".claude", "hooks", "notify.py")
received = []


class H(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        received.append(self.rfile.read(int(self.headers.get("Content-Length", 0))).decode())
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"{}")

    def log_message(self, *a):
        pass


srv = http.server.HTTPServer(("127.0.0.1", 0), H)
threading.Thread(target=srv.serve_forever, daemon=True).start()
tmp = tempfile.mkdtemp()
STATE = os.path.join(tmp, "state")
env = dict(os.environ, BARBERGO_NTFY_BASE=f"http://127.0.0.1:{srv.server_port}",
           BARBERGO_NOTIFY_STATE_DIR=STATE, BARBERGO_NOTIFY_GOAL_WAIT="6")
fails = 0


def hook(event, **payload):
    return subprocess.run([sys.executable, HOOK, event], input=json.dumps(payload),
                          text=True, capture_output=True, env=env, timeout=30)


def armed(sid):
    return os.path.exists(os.path.join(STATE, sid))


def check(name, cond):
    global fails
    print(("PASS  " if cond else "FAIL  ") + name)
    fails += 0 if cond else 1


def task(sid, pid, prompt, expect_ping, label):
    """One full task: prompt submit, then Stop."""
    before = len(received)
    hook("prompt", session_id=sid, prompt_id=pid, prompt=prompt)
    hook("stop", session_id=sid, prompt_id=pid, stop_hook_active=False)
    check(f"{label}: {'ping' if expect_ping else 'silent'}",
          (len(received) - before) == (1 if expect_ping else 0))
    check(f"{label}: state cleared after task", not armed(sid))


print("== default off / what does NOT arm")
for i, p in enumerate(["hallo", "/goal Erledigt wenn X", "/my-goal", "notify:on",
                       "siehe `/my-notification-on` im Text", "/my-notification-onx",
                       "pfad/my-notification-on"]):
    task("S", f"p{i}", p, False, f"no arming by {p!r}")

print("== arming forms")
task("S", "a1", "/my-notification-on mach etwas", True, "leading token")
task("S", "a2", "/goal /my-notification-on Erledigt wenn X", True,
     "goal + token, no verdict at all (aborted) -> finished")
task("S", "a3", "bitte das erledigen /my-notification-on", True, "token at end")

print("== consecutive tasks in ONE session")
seq = [("c1", "normaler Auftrag", False), ("c2", "/my-notification-on Auftrag", True),
       ("c3", "wieder normal", False), ("c4", "/my-notification-on nochmal", True),
       ("c5", "/goal ohne Option", False)]
for pid, prompt, exp in seq:
    task("SEQ", pid, prompt, exp, f"seq {prompt!r}")

print("== notification event (needs input) only while armed")
hook("prompt", session_id="N", prompt_id="n1", prompt="/my-notification-on x")
b = len(received)
hook("notification", session_id="N", notification_type="permission_prompt")
check("permission prompt pings while armed", len(received) == b + 1)
b = len(received)
hook("notification", session_id="N", notification_type="idle_prompt")
check("idle_prompt silent", len(received) == b)
hook("stop", session_id="N", prompt_id="n1")
b = len(received)
hook("notification", session_id="N", notification_type="permission_prompt")
check("notification silent after task ended", len(received) == b)

print("== stale/foreign prompt_id never pings")
hook("prompt", session_id="F", prompt_id="old", prompt="/my-notification-on x")
b = len(received)
hook("stop", session_id="F", prompt_id="other")
check("Stop of a different task is silent", len(received) == b and not armed("F"))

print("== parallel sessions")
hook("prompt", session_id="P1", prompt_id="x1", prompt="/my-notification-on a")
hook("prompt", session_id="P2", prompt_id="x2", prompt="normal")
b = len(received)
hook("stop", session_id="P2", prompt_id="x2")
check("P2 silent while P1 armed", len(received) == b and armed("P1"))
hook("prompt", session_id="P2", prompt_id="x3", prompt="neue Eingabe in P2")
check("P2 new prompt does not disarm P1", armed("P1"))
b = len(received)
hook("stop", session_id="P1", prompt_id="x1")
check("P1 pings", len(received) == b + 1)

print("== /goal run (goal_status verdicts appear in the transcript after Stop)")
tr = os.path.join(tmp, "t.jsonl")


def add(met, sentinel=False):
    with open(tr, "a", encoding="utf-8") as f:
        f.write(json.dumps({"type": "attachment", "attachment": {
            "type": "goal_status", "met": met, "sentinel": sentinel}}) + "\n")


def verdict_later(met, delay):
    threading.Timer(delay, add, args=(met,)).start()


add(False, True)
hook("prompt", session_id="G", prompt_id="g1", prompt="/goal /my-notification-on Erledigt wenn X")
b = len(received)
verdict_later(False, 1.0)
hook("stop", session_id="G", prompt_id="g1", transcript_path=tr, stop_hook_active=False)
check("goal turn 1 (not met): silent, still armed", len(received) == b and armed("G"))
b = len(received)
verdict_later(False, 1.0)
hook("stop", session_id="G", prompt_id="g1", transcript_path=tr, stop_hook_active=True)
check("goal turn 2 (not met): silent, still armed", len(received) == b and armed("G"))
b = len(received)
verdict_later(True, 1.0)
hook("stop", session_id="G", prompt_id="g1", transcript_path=tr, stop_hook_active=True)
check("goal turn 3 (met): ping + reset", len(received) == b + 1 and not armed("G"))
b = len(received)
hook("prompt", session_id="G", prompt_id="g2", prompt="/goal ohne Option")
hook("stop", session_id="G", prompt_id="g2", transcript_path=tr)
check("next goal without option: silent", len(received) == b and not armed("G"))

print("== session lifecycle")
hook("prompt", session_id="L", prompt_id="l1", prompt="/my-notification-on x")
hook("start", session_id="L", source="compact")
check("compact keeps arming", armed("L"))
hook("start", session_id="L", source="resume")
check("resume resets", not armed("L"))
hook("prompt", session_id="L", prompt_id="l2", prompt="/my-notification-on x")
hook("end", session_id="L")
check("session end cleans up", not armed("L"))
old = os.path.join(STATE, "OLD")
open(old, "w").close()
t = time.time() - 13 * 3600
os.utime(old, (t, t))
hook("start", session_id="Z", source="startup")
check("stale state purged", not os.path.exists(old))

print("== robustness")
r = subprocess.run([sys.executable, HOOK, "stop"], input="garbage", text=True,
                   capture_output=True, env=env)
check("garbage stdin exits 0", r.returncode == 0)
bad = dict(env, BARBERGO_NTFY_BASE="http://127.0.0.1:9")
subprocess.run([sys.executable, HOOK, "prompt"], text=True, env=bad, capture_output=True,
               input=json.dumps({"session_id": "U", "prompt_id": "u", "prompt": "/my-notification-on"}))
r = subprocess.run([sys.executable, HOOK, "stop"], text=True, env=bad, capture_output=True,
                   timeout=20, input=json.dumps({"session_id": "U", "prompt_id": "u"}))
check("unreachable ntfy: exit 0, state cleared", r.returncode == 0 and not armed("U"))

print("\nALL PASSED" if not fails else f"\n{fails} FAILED")
sys.exit(1 if fails else 0)
