# Netlify Deployment Guide for Aurexis Solution IT Website

This guide will walk you through deploying your React + Vite website to Netlify without making any changes to your codebase.

## Prerequisites

- Node.js installed on your system
- A Netlify account (free)
- Your project code ready

## Method 1: Manual Deployment (Quick & Easy)

### Step 1: Prepare Your Project

1. **Open your terminal/command prompt**
2. **Navigate to your project directory:**
   ```bash
   cd D:\aurexis-solution-it-website
   ```

3. **Install dependencies (if not already done):**
   ```bash
   npm install
   ```

4. **Build your project for production:**
   ```bash
   npm run build
   ```
   - This creates a `dist` folder with optimized production files
   - If successful, you'll see a message like "✓ built in X.XXs"

5. **Verify the build (optional):**
   ```bash
   npm run preview
   ```
   - This starts a local preview server
   - Open the URL shown (usually `http://localhost:4173`)
   - Test your website to ensure everything works
   - Press `Ctrl+C` to stop the preview server

### Step 2: Deploy to Netlify

1. **Go to [netlify.com](https://netlify.com)**
2. **Sign up or log in** to your account
3. **Click "Add new site"** in the top right corner
4. **Select "Deploy manually"**
5. **Drag and drop your `dist` folder** into the deploy area
   - The `dist` folder should be in your project root directory
   - You can also click "Browse to upload" and select the `dist` folder
6. **Wait for deployment** (usually takes 1-2 minutes)
7. **Your site is live!** You'll get a URL like `https://amazing-name-123456.netlify.app`

### Step 3: Configure Environment Variables (If Needed)

If your website uses the `GEMINI_API_KEY` environment variable:

1. **Go to your site dashboard** on Netlify
2. **Click "Site settings"** in the top navigation
3. **Go to "Environment variables"** in the left sidebar
4. **Click "Add variable"**
5. **Add:**
   - Key: `GEMINI_API_KEY`
   - Value: Your actual API key
6. **Click "Save"**
7. **Redeploy your site** by going to "Deploys" and clicking "Trigger deploy"

## Method 2: Git-based Deployment (For Continuous Updates)

### Step 1: Push to GitHub

1. **Create a new repository on GitHub:**
   - Go to [github.com](https://github.com)
   - Click "New repository"
   - Name it (e.g., "aurexis-solution-it-website")
   - Make it public or private
   - Don't initialize with README (since you already have files)

2. **Initialize Git in your project:**
   ```bash
   cd D:\aurexis-solution-it-website
   git init
   ```

3. **Add all files:**
   ```bash
   git add .
   ```

4. **Make your first commit:**
   ```bash
   git commit -m "Initial commit"
   ```

5. **Set the main branch:**
   ```bash
   git branch -M main
   ```

6. **Connect to GitHub:**
   ```bash
   git remote add origin https://github.com/yourusername/your-repo-name.git
   ```
   (Replace `yourusername` and `your-repo-name` with your actual GitHub username and repository name)

7. **Push to GitHub:**
   ```bash
   git push -u origin main
   ```

### Step 2: Connect to Netlify

1. **Go to [netlify.com](https://netlify.com)**
2. **Click "Add new site"** → **"Import an existing project"**
3. **Click "Deploy with GitHub"**
4. **Authorize Netlify** to access your GitHub account
5. **Select your repository** from the list
6. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Click "Deploy site"

### Step 3: Set Up Environment Variables

1. **In your Netlify site dashboard, go to "Site settings"**
2. **Click "Environment variables"**
3. **Add your environment variables:**
   - Key: `GEMINI_API_KEY`
   - Value: Your actual API key
4. **Click "Save"**

### Step 4: Automatic Deployments

- Every time you push changes to your main branch on GitHub, Netlify will automatically rebuild and redeploy your site
- You can see deployment status in the "Deploys" tab

## Custom Domain Setup (Optional)

### Step 1: Add Custom Domain

1. **Go to your site dashboard on Netlify**
2. **Click "Domain settings"**
3. **Click "Add custom domain"**
4. **Enter your domain name** (e.g., `yourdomain.com`)
5. **Follow Netlify's DNS instructions**

### Step 2: Configure DNS

1. **Go to your domain registrar** (where you bought your domain)
2. **Update DNS records** as instructed by Netlify
3. **Wait for DNS propagation** (can take up to 24 hours)

## Troubleshooting

### Common Issues:

1. **Build fails:**
   - Check that all dependencies are installed: `npm install`
   - Ensure your code has no TypeScript errors
   - Check the build logs in Netlify dashboard

2. **Site shows blank page:**
   - Verify the publish directory is set to `dist`
   - Check browser console for errors
   - Ensure all file paths are correct

3. **Environment variables not working:**
   - Make sure variable names match exactly
   - Redeploy after adding environment variables
   - Check that variables are available in your build process

### Useful Commands:

```bash
# Check if build works locally
npm run build

# Preview the built site
npm run preview

# Check for TypeScript errors
npx tsc --noEmit

# Install dependencies
npm install
```

## Deployment Checklist

- [ ] Project builds successfully (`npm run build`)
- [ ] All dependencies are installed
- [ ] Environment variables are configured (if needed)
- [ ] Site is accessible via Netlify URL
- [ ] All pages and features work correctly
- [ ] Custom domain is set up (if desired)

## Next Steps

After successful deployment:

1. **Test all functionality** on the live site
2. **Set up a custom domain** if desired
3. **Configure automatic deployments** for future updates
4. **Monitor site performance** in Netlify dashboard
5. **Set up form handling** if you have contact forms (Netlify Forms)

## Support

- **Netlify Documentation:** [docs.netlify.com](https://docs.netlify.com)
- **Vite Documentation:** [vitejs.dev](https://vitejs.dev)
- **React Documentation:** [react.dev](https://react.dev)

---

**Your website is now live on Netlify! 🎉**
