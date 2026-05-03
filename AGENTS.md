# 📌 Project Overview

Go Dutch is a **cross-platform expense-sharing mobile app** built with React Native.

### Core Capabilities
- Create and manage groups
- Add and split expenses
- Track balances
- Optimize settlements
- Work offline-first (critical feature)

---

# 🧭 Product Philosophy

### Primary Goal
> Add an expense in under **5 seconds**

### Principles
- Speed > Features  
- Simplicity > Flexibility  
- Reliability > Perfection  

---



# 🧱 Tech Stack

## Frontend
- React Native  
- TypeScript  
- Expo Router (file-based navigation)  
- Zustand (client state)  
- React Query (server state)  

## Backend
- Firebase (Auth - Google SSO) learn : https://firebase.google.com/docs/auth?authuser=0
- Supabase (DB + APIs)  
- PostgreSQL  

## Local Storage
- SQLite (offline-first storage)  

## Notifications
- Firebase Cloud Messaging (FCM)  

---

# 📂 Project Structure

```

src/
├── assets/
├── components/
├── constants/
├── data/
├── hooks/
├── navigation/
├── screens/
├── services/
├── store/
├── theme/
├── types/
├── utils/
└── database/

```

---

# 🔄 Data Flow Architecture (IMPORTANT)

```

UI (Screens / Components)
↓
Hooks (useExpenses, useGroups)
↓
Services (API + DB logic)
↓
├── React Query (server state)
├── Zustand (UI/local state)
└── SQLite (offline storage)

```

### Rules
- ❌ No API calls in components  
- ❌ No DB access in UI  
- ✅ All logic goes through hooks + services  

---

# 🧭 Navigation Rules

## Use Expo Router ONLY

## Structure

```

app/
├── (auth)/
│   ├── login.tsx (Google SSO via Firebase)
├── (main)/
│   ├── home.tsx
│   ├── group/
│   │   ├── create.tsx
│   │   ├── [id].tsx
│   ├── expense/
│   │   ├── add.tsx
│   │   ├── [id].tsx
│   ├── settlement.tsx
│   ├── activity.tsx
│   ├── profile.tsx

````

---

# 🧠 State Management Rules

## Zustand (Client State)
Use for:
- Auth state  
- UI state  
- Temporary data  

## React Query (Server State)
Use for:
- API calls  
- Caching  
- Syncing  

---

# 📡 Offline-First Architecture (CRITICAL)

## Core Principle
> Always write locally first → sync later

---

## SQLite Tables

### Cached Data
- groups  
- expenses  
- members  

### Sync Queue

```sql
pending_sync:
- id
- type (CREATE / UPDATE / DELETE)
- entity (expense / group / settlement)
- payload (JSON)
- status (pending / syncing / failed)
- retry_count
- created_at
````

---

## Sync Flow

1. Save to SQLite
2. Add to sync queue
3. Update UI instantly
4. Sync in background

---

## Sync Rules

* FIFO processing
* Retry max 3 times
* Use UUIDs
* Idempotent APIs

---

## Conflict Resolution

| Case             | Rule            |
| ---------------- | --------------- |
| Edit conflict    | Last write wins |
| Delete vs update | Delete wins     |
| Server mismatch  | Server wins     |

---

# 💰 Balance Engine

## Step 1: Net Balance

```
balance = paid - owed
```

## Step 2: Settlement

* Split into creditors (+) and debtors (-)
* Match largest values
* Settle minimum amount

### Example

```
A: +500
B: -300
C: -200

B → A: 300
C → A: 200
```

---

# 🌐 API / Service Layer

All APIs must go through:

```
src/services/
```

### Example

```ts
export const createExpense = async (data) => {
  // Save locally
  // Add to sync queue
  // Return response
};
```

---

# ⚠️ Error Handling

## Types

* Network Error
* Validation Error
* Server Error
* Sync Error

## Rules

* Show user-friendly messages
* Provide retry option
* Never crash

Example:

> "No internet. Expense saved and will sync later."

---

# 🎨 UI/UX Guidelines

## Design

* Minimal
* Fast
* Clean

## Rules

* Minimal taps
* Large touch targets
* Consistent spacing

---

# 🎯 Components

### Buttons

* PrimaryButton
* SecondaryButton
* IconButton

