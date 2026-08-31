# AGT R&D fleet

Bots for Angel Guardian Technologies · operator Diakon.

| Agent | Duty |
| --- | --- |
| Praefectus | GitHub · writes `rnd/status.json` on The Bridge |
| Navis | Hugging Face · probes Cieobchodzitm Spaces |
| Praeco | Slack `angelguardiantech` · `#agt-rnd` |
| Tabularius | Notion · AGT R&D ledger |

## Secrets (repo Settings → Secrets → Actions)

- `SLACK_WEBHOOK_URL` — Incoming Webhook for `#agt-rnd`
- `NOTION_TOKEN` — internal integration, share the AGT R&D database
- `NOTION_DATABASE_ID` — database with a title property `Name`
- `HF_TOKEN` — write token for Cieobchodzitm (optional; probe works without it)

## Run

- Weekdays 08:00 CEST (`cron 0 6 * * 1-5`)
- Actions → **AGT R&D bots** → Run workflow

Status: https://cieobchodzitm-lab.github.io/rnd/status.json
