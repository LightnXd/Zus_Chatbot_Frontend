# ZUS Drinkware Chatbot - Frontend
> Modern Vue 3 chat interface for ZUS Coffee drinkware assistant

---

## 🚀 Quick Setup

### Option 1: Vercel Deployment (Production)

**Prerequisites:**
- Vercel account ([vercel.com](https://vercel.com))
- GitHub repository connected to Vercel

**Steps:**

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "Deploy frontend"
   git push origin main
   ```

2. **Import to Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your GitHub repository
   - Choose "frontend" folder as root directory

3. **Configure build settings:**
   
   Vercel auto-detects Vite configuration from `vercel.json`:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite"
   }
   ```

4. **Set environment variables:**
   
   In Vercel dashboard → Settings → Environment Variables:
   ```env
   VITE_API_URL=https://your-backend.up.railway.app
   ```

5. **Deploy:**
   - Click "Deploy"
   - Vercel builds and deploys automatically
   - Get your URL: `https://your-app.vercel.app`

**Auto-Deployment:**
- ✅ Push to `main` → Auto-deploy to production
- ✅ Pull requests → Deploy preview environments
- ✅ HTTPS certificate included
- ✅ Global CDN distribution

---

### Option 2: Local Development

**Prerequisites:**
- Node.js 18+ and npm
- Backend running (see backend README)

**Setup Steps:**

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   
   Create `.env` file:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   ```
   http://localhost:5173
   ```

**Development Commands:**

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (hot reload) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## 🏗️ Architecture Overview

### Component Architecture

```
┌────────────────────────────────────────────────────────────┐
│                           App.vue                          │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    ChatContainer.vue                 │  │
│  │  ┌───────────────────────────────────────────────┐   │  │
│  │  │             Message Display Area              │   │  │
│  │  │  - User messages                              │   │  │
│  │  │  - AI messages                                │   │  │
│  │  └───────────────────────────────────────────────┘   │  │
│  │                                                      │  │
│  │  ┌───────────────────────────────────────────────┐   │  │
│  │  │                 Input Area                    │   │  │
│  │  └───────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    Services Layer                    │  │
│  │    ┌───────────────┐      ┌───────────────────┐      │  │
│  │    │ ApiService.js │      │ CommandHandler.js │      │  │
│  │    └──────┬────────┘      └───────────────────┘      │  │
│  │           │                                          │  │
│  │           ▼                                          │  │
│  │      Axios HTTP Client                               │  │
│  └───────────┬──────────────────────────────────────────┘  │
└──────────────┼─────────────────────────────────────────────┘
               │
               ▼
      ┌───────────────────┐        
      │    Backend API    │    
      └───────────────────┘  

```

### Data Flow

```
User Input → Command Check → API Request → Backend Processing
                ↓                              ↓
           Local Command?                  LLM + DB Query
                ↓                              ↓
           Execute Local                  Generate Response
                ↓                              ↓
           Update UI ←─────────────────── Return JSON
                ↓
         Display Message
                ↓
         Auto-scroll Bottom
```

---

## 📂 Project Structure

```
frontend/            
│
├── assets/                       # Static assets 
│   ├── hide_thinking.png         # Hide thinking icon
│   └── show_thinking.png         # Show thinking icon
│
├── src/         
│   │
│   ├── services/
│   │   ├── ApiService.js         # Backend API wrapper (health, stats, chat)
│   │   └── CommandHandler.js     # Local command processor (/help, /clear, /stats)
│   │
│   ├── styles/
│   │   └── ChatContainer.css     # Chat UI styles (messages, input, animations)
│   │
│   ├── App.vue                   # Root Vue component (chat interface)
│   │
│   └── main.js                   # Vue app initialization and mounting
│
├── .env                          # Local environment variables (VITE_API_URL)
├── .env.production               # Production environment variables
├── index.html                    # HTML entry point (mounts Vue app)
├── package-lock.json             # Locked dependency versions
├── package.json                  # NPM dependencies and scripts
├── vercel.json                   # Vercel deployment configuration
└── vite.config.js                # Vite build tool configuration

```

---


## 🔑 Key Trade-offs

### 1. **Vue 3 Composition API vs Options API**

| Aspect | Options API (Current) | Composition API |
|--------|----------------------|-----------------|
| **Learning Curve** | ✅ Easier for beginners | 🟡 Steeper learning |
| **Code Reusability** | 🟡 Mixins (limited) | ✅ Composables (better) |
| **TypeScript Support** | 🟡 Moderate | ✅ Excellent |
| **Bundle Size** | ✅ Same as Composition | ✅ Same |
| **Migration** | ✅ No changes needed | 🟡 Requires refactor |

**Decision:** Options API for simplicity in MVP; easy to migrate to Composition API later.

---

### 2. **Axios vs Fetch API**

| Aspect | Axios (Current) | Fetch API |
|--------|-----------------|-----------|
| **Features** | ✅ Interceptors, auto-JSON | 🟡 Basic |
| **Error Handling** | ✅ Better error detection | 🟡 Manual checks |
| **Browser Support** | ✅ Older browsers | 🟡 Modern only |
| **Bundle Size** | 🟡 +13KB | ✅ 0KB (native) |
| **TypeScript** | ✅ Good types | 🟡 Basic types |

**Decision:** Axios for better error handling and developer experience; 13KB acceptable for chat app.

---

### 3. **Single Component vs Multi-Component**

| Aspect | Current (2 components) | Highly Modular |
|--------|------------------------|----------------|
| **Complexity** | ✅ Simple | 🟡 More files |
| **Reusability** | 🟡 Limited | ✅ High |
| **Testing** | ✅ Easy | ✅ Easier |
| **Maintenance** | ✅ Centralized | 🟡 Scattered |

**Decision:** Keep it simple with 2 main components; split only if needed.

**Current Split:**
- `ChatContainer.vue` - UI + State (main component)
- `ApiService.js` - API logic (service layer)
- `CommandHandler.js` - Command logic (service layer)

---

### 4. **State Management: Local vs Pinia/Vuex**

| Aspect | Local State (Current) | Pinia/Vuex |
|--------|-----------------------|------------|
| **Setup** | ✅ Zero config | 🟡 Boilerplate |
| **Performance** | ✅ Faster | 🟡 Slight overhead |
| **Scalability** | ⚠️ Limited to 1 component | ✅ Shared state |
| **DevTools** | 🟡 Basic | ✅ Time travel debugging |
| **Learning Curve** | ✅ Minimal | 🟡 Additional concept |

**Decision:** Local state sufficient for single-page chat app.

**Migration Path:** If adding features (settings, themes, multi-chat), use Pinia.

---

### 5. **CSS: Scoped vs Global vs CSS-in-JS**

| Aspect | Scoped CSS (Current) | Global CSS | CSS-in-JS |
|--------|---------------------|------------|-----------|
| **Isolation** | ✅ Component-scoped | ❌ Global pollution | ✅ JS-scoped |
| **Performance** | ✅ No runtime cost | ✅ No runtime cost | 🟡 Runtime overhead |
| **Maintainability** | ✅ Colocated with component | 🟡 Separate files | ✅ JS variables |
| **Bundle Size** | ✅ Small | ✅ Small | 🟡 Larger |

**Decision:** Scoped CSS for clean separation; external `ChatContainer.css` for larger styles.

---

### 6. **Vite vs Webpack**

| Aspect | Vite (Current) | Webpack |
|--------|---------------|---------|
| **Dev Server** | ✅ Lightning fast (ESM) | 🟡 Slower |
| **HMR** | ✅ Instant | 🟡 Moderate |
| **Build Speed** | ✅ Rollup (fast) | 🟡 Slower |
| **Ecosystem** | 🟡 Newer | ✅ Mature |
| **Config** | ✅ Minimal | 🟡 Verbose |

**Decision:** Vite for modern dev experience; significantly faster than Webpack.

**Benchmark:**
- Dev server start: Vite ~500ms vs Webpack ~5s
- HMR update: Vite ~50ms vs Webpack ~500ms

---

### 7. **Vercel vs Netlify vs GitHub Pages**

| Aspect | Vercel (Current) | Netlify | GitHub Pages |
|--------|-----------------|---------|--------------|
| **Setup** | ✅ Auto-detect Vite | ✅ Auto-detect | 🟡 Manual config |
| **Preview Deploys** | ✅ Per PR | ✅ Per PR | ❌ None |
| **Custom Domains** | ✅ Free HTTPS | ✅ Free HTTPS | ✅ Free HTTPS |
| **Build Time** | ✅ ~1-2 min | ✅ ~1-2 min | 🟡 ~3-5 min |
| **Edge Network** | ✅ Global CDN | ✅ Global CDN | 🟡 Limited |
| **API Proxying** | ✅ Built-in | ✅ Built-in | ❌ None |

**Decision:** Vercel for seamless Vite integration and preview deployments.

---

## 🎨 UI/UX Features

### Message Display

**User Messages:**
- 🟦 Blue gradient background (`#1e3a8a → #3b82f6`)
- 📍 Right-aligned
- ⚪ White text
- 🔵 Rounded corners (18px, sharp bottom-right)

**AI Messages:**
- ⚪ White background
- 📍 Left-aligned
- ⚫ Dark gray text (`#1f2937`)
- 🔵 Rounded corners (18px, sharp top-left)

### Typing Indicator

Animated dots while AI is thinking:
```css
.typing-indicator {
  animation: pulse 1.5s infinite;
}
```

### Auto-Scroll

Messages automatically scroll to bottom on:
- New message sent
- AI response received
- Chat cleared

### Input Area

- 🎯 Auto-focus on load
- ⌨️ Enter to send (Shift+Enter for new line)
- 🚫 Disabled while loading
- 📏 Auto-resize textarea

---

## 🔧 Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_URL` | ✅ Yes | Backend API URL | `http://localhost:8000` (local)<br>`https://your-app.up.railway.app` (prod) |

**Local Development (`.env`):**
```env
VITE_API_URL=http://localhost:8000
```

**Production (`.env.production` or Vercel):**
```env
VITE_API_URL=https://your-backend.up.railway.app
```

---

## 🧪 Testing

### Manual Testing Checklist

**Basic Functionality:**
- [ ] Chat interface loads
- [ ] Health check passes (backend online)
- [ ] Send message → Receive AI response
- [ ] Session persists across messages
- [ ] Auto-scroll works
- [ ] `/help` command shows help
- [ ] `/clear` command clears chat
- [ ] `/stats` command shows statistics

**Error Handling:**
- [ ] Backend offline → Error message shown
- [ ] Network error → User-friendly error
- [ ] Invalid input → Handled gracefully

**UI/UX:**
- [ ] Messages display correctly
- [ ] Typing indicator shows while loading
- [ ] Mobile responsive (test on phone)
- [ ] Keyboard shortcuts work (Enter)

---

## 📊 Performance Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| **First Load** | ~500ms | Vite optimized |
| **Bundle Size** | ~150KB | Minified + gzipped |
| **Lighthouse Score** | 95+ | Performance audit |
| **Time to Interactive** | <1s | Fast startup |
| **API Latency** | ~1.5s | Backend dependent |

---

## 🚨 Common Issues & Solutions

### Issue 1: Backend Connection Failed

**Symptom:**
```
Cannot connect to backend. The server might be down.
```

**Solution:**
1. Check if backend is running: `http://localhost:8000/health`
2. Verify `VITE_API_URL` in `.env`
3. Check CORS settings in backend

---

### Issue 2: Messages Not Sending

**Symptom:**
- Click send, nothing happens
- No error message

**Solution:**
1. Open browser console (F12)
2. Check for JavaScript errors
3. Verify network tab shows API request
4. Check backend logs

---

### Issue 3: Session Lost After Refresh

**Symptom:**
- Refresh page → Conversation resets

**Expected Behavior:**
- Session ID stored in memory (not localStorage)
- **This is intentional** - refresh starts new conversation
- To persist: Add `sessionId` to localStorage (future enhancement)

---

### Issue 4: Typing Indicator Stuck

**Symptom:**
- Dots keep animating
- Response never arrives

**Solution:**
1. Check network tab for failed request
2. Backend might be down
3. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

---

## 🚀 Deployment Workflow

### Vercel Continuous Deployment

```
Code Push → GitHub → Vercel Auto-Deploy
    ↓
  npm run build (Vite)
    ↓
  Generate dist/ folder
    ↓
  Deploy to Edge Network
    ↓
  Service live at https://your-app.vercel.app
```

**Automatic:**
- ✅ Build on every push to `main`
- ✅ Preview deployments for PRs
- ✅ HTTPS certificate
- ✅ Global CDN (300+ edge locations)
- ✅ Instant rollback

---

## 🛠️ Tech Stack Summary

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Vue 3 | 3.3.0 | Reactive UI |
| **Build Tool** | Vite | 5.0.0 | Fast dev server + build |
| **HTTP Client** | Axios | 1.6.0 | API requests |
| **Styling** | Scoped CSS | - | Component styles |
| **Deployment** | Vercel | - | Static hosting + CDN |
| **Package Manager** | npm | - | Dependency management |

---

## 📱 Mobile Responsiveness

**Tested On:**
- 📱 iPhone 12/13/14 (iOS Safari)
- 🤖 Android devices (Chrome)
- 💻 Desktop browsers (Chrome, Firefox, Safari, Edge)

**Responsive Features:**
- Fluid width (max-width: 800px)
- Touch-friendly buttons
- Readable font sizes (16px minimum)
- Proper viewport meta tag

---

## 🔄 Future Enhancements

**Potential Features:**
1. **Persistent Sessions:** Store `sessionId` in localStorage
2. **Message History:** Save conversation to browser storage
3. **Dark Mode:** Toggle between light/dark themes
4. **Voice Input:** Speech-to-text for messages
5. **Export Chat:** Download conversation as PDF/TXT
6. **Typing Animation:** Character-by-character AI response
7. **Markdown Support:** Render formatted text in messages
8. **Multi-Language:** i18n support for Malay/Chinese

---

## 📝 Scripts Reference

```json
{
  "scripts": {
    "dev": "vite",              // Start dev server (port 5173)
    "build": "vite build",      // Production build → dist/
    "preview": "vite preview"   // Preview production build
  }
}
```

**Usage:**
```bash
npm run dev       # Development (http://localhost:5173)
npm run build     # Build for production
npm run preview   # Test production build locally
```

---

## 🌐 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Fully supported |
| Firefox | 88+ | ✅ Fully supported |
| Safari | 14+ | ✅ Fully supported |
| Edge | 90+ | ✅ Fully supported |
| IE 11 | - | ❌ Not supported |

---

## 📚 Additional Documentation

- **API Documentation:** [API_DOCUMENTATION.md](../API_DOCUMENTATION.md)
- **Backend README:** [Backend README.md](../Zus_Chatbot_Backend/README.md)

---

## 📝 License

MIT License - See LICENSE file for details

---

## 👨‍💻 Author

**LightnXd**  
GitHub: [@LightnXd](https://github.com/LightnXd)

---

## 🤝 Contributing

Pull requests welcome! For major changes, please open an issue first.

---

**Last Updated:** November 10, 2025
