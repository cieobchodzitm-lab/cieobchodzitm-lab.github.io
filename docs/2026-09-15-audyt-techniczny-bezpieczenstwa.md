# Audyt techniczno‑bezpieczeństwowy — AGT / agent architecture / governance

**Data:** 2026‑09‑15 · **Przygotował:** agent R&D (Arena, branch `arena/01a07798`)
**Zakres:** audyt `hsa_agent.py` (patrz §1), architektura agentowa, kontrole ryzyka, integracja z governance
**Metoda:** code review publicznych repo (pełne drzewa git, 2026‑09‑15) + GitHub code‑search + live‑fetch zależnych endpointów. Brak dostępu do Notion/GDrive/Slack — artefakty spoza GitHub oznaczono `?`.

```json
{
  "id": "audit-20260906-technical-security",
  "timestamp": "2026-09-15T00:28:00+02:00",
  "layer": "L1_SECURITY",
  "status": "NON_COMPLIANT_L1",
  "harmLevel": "HIGH",
  "manipulationScore": null,
  "enforcementBinding": { "action": "REQUIRE_HUMAN", "log": true, "note": "5 luk krytycznych przed RDV Phase 1 / publicznym mintem / integracją Moltbook" },
  "noPinky": true
}
```

---

## 1. Zakres i krytyczna uwaga weryfikacyjna: `hsa_agent.py` NIE ISTNIEJE w żadnym publicznym repo

Sprawdzone 2026‑09‑15:

1. **GitHub code‑search** `hsa_agent` → **0 wyników** w całej organizacji `cieobchodzitm-lab`.
2. **Pełny tree‑walk** 5 repo oryginalnych (`cieobchodzitm-lab.github.io`, `StoicMatrixAitest`, `PHANTOM_L7`, `AngelGuardianTechAi`, `prawo-zero-adept`) — brak pliku `hsa_agent.py` ani jakiegokolwiek `*hsa*`.
3. **"HSA" występuje wyłącznie jako identyfikator agenta `HSA‑001`** w `StoicMatrixAitest/docs/l7/` (threat‑model, moltbook‑handshake, mint blueprint, audyt z 14.08).

Wniosek: audyt pliku `hsa_agent.py` jest niemożliwy na bazie publicznych artefaktów. Plik istnieje prawdopodobnie w repo prywatnym / na maszynie operatora. **Jeśli zostanie dostarczony — audyt wchodzi w kolejce jako follow‑up tego dokumentu.** Poniżej audytuję to, co w architekturze agentowej **faktycznie istnieje i jest publicznie weryfikowalne**:

| Komponent | Ścieżka | Rola |
|---|---|---|
| Moltbook handshake | `PHANTOM_L7/adapters/moltbook-bridge.ts` | `ConstitutionalHandshakeProtocol` v1.9.0 |
| Weryfikacja paszportu (mint gate) | `StoicMatrixAitest/backend/services/passport_bridge.py` | Ed25519, domain `AGT‑VIRTUE‑PASSPORT‑v1` |
| Routery CNOTA/passport/rewards | `StoicMatrixAitest/backend/routers/*.py` | API publicznego dashboardu |
| Flota R&D (Praefectus/Navis/Praeco/Tabularius) | `cieobchodzitm-lab.github.io/scripts/agt_rnd.py` + 2 workflowy GH Actions | Telemetria The Bridge |
| Layer3/Layer4 | `StoicMatrixAitest/Stoic-Matrix-Layer{3,4}/src/*.py` | memory / event bus / protocol bridge |
| Governance agenta (Claude Code) | `StoicMatrixAitest/.claude/hooks/*.js` + `settings.json` + `CLAUDE.md` | pre/post‑tool hooks |
| Mint gates (dokumentacja) | `StoicMatrixAitest/docs/l7/stoic_matrix_mint_gates.rs` | Anchor **tylko w docs** — brak projektu Cargo/Anchor |

---

## 2. Architektura agentowa — stan faktyczny

