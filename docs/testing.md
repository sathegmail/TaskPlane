# TaskPlane — Automated Testing Strategy & Protocol

**Rule:** The AI agent performs exhaustive automated verification on every code change before handing off work. The user should only ever need to do a quick visual check.

---

## 1. Automated Testing Pyramid

```
                ┌────────────────────────┐
                │   Expo Bundle Check    │  Headless iOS & Android compilation
                │  (npx expo export)     │
                ├────────────────────────┤
                │  Component Integration │  User interaction simulations
                │ (RNTL / Component Sim) │  (typing, tapping, filtering)
                ├────────────────────────┤
                │   Logic & Unit Tests   │  State changes, SQLite, sorting,
                │         (Jest)         │  notifications, data validation
                ├────────────────────────┤
                │  Type Safety Check     │  Zero TypeScript compiler errors
                │ (npx tsc --noEmit)     │
                └────────────────────────┘
```

---

## 2. Test Suites Maintained by the Agent

### 2.1 State & Storage Tests (`tests/store.test.ts`)
- Creating a new task (validates ID generation, timestamps, default values).
- Toggling task completion (`is_completed: true`, sets `completed_at`).
- Filtering tasks (`today`, `upcoming`, `completed`, `by priority`).
- SQLite offline persistence and schema migrations.

### 2.2 Component & UI Interaction Tests (`tests/components/*.test.tsx`)
- **Quick Add Bar**: Simulates typing in the input, tapping submit, and checking that the task renders on screen.
- **Task Item**: Simulates tapping the checkbox, verifying animation state and strikethrough styling.
- **Filter Tabs**: Simulates switching tabs (`All` -> `Today` -> `Done`) and verifying list contents.

### 2.3 Notification & Wrist Logic Tests (`tests/notifications.test.ts`)
- Verifies scheduled notification payloads include the correct interactive action categories (`ACTION_COMPLETE`, `ACTION_SNOOZE`).
- Simulates background action triggers and validates that `ACTION_COMPLETE` updates the task state without opening the app.

---

## 3. Strict Pre-Commit Verification Gate

Before committing any feature or declaring a task complete, the agent must run:

```zsh
npm run test:all
```
*(Runs: `tsc --noEmit` + `jest --runInBand` + `npx expo export --dry-run`)*

If any test fails, the agent self-heals and fixes the problem before notifying the user.
