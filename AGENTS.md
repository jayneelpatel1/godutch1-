# 🤖 AGENTS.md — Kharchaa (Cross-Platform OpenCode Instructions)

⚠️ **PRIORITY RULE:** Always prefer component reuse over new creation.

---

# 📌 Project Overview

**Project Name:** Kharchaa
**Type:** Cross-platform app (Android + iOS + Web)
**Framework:** React Native + Expo (Web enabled)
**Purpose:** Expense sharing between friends/groups

---

# 🎯 Core Principles

* Cross-platform compatibility (Android, iOS, Web)
* Reusability first
* Clean and scalable architecture
* Minimal duplication
* AI-friendly structure
* Maintainable code

---

# 🧱 Tech Stack

* React Native (Expo + Expo Web)
* TypeScript (strict mode)
* React Navigation
* Firebase Authentication
* Supabase (PostgreSQL backend)
* React Query (TanStack Query)
* Zustand (state management)
* Responsive design (for web)

---

# 🌐 Cross-Platform Rules (VERY IMPORTANT)

## 1. Platform-Agnostic Code First

* Use core components:

  * `View`, `Text`, `Pressable`, `ScrollView`

---

## 2. Platform Checks (Only When Required)

```jsx
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  // web-specific logic
}
```

---

## 3. Responsive Design

* Use flexible layouts:

  * `flex`, `%`, `Dimensions`
* Avoid fixed sizes

```jsx
width: '100%'
maxWidth: 500
```

---

## 4. Navigation

* Use Expo Router (file-based, web supported)

---

## 5. Styling

* Use StyleSheet
* UI must work on:

  * Mobile
  * Tablet
  * Desktop

---

## 6. Library Selection

✅ Use:

* Expo-supported libraries
* Cross-platform packages
* Firebase Auth
* Supabase JS client

❌ Avoid:

* Platform-specific libraries
* SQLite/local database (online-only mode)

---

# 📁 Folder Structure

```
/components/ui        → Generic UI (Button, Input, Card)
/components/common    → Shared components
/features/*           → Feature modules
/hooks                → Reusable logic (React Query + Zustand)
/services             → API logic (Supabase + Firebase)
/utils                → Helpers
/constants            → Static config
/app                  → Expo Router screens
  /(auth)            → Authentication screens
  /(main)            → Main app screens
```

---

# ♻️ Component Reuse Guidelines

## 🔍 Mandatory Pre-Check

Before creating any component:

1. Search:

   * `/components/ui`
   * `/components/common`
   * `/features/*`

2. Ask:

   * Can existing component be reused?

👉 If YES → REUSE
👉 If NO → Create new

---

## 🧩 Reuse Rules

### Use Props Instead of Duplication

```jsx
// ❌ BAD
<ButtonPrimary />
<ButtonSecondary />

// ✅ GOOD
<Button variant="primary" />
<Button variant="secondary" />
```

---

### Extract Repeated UI

```jsx
// ❌ BAD
<View>...</View>

// ✅ GOOD
<Card>{children}</Card>
```

---

### Separate Logic

```jsx
const { data } = useGroups();
```

---

# 🚫 Anti-Patterns

* Duplicate components
* Hardcoded values
* Fixed layouts (break web)
* Unnecessary platform-specific code
* Local SQLite/database usage (use Supabase instead)

---

# 🎨 UI/UX Rules

* Mobile-first design
* Must adapt to web
* Clean spacing
* Touch-friendly UI

---

# ⚙️ State Management

* Prefer local state
* Use Zustand for global state
* Use React Query for server state
* Avoid unnecessary re-renders

---

# 🔌 API Rules

* Keep API in `/services`
* No API calls in UI
* Use async/await
* Use Supabase JS client
* Firebase Auth for authentication
* Online-only mode (no offline sync)

---

# 🔁 Refactor Rule

If duplication found:

* Refactor immediately
* Replace with shared component

---

# 🧪 Pre-Commit Dry Run (MANDATORY)

## 🎯 Objective

**Every code change MUST be verified locally before committing.**
Never assume the code works — always run it and see it with your own eyes.