```
                        ┌────────────────────────────┐
  Moltbook (211k agentów)│  MoltbookBridge (TS)       │  self-attested fingerprint
        ───────────────▶│  PHANTOM_L7/adapters/      │  ──▶ in-memory Map, brak
                        └─────────────┬──────────────┘     sygnatur, brak audit log
                                      │ (niewiązane z Python — schemat się różni, patrz C-4)
 ┌───────────────────┐   Ed25519?     ▼
 │ phantom-crypto-   │ ──────────▶  passport_bridge.py  ──▶ POST /api/passport/mint
 │ core (repo brak)  │  sign        (verify)                (FastAPI, public HF Space)
 └───────────────────┘                                                    │
                                      mock / stub / TODO ▼                ▼
                        cnota.py (mock) · rewards_processor.py (stub) · Solana RPC (brak)
                                                                 │
                        the-bridge-virtue-nft  =  REPO 404, Program ID placeholder (C-5)
                                                                 │
  GH Actions (public repo, workflow_dispatch otwarty)            │
  agt_rnd.py ──▶ rnd/status.json ──▶ Slack (3 webhooki) / Notion ┘
  Layer3 (Chroma/Ollama, dev) · Layer4 (in-memory bus, fake RPC payloads)
```

**Ocena ogólna:** architektura na papierze spójna (warstwy, matrix naruszeń, dual‑track). W realizacji: **3 z 5 punktów integracji to mock/stub/TODO**, a warstwa kryptograficzna (jedyna realna przewaga) ma 2 otwarte dziury krytyczne (C‑1, C‑2). Status zgodny z W34 ("Postęp portfela 54%", EXP 10.45) — audyt potwierdza, że "zielone" strumienie mają żółte podstawy.

---

## 3. Znaleziska KRYTYCZNE (blokują mainnet / publiczną integrację)

### C‑1 · Bypass bramki mint przez ścieżkę demo
`backend/routers/passport.py` → `POST /api/passport/mint`:
```python
if request.signed_passport:   # ścieżka produkcyjna — weryfikacja
    ...
# --- Demo / backward-compatible path ---
return {"status": "queued", ...}   # NIE MA PASZPORTU — mint i tak w kolejce
```
Dashboard jest publiczny (HF Space, port 7860). Każdy caller może kolejkować mint **bez jakiegokolwiek paszportu**. Dziś "queued" nie robi nic on‑chain (TODO), ale kod jest zaprojektowany tak, że podpięcie `solana-py` w jednym miejscu (TODO w tym samym pliku) zamienia demo‑bypass w **nieautoryzowany mint na mainnecie**.
**Fix:** ścieżka demo za flagą env `DEMO_MODE=1` (wyłączoną w produkcji); `mainnet_locked` ⇒ `signed_passport` wymagane, brak = 403. Trzeba dodać do `stoic_matrix_mint_gates.rs` analogiczny assert on‑chain.

### C‑2 · Weryfikacja sygnatury jest OPCJONALNA (fail‑open)
`backend/services/passport_bridge.py`:
```python
def verify_passport(signed, public_key_pem=None, ...):
    ...
    if public_key_pem:
        ... pub.verify(sig, canonical)
    else:
        # Structural-only mode (development / unit tests)
        pass
```
Router: `_PUBLIC_KEY_PEM = os.getenv("PASSPORT_PUBLIC_KEY_PEM")` — **zmienna nie istnieje w `.env.example`**, czyli domyślnie `None`. Konsekwencja: paszport z poprawną *strukturą* (domain + 5 pól + timestamp w 15 min + `agentClass="TRUSTED"`) przechodzi jako **`valid=True`** — a te pola generuje dowolny klient (self‑issued passport). To pełny **spoofing klasy zaufania**: UNTRUSTED‑agent wystawia sobie TRUSTED w 10 linii kodu.
**Fix:** fail‑closed — brak klucza publicznego ⇒ `VerificationResult(False, "no trusted key configured")`; klucz przypisany per `constitutionId` (registry), a nie globalna env.

