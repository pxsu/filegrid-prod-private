# Authoritative Server Architecture

## Overview

This project implements a **real-time collaborative canvas** using Firestore as the authoritative data source. The architecture follows a client-server model where Firestore acts as the "server" managing the source of truth for all canvas state.

## Architecture Components

### 1. **AuthoritativeSync Service** (`lib/services/AuthoritativeSync.ts`)

The core synchronization layer that acts as the "authoritative server":

- **Real-time Listeners**: Listens to Firestore changes and broadcasts events to clients
- **Throttling**: Prevents excessive writes (max 10 updates/second per resource)
- **Event System**: Pub/sub pattern for distributing state changes
- **Conflict Resolution**: Last-write-wins strategy

**Key Features:**
```typescript
// Start syncing a canvas
sync.startCanvasSync(canvasId);

// Listen to events
sync.on('canvas_updated', (event) => {
  // Handle canvas updates
});

// Update with throttling
await sync.updateViewport(canvasId, { x, y, zoom });
```

### 2. **Data Services**

#### CanvasService (`lib/services/CanvasService.ts`)
- CRUD operations for canvases
- Slug generation and management
- Firebase Firestore integration

#### PlayerService (`lib/services/PlayerService.ts`)
- Player management (join/leave/cursor/selection)
- Role-based permissions
- Real-time player presence

### 3. **React Hooks**

#### useCanvas (`lib/hooks/useCanvas.ts`)
- Canvas state management
- Real-time sync enabled by default
- Viewport synchronization
- Object management (add/remove)

```typescript
const { canvas, addObject, updateViewport } = useCanvas(slug, enableRealtime);
```

#### usePlayers (`lib/hooks/usePlayers.ts`)
- Player tracking and management
- Cursor position sync
- Selection state sync
- Active player detection

```typescript
const { players, activePlayers, updateCursor } = usePlayers(canvasId, enableRealtime);
```

#### useCanvasSync (`lib/hooks/useCanvasSync.ts`)
- Bridges PixiJS Viewport with Firestore
- Throttled viewport synchronization
- Prevents feedback loops with threshold detection

### 4. **Data Models**

All models in `lib/models/` include:
- Type-safe class definitions
- Helper methods for state updates
- JSON serialization/deserialization
- Firebase Timestamp handling

**Key Models:**
- `Canvas`: Canvas state, objects, viewport
- `Player`: User presence, cursor, role, selection
- `CanvasObject`: Abstract base for drawable objects
- `Rectangle`, `Circle`, `Text`, `Image`: Concrete objects

## Data Flow

### Client → Server (Write Path)

```
User Action (e.g., pan canvas)
    ↓
PixiJS Viewport updates
    ↓
useCanvasSync detects change
    ↓
AuthoritativeSync.updateViewport() [throttled]
    ↓
Firestore writes new state
```

### Server → Client (Read Path)

```
Firestore state changes
    ↓
onSnapshot listener fires
    ↓
AuthoritativeSync emits event
    ↓
Hook subscribers receive update
    ↓
React re-renders with new state
    ↓
PixiJS viewport updates (if needed)
```

## Real-time Sync Events

| Event Type | Triggered When | Data |
|------------|---------------|------|
| `canvas_updated` | Any canvas field changes | Full canvas object |
| `object_added` | New object created | New object |
| `object_updated` | Object modified | Updated object |
| `object_removed` | Object deleted | Object ID |
| `viewport_updated` | Pan/zoom changes | Viewport state |
| `player_joined` | User joins canvas | Player object |
| `player_left` | User leaves canvas | Player object |
| `player_cursor_moved` | Cursor position changes | Player with cursor |
| `player_selection_changed` | Selection changes | Player with selection |

## Throttling & Performance

### Update Throttling
- **Viewport updates**: Max 20/second (50ms throttle)
- **Cursor updates**: Max 10/second (100ms throttle)
- **General updates**: Max 10/second (100ms throttle)

### Optimization Techniques
1. **Threshold Detection**: Only sync when changes exceed threshold
2. **Debouncing**: Aggregate rapid changes
3. **Selective Listening**: Only subscribe to needed events
4. **Local Optimistic Updates**: Update UI immediately, sync in background

## Firestore Collections

### `canvases`
```typescript
{
  id: string
  slug: string (indexed)
  title: string
  data: {
    objects: CanvasObject[]
    viewport: { x, y, zoom }
  }
  ownerId?: string (indexed)
  isPublic: boolean (indexed)
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### `players`
```typescript
{
  id: string
  canvasId: string (indexed)
  userId: string (indexed)
  role: 'owner' | 'editor' | 'viewer'
  status: 'active' | 'idle' | 'offline'
  cursorPosition?: { x, y }
  selectedObjectIds: string[]
  color: string
  invitedAt: Timestamp
  lastActiveAt: Timestamp
}
```

## Usage Example

```typescript
'use client';

import { useCanvas } from '@/lib/hooks/useCanvas';
import { usePlayers } from '@/lib/hooks/usePlayers';
import PixiCanvas from '@/app/components/Canvas';

export default function CanvasPage({ slug }: { slug: string }) {
  // Enable real-time sync (default: true)
  const { canvas, loading } = useCanvas(slug);
  const { activePlayers } = usePlayers(canvas?.id);

  if (loading) return <div>Loading...</div>;
  
  return (
    <div className="w-screen h-screen">
      {/* Canvas with real-time sync */}
      <PixiCanvas canvas={canvas} enableSync={true} />
      
      {/* Show active collaborators */}
      <div>
        {activePlayers.length} users online
      </div>
    </div>
  );
}
```

## Conflict Resolution

The system uses a **last-write-wins** strategy:
- Firestore handles concurrent writes with server timestamps
- Clients receive updates via real-time listeners
- Local state is overwritten by server state
- Threshold detection prevents unnecessary overwrites

## Scalability Considerations

### Current Design (Phase 1)
- Firestore as authoritative store
- Real-time listeners for sync
- Suitable for: 5-10 concurrent users per canvas

### Future Enhancements (Phase 2+)
- WebSocket server for lower latency
- Operational Transform (OT) or CRDT for conflict resolution
- Server-side canvas state caching
- Horizontal scaling with Redis pub/sub

## Security Rules (Recommended)

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Canvases
    match /canvases/{canvasId} {
      allow read: if resource.data.isPublic == true 
                  || request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null 
                            && resource.data.ownerId == request.auth.uid;
    }
    
    // Players
    match /players/{playerId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null 
                    && resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null 
                    && (resource.data.userId == request.auth.uid
                        || canvasOwner(resource.data.canvasId));
    }
  }
}
```

## Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Firebase**
   Create `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

## Testing Real-time Sync

1. Open canvas in multiple browser tabs/windows
2. Pan/zoom in one window
3. Observe synchronized viewport in other windows
4. Add/remove objects and see real-time updates
5. Check active users indicator

## Troubleshooting

### Sync Not Working
- Check Firebase configuration in `.env.local`
- Verify Firestore security rules allow reads/writes
- Check browser console for errors
- Ensure `enableRealtime` prop is true

### High Latency
- Check network tab for excessive Firestore writes
- Verify throttling is working (check update frequency)
- Consider implementing local caching
- Check Firestore region (use closest to users)

### Data Conflicts
- Current: Last-write-wins (acceptable for viewport)
- For critical data: Implement optimistic locking
- Consider CRDTs for object properties

## Next Steps

1. **Authentication**: Add Firebase Auth for user identification
2. **Cursor Sharing**: Render other users' cursors on canvas
3. **Presence System**: Show who's viewing what
4. **History/Undo**: Implement version control with Versions model
5. **Comments**: Add collaborative commenting system
6. **Performance**: Add WebSocket layer for <100ms latency
