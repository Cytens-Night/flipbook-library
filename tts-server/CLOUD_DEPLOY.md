# Deploy Piper TTS to Free Cloud Services

This guide helps you deploy the Piper TTS server to a free cloud platform so you can use natural-sounding voices without local installation.

## Option 1: Railway.app (Recommended - Easiest)

**Free tier: 500 hours/month**

1. **Sign up at Railway.app:**
   - Go to: https://railway.app
   - Sign in with GitHub

2. **Create New Project:**
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Connect your GitHub and select this repository

3. **Configure:**
   - Railway auto-detects the Dockerfile
   - Set port to `3001`
   - Deploy!

4. **Get your URL:**
   - Railway gives you a URL like: `https://your-app.railway.app`
   - Update `ttsService.js` baseURL to this URL

**Done!** Your TTS server is live and free.

---

## Option 2: Render.com

**Free tier: 750 hours/month**

1. **Sign up at Render.com:**
   - Go to: https://render.com
   - Sign in with GitHub

2. **Create Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Select `tts-server` folder

3. **Configure:**
   - Environment: Docker
   - Instance Type: Free
   - Click "Create Web Service"

4. **Get your URL:**
   - Render provides: `https://your-service.onrender.com`
   - Update `ttsService.js` baseURL

---

## Option 3: Fly.io

**Free tier: 3 VMs**

1. **Install Fly CLI:**
   ```bash
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```

2. **Deploy:**
   ```bash
   cd tts-server
   fly launch
   fly deploy
   ```

3. **Get URL:**
   ```bash
   fly status
   ```

---

## Option 4: Google Cloud Run

**Free tier: 2 million requests/month**

1. **Install Google Cloud SDK**

2. **Deploy:**
   ```bash
   cd tts-server
   gcloud run deploy piper-tts --source . --platform managed --region us-central1 --allow-unauthenticated
   ```

3. **Get the URL from output**

---

## Update Your App

Once deployed, update the TTS service URL:

**In `src/utils/ttsService.js`:**
```javascript
export const ttsService = {
  baseURL: 'https://your-deployed-url.com/api',  // Change this
  // ... rest of code
};
```

---

## Testing

After deployment:

1. Test health endpoint:
   ```
   https://your-url.com/api/health
   ```

2. Test TTS:
   ```bash
   curl -X POST https://your-url.com/api/tts \
     -H "Content-Type: application/json" \
     -d '{"text":"Hello world"}'
   ```

---

## Cost Breakdown

All options are **100% FREE** for your usage:

- **Railway:** 500 hours/month (plenty for personal use)
- **Render:** 750 hours/month + auto-sleep when idle
- **Fly.io:** 3 VMs free tier
- **Google Cloud Run:** 2M requests/month

Your app will use maybe 1-5 hours/month, so you're well within free limits.

---

## Recommended: Railway.app

Easiest and most reliable for beginners:
1. Push code to GitHub
2. Connect Railway to repo
3. Auto-deploys from Dockerfile
4. Get instant URL
5. Done in 5 minutes!
