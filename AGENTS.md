# AGENTS.md

# Go Dutch — OpenCode AI Agent Instructions

## Project Overview

Go Dutch is a cross-platform expense-sharing mobile application built using React Native.

The app helps users:

* Create expense groups
* Split expenses
* Track balances
* Manage settlements
* Work offline-first

The application should prioritize:

* Simplicity
* Fast UX
* Minimal UI
* Clean architecture
* Reusable components
* Offline-first support

---

# Tech Stack

## Frontend

* React Native
* TypeScript
* React Navigation
* Zustand
* React Query

## Backend

* Supabase
* PostgreSQL

## Local Storage

* SQLite

## Notifications

* Firebase Cloud Messaging (FCM)

---

# Project Structure

```text
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

# Development Rules

## General Rules

* Use TypeScript strictly.
* Prefer functional components.
* Use reusable components whenever possible.
* Keep files modular and maintainable.
* Avoid duplicate code.
* Prefer clean and readable code over complex optimizations.

---

# UI/UX Guidelines

## Design Principles

The app should feel:

* Lightweight
* Modern
* Minimal
* Fast
* Clean

## UX Philosophy

Primary product philosophy:

"Add expense in under 5 seconds."

## UI Rules

* Minimal taps
* Large touch targets
* Rounded cards
* Consistent spacing
* Simple typography
* Bottom navigation preferred
* Avoid cluttered screens

---

# Styling Rules

## Preferred Styling

Use one consistent styling approach.

Recommended:

* NativeWind
  OR
* StyleSheet API

Avoid mixing multiple styling systems.

## Colors

### Primary

#16A34A

### Background

#FFFFFF

### Text

#111827

### Secondary Background

#F3F4F6

---

# Navigation Rules

Use React Navigation.

## Navigation Structure

```text
Auth Stack
 ├── Splash
 ├── Login
 └── OTP

Main Stack
 ├── Home
 ├── Create Group
 ├── Group Details
 ├── Add Expense
 ├── Expense Details
 ├── Settlement
 ├── Activity Feed
 └── Profile
```

---

# State Management Rules

## Zustand Usage

Use Zustand for:

* Local UI state
* Auth state
* Temporary app state

Do NOT overuse global state.

## React Query Usage

Use React Query for:

* API requests
* Server cache
* Mutations
* Sync handling

---

# Offline-First Rules

Offline support is a core feature.

## Requirements

* App should work without internet.
* Store changes locally first.
* Sync automatically when online.
* Prevent duplicate sync operations.

## Local Database

Use SQLite for:

* Cached groups
* Expenses
* Pending sync queue

---

# Authentication Rules

## MVP Authentication

Use email OTP authentication only.

Do NOT implement:

* Google login
* Apple login
* Mobile OTP login

## Session Rules

* Persist sessions locally.
* Auto-login users when possible.

---

# Component Guidelines

## Reusable Components Required

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
* OTPInput
* SearchInput

### Utility Components

* Avatar
* EmptyState
* Loader
* ErrorState

---

# Naming Conventions

## File Naming

Use PascalCase for components.

Examples:

* HomeScreen.tsx
* GroupCard.tsx
* AddExpenseModal.tsx

## Hook Naming

Use camelCase.

Examples:

* useAuth.ts
* useExpenses.ts

## Store Naming

Examples:

* authStore.ts
* expenseStore.ts

---

# Code Quality Rules

## Required

* Use TypeScript interfaces/types.
* Avoid any type.
* Handle loading states.
* Handle empty states.
* Handle error states.
* Keep components small.

## Avoid

* Deep prop drilling
* Large monolithic components
* Hardcoded repeated styles
* Inline business logic in UI components

---

# Performance Guidelines

## Requirements

* App launch under 3 seconds.
* Expense creation under 5 seconds.
* Smooth scrolling.
* Minimize unnecessary re-renders.

## Optimization Rules

* Memoize expensive components.
* Use FlatList properly.
* Avoid unnecessary state updates.

---

# Database Schema

## users

```sql
id
name
phone
avatar
created_at
```

## groups

```sql
id
name
created_by
created_at
```

## group_members

```sql
group_id
user_id
joined_at
```

## expenses

```sql
id
group_id
paid_by
amount
note
category
split_type
created_at
```

## expense_splits

```sql
expense_id
user_id
owed_amount
```

## settlements

```sql
id
payer_id
receiver_id
amount
status
created_at
```

---

# Expense Split Rules

## Supported Split Types

* Equal split
* Exact amount split
* Percentage split
* Ratio split

## Balance Optimization

The system should minimize the number of transactions.

Example:

Instead of:

* A pays B
* B pays C
* C pays A

Optimize to:

* A pays C only

---

# Development Milestones

## Milestone 1 ✅ [COMPLETED]

UI-only screens with dummy data.

## Milestone 2 ✅ [COMPLETED]

Authentication and backend setup.

## Milestone 3 ✅ [COMPLETED]

Group management system.

## Milestone 4 ✅ [COMPLETED]

Expense management system.

## Milestone 5

Balance engine and settlements.

## Milestone 6

Offline sync support.

## Milestone 7

Notifications and sharing.

## Milestone 8

QA and beta release.

*Current Progress (as of Sat May 02 2026): Authentication (Milestone 2) completed. OTP email login, session persistence, and auth state management are fully functional.*

---

# Dummy Data Rules

During early development:

* Use static mock data.
* Avoid backend dependency.
* Prioritize UI completion.
* Focus on navigation flow.

---

# API Integration Rules

## API Layer

All API calls must go through:

```text
src/services/
```

Do NOT call APIs directly inside components.

---

# Error Handling Rules

## Requirements

* Handle network failures.
* Show meaningful error messages.
* Provide retry options.
* Avoid app crashes.

---

# Git Workflow

## Branch Naming

Examples:

* feature/auth
* feature/groups
* feature/expenses
* fix/offline-sync

## Commit Naming

Examples:

* feat: add login screen
* feat: implement group creation
* fix: resolve balance calculation bug

---

# Testing Rules

## Required Testing

* Screen rendering
* Navigation flow
* Expense calculations
* Offline sync
* Form validation

---

# Product Philosophy

Every feature should support:

* Speed
* Simplicity
* Reliability
* Minimal friction

The app should always feel faster and simpler than traditional expense-sharing apps.

---

# Current Build Commands

Run these commands to work with the current codebase:

```bash
npm install          # Install dependencies
npm run start        # Start Expo dev server
npx expo start      # Same, explicitly via expo
npx expo lint       # Run ESLint
npm run android     # Start for Android
npm run ios         # Start for iOS
npm run web         # Start for web
```

## Entry Point

`"main": "expo-router/entry"` in package.json means Expo Router manages the entry point. Do not create a traditional App.tsx or index.js entry point.

## Path Aliases

- `@/*` maps to `./src/*`
- `@/assets/*` maps to `./assets/*`
