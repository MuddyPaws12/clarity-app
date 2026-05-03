# Clarity App - Personal Productivity

A simple, Basecamp-inspired productivity app for Android built with Expo and React Native.

## Philosophy

Clarity is about organization without bloat. It's designed around a clear hierarchy:

**Projects → Lists → Tasks**

That's it. No tags, no priorities, no unnecessary features. Just structure, clarity, and focus.

## Features

✅ Create and manage projects  
✅ Organize tasks into multiple lists per project  
✅ Add, complete, and delete tasks  
✅ Color-coded projects  
✅ Export/Import data as JSON  
✅ Fully local-first (no cloud, no accounts)  
✅ Privacy-respecting (no tracking, no ads)  
✅ Responsive design (phones & tablets)  

## Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`

### Installation

```bash
# Install dependencies
npm install

# Start the dev server
npm start
```

### Running on Android

```bash
# Option 1: With Android emulator
npm run android

# Option 2: With Expo Go app
# Scan the QR code with Expo Go app
npm start

# Option 3: Build a standalone APK
npm run build:android
```

## Project Structure

```
src/
├── types/
│   └── models.ts          # Data models
├── db/
│   └── database.ts        # SQLite operations
├── context/
│   └── AppContext.tsx     # Global state
├── screens/
│   ├── ProjectsScreen.tsx
│   └── ProjectDetailScreen.tsx
├── components/
│   ├── ProjectCard.tsx
│   ├── TaskItem.tsx
│   ├── AddTaskInput.tsx
│   ├── ColorPicker.tsx
│   └── ListDragDrop.tsx
└── utils/
    ├── theme.ts           # Colors and fonts
    └── responsive.ts      # Responsive utilities
```

## Data Model

### Project
```typescript
{
  id: string;           // UUID
  name: string;         // "Work", "Personal", etc.
  color: string;        // Hex color
  createdAt: number;    // Timestamp
  order: number;        // Display order
}
```

### List
```typescript
{
  id: string;           // UUID
  projectId: string;    // Parent project
  name: string;         // "Today", "Backlog", etc.
  order: number;        // Display order
}
```

### Task
```typescript
{
  id: string;           // UUID
  listId: string;       // Parent list
  projectId: string;    // Project reference
  title: string;        // Task description
  completed: boolean;   // Done?
  createdAt: number;    // Timestamp
  completedAt: number | null;  // When completed
  order: number;        // Display order
}
```

## Database

Clarity uses **SQLite** via `expo-sqlite` for local storage. All data is stored on-device with no cloud sync.

### Benefits
- ✅ Zero setup or configuration
- ✅ No internet required
- ✅ Complete privacy
- ✅ Fast local queries
- ✅ Easy backups (export as JSON)

## Export & Import

You can export your data as a JSON backup and import it anytime:

1. **Export**: Main menu (⋮) → Export Data
2. **Import**: Main menu (⋮) → Import Data → Select file

Backups are stored as timestamped JSON files.

## Design Principles

### What We Include
- ✅ Clear hierarchy (Projects → Lists → Tasks)
- ✅ Visual distinction (colors, spacing)
- ✅ Frictionless task entry
- ✅ Completed task segregation
- ✅ Data portability (export/import)
- ✅ Responsive design (all device sizes)

### What We Don't Include
- ❌ Tags (structure replaces this)
- ❌ Priorities (lists handle organization)
- ❌ Due dates (keep it simple)
- ❌ Recurring tasks (manual recreation is fine)
- ❌ Notifications (stay calm)
- ❌ Gamification (focus on the work)
- ❌ Team collaboration (personal tool)
- ❌ Cloud sync (local first)

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **UI Framework** | React Native | Write once, run on Android/iOS |
| **Mobile Runtime** | Expo | Simplest development, no native code |
| **Database** | SQLite | Local, fast, zero setup |
| **State Management** | React Context | Minimal boilerplate |
| **Navigation** | React Navigation | Industry standard |
| **Styling** | React Native StyleSheet | No CSS complexity |
| **Language** | TypeScript | Type safety |

## Performance

- App size: ~50MB (Expo + dependencies)
- Database: Optimized indexes on foreign keys
- Rendering: FlatList virtualization for large lists
- Storage: ~1-5MB per year of typical use

## Troubleshooting

### App won't start
```bash
rm -rf node_modules
npm install
npm start
```

### Database issues
To reset: uninstall and reinstall the app

### Import fails
- Make sure the JSON file is valid
- Check format: `{ "projects": [...], "lists": {...}, "tasks": {...} }`

## License

MIT - Use freely, modify as you wish.

---

**Made with ❤️ for people who value clarity over features.**