---

## 🚨 Golden Rules

* ❌ NEVER commit without running the app first
* ❌ NEVER skip TypeScript check — a type error in prod is a bug
* ❌ NEVER only test the feature you added — always check adjacent screens too
* ✅ ALWAYS run the app and manually navigate to what you changed
* ✅ ALWAYS check web AND mobile — they can fail independently
* ✅ ALWAYS clear errors in the terminal before calling it "passing"

---

## 🔢 Dry Run Steps (Run In This Order)

### Step 1 — TypeScript Check

Catch type errors before they become runtime crashes:

```bash
npx tsc --noEmit
```

* ✅ Zero errors = proceed
* ❌ Any error = fix before moving on — do NOT ignore TS errors

---

### Step 2 — Lint Check

Catch code style and logic issues:

```bash
npx eslint . --ext .ts,.tsx
```

* ✅ Zero warnings/errors = proceed
* ❌ Errors = fix before committing
* ⚠️ Warnings = fix if related to your changes; document if pre-existing

---

### Step 3 — Start the App

```bash
npx expo start
```

Then open on each platform:

| Platform | How to open |
|----------|-------------|
| Android  | Press `a` in terminal, or scan QR with Expo Go |
| iOS      | Press `i` in terminal, or scan QR with Expo Go |
| Web      | Press `w` in terminal → opens in browser |

---

### Step 4 — Manual Feature Test

Navigate directly to the screen/feature you changed and verify:

```
✅ Does the feature work as expected?
✅ Does the UI render correctly (no broken layout, no overflow)?
✅ Does it handle empty state? (no data, no user, no group)
✅ Does it handle error state? (bad network, Supabase error)
✅ Does it handle loading state? (spinner shown while fetching)
```

---

### Step 5 — Regression Check

Check screens that are **near** what you changed — your fix may have broken a neighbor:

```
If you changed:        Also check:
─────────────────────────────────────────
ExpenseCard            ExpenseList, GroupDetail
GroupService           GroupList, GroupDetail, CreateGroup
authStore              Login, Signup, any auth-gated screen
useGroups hook         Every screen that calls useGroups
Navigation params      The screen before AND after in the flow
```

---

### Step 6 — Web-Specific Console Check

Open browser DevTools (`F12`) and check:

```
✅ No red errors in Console tab
✅ No failed network requests in Network tab
✅ Layout looks correct at 375px (mobile), 768px (tablet), 1280px (desktop)
✅ No "window is not defined" or other web-incompatible RN errors
```

---

### Step 7 — Check Terminal for Runtime Errors

Look at the Expo terminal output while using the app:

```
✅ No red error stack traces
✅ No yellow warnings related to your changes
✅ No "VirtualizedLists should never be nested" or similar RN warnings
```

---

## ✅ Dry Run Checklist (Complete ALL Before Committing)

```
Static Checks
  [ ] npx tsc --noEmit → zero errors
  [ ] npx eslint → zero errors

App Running
  [ ] App starts without crashing
  [ ] Feature works correctly on Web
  [ ] Feature works correctly on Android
  [ ] Feature works correctly on iOS

Manual Testing
  [ ] Happy path tested (normal use)
  [ ] Empty state tested (no data)
  [ ] Error state tested (or confirmed handled)
  [ ] Loading state visible (spinner/skeleton shown)

Regression
  [ ] Adjacent screens still work
  [ ] Navigation flow intact
  [ ] No new console errors or warnings introduced

Web Specific
  [ ] Browser console clean (no red errors)
  [ ] Responsive at mobile, tablet, desktop widths
```

---

## 🤖 AI Behavior (OpenCode) — Dry Run Rules

After implementing any code change, OpenCode MUST:

1. **Tell the user what to run** — always show the exact commands
2. **List what to manually test** — be specific, not generic
3. **Flag any untestable parts** — e.g. "I cannot verify the haptic feedback on web"
4. **Never say "this should work"** — only "please run these steps to verify"
5. **Block commit suggestion until dry run is confirmed** — ask user: "Have you completed the dry run checklist?"

