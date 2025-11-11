# ZUS Drinkware Chatbot - Frontend

## 🚀 Quick Setup

### Option 1: Vercel Deployment (Production)

**Prerequisites:**
- Vercel account ([vercel.com](https://vercel.com))
- GitHub repository connected to Vercel

**Steps:**

1. **Import to Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your GitHub repository
   - Choose "frontend" folder as root directory

2. **Configure build settings:**
   
   Vercel auto-detects Vite configuration from `vercel.json`:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite"
   }
   ```

3. **Set environment variables:**
   
   In Vercel dashboard → Settings → Environment Variables:
   ```env
   VITE_API_URL=https://your-backend.up.railway.app or http://localhost:8000
   ```

4. **Deploy:**
   - Click "Deploy"
   - Vercel builds and deploys automatically
   - Get your URL: `https://your-app.vercel.app`

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
   VITE_API_URL=https://your-backend.up.railway.app or http://localhost:8000
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   ```
   http://localhost:3000
   ```

**Development Commands:**

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (hot reload) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## 📂 Project Structure

```
frontend/            
│
├── public/                       # Static assets
│   ├── hide_thinking.png         # Hide thinking icon
│   └── show_thinking.png         # Show thinking icon
│
├── src/         
│   │
│   ├── services/
│   │   ├── ApiService.js         # Backend API wrapper 
│   │   ├── CommandHandler.js     # Local command processor 
│   │   └── StorageService.js     # Local Session storage
│   │
│   ├── styles/
│   │   └── ChatContainer.css     # Chat UI styles 
│   │
│   ├── App.vue                   # Root Vue component 
│   │
│   └── main.js                   # Vue app initialization and mounting
│
├── index.html                    # HTML entry point 
├── package-lock.json             # Locked dependency versions
├── package.json                  # NPM dependencies and scripts
├── vercel.json                   # Vercel deployment configuration
└── vite.config.js                # Vite build tool configuration

```
---