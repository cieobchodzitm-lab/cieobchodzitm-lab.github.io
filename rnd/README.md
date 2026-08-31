# AGT R&D fleet

Bots for Angel Guardian Technologies · operator Diakon.

| Agent | Duty |
| --- | --- |
| Praefectus | GitHub · writes `rnd/status.json` on The Bridge |
| Navis | Hugging Face · probes Cieobchodzitm Spaces |
| Praeco | Slack `angelguardiantech` · three Incoming Webhooks |
| Tabularius | Notion · AGT R&D ledger |

## Slack Incoming Webhooks

Create channels, then add one webhook per channel (Incoming Webhooks → Add New Webhook to Workspace).

| Channel | GitHub secret | Agent |
| --- | --- | --- |
| `#agt-rnd` | `SLACK_WEBHOOK_URL` | Praeco · dispatch |
| `#agt-praxis` | `SLACK_WEBHOOK_GH` | Praefectus · GitHub |
| `#agt-navis` | `SLACK_WEBHOOK_HF` | Navis · Hugging Face |

App manifest: [`slack-manifest.yaml`](./slack-manifest.yaml) — paste at https://api.slack.com/apps?new_app=1

Workspace: https://angelguardiantech.slack.com/apps/A0F7XDUAZ-incoming-webhooks

## Other secrets

- `NOTION_TOKEN` + `NOTION_DATABASE_ID` (title property `Name`)
- `HF_TOKEN` — optional write token for Cieobchodzitm

## Run

- Weekdays 08:00 CEST (`cron 0 6 * * 1-5`)
- Actions → **AGT R&D bots** → Run workflow

Status: https://cieobchodzitm-lab.github.io/rnd/status.json