### What to say after implementing changes:

```
✅ Code changes complete.

Before committing, please run the dry run:

1. npx tsc --noEmit          ← check for type errors
2. npx eslint . --ext .ts,.tsx  ← check for lint errors
3. npx expo start            ← start the app

Then manually test:
  → Navigate to [specific screen you changed]
  → Test [specific action — e.g. "add an expense and verify split amounts"]
  → Check Web (browser console should be clean)
  → Check Android/iOS (Expo Go)

Also verify these adjacent screens still work:
  → [list related screens]

Once you've confirmed everything works, let me know and I'll prepare the commit.
```

---

## ⚠️ Common Dry Run Mistakes (AVOID)

* Running `tsc` but ignoring the errors and committing anyway
* Testing only on web and assuming mobile works
* Testing the happy path only — skipping empty/error/loading states
* Not checking the browser console for silent JS errors
* Saying "it looks fine" without actually opening the app

---

# 💬 Comment Requirements

## 🎯 Core Philosophy

* Comment **WHY**, not **WHAT** — the code shows what; comments explain intent, decisions, and non-obvious behavior
* ❌ Bad: `// increment i` above `i++`
* ✅ Good: `// skip index 0 — header row is never selectable`
* Keep comments up to date — a wrong comment is worse than no comment
* Remove debug/temporary comments before committing

---

## 📦 Reusable Components (`/components/ui`, `/components/common`)

Every reusable component MUST have a header comment block:

```tsx
/**
 * @component Button
 * @description Reusable pressable button with variant and size support.
 *              Handles disabled state and loading spinner automatically.
 *
 * @used-in ExpenseScreen, GroupScreen, SettleUpModal
 *
 * @props
 *   - label: string          — Button text
 *   - onPress: () => void    — Tap handler
 *   - variant: 'primary' | 'secondary' | 'ghost'  — Visual style
 *   - size: 'sm' | 'md' | 'lg'                    — Dimensions
 *   - loading?: boolean      — Shows spinner, disables press
 *   - disabled?: boolean     — Grays out and blocks interaction
 *
 * @platform Android ✅ | iOS ✅ | Web ✅
 */
```

---

## 🪝 Custom Hooks (`/hooks`)

Every custom hook MUST have a JSDoc block:

```tsx
/**
 * @hook useGroups
 * @description Fetches all groups the current user belongs to.
 *              Uses React Query for caching — data is fresh for 5 minutes.
 *
 * @returns {
 *   groups: Group[]     — List of user's groups (empty array if none)
 *   isLoading: boolean  — True on first fetch only
 *   isError: boolean    — True if Supabase query failed
 *   refetch: () => void — Manually trigger re-fetch
 * }
 *
 * @dependencies useAuthStore (reads current user ID)
 * @query-key ['groups', userId]
 */
```

---

## 🔧 Service Functions (`/services`)

Every exported function in a service file MUST have a JSDoc block:

```tsx
/**
 * @function createExpense
 * @description Inserts a new expense into Supabase and links it to the group.
 *              Does NOT calculate splits — caller must pass pre-calculated amounts.
 *
 * @param {string} groupId     — UUID of the group this expense belongs to
 * @param {ExpenseInput} data  — Title, amount, paidBy, splits[]
 * @returns {Promise<Expense>} — The newly created expense row
 *
 * @throws Supabase error if insert fails (network issue or RLS violation)
 * @side-effects Inserts into `expenses` + `expense_splits` tables
 */
```

---

## 🗃️ Zustand Stores (`/store`)

Every store file MUST have a header block and inline comments on non-obvious state:

```tsx
/**
 * @store authStore
 * @description Global authentication state managed by Zustand.
 *              Firebase Auth is the source of truth — this store mirrors it.
 *
 * @state
 *   - user: FirebaseUser | null  — Null means logged out
 *   - isAuthReady: boolean       — False until Firebase finishes initializing
 *                                  (prevents flashing login screen on app start)
 *
 * @actions
 *   - setUser()     — Called by Firebase onAuthStateChanged listener
 *   - clearUser()   — Called on logout
 */
```