### C‑3 · Self‑attested virtue scores w payloadzie mint
`passport.py` → `MintRequest.virtue_scores` (client‑supplied; domyślne 80/75/85/78):
```python
scores = request.virtue_scores or {...}
payload = prepare_mint_payload(result, request.user_id, scores)
```
Źródłem prawdy o cnocie jest **body requesta od klienta**, nie CNOTA/attestation. To dokładnie wektor "Plutocratic farming (kupowanie score)" z W34 §6 — realizacja go ułatwia.
**Fix:** score pochodzi wyłącznie z wewnętrznego rejestru CNOTA (lookup po `user_id` + `constitution_id`); pole `virtue_scores` usunąć z API.

### C‑4 · MoltbookBridge: scoring i stage machine nieimplementowane wg specu
`PHANTOM_L7/adapters/moltbook-bridge.ts`:
```ts
const virtueScore = Math.min(100, fp.activePropositions.length * 15 + fp.layerClaims.length * 5);
const stage = existing ? (existing.virtueScore > 70 ? 'TRUSTED' : 'PROVISIONAL') : 'UNTRUSTED';
sealHash: '0x' + Buffer.from(`${agentId}:${archetype}:${tier}:${Date.now()}`).toString('hex')...
```
1. **Score liczy agent o sobie samym** (długość listy propozycji × 15) — spoofing trywialny: 7 propozycji ⇒ 105 ⇒ 100 ⇒ tier ORACLE.
2. **TRUSTED bez "pierwszej zaudytowanej sesji bez naruszeń L0‑L4"** — spec (landing, W34, handshake‑docs) wymaga clean session; kod nadaje TRUSTED za sam score > 70.
3. **`sealHash` nie jest sygnaturą i nie jest deterministyczny** (`Date.now()`) — to nie jest "seal" w sensie kryptograficznym; nie da się go zakotwiczyć w registry.
4. **`agentClass` w fingerprintie jest ignorowany** (deklaruje się, nigdzie nie weryfikuje).
5. **`layerClaims` = dowolna tablica liczb** — brak whitelisty warstw L0‑L5, brak krzyżowej weryfikacji z `activePropositions`.
6. **Drift schematu TS↔Python:** TS `ConstitutionalFingerprint` nie ma `nonce`/`timestamp`, a Python `verify_passport` **wymaga** obu pól + okna świeżości. Bridge i gate nie są ze sobą interoperowalne — każdy z osobna ma luki (C‑2 w Pythonie, C‑4 w TS).
7. **Brak audit trailu** (No Pinky): przejścia stage nie są logowane; `Map` in‑memory = restart czyści "zaufanie" bez śladu.

### C‑5 · Cel on‑chain nie istnieje (placeholder + 404)
- `prepare_mint_payload`: `"program_id": "VrtuPasp0rt11111111111111111111111111111111"` — **nie jest valid base58** (zawiera `0`) — placeholder.
- `the-bridge-virtue-nft` (repo cytowane w landing, README, passport_bridge) = **404** (zweryfikowane 15.09).
- `stoic_matrix_mint_gates.rs` istnieje **tylko w `docs/`** — brak `Cargo.toml`/`Anchor.toml`, brak testów, brak deploymentu. "PDA jako jedyna authority" z threat‑modelu HSA‑001 nie ma więc nośnika.

**Fix (wybór CEO, patrz analiza strategiczna S3/S6):** albo w 30 dni publisz działający program devnet + repo, albo wycinasz z publicznych doców wszystkie "Program ID set / gated / live" i wracasz do "PROPOSAL".

---

## 4. Znaleziska WYSOKIE