### Cards

* GroupCard
* ExpenseCard
* BalanceCard

### Inputs
* TextInput
* SearchInput

---

# 🎨 Styling

Use ONE:

* NativeWind
  OR
* StyleSheet

---

## Colors

```
Primary: #16A34A  
Background: #FFFFFF  
Text: #111827  
Secondary: #F3F4F6  
```

---

# 🔐 Security

* Use Supabase RLS
* Validate user_id
* Never trust client

---

# ⚡ Performance

## Targets

* App launch < 3s
* Expense add < 5s

## Optimization

* Use FlatList
* Memoize components
* Avoid re-renders

---

# 📦 Pagination

Use:

* Cursor-based pagination
* Lazy loading

---

# 🧪 Testing

* Navigation flow
* Expense calculation
* Offline sync
* Validation

---

# 🧑‍💻 Code Quality

## Required

* Strict TypeScript
* No `any`
* Handle all states

## Avoid

* Deep prop drilling
* Large components
* Inline logic

---

# 🔧 Logging

## Dev

* console logs

## Future

* Sentry / LogRocket

---

# 🚩 Feature Flags (Future)

* Enable/disable features remotely

---

# 🚫 Git Commit & Push Rules (MANDATORY)

## Core Rule
NEVER commit or push code without explicit user permission.

Always ask:
> "Should I commit these changes?"

---

## Commit Flow (STRICT)

Before committing:

1. Explain what changes were made
2. Show list of modified files
3. Suggest a commit message
4. Ask for approval

Only proceed if user says YES

---

## Commit Message Format

Use conventional commits:

- feat: new feature
- fix: bug fix
- refactor: code improvement
- chore: minor changes
- docs: documentation updates

### Examples
- feat: implement expense creation flow  
- fix: resolve sync duplication issue  
- refactor: optimize balance calculation  
- docs: update AGENTS.md with sync rules  

---

## Push Rules

- NEVER push automatically
- Ask before pushing:
  > "Should I push these changes?"

---

## Branch Rules

Use feature-based branches:

- feature/auth
- feature/groups
- feature/expenses
- feature/balance-engine
- feature/offline-sync
- fix/<bug-name>

---

## AGENTS.md Update Rule (IMPORTANT)

If any of the following changes occur:

- Architecture updates  
- New patterns introduced  
- Folder structure changes  
- State management changes  
- Sync logic changes  

👉 Then AGENTS.md MUST be updated.

---

## AGENTS.md Update Workflow

1. Modify AGENTS.md
2. Explain what was updated
3. Suggest commit message:

Example:
> docs: update AGENTS.md with offline sync architecture

4. Ask:
> "Should I commit these documentation updates?"

---

## Atomic Commit Rule

Each commit should:
- Do ONE logical change only
- Be easy to understand and revert

❌ Bad:
- "updated many things"

✅ Good:
- "feat: add group creation screen"

---

## Safety Rules

- ❌ Do NOT force push  
- ❌ Do NOT delete branches without permission  
- ❌ Do NOT overwrite existing commits  

---

## Final Rule

> If unsure, always ask before taking any git action.
---

# 🧩 Milestones

## ✅ Completed

* M1: UI
* M2: Auth
* M3: Groups
* M4: Expenses

## 🔄 Next

* M5: Balance engine
* M6: Offline sync

---

# 🧠 Final Rule

> Prefer a simple working solution over a perfect complex one.

# 📝 Code Commenting Rules (MANDATORY)

## Requirement
All code generated MUST include meaningful comments.

## Where to Add Comments

### 1. Functions
- Explain purpose of function
- Explain inputs/outputs

### 2. Complex Logic
- Balance calculations
- Split logic
- Sync handling
- Algorithms

### 3. Critical Flows
- Offline sync
- API calls
- Data transformations

---

## Example

```ts
// Calculates net balance for each user in a group
// Input: list of expenses
// Output: map of userId → balance
export const calculateBalances = (expenses) => {
  // Initialize balance map
  const balances = {}

  // Loop through each expense
  for (const expense of expenses) {
    // Add paid amount to payer
    balances[expense.paidBy] += expense.amount

    // Subtract owed amount from participants
    expense.splits.forEach(split => {
      balances[split.userId] -= split.owedAmount
    })
  }

  return balances
}