---

## 🖥️ Screen Files (`/app`)

Screen-level files need a short description at the top and inline comments for non-obvious logic only:

```tsx
/**
 * @screen GroupDetailScreen
 * @description Shows members, balances, and expense list for a single group.
 *              Pulls groupId from Expo Router params.
 *
 * @route /groups/[groupId]
 * @auth Required — redirects to login if no session
 */
```

---

## 🧮 Complex Business Logic

Any non-trivial algorithm or calculation MUST be explained inline. This is most critical in the balance engine (M5):

```tsx
/**
 * Simplify debts using a greedy settle-up algorithm.
 *
 * Why this approach:
 *   A naive approach creates O(n²) transactions (every person pays everyone).
 *   This greedy method minimizes total transactions by always matching
 *   the largest debtor with the largest creditor.
 *
 * Limitation:
 *   Does not guarantee the globally optimal minimum — that is NP-hard.
 *   For groups under ~20 people this is fast and good enough.
 *
 * @param {Balance[]} balances — Net balance per user (positive = owed money, negative = owes money)
 * @returns {Settlement[]}    — Minimal list of who pays whom and how much
 */
function simplifyDebts(balances: Balance[]): Settlement[] {
  // Separate into creditors (they are owed) and debtors (they owe)
  // Sort descending so we always process the largest amounts first
  ...
}
```

---

## 🌐 Platform-Specific Code

Always explain WHY a platform check is needed, not just that it exists:

```tsx
// Web does not support Haptics — calling it throws a runtime error
// iOS/Android use it to give tactile feedback on successful settlement
if (Platform.OS !== 'web') {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
```

---

## 🔑 Constants (`/constants`)

Group related constants and explain non-obvious values:

```tsx
// Query stale times (milliseconds)
// Groups change rarely — 5 min cache avoids hammering Supabase on every navigation
export const QUERY_STALE_TIME = {
  GROUPS: 5 * 60 * 1000,    // 5 minutes
  EXPENSES: 2 * 60 * 1000,  // 2 minutes — expenses change more frequently
  USER: 10 * 60 * 1000,     // 10 minutes — profile data is nearly static
};
```

---

## 🚩 TODO / FIXME Format

Use a consistent format so they're searchable:

```tsx
// TODO(milestone-6): Add optimistic update so UI reflects change before Supabase confirms
// FIXME(@yourname): Currency rounding loses 1 paisa on splits > 3 people — needs revisit
// HACK: Supabase RLS does not support array contains yet — filtering client-side as workaround
// NOTE: This runs on every render — acceptable here because the list is always < 20 items
```

---

## ❌ What NOT to Comment

```tsx
// ❌ Obvious — don't do this
const [loading, setLoading] = useState(false); // state for loading

// ❌ Restating the function name
// Gets the user
async function getUser() { ... }

// ❌ Dead code left with a comment — just delete it
// const oldBalance = calculateOldBalance(); // not needed anymore
```

---

## ✅ Comment Checklist (Before Committing)

* [ ] All new components have a `@component` header block
* [ ] All new hooks have a `@hook` JSDoc block
* [ ] All new service functions have a `@function` JSDoc block
* [ ] Complex logic has an explanation of WHY, not just what
* [ ] Platform-specific blocks explain the reason
* [ ] No debug `console.log` left in — or intentional logs are marked `// intentional`
* [ ] No outdated comments referencing removed code
* [ ] TODO/FIXME follow the standard format

---

# 🔄 PR / Commit Rules

## ✅ Checklist

* [ ] Works on Android
* [ ] Works on iOS
* [ ] Works on Web
* [ ] No duplicate components
* [ ] Responsive UI verified
* [ ] Online-only mode confirmed

---

## 📝 Commit Format

```
feat: add reusable component
refactor: extract shared component
fix: resolve platform issue
refactor: switch to online-only mode
```

---

# 🚀 GitHub Rules (CRITICAL)

## 👥 Team Structure

* **Owner:** Main developer (you)
* **Collaborator:** Your brother
* **Rule:** The person who wrote the code does NOT merge their own PR — the other person always reviews and merges

