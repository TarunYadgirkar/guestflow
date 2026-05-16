# GuestFlow — GitHub Setup & Zero-Conflict Workflow

The entire merge-conflict problem comes from two people editing the same file. We kill it with **strict folder ownership** + a frozen contract. Follow this exactly.

---

## A. One-time setup (one person does this at ~9:15 AM, ~5 min)

1. **Person A** creates a repo named `guestflow`.
   - **Make it PUBLIC immediately.** The hackathon rules require a public repo for judging — don't risk forgetting.
2. Settings → Collaborators → add Person B and Person C by GitHub username. They accept the email/notification invite.
3. Person A pushes the starter scaffold (these docs + the structure below) to `main`.
4. **All three** clone it:
   ```bash
   git clone https://github.com/<personA>/guestflow.git
   cd guestflow
   ```
5. Each person creates a `.env` locally (NEVER committed) from `.env.example`:
   ```bash
   cp .env.example .env
   # paste the Anthropic + ElevenLabs keys you get day-of
   ```

## B. Repo structure (folder = owner; you ONLY edit your folder)

```
guestflow/
├── CLAUDE.md            # auto-read by everyone's Claude Code (shared, frozen early)
├── PRD.md               # the spec (shared, read-only after 10am)
├── SCHEMA.md            # human contract (shared, read-only after 10am)
├── .gitignore
├── .env.example
├── /shared
│   └── types.ts         # FROZEN CONTRACT — edit only in a team huddle
├── /agent       <-- OWNER: Person A   (Claude orchestration + host-matching)
├── /web         <-- OWNER: Person B   (demo UI + live reasoning trace)
└── /data        <-- OWNER: Person C   (guests/staff/events JSON, mock flight, pitch)
        └── /pitch/demo-script.md
```

**The one hard rule: you never edit a file outside your own folder.** The only shared files are `types.ts`, `CLAUDE.md`, `PRD.md`, `SCHEMA.md` — all frozen by 10:00 AM. If they're frozen and you only touch your folder, **you will essentially never hit a conflict.**

## C. The workflow (everyone works on `main` — simplest, lowest overhead)

Branches add overhead you don't have time for when folders are isolated. Instead:

**Before you start / before every push:**
```bash
git pull --rebase
```
**Commit small and often (every ~20–30 min):**
```bash
git add <only your folder>
git commit -m "agent: host-matching v1"
git pull --rebase
git push
```

That's it. `--rebase` keeps history linear and, because nobody else touched your folder, the pull is always clean.

**If you ever see a conflict:** it means a shared/frozen file changed. Stop, ping the team, do not force-push. 30-second fix:
```bash
git rebase --abort        # bail out safely
# resolve verbally with the team, then redo the pull
```

## D. .gitignore (commit this at setup)

```
node_modules/
.env
.env.local
dist/
.DS_Store
*.log
.vercel/
```

## E. .env.example (commit this — values blank)

```
ANTHROPIC_API_KEY=
ELEVENLABS_API_KEY=
```

## F. Integration checkpoints (non-negotiable)

- **1:00 PM — first full integration.** `/web` imports the real `/agent` output on real `/data`. The first integration ALWAYS breaks something; you want hours of runway, not minutes.
- Then integrate **every hour**. Small, frequent, boring.
- **4:00 PM feature freeze.** After this: only bug-fix and rehearse. No new features, ever, no matter how good the idea.

## G. Pre-submission checklist (5:00 PM)

- [ ] Repo is **public** (Settings → check it says Public)
- [ ] `.env` is NOT in the repo (search the repo for your key — if it's there, rotate it)
- [ ] Demo link is live and loads in an incognito window
- [ ] All 3 teammates added on the Cerebral Valley submission page
- [ ] 1-minute demo video uploaded
- [ ] `README.md` has a one-paragraph what-it-is + run instructions
