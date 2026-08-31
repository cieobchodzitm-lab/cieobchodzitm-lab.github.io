# AGT R&D fleet

Bots for Angel Guardian Technologies · operator Diakon.

| Agent | Duty |
| --- | --- |
| Praefectus | GitHub · writes `rnd/status.json` on The Bridge |
| Navis | Hugging Face · probes Cieobchodzitm Spaces |
| Praeco | Slack `angelguardiantech` · three Incoming Webhooks |
| Tabularius | Notion · AGT R&D ledger |

## Slack ↔ GitHub Actions

Two workflows.

1. **AGT R&D bots** (`agt-rnd.yml`) — weekdays 08:00 CEST + manual dispatch. Python writes `status.json` and, if secrets exist, posts the brief through Incoming Webhooks.
2. **AGT Slack** (`agt-slack.yml`) — fires when the fleet job completes (`workflow_run`) and on manual dispatch. Uses [`slackapi/slack-github-action@v2.1.1`](https://github.com/slackapi/slack-github-action) so GitHub Actions itself speaks Slack, not only the Python bot.

| Channel | Secret | Who speaks |
| --- | --- | --- |
| `#agt-rnd` | `SLACK_WEBHOOK_URL` | Praeco · dispatch + Action conclusion |
| `#agt-praxis` | `SLACK_WEBHOOK_GH` | Praefectus · GitHub |
| `#agt-navis` | `SLACK_WEBHOOK_HF` | Navis · Hugging Face |

Add secrets: https://github.com/cieobchodzitm-lab/cieobchodzitm-lab.github.io/settings/secrets/actions

Incoming Webhooks (workspace): https://angelguardiantech.slack.com/apps/A0F7XDUAZ-incoming-webhooks

Manifest: [`slack-manifest.yaml`](./slack-manifest.yaml)

Empty secret → that step is skipped. Action does not fail the fleet.

## Other secrets

- `NOTION_TOKEN` + `NOTION_DATABASE_ID` (title property `Name`)
- `HF_TOKEN` — optional write token for Cieobchodzitm

## Run

- Weekdays 08:00 CEST (`cron 0 6 * * 1-5`)
- Actions → **AGT R&D bots** → Run workflow (fleet + Slack follow-up)
- Actions → **AGT Slack** → Run workflow (test ping only)

Status: https://cieobchodzitm-lab.github.io/rnd/status.json