---

## 🛠️ First Time Setup (Do This Once)

```
Step 1 — Add your brother as a collaborator
  GitHub repo → Settings → Collaborators → Add → enter his GitHub username

Step 2 — Both of you clone the repo locally
  git clone <your-repo-url>
  cd kharchaa

Step 3 — Always start every new task with these 3 commands
  git checkout staging
  git pull
  git checkout -b feature/your-task-name

Step 4 — Never touch staging or master directly
  ❌ No direct commits to staging
  ❌ No direct commits to master
  ✅ Always work on a feature branch
```

---

## 🌿 Branch Strategy

```
master    → Stable checkpoint ("this week's work is solid ✅")
staging   → Live site (auto-deploys to Firebase on every push)
feature/* → Where all actual work happens
```

### ⚠️ STRICT RULES

* ❌ NEVER push directly to `staging`
* ❌ NEVER push directly to `master`
* ✅ ALL work goes through a feature branch → PR → staging

---

## 🔁 Day-to-Day Development Flow

```
1. Sync with latest staging
   git checkout staging
   git pull origin staging

2. Create a feature branch
   git checkout -b feature/<task-name>

3. Write code on your branch

4. Push your branch
   git push origin feature/<task-name>

5. Open a Pull Request → into staging on GitHub

6. The OTHER person:
   - Reviews the code
   - Clicks the preview URL (auto-generated by Firebase)
   - Approves or leaves comments

7. Once approved → other person merges PR

8. Firebase auto-deploys to live site ✅
```

---

## 🌿 Branch Creation Rule (MANDATORY)

**Always create your feature branch from `staging` — never from `master` or another feature branch.**

```bash
# ✅ CORRECT — always do this first
git checkout staging
git pull origin staging         ← get the latest code
git checkout -b feature/your-task-name

# ❌ WRONG — never do these
git checkout -b feature/x       ← branching without pulling latest
git checkout master
git checkout -b feature/x       ← branching from master
git checkout feature/other
git checkout -b feature/x       ← branching from another feature branch
```

**Why?**
- Branching from `staging` means your code is always based on what's live
- Branching from `master` = your code is behind (master is older than staging)
- Branching from another feature branch = you inherit someone else's unreviewed code

---

## 🌿 Branch Naming Rules

| What you are doing | Branch name |
|--------------------|-------------|
| New feature | `feature/add-expense-screen` |
| Bug fix | `fix/login-crash` |
| UI update | `ui/home-screen-redesign` |
| Urgent fix | `hotfix/broken-signup` |
| Refactor | `refactor/expense-card-cleanup` |

---

## ⚔️ Conflict Resolution (When PR Shows Merge Conflicts)

### 🧠 Why conflicts happen — understand this first

Your local branch is NOT the problem. Conflicts appear on GitHub because:

```
staging ──── A ──── B ──── C   ← brother's PR merged (staging moved forward)
                    ↑
your branch ── X ── Y          ← your PR, still based on old staging
```

Your local branch `X → Y` is perfectly clean. But staging has moved forward (commit C was added after you branched). GitHub sees the divergence and flags your PR as a conflict — even though nothing is wrong locally.

**The fix: rebase your branch onto the updated staging so your commits sit on top of C, not B.**

```
staging ──── A ──── B ──── C
                            ↑
your branch (after rebase) ── X' ── Y'   ← clean, no conflict
```

**NEVER resolve conflicts by clicking "Merge staging into branch" on GitHub — always rebase.**

### Why rebase, not merge?
- Merge creates an extra "merge commit" that pollutes the history
- Rebase replays your commits on top of the latest staging cleanly
- PR stays linear and easy to review

### When to do this

Run the rebase **as soon as you see the conflict warning on GitHub** — before asking your brother to review. Don't open a review request on a conflicted PR.

A good habit: before requesting review on any PR, always run `git fetch origin` first to check if staging has moved.

### Steps (run in this order):

```bash
# Step 1 — Fetch latest staging (don't pull, just fetch)
git fetch origin

# Step 2 — Rebase your branch onto staging
git rebase origin/staging
```

