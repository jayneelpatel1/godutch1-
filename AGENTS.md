# 🤖 AGENTS.md — Go Dutch (Cross-Platform OpenCode Instructions)

⚠️ **PRIORITY RULE:** Always prefer component reuse over new creation.

---

# 📌 Project Overview

**Project Name:** Go Dutch
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

# 🤖 AI Behavior Rules (OpenCode)

* Always check for reusable components first
* Never create duplicates
* Prefer props over variants
* Ensure cross-platform compatibility
* Follow folder structure
* Add comments for reusable components
* Use React Query for data fetching
* Use Zustand for state management
* **Online-only mode: No SQLite or local database**

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
