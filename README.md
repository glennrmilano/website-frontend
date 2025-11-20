# Vx Predict - Frontend (Next.js)

Modern React/Next.js web UI for healthcare supply chain forecasting with real-time AI streaming.

## Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create `.env.local`:

```bash
cp .env.example .env.local
```

Update `.env.local` if your backend is not running on `http://localhost:8000`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home (redirects to login)
│   ├── auth/login/page.tsx        # Login with API key
│   └── dashboard/
│       ├── page.tsx               # Dashboard home
│       └── [id]/page.tsx          # Chat conversation (Phase 5.2)
├── components/
│   ├── chat/                      # Chat components (Phase 5.2)
│   ├── artifacts/                 # Chart/artifact viewers (Phase 5.3)
│   ├── context/                   # Right panel components (Phase 5.4)
│   ├── layout/                    # Layout components (Phase 5.4)
│   └── ui/                        # Reusable UI components
├── lib/
│   ├── api/                       # API client and endpoints
│   ├── hooks/                     # Custom React hooks (Phase 5.2)
│   ├── store/                     # Zustand stores
│   ├── types/                     # TypeScript types
│   └── utils/                     # Utility functions
├── styles/
│   └── globals.css                # Global styles + Tailwind
└── public/                        # Static assets
```

## Phase 5 Implementation

### Phase 5.1: Auth System ✅
- [x] Login page with API key validation
- [x] Auth store (Zustand) with localStorage persistence
- [x] API client with automatic auth header injection
- [x] Dashboard home page with session creation
- [x] 401 error handling with automatic redirect

### Phase 5.2: Chat Interface ✅
- [x] 3-column chat layout (sidebar | chat | context panel)
- [x] ChatThread component with auto-scroll
- [x] StreamingMessage component with real-time token display
- [x] Real-time streaming with fetch-based SSE integration
- [x] Tool call indicators with status tracking
- [x] Artifact creation handlers
- [x] ChatInput with multi-line support
- [x] Message persistence to store

### Phase 5.3: Artifact Rendering ✅
- [x] ChartArtifact renderer for JSON chart data
- [x] TableArtifact renderer with formatted output
- [x] HTML artifact viewer with sanitization
- [x] Markdown code block renderer
- [x] ArtifactViewer dispatcher component
- [x] Artifact integration in ChatThread

### Phase 5.4: Context & Navigation ✅
- [x] Left sidebar with navigation menu
- [x] Recent sessions list in sidebar
- [x] Right context panel with tabbed interface
- [x] Tab system (National/Facility/Scenario)
- [x] Toggle buttons for sidebar/context panel
- [x] New session button with navigation

### Phase 5.5: Advanced Features ✅
- [x] Settings page with full layout
- [x] API key management (show/hide/copy/update)
- [x] Usage statistics dashboard
- [x] Preference toggles (theme, auto-save, notifications)
- [x] Logout functionality
- [x] API key validation on update

## Authentication

The frontend uses API key authentication:

1. User enters their API key on the login page
2. Key is validated against the backend
3. Key is stored in `localStorage` (encrypted in production)
4. Key is included in all subsequent API requests as `Authorization: Bearer sk_org_...`

## API Integration

All API calls go through the `apiClient` in `lib/api/client.ts`, which automatically:
- Adds the `Authorization` header
- Handles auth errors (401 redirects to login)
- Uses the configured backend URL

Endpoints available:
- `POST /api/sessions` - Create new session
- `POST /api/sessions/{id}/messages` - Send message
- `GET /api/sessions/{id}/messages` - Get history
- `GET /api/sessions/{id}/usage` - Get usage stats
- `GET /api/streams/{id}` - SSE stream

## Real-Time Streaming (SSE)

Example of subscribing to a message stream:

```typescript
const eventSource = new EventSource(
  `/api/streams/${streamId}`,
  {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    }
  }
);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case 'token':
      // Display token (real-time text)
      break;
    case 'tool_start':
      // Show tool is executing
      break;
    case 'artifact_created':
      // Render artifact (chart, etc)
      break;
    case 'done':
      // Stream finished
      break;
  }
};
```

## State Management

We use Zustand for lightweight state management:

- `useAuthStore` - API key and auth state
- `useChatStore` - Messages and conversation (Phase 5.2)
- `useUIStore` - UI state like sidebar toggle (Phase 5.4)

All stores persist to localStorage automatically.

## Component Architecture

### Chat Components (`app/components/chat/`)

- **ChatThread** - Main message container with auto-scroll to latest message
- **StreamingMessage** - Individual message with real-time token streaming and tool indicators
- **ChatInput** - Text input with auto-resize, Shift+Enter for newlines, and send button

### Layout Components (`app/components/layout/`)

- **Sidebar** - Left navigation with session list, new session button, and user menu
- **ContextPanel** - Right panel with tabbed context data (National/Facility/Scenario)

### Artifact Components (`app/components/artifacts/`)

- **ArtifactViewer** - Dispatcher that renders the correct artifact type
- **ChartArtifact** - Renders JSON chart data as tables (ready for Recharts)
- **TableArtifact** - Renders structured data with formatting and overflow handling

### Pages

- **`/auth/login`** - API key entry and validation
- **`/dashboard`** - Session management and creation
- **`/dashboard/[id]`** - Main chat interface with 3-column layout
- **`/settings`** - API key management, usage stats, and preferences

### Hooks

- **`useStreaming()`** - Handles SSE stream subscription and event parsing
  - Supports token streaming, tool execution, artifacts, and completion events
  - Automatically updates chat store with received data

## Building & Deployment

### Build
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Deploy to Vercel
```bash
vercel deploy
```

### Docker Deployment

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t vx-predict .
docker run -p 3000:3000 vx-predict
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |
| `NEXT_PUBLIC_APP_NAME` | App display name | `Vx Predict` |
| `NEXT_PUBLIC_BRAND_COLOR` | Primary brand color | `#3b82f6` |

## Troubleshooting

### 401 Unauthorized
- API key is invalid or expired
- Try logging in again

### Connection Error
- Make sure backend is running on the configured URL
- Check `NEXT_PUBLIC_API_URL` in `.env.local`

### CORS Issues
- Backend should have CORS enabled for the frontend URL
- In production, configure allowed origins

## Development Tips

- Use browser DevTools to inspect network requests
- Check `localStorage` to see stored API key
- Use `NEXT_PUBLIC_API_URL=http://localhost:8000` for local development

## Next Steps

See `PHASE_5_IMPLEMENTATION_PLAN.md` in the root directory for detailed implementation roadmap.

---

Built with ❤️ using Next.js, React, and TypeScript
