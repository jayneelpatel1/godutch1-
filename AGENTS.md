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

## 🌿 Branching Strategy (MANDATORY)

⚠️ NEVER work directly on `main` / `master`

---

### 1. Create Feature Branch FIRST

Before writing any code:

```bash
git checkout -b feature/<feature-name>
```

---

### 2. Branch Naming Rules

Use clear naming:

* `feature/add-expense-screen`
* `fix/login-error`
* `refactor/component-reuse`

---

### 3. Development Flow

1. Create branch
2. Make changes
3. Commit (after user approval)
4. Push branch

```bash
git push origin feature/<feature-name>
```

---

### 4. Pull Request Rule

* NEVER push directly to `main`
* ALWAYS create Pull Request (PR)

---

### 5. AI Must Ask Before Branch Creation

Before creating branch:

```
Should I create a new branch?
Branch name: feature/<feature-name>
```

---

### 6. Push Rule (UPDATED)

Before pushing:

```
Should I push this branch to GitHub?
Branch: feature/<feature-name>
```

---

### 7. Deployment Rule (Post-Push Approval)

* Trigger: After user approves and completes push to GitHub
* Post-push flow:
  1. Ask user for Firebase deployment approval
  2. If approved: Run Expo web build then `firebase deploy`
  3. Report deployment status to user
* ❌ NEVER deploy without user approval
* ❌ NEVER deploy before confirming push success
* ❌ NEVER deploy when committing - deployment is ONLY post-push

---

## 🚫 Strict Anti-Rules

* ❌ Do NOT commit directly to main
* ❌ Do NOT push without branch
* ❌ Do NOT force push
* ❌ Do NOT skip PR process

---

## ✅ Final Flow

```
main → feature branch → commit → push → PR → merge → deploy (Firebase)
```

---

## 🚀 Automatic Deployment (NEW)

### Staging Branch Auto-Deploy

* **Branch:** `staging`
* **Deploy trigger:** Push to `staging` branch
* **Deploy target:** Firebase Hosting (live channel)
* **URL:** https://godutch-ab7b2.web.app

### Workflow Files:

* `.github/workflows/firebase-hosting-merge.yml` - Deploys to live on push to `staging`
* `.github/workflows/firebase-hosting-pull-request.yml` - Creates preview channels for PRs

### Setup Requirements:

1. **GitHub Secret:** `FIREBASE_SERVICE_ACCOUNT_GODUTCH_AB7B2`
   * Contains Firebase service account JSON key
   * Required for GitHub Actions to deploy

2. **Build Script:** `npm run build:web`
   * Exports Expo web app to `dist` folder
   * Configured in `package.json`

### Deployment Flow:

```
staging branch → push → GitHub Actions → build → deploy to Firebase
```

### PR Preview Deployments:

* Automatically creates preview URLs for pull requests
* Preview URL format: `https://godutch-ab7b2--pr-XXX.web.app`


## ⛔️ NEVER Commit Without Asking

**YOU MUST:**
1. **Always ask the user before committing**
   - "Should I commit these changes?"
   - Show what files will be committed
   - Show the commit message you plan to use

2. **Wait for explicit user approval**
   - Only commit after user says "yes" or "commit"
   - When user says "commit": Commit first, then automatically push to GitHub
   - Ask for deployment approval ONLY after successful push

3. **NEVER deploy when committing**
   - ❌ Deployment only happens AFTER successful push to GitHub
   - ❌ Never include deployment in commit workflow
   - ✅ Deploy only when user approves post-push

**New Rule:** If user says "commit", automatically push to GitHub after creating the commit.

## ✅ Commit Checklist (Ask User First!)

* [ ] Did you ask the user first?
* [ ] Did user approve the commit?
* [ ] Are all files staged correctly?
* [ ] Is commit message following format?
* [ ] Did you run lint/typecheck?
* [ ] Is user ready to push?

## 📤 Push Checklist (Ask User First!)

* [ ] Did you ask the user first?
* [ ] Did user approve the push?
* [ ] Is commit already created?
* [ ] Is branch correct (master/main)?
* [ ] Is remote correct (origin)?
* [ ] Is user ready for Firebase deployment post-push?

## 💬 What To Say To User:

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
Should I push to GitHub (origin/master)?
```

**After "commit" command (auto-push):**
```
I've committed: 57d643f
Now pushing to GitHub (origin/master)...
[Push successful]
Should I deploy the app to Firebase?
```

**Before deploying:**
```
I've successfully pushed to GitHub (branch: <branch-name>).
Should I deploy the app to Firebase?
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

```id="dbg123"
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
