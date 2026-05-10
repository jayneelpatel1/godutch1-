# Kharchaa

Expense sharing app for friends and groups — built with React Native + Expo (Android, iOS, Web).

Track shared expenses, split bills, and settle debts. Inspired by Splitwise.

## Features

- Google Sign-In authentication (Firebase Auth)
- Create and manage groups
- Add expenses with equal or custom splits
- View group balances and simplified settlements
- Activity feed for all group events
- Cross-platform: Android, iOS, Web

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo |
| Routing | Expo Router (file-based) |
| Auth | Firebase Authentication |
| Backend | Supabase (PostgreSQL) |
| Data Fetching | TanStack Query (React Query) |
| State Management | Zustand |
| Language | TypeScript (strict) |
| Styling | StyleSheet + responsive design |
| Linting | ESLint (expo config) |
| Deployment | Firebase Hosting (auto via GitHub Actions) |

## Prerequisites

- Node.js 18+
- npm
- Expo CLI (`npm install -g expo-cli`)
- Supabase project (URL + anon key)
- Firebase project (Web config)

## Getting Started

1. Clone the repo

   ```bash
   git clone <repo-url>
   cd kharchaa
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Set up environment variables in the project root.

4. Start the app

   ```bash
   npx expo start
   ```

   Press `w` for Web, `a` for Android, or `i` for iOS.

## Project Structure

```
├── app/
│   ├── (auth)/         Authentication screens (login, signup)
│   └── (main)/         Main app screens (groups, expenses, profile)
├── components/
│   ├── ui/             Generic UI components (Button, Input, Card)
│   └── ...             Shared feature components
├── features/           Feature module components
├── hooks/              Custom hooks (React Query + Zustand)
├── services/           API layer (Supabase + Firebase)
├── store/              Zustand state stores
├── types/              TypeScript type definitions
├── utils/              Helper utilities
├── constants/          Static configuration
└── AGENTS.md           AI-assisted development instructions
```

## Available Scripts

```bash
npm start          # Start Expo dev server
npm run android    # Start with Android
npm run ios        # Start with iOS
npm run web        # Start with Web
npm run build:web  # Export for web deployment
npm run lint       # Run ESLint
npx tsc --noEmit   # TypeScript type check
```

## Development Workflow

1. **Sync with staging**

   ```bash
   git checkout staging && git pull
   ```

2. **Create a feature branch**

   ```bash
   git checkout -b feature/<task-name>
   ```

3. **Make changes and verify**

   ```bash
   npx tsc --noEmit          # Type check
   npx eslint . --ext .ts,.tsx  # Lint
   npx expo start            # Test on Web + Android + iOS
   ```

4. **Commit and push**

   ```bash
   git add -A
   git commit -m "type: description"
   git push origin feature/<task-name>
   ```

5. **Open a Pull Request** into `staging` on GitHub

> See [AGENTS.md](./AGENTS.md) for detailed branch rules, commit format, and PR workflow.

## Deployment

Deployment is fully automated via GitHub Actions:

- **Preview URLs** created automatically for each PR
- **Live deployment** triggers on push to `staging`
- No manual Firebase deploy commands needed

## Team

- **Owner** — writes code, opens PRs
- **Collaborator** — reviews and merges PRs

The person who writes the code does **not** merge their own PR.
