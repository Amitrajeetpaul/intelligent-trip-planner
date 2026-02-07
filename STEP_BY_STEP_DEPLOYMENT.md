# Step-by-Step Deployment Guide (Dynamic Editing Mode)

Follow these 6 steps to make your website live and keep it syncable with Antigravity.

## Step 1: Create a GitHub Repository
1. Go to [github.com/new](https://github.com/new).
2. Name it `intelligent-trip-planner`.
3. Keep it **Public** (or Private if you have GitHub Pro, but Public is easier for free hosting).
4. Do **NOT** initialize with a README or .gitignore (we already have those).
5. Click **Create repository**.

## Step 2: Push Your Code to GitHub
Open your terminal in this workspace and run these commands one by one:
```bash
git init
git add .
git commit -m "Initial commit - Ready for Deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/intelligent-trip-planner.git
git push -u origin main
```
> [!IMPORTANT]  
> Replace `YOUR_USERNAME` with your actual GitHub username.

## Step 3: Create a Database (Render.com)
1. Sign up/Log in to [Render.com](https://render.com).
2. Click **New** -> **PostgreSQL**.
3. Name: `trip-planner-db`.
4. Click **Create Database**.
5. Once created, copy the **Internal Database URL**.

## Step 4: Create the Web Service (Render.com)
1. Click **New** -> **Web Service**.
2. Select **Connect a repository** and choose your `intelligent-trip-planner` repo.
3. Settings:
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/index.cjs`
4. Click **Create Web Service**.

## Step 5: Set Environment Variables
In the **Environment** tab of your Render Web Service, click **Add Environment Variable**:
- `DATABASE_URL`: (Paste the URL from Step 3)
- `AI_PROVIDER`: `gemini`
- `GEMINI_API_KEY`: `your_key_here`
- `SESSION_SECRET`: `something_random_and_long`
- `NODE_ENV`: `production`

## Step 6: The "Antigravity Sync" Workflow
Once Step 5 is done, your site will be live at a URL like `xxx.onrender.com`.

**How to edit it late:**
1. Tell me (Antigravity) to make a change locally.
2. Once the change is done, I (or you) will run:
   ```bash
   git add .
   git commit -m "Update: [Description of change]"
   git push
   ```
3. **Render will detect the push and automatically update your live site!** 🚀🌎✨🥇🏆🥇
