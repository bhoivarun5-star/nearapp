# Deploying GeoConnect to Render

Follow these exact steps to host your application on Render.

## 1. Prepare your Repository
Ensure your code is pushed to your GitHub repository.

### Fixing "invalid ELF header" error
If you see this error, it means `node_modules` were pushed to Git. Run these commands locally to fix it:
```powershell
# Remove node_modules from Git tracking
git rm -r --cached node_modules
git rm -r --cached server/node_modules
git rm -r --cached client/node_modules

# Commit and push the clean state
git add .gitignore
git commit -m "Fix: Remove binaries from Git tracking"
git push origin main
```

## 2. Create a New Web Service on Render
1. Go to the [Render Dashboard](https://dashboard.render.com/).
2. Click the **New +** button in the top right.
3. Select **Web Service**.
4. Connect your GitHub account and select the `nearapp` repository.

## 3. Configure Build and Start Settings
In the "Web Service" configuration page, use these settings:

| Setting | Value |
| :--- | :--- |
| **Name** | `geoconnect` (or any name you like) |
| **Region** | `Oregon (US West)` (or closest to you) |
| **Branch** | `main` |
| **Root Directory** | *(Leave empty - use the root of the project)* |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

## 4. Add Environment Variables
This is the most important step for the app to function.

1. Scroll down to the **Environment** section.
2. Click **Add Environment Variable**.
3. Add the following:
   - **Key**: `JWT_SECRET`
   - **Value**: `any-secure-random-phrase-here` (e.g., `my_location_app_2026!`)
4. (Optional but recommended) Click **Add Environment Variable** again:
   - **Key**: `NODE_VERSION`
   - **Value**: `22.15.0`

## 5. Deploy
1. Click **Create Web Service**.
2. Render will start the build process. 
   - It will run `npm install`, which triggers the root `postinstall` script.
   - This script installs both backend and frontend dependencies and builds the React app.
3. Once the logs show `Server running on port 10000`, your app is live!

---

> [!IMPORTANT]
> **Data Persistence**: On Render's Free tier, the SQLite database (`database.sqlite`) is **ephemeral**. This means every time the server restarts or you redeploy, all users and connections will be deleted. 
> 
> To fix this for production, you would need to:
> 1. Use a **Render Blueprint** to add a "Disk" (Storage).
> 2. Or, use a managed database like **Render PostgreSQL**.
