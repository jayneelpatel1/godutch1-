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

# 💬 Comment Requirement

```js
// Reusable component
// Used in: [Screen1, Screen2]
// Props: title, onClick, variant
```

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

## 👁️ Review Rules (2-Person Team)

* You write code → **brother reviews and merges**
* Brother writes code → **you review and merges**
* ❌ Never merge your own PR (except true emergencies)
* ✅ Always check the Firebase preview URL before approving
* ✅ Leave a comment on GitHub if something looks wrong

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
* [ ] Are all files staged correctly?
* [ ] Is commit message following format?
* [ ] Did you run lint/typecheck?
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

---

## 🚫 Strict Anti-Rules

* ❌ Do NOT push directly to `staging`
* ❌ Do NOT push directly to `master`
* ❌ Do NOT merge your own PR
* ❌ Do NOT force push
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