Git will pause at each commit that conflicts. For each conflict:

```bash
# Step 3 — Open each conflicted file in your editor
# Look for conflict markers and resolve them:
#
# <<<<<<< HEAD (your changes)
# your code
# =======
# their code
# >>>>>>> origin/staging (staging's changes)
#
# Delete the markers, keep the correct code (yours, theirs, or a blend)

# Step 4 — Stage the resolved files
git add .

# Step 5 — Continue the rebase (repeat steps 3–5 for each conflicting commit)
git rebase --continue
```

Once rebase is complete:

```bash
# Step 6 — Force push with lease (the ONE allowed force push)
git push origin feature/your-branch-name --force-with-lease
```

The PR on GitHub will automatically update and the conflict warning will be gone.

### ✅ Rules during rebase

* ✅ Use `git add .` + `git rebase --continue` to proceed
* ✅ Use `--force-with-lease` for the push after rebase — it is safe
* ❌ NEVER use `git merge origin/staging` — use rebase only
* ❌ NEVER use plain `git push --force` — always `--force-with-lease`
* ❌ NEVER commit during a rebase — only `git add` + `git rebase --continue`

### 🆘 If rebase goes wrong — abort and start over

```bash
git rebase --abort
# You are back to where you started — try again carefully
```

### ⚠️ Why `--force-with-lease` and not `--force`?

| Command | What it does |
|---------|-------------|
| `--force` | Overwrites remote branch blindly — can erase someone else's push |
| `--force-with-lease` | Fails safely if the remote was updated since your last fetch — protects against overwriting |

Always use `--force-with-lease`. Plain `--force` is banned.

### Conflict checklist

```
[ ] Understood the cause — staging moved forward, local branch is fine
[ ] git fetch origin ran before rebase
[ ] git rebase origin/staging used (NOT git merge)
[ ] All conflict markers (<<<<<<< ======= >>>>>>>) removed from files
[ ] git add . run after resolving each file
[ ] git rebase --continue run after staging
[ ] App tested after rebase (conflicts can introduce subtle bugs)
[ ] git push --force-with-lease used (NOT --force)
[ ] PR updated on GitHub — conflict warning gone
[ ] Brother notified to re-review
```

---

## 👁️ Review Rules (2-Person Team)

* You write code → **brother reviews and merges**
* Brother writes code → **you review and merges**
* ❌ Never merge your own PR (except true emergencies)
* ✅ Always check the Firebase preview URL before approving
* ✅ Leave a comment on GitHub if something looks wrong
* ✅ After a rebase force-push, re-review the PR from scratch — the commit history changed

---

## 🏷️ Master Branch — Checkpoint Rule

Master is NOT used for daily work. It is a **"stamp of approval"** — a snapshot of code you fully trust.

```
When to merge staging → master:
  ✅ At end of a stable week
  ✅ After a milestone is complete (M1, M2, M3...)
  ✅ Before starting a risky new feature
  ✅ When the live site is working perfectly

How:
  → Open a PR from staging → master on GitHub
  → Both of you review it together
  → Merge it
  → Tag it (optional): git tag v0.1.0
```

Think of master as your **game save point** — if staging ever breaks badly, master is your safe restore.

---

## 🚀 Automatic Deployment

### How Deployment Works

```
You open PR (feature → staging)
        ↓
Firebase creates a PREVIEW URL automatically
(e.g. https://godutch-ab7b2--pr-42.web.app)
        ↓
Brother reviews code + tests preview URL
        ↓
Brother approves and merges PR into staging
        ↓
Firebase automatically deploys to LIVE site
(https://godutch-ab7b2.web.app)
```

### Workflow Files

* `.github/workflows/firebase-hosting-merge.yml` → Deploys live on push to `staging`
* `.github/workflows/firebase-hosting-pull-request.yml` → Creates preview URLs for PRs

### Required GitHub Secret

* `FIREBASE_SERVICE_ACCOUNT_GODUTCH_AB7B2` → Firebase deploy key (already configured)

---

## ⛔️ NEVER Commit Without Asking

