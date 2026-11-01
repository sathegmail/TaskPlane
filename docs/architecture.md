# TaskPlane — System Architecture

**Version:** 1.0  
**Last Updated:** 2026-11-01  

---

## 1. System Overview

```
                                 ┌─────────────────────────┐
                                 │   Supabase Cloud        │
                                 │   (PostgreSQL + Auth)   │
                                 └────────────┬────────────┘
                                              │ Realtime TLS
              ┌───────────────────────────────┼───────────────────────────────┐
              ▼                               ▼                               ▼
    ┌───────────────────┐           ┌───────────────────┐           ┌───────────────────┐
    │    iOS & iPadOS   │           │      Android      │           │    Apple Watch    │
    │  (Expo / React)   │           │  (Expo / React)   │           │ (SwiftUI WatchKit)│
    └─────────┬─────────┘           └─────────┬─────────┘           └─────────▲─────────┘
              │                               │                               │
              │                               │                               │
              ▼                               ▼                               │
    ┌───────────────────┐           ┌───────────────────┐                     │
    │   Expo Local DB   │           │   Expo Local DB   │                     │
    │ (SQLite / MMKV)   │           │ (SQLite / MMKV)   │                     │
    └─────────┬─────────┘           └───────────────────┘                     │
              │                                                               │
              └────────────── WatchConnectivity Session ──────────────────────┘
```

---

## 2. Technology Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | **React Native + Expo (v51+)** | Unified code for iOS, iPadOS, Android; best-in-class vibe coding speed & ecosystem. |
| **Language** | **TypeScript** | Strict type safety for data models, API responses, and task objects. |
| **Styling / UI** | **NativeWind (Tailwind CSS)** | Rapid component styling, responsive layouts (iPhone vs. iPad tablet view), Dark mode. |
| **Local Storage** | **Expo SQLite / Async Storage** | Offline-first guarantee; instant load time without waiting on network. |
| **Backend & Auth** | **Supabase** | Free tier for development; PostgreSQL database, Realtime subscriptions, Auth. |
| **Wrist Notifications** | **Expo Notifications** | Schedules local push alerts that forward to all smartwatches (Garmin, Fitbit, etc.). |
| **Apple Watch Target** | **SwiftUI + WatchConnectivity** | Native companion target embedded in the Xcode project for watchOS series. |
| **Wear OS Target** | **Android Wear OS Module** | Native companion target in Android project for Galaxy / Pixel watches. |

---

## 3. Data Schema

### 3.1 `Task` Entity
```typescript
interface Task {
  id: string;               // UUID (v4)
  user_id: string;          // Owner user ID (for multi-device sync)
  title: string;            // Task summary / title
  notes?: string;           // Optional detailed description / subtasks
  due_date?: string;        // ISO 8601 string (e.g. 2026-11-01T15:00:00Z)
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category_id?: string;     // Reference to Category / List
  is_completed: boolean;    // Completion state
  completed_at?: string;    // ISO 8601 timestamp when checked off
  created_at: string;       // ISO 8601 creation timestamp
  updated_at: string;       // ISO 8601 modification timestamp
  is_synced: boolean;       // Local flag: has this synced to cloud?
}
```

### 3.2 `Category` Entity
```typescript
interface Category {
  id: string;
  user_id: string;
  name: string;             // e.g. "Work", "Personal", "Health"
  color: string;            // Hex color code (e.g. "#4F46E5")
  icon?: string;            // Icon name (Lucide / Ionicons)
  created_at: string;
}
```

---

## 4. Smartwatch Integration Strategy

1. **Passive Wrist Mode (Universal for all smartwatches)**:
   - When a task reaches its reminder time, a local notification fires with `categoryIdentifier: 'TASK_REMINDER'`.
   - Actions provided:
     - `ACTION_COMPLETE`: Tapping this marks the task complete immediately in the background.
     - `ACTION_SNOOZE`: Reschedules the reminder by 15 minutes.
   - Compatible with Garmin, Fitbit, Amazfit, Apple Watch, Wear OS.

2. **Active Wrist Mode (Apple Watch & Wear OS apps)**:
   - A dedicated companion app communicates with the phone app over native bridges (`WatchConnectivity` on iOS, `Wearable Data Layer` on Android).
   - Shows the top 5–10 tasks due today.
