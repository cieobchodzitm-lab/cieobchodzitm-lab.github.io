#!/usr/bin/env python3
"""AGT R&D fleet — Praefectus, Navis, Praeco, Tabularius.

Writes rnd/status.json. Optional: Slack webhook, Notion page, HF whoami.
No third-party deps. Secrets come from the environment (GitHub Actions).
"""
from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STATUS = ROOT / "rnd" / "status.json"
NOTE = os.environ.get("DISPATCH_NOTE", "").strip()
NOW = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def get_json(url: str, headers: dict[str, str] | None = None, timeout: int = 20):
    req = urllib.request.Request(url, headers=headers or {"User-Agent": "agt-rnd-bot"})
    with urllib.request.urlopen(req, timeout=timeout) as res:
        return json.loads(res.read().decode("utf-8"))


def post_json(url: str, payload: dict, headers: dict[str, str] | None = None, timeout: int = 20):
    data = json.dumps(payload).encode("utf-8")
    hdrs = {"Content-Type": "application/json", "User-Agent": "agt-rnd-bot"}
    if headers:
        hdrs.update(headers)
    req = urllib.request.Request(url, data=data, headers=hdrs, method="POST")
    with urllib.request.urlopen(req, timeout=timeout) as res:
        raw = res.read().decode("utf-8")
        return raw


def praefectus() -> dict:
    return {
        "id": "gh",
        "latin": "Praefectus",
        "ok": True,
        "detail": "status.json on The Bridge",
        "repos": [
            "cieobchodzitm-lab/cieobchodzitm-lab.github.io",
            "cieobchodzitm-lab/StoicMatrixAitest",
            "cieobchodzitm-lab/AngelGuardianTechAi",
        ],
    }


def navis() -> dict:
    spaces = []
    try:
        data = get_json("https://huggingface.co/api/spaces?author=Cieobchodzitm&limit=20")
        spaces = [{"id": s.get("id"), "sdk": s.get("sdk")} for s in data if s.get("id")]
    except Exception as exc:
        return {"id": "hf", "latin": "Navis", "ok": False, "detail": str(exc)[:180], "spaces": []}
    token = os.environ.get("HF_TOKEN", "").strip()
    who = None
    if token:
        try:
            who = get_json(
                "https://huggingface.co/api/whoami-v2",
                headers={"Authorization": f"Bearer {token}"},
            ).get("name")
        except Exception:
            who = "token-rejected"
    return {
        "id": "hf",
        "latin": "Navis",
        "ok": True,
        "detail": f"{len(spaces)} spaces" + (f" · {who}" if who else " · public probe"),
        "spaces": spaces,
    }


def praeco(brief: str) -> dict:
    url = os.environ.get("SLACK_WEBHOOK_URL", "").strip()
    if not url:
        return {"id": "slack", "latin": "Praeco", "ok": False, "detail": "no SLACK_WEBHOOK_URL"}
    if "hooks.slack.com" not in url:
        return {"id": "slack", "latin": "Praeco", "ok": False, "detail": "webhook host rejected"}
    try:
        post_json(url, {"text": brief, "username": "AGT Praeco"})
        return {"id": "slack", "latin": "Praeco", "ok": True, "detail": "angelguardiantech #agt-rnd"}
    except urllib.error.HTTPError as exc:
        return {"id": "slack", "latin": "Praeco", "ok": False, "detail": f"slack {exc.code}"}
    except Exception as exc:
        return {"id": "slack", "latin": "Praeco", "ok": False, "detail": str(exc)[:180]}


def tabularius(brief: str) -> dict:
    token = os.environ.get("NOTION_TOKEN", "").strip()
    db = os.environ.get("NOTION_DATABASE_ID", "").strip()
    if not token or not db:
        return {"id": "notion", "latin": "Tabularius", "ok": False, "detail": "no Notion secrets"}
    payload = {
        "parent": {"database_id": db},
        "properties": {
            "Name": {"title": [{"text": {"content": f"AGT R&D · {NOW[:10]}"}}]}
        },
        "children": [
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [{"type": "text", "text": {"content": brief[:1800]}}]
                },
            }
        ],
    }
    try:
        post_json(
            "https://api.notion.com/v1/pages",
            payload,
            headers={
                "Authorization": f"Bearer {token}",
                "Notion-Version": "2022-06-28",
            },
        )
        return {"id": "notion", "latin": "Tabularius", "ok": True, "detail": "AGT R&D page"}
    except urllib.error.HTTPError as exc:
        return {"id": "notion", "latin": "Tabularius", "ok": False, "detail": f"notion {exc.code}"}
    except Exception as exc:
        return {"id": "notion", "latin": "Tabularius", "ok": False, "detail": str(exc)[:180]}


def main() -> None:
    brief = " · ".join(
        part
        for part in [
            "AGT R&D fleet.",
            NOTE or "Scheduled pulse.",
            "Praefectus writes The Bridge. Navis reads Hugging Face. Praeco speaks Slack. Tabularius ledgers Notion.",
            "Per Aspera, Ad Astra · Una",
        ]
        if part
    )
    channels = [praefectus(), navis(), praeco(brief), tabularius(brief)]
    payload = {
        "at": NOW,
        "house": "Angel Guardian Technologies",
        "operator": "Diakon",
        "agent": "agt-project-designer",
        "note": NOTE,
        "brief": brief,
        "channels": channels,
    }
    STATUS.parent.mkdir(parents=True, exist_ok=True)
    STATUS.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"wrote": str(STATUS), "ok": all(c["ok"] for c in channels[:2])}, indent=2))


if __name__ == "__main__":
    main()