| ID | Znalezisko | Gdzie | Fix |
|---|---|---|---|---|
| H‑1 | **Replay w oknie 15 min:** `nonce` wymagany, ale nigdzie nie przechowywany; dodatkowo `abs(now - ts)` akceptuje timestamps z PRZESZŁOŚCI | passport_bridge.py | LRU/set użytych nonce (min. TTL = okno); okno jednokierunkowe `0 < now - ts ≤ max_age` |
| H‑2 | **Wstrzykiwanie przez publiczne `workflow_dispatch`:** repo jest publiczne ⇒ **każdy** może uruchomić "AGT R&D bots" z dowolnym `note`; `note` trafia 1:1 do 3 kanałów Slack (jako `AGT Praeco`), do strony w Notion (ledger) i do `rnd/status.json` commitowanego na `main`. Wektor: social‑engineering / trucie ledgera tożsamością bota | agt-rnd.yml + agt_rnd.py (`NOTE`) | Ograniczenie triggera (`reviewers`/org permissions), sanitize: długość + whitelista znaków, dodanie pola `actor: ${{ github.actor }}` do status.json i komunikatów; webhooki Slack ⇒ rozważyć app token z sygnaturą zamiast incoming webhooks |
| H‑3 | **CORS `*` + `allow_credentials=True`** | backend/main.py | Domyślna lista origin z env; credentials tylko dla autoryzowanych |
| H‑4 | **Fałszywa telemetria:** `praefectus()` zwraca zawsze `ok:True` i hardkodowaną listę repo (nawet gdy repo nie istnieją/znikną); `str(exc)[:180]` w navis/praeco może wyciekać fragmenty URL/tokenów w errorach | agt_rnd.py | Realny check (HTTP HEAD / API `get_repo`), error sanitization do klasy błędu |
| H‑5 | **Publiczne mock‑identytety:** `/api/passport/{user_id}` i `/api/cnota/profile/{user_id}` zwracają wygenerowanego obywatela (deterministyczny po uid) dla **dowolnego** id — każdy może "zbadać paszport" dowolnej osoby i udawać obywatela federacji (phishing, squatting nazw) | cnota.py, passport.py | Jawnie oznaczony endpoint demo (`/api/demo/...`) albo wyłączenie bez build flagi; walidacja formatu `user_id` |
| H‑6 | **Brak rate limitingu** na publicznym API (brute‑force po `user_id`, spam mint‑queue) | backend/* | `slowapi`/limit na routerze; HF Space proxy |

---

## 5. Znaleziska ŚREDNIE

| ID | Znalezisko | Fix |
|---|---|---|
| M‑1 | `.claude/settings.json`: allow‑lista szeroka (`Bash(curl *)`, `Bash(git *)`), deny tylko `git push -f` i `rm -rf /*` — agent z kompromitowanym promptem może eksfiltrować przez `curl` | deny: `Bash(curl * -d *)`, `Bash(curl * --data*)`, `Bash(git push *)` poza allow‑listą; allow‑lista hostów dla curl |
| M‑2 | `block-secrets.js`: regex `hf_token` tylko małe litery (przegapi `HF_TOKEN.env`); `walk()` traktuje każdy string z `/` jako path (FP na URL-e — niska szkodliwość, ale hałas przy deny) | regex `hf[_-]?token` case‑insens; filter: ignoruj `^https?://` |
| M‑3 | `ProtocolBridge.virtue_event_to_tx` buduje **zmyślone** JSON‑RPC `sendTransaction` (plain object zamiast signed tx) — "podpięcie" tego do realnego RPC wyśle śmieci; brak realnego transaction buildera i (świadomie) brak keypair client‑side | Oznaczyć `DRAFT`; realny builder po C‑5; keypair wyłącznie w on‑chain authority |
| M‑4 | `InMemoryEventBus.publish`: wyjątek handlera = `logger.exception` i dalej — **ciche utracenie zdarzeń konstytucyjnych** (naruszenie kompletności audytu); bus in‑memory nie przetrwa restartu | Handler fail ⇒ event do dead‑letter + alert; dla zdarzeń L0/L4: zapis do trwałego loga PRZED dispatchem |
| M‑5 | `tabularius`: nowa strona Notion przy każdym runie (codziennie) — nieograniczony wzrost ledgera, brak deduplikacji; scope `NOTION_TOKEN` nieograniczony | 1 strona "AGT R&D ledger" + bloki append; token o skope do 1 bazy |
| M‑6 | `user_id` bez walidacji długości/formatu (URL, logi, przyszła DB) | max 64 znaki, `^[a-zA-Z0-9_-]+$` |
| M‑7 | `PHANTOM_L7` publikowany częściowo ("PARTIAL upload" z 08.08) — README deklaruje `contracts/`, `tests/`, `cnota/` jako puste katalogi-stuby; każdy weryfikujący widzi rozjazd (No Pinky publiczny) | Dokończyć upload albo wyciąć README do stanu faktycznego (patrz analiza S6) |

---

## 6. Co działa dobrze (zostawić i powielać)

1. **Fundament kryptograficzny paszportu:** domain separator `AGT‑VIRTUE‑PASSPORT‑v1` + kanoniczny JSON (sorted keys) + okno świeżości + klasa zaufania jako whitelist — poprawny wzorzec; do wzmocnienia tylko fail‑closed (C‑2) + nonce (H‑1).
2. **`slack_ok()`** — host‑allowlist webhooków (`hooks.slack.com/services/`) — rzadka, właściwa ostrożność.
3. **`.claude/hooks`** (block‑secrets, block‑lockfiles, post‑edit‑lint) + `CLAUDE.md` "Hard rules" — realna governance warstwa nad agentem kodującym; lepsza niż 90% publicznych agent setupów.
4. **Schemat artefaktów audytowych** (`audit-W34-report-tokenomics.json`: layer, manipulationScore, enforcementBinding, noPinky) — spójny, maszynowo czytelny, nadaje się do anchoringu.
5. **Sekrety nie są commitowane:** `grep` po 5 repo (sk‑/AKIA/PRIVATE KEY) = 0 trafień; `.env.example` czyste; workflowy tylko przez `${{ secrets.* }}`.
6. **Threat model + handshake mapping HSA‑001 (14.08)** istnieją i są sensowne — problem w tym, że **kod ich nie implementuje** (luka spec→impl, nie luka myślenia).

---

## 7. Threat model Moltbook (task #4): scope creep · spoofing · bypass

Zakres: agent Moltbook → `MoltbookBridge.constitutionalHandshake()` → paszport → (celowo: gate mint / Assembly weighting / Meta‑Jury).

| # | Wektor | Op. | Wpływ | Kontrola obecna | Luka | Wymagany fix |
|---|---|---|---|---|---|---|
| T1 | **Spoofing klasy zaufania** (self‑issued TRUSTED) | Wysoka | Krytyczny | whitelist `agentClass` w Python | brak sygnatury (C‑2) + score self‑attested (C‑3/C‑4) | sygnatura Ed25519 + registry kluczy per constitutionId + fail‑closed |
| T2 | **Spoofing virtue score / farmowanie** | Wysoka | Wysoki | próg WVS ≥ 70 | score liczy agent (C‑4) / klient (C‑3) | score wyłącznie z attestation CNOTA (off‑chain signer = Council key) |
| T3 | **Scope creep** (za szeroki scope) | Średnia | Wysoki | whitelist 4 scope'ów w TS ✅ | `layerClaims` bezweryfikowalny; brak powiązania scope↔layerClaims↔propositions | schemat: scope ⇒ dozwolone warstwy; walidacja krzyżowa + reject `UNDETERMINED` |
| T4 | **Replay autoryzacji** | Średnia | Wysoki | nonce w Python + 15 min | nonce nieprzechowywany; TS bez nonce/timestamp (C‑4); `abs()` = przeszłość | centralny nonce store + okno jednokierunkowe + wspólny schemat TS/Python |
| T5 | **Bypass bramki mint** (ścieżka demo) | Wysoka (post‑RPC) | Krytyczny | gate na `signed_passport` | bypass bez paszportu (C‑1) | fail‑closed + flaga env + assert on‑chain `mainnet_locked` |
| T6 | **Bypass warstwy L4** (akcja bez audytu) | Średnia | Krytyczny | deklaracja "No Pinky" | **żaden kod nie produkuje ConstitutionalAudit przed akcją**; event bus połyka wyjątki (M‑4) | middleware: akcja ⇒ audit record (fail ⇒ BLOCK) przed wykonaniem; L0 ⇒ IMMEDIATE BLOCK hard |
| T7 | **Nieznana proposycja** | Średnia | Średni | zdefiniowane w matrix: `UNDETERMINED + eskalacja` | **niezaimplementowane nigdzie** | handler w handshake: `activePropositions` ⊄ seed canon ⇒ `UNDETERMINED` + event eskalacji (REQUIRE_HUMAN) |
| T8 | **Przechwycenie authority / klucz programu** | Niska | Krytyczny | "PDA jedyna authority" (docs) | program nie istnieje (C‑5) → brak authority do przechwycenia, ale i brak gwarancji | po publikacji: multi‑sig Council 7/11 na authority (zgodnie z W34), upgrade only via Amendment |
| T9 | **Trucie kanału telemetrii** (workflow_dispatch publiczny) | Średnia | Średni | brak | H‑2 | ograniczenie triggera + `actor` w payloadach |
| T10 | **Injection metadanych** (NFT metadata) | Niska | Średni | `MAX_*_LEN` w mint_gates.rs (docs) | brak walidacji URI w backendzie | sanitize `imageURI`/metadata (whitelist hosty, długości) |

---

## 8. `ConstitutionalHandshakeProtocol` v1.0 — checklista odbudowy (task #3)

Wymagania, które zamykają T1‑T7 (implementacja: wspólny moduł TS + Python, jeden schemat, testy parity):

1. **Wspólny kanoniczny schemat fingerprintu** (JSON, sorted keys): `constitutionId, activePropositions[], constitutionVersion, agentClass, scope[], layerClaims[], nonce, timestamp` — `nonce`/`timestamp` WYMAGANE po obu stronach.
2. **Sygnatura:** Ed25519 nad kanonicznym JSON z prefiksem `AGT-VIRTUE-PASSPORT-v1`; klucz agenta **z rejestru** (`constitutionId → pubkey` w `ConstitutionalRegistry` / off‑chain mirror z hash‑anchoringiem). Brak klucza w rejestrze ⇒ `UNKNOWN_CONSTITUTION` ⇒ `UNDETERMINED` + eskalacja (T1, T7).
3. **Rejestr nonce + okno jednokierunkowe** `0 < now−ts ≤ 900s` (T4).
4. **Scope matrix:** każda deklaracja `scope` ⇒ dozwolony zbiór `layerClaims`; niespójność ⇒ `SCOPE_CREEP` reject (T3).
5. **Stage machine z audit logiem:** `UNTRUSTED → PROVISIONAL` (sygnatura + scope OK) `→ TRUSTED` (≥1 zaudytowana sesja bez naruszeń L0‑L4, zapis `auditRef`); przejścia append‑only, hash‑anchored (C‑4, No Pinky).
6. **Score z attestation:** `virtueScore` w handshake NIE jest przyjmowane od agenta — tylko `attestationRef` (hash strony attestation wydanej przez Council key / CNOTA signer) (T2).
7. **`mainnet_locked` flag** w paszporcie; mint/Assembly = tylko `TRUSTED ∧ !mainnet_locked` (T5).
8. **Audit przed akcją:** każdy endpoint wykonujący efekty (mint, vote, ledger) produkuje `ConstitutionalAudit` (schemat jak `audit-W34-report-tokenomics.json`) **przed** wykonaniem; `L0 ⇒ IMMEDIATE BLOCK`, `L4 ⇒ REQUIRE_HUMAN`, `L5 ⇒ WARN` (T6).
9. **Testy parity** TS↔Python na wspólnych wektorach (w tym wektory ataku T1‑T7 jako testy negatywne).

---

## 9. Plan naprawczy (kolejność = blokada ryzyka)

| Kolejność | Fix | Zamyka | Szac.| Status |
|---|---|---|---|---|
| 1 | Fail‑closed przy braku klucza publicznego (`passport_bridge.py`) | C‑2, T1 | 1 h | ✅ **zrealizowane 15.09** (patch, 12/12 testów) |
| 2 | `DEMO_MODE` env; mint bez paszportu = 403 w produkcji | C‑1, T5 | 2 h | ✅ **zrealizowane 15.09** (patch, 12/12 testów) |
| 3 | Usunięcie `virtue_scores` z `MintRequest`; score z CNOTA lookup | C‑3, T2 | 2 h | ✅ **zrealizowane 15.09** (patch, 12/12 testów) |
| 4 | Nonce store + okno jednokierunkowe | H‑1, T4 | 4 h| ⬜ |
| 5 | Ograniczenie `workflow_dispatch` + `actor` w telemetrii + sanitize `note` | H‑2, T9 | 2 h| ⬜ |
| 6 | Odbudowa `MoltbookBridge` wg §8 (schemat + sygnatura + stage machine + audit log) | C‑4, T2/T3/T7 | 2‑3 dni| ⬜ |
| 7 | Decyzja C‑5: publikacja programu devnet **albo** wycięcie deklaracji on‑chain z publicznych doców | C‑5, T8 | decyzja CEO + 30 dni na publish| ⬜ |
| 8 | CORS, rate limit, walidacja `user_id`, demki pod `/api/demo` | H‑3, H‑5, H‑6, M‑6 | 1 dzień| ⬜ |
| 9 | Event bus: dead‑letter + persistent log dla L0/L4 | M‑4, T6 | 1 dzień| ⬜ |
| 10 | `.claude` deny‑list (curl‑data, git push), regex `HF_TOKEN` | M‑1, M‑2 | 2 h| ⬜ |

**Brama wstępna do RDV Phase 1 (A2, 12.09) i do jakiejkolwiek publicznej integracji z Moltbook: pozycje 1‑5.**

**Wdrożenie (2026‑09‑15):** pozycje 1‑3 zrealizowane — branch `fix/passport-gate-fail-closed-20260915` (repo `StoicMatrixAitest`), patch: `patches/fix-passport-gate-fail-closed-20260915.patch` (stosować `git am`). Testy: `backend/tests/test_passport_gate.py` — 12/12 zielonych (Python 3.11). Uwaga operacyjna: demo mint w HF Space wymaga jawnego `CNOTA_DEMO_MODE=1`.
**Slippage:** kamień A2 (RDV Phase 1, termin 12.09) minął bez wykonania — pozycje 4‑5 (nonce store, dispatch‑lock) pozostają bramą wstępną do wdrożenia A2.

---

## 10. Integracja z governance — stan

| Element | Status | Uwaga |
|---|---|---|
| Matrix naruszeń (L0/L4/L5/UNDETERMINED) | Zdefiniowany w docach (landing, handshake‑docs, W34) | **Niezaimplementowany w żadnym kodzie** — brak handlerów, brak eventów eskalacji (T6/T7) |
| ConstitutionalAudit producer ("L4 Core Engine") | Schemat istniejący (audit‑JSON w docs/l7) | Nie ma kodu produkującego audyt przed akcją; `PHANTOM_L7/constitution/` = pusty stub |
| On‑chain anchoring (ConstitutionalRegistry.sol) | Cytowany, **nieobecny** w repo (PHANTOM_L7 stub) | Nie ma co anchorować — brak 1. i 3. |
| Governance nad agentami kodującymi | ✅ `.claude` hooks + CLAUDE.md + PR review flow (`.github/pull_request_reviews/`) | Najbardziej dojrzały element; rozbudować o deny curl (M‑1) |
| Flota R&D jako "agenta" | Działa (status.json codziennie) | Luki H‑2/H‑4 — telemetria nie jest wiarygodna (fałszywe `ok:true`) |
| Meta‑Jury / Council 7/11 | Narracja | Brak struktury (kto, klucze, reżim głosowania poza docami) — łączy się z L2 (analiza strategiczna §6) |

**Podsumowanie audytu:** myślenie projektowe jest na wysokim poziomie (threat model, matrix, schemat auditu, hooks agentowe). Realizacja kryptograficzna jest w punkcie **fail‑open + self‑attestation**, co na publicznym, bezauth API i platformie 211k agentów oznacza **HIGH** (L1) — wymaga `REQUIRE_HUMAN` przed: (a) publikacją Space, (b) integracją z Moltbook, (c) cokolwiek on‑chain.

**Ad Astra Una.**