**YOU MUST:**

1. **Always ask the user before committing**
   - "Should I commit these changes?"
   - Show what files will be committed
   - Show the commit message you plan to use

2. **Wait for explicit user approval**
   - Only commit after user says "yes" or "commit"
   - When user says "commit": Commit first, then automatically push to GitHub

3. **NEVER manually trigger Firebase deployment**
   - ❌ Deployment is fully automated via GitHub Actions
   - ❌ Never run Firebase deploy commands manually
   - ✅ Merging PR into staging = deployment happens automatically

**Rule:** If user says "commit", automatically push to GitHub after creating the commit.

---

## ✅ Commit Checklist (Ask User First!)

* [ ] Did you ask the user first?
* [ ] Did user approve the commit?
* [ ] **Dry run completed?** (`tsc`, `eslint`, app tested on all platforms)
* [ ] Are all files staged correctly?
* [ ] Is commit message following format?
* [ ] No debug logs or temporary comments left in code?
* [ ] Is user ready to push?

---

## 📤 Push Checklist (Ask User First!)

* [ ] Did you ask the user first?
* [ ] Did user approve the push?
* [ ] Is commit already created?
* [ ] Is branch a feature branch (NOT staging or master)?
* [ ] Is remote correct (origin)?
* [ ] Is PR ready to be opened into staging on GitHub?

---

## 💬 What To Say To User

**Before committing:**
```
I've made these changes:
- Modified: src/components/ExpenseCard.tsx
- Updated: AGENTS.md

Should I commit these changes?
Commit message: "fix: show user names instead of IDs in expense splits"
```

**Before pushing:**
```
I've created commit: 57d643f
Should I push to GitHub (origin/feature/your-branch-name)?
```

**After "commit" command (auto-push):**
```
I've committed: 57d643f
Now pushing to GitHub (origin/feature/your-branch-name)...
[Push successful]

Next step: Open a Pull Request into staging on GitHub.
Your brother should review and merge it.
Firebase will deploy to live automatically once the PR is merged. ✅
```

**Reminder after push:**
```
✅ Branch pushed successfully.
📌 Reminder: Open a PR into staging (not master).
👀 Ask your brother to review and merge — don't merge your own PR.
🚀 No manual deployment needed — GitHub Actions handles it automatically.
```

**When PR shows a merge conflict:**
```
⚠️ Merge conflict on GitHub — but your local branch is fine.

This happened because staging moved forward (your brother's PR merged)
after you created your branch. You just need to rebase onto the updated staging.

Run these commands:

1. git fetch origin
2. git rebase origin/staging
3. Open each conflicted file → resolve the <<<<<<< markers
4. git add .
5. git rebase --continue  ← repeat 3–5 for each conflicting commit
6. git push origin feature/your-branch --force-with-lease

The PR will update automatically — conflict warning will be gone.
Ask your brother to re-review once it's clean.
```

---

## 🚫 Strict Anti-Rules

* ❌ Do NOT push directly to `staging`
* ❌ Do NOT push directly to `master`
* ❌ Do NOT merge your own PR
* ❌ Do NOT use plain `git push --force` — always `--force-with-lease`
* ❌ Do NOT use `git merge origin/staging` to resolve conflicts — use `git rebase`
* ❌ Do NOT skip the PR process
* ❌ Do NOT manually run Firebase deploy commands — GitHub Actions does this automatically

---

## 📋 Weekly Rhythm (Suggested)

```
Monday
  → Both sync up, decide who builds what
  → Each creates their own feature branch

During the week
  → Work on feature branches
  → Open PRs into staging
  → Review each other's PRs
  → If PR shows conflicts → rebase onto staging before asking for review

End of week (when stable)
  → Merge staging → master
  → Master = your "this week was solid" checkpoint
```

---

# 🚀 Expected Outcome

* Single codebase for all platforms
* Faster development
* Clean architecture
* Scalable product
* Supabase backend with Firebase Auth
* React Query for data management

---

# 🔧 Current Architecture (Milestone 5+)

## Mode: Online-Only

* **No SQLite/local database**
* **No offline sync** (will be added in Milestone 6 if needed)
* All data via Supabase
* Firebase Auth for user authentication

## Key Services:

* `services/supabase.ts` - Supabase client
* `services/firebaseConfig.ts` - Firebase config
* `services/googleAuth.ts` - Firebase Auth
* `services/groupService.ts` - Group CRUD
* `services/expenseService.ts` - Expense CRUD
* `services/userService.ts` - User management

## Key Hooks:

* `hooks/useGroups.ts` - Group data with React Query
* `hooks/useExpenses.ts` - Expense data with React Query
* `hooks/useUser.ts` - User data management

## State Management:

* `store/authStore.ts` - Auth state (Zustand)
* `store/groupStore.ts` - Group state (Zustand)
* `store/expenseStore.ts` - Expense state (Zustand)

---

# 📋 Development Phases

- [x] M1: Project setup + navigation
- [x] M2: Authentication (Firebase)
- [x] M3: Group management
- [x] M4: Expense management
- [x] M5: Balance engine (current)
- [ ] M6: Offline sync (optional, deferred)
- [ ] M7: Polish & deploy

---

# 🐛 Debugging Rules (STRICT)

## 🎯 Objective

Fix issues with **root-cause analysis**, not guesswork.
Avoid introducing new bugs while fixing existing ones.

---

## 🚨 Golden Rules (MANDATORY)

* ❌ NEVER fix without understanding the root cause
* ❌ NEVER apply random or multiple fixes at once
* ❌ NEVER break existing working features
* ❌ NEVER ignore error logs
* ✅ ALWAYS reproduce the issue first
* ✅ ALWAYS read logs/errors carefully
* ✅ ALWAYS fix the root cause
* ✅ ALWAYS verify across all platforms (Android, iOS, Web)

---

## 🔍 Debugging Process (Follow Step-by-Step)

### 1. Understand the Problem

* What is expected behavior?
* What is actually happening?

---

### 2. Reproduce the Issue

* Can it be consistently reproduced?
* What steps trigger it?

---

### 3. Check Logs & Errors

* Read:

  * Console logs
  * Network logs
  * API responses

```js
console.log('DEBUG:', data);
```

👉 Do NOT skip this step

---

### 4. Identify Root Cause

Ask:

* Is it UI issue?
* API issue?
* State issue?
* Platform-specific issue?

---

### 5. Apply Minimal Fix

* Fix ONLY what is broken
* Do NOT refactor unrelated code

---

### 6. Verify Fix

* Test on:

  * Android
  * iOS
  * Web

* Test:

  * Edge cases
  * Different inputs

---

### 7. Cleanup Debug Code

* Remove unnecessary logs
* Keep only meaningful logs if required

---

## 🧠 Debugging Best Practices

### Use Structured Logs

```js
console.log('[ExpenseScreen] API Response:', response);
```

---

### Check API Layer First

* Validate:

  * Request payload
  * Response format
  * Error handling

---

### Validate State Flow

* Ensure:

  * Correct data flow
  * No stale state
  * Proper updates

---

### Use Isolation Technique

* Disable parts of code to isolate issue
* Narrow down problem scope

---

## ⚠️ Common Mistakes (AVOID)

* Fixing symptoms instead of cause
* Blindly changing multiple files
* Ignoring platform differences
* Not testing after fix
* Leaving debug logs in production

---

## 🔄 Debugging Checklist (MANDATORY BEFORE COMMIT)

* [ ] Issue reproduced
* [ ] Root cause identified
* [ ] Minimal fix applied
* [ ] Verified on Android
* [ ] Verified on iOS
* [ ] Verified on Web
* [ ] No unnecessary logs left

---

## 📝 Debug Commit Format

```
fix: resolve [issue] by fixing root cause
debug: identify issue in [component/service]
```

---

## 🤖 AI Debug Behavior (OpenCode)

* MUST analyze before fixing
* MUST explain root cause
* MUST apply minimal fix
* MUST not introduce new patterns during fix
* MUST not refactor unrelated code
* MUST verify cross-platform compatibility

---