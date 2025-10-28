# GitHub Upload Guide

## Step-by-Step Guide to Upload Your Project to GitHub

### Prerequisites
- Git installed on your computer
- GitHub account created
- Your project files ready

### Method 1: Using GitHub Desktop (Easiest)

1. **Download GitHub Desktop**
   - Go to https://desktop.github.com/
   - Download and install GitHub Desktop

2. **Create Repository on GitHub**
   - Go to https://github.com
   - Click the "+" button in top right corner
   - Select "New repository"
   - Name: `aurexis-solution-it-website`
   - Description: `Aurexis Solution IT Website with Customer Dashboard and Admin Panel`
   - Choose Public or Private
   - **Don't** initialize with README, .gitignore, or license (since you already have files)
   - Click "Create repository"

3. **Clone Repository Locally**
   - Copy the repository URL from GitHub
   - Open GitHub Desktop
   - Click "Clone a repository from the Internet"
   - Paste the URL and choose local path
   - Click "Clone"

4. **Copy Your Project Files**
   - Copy all your project files into the cloned folder
   - Replace any existing files if prompted

5. **Commit and Push**
   - GitHub Desktop will show all your files as "Changes"
   - Add commit message: "Initial commit - Aurexis website with dashboard"
   - Click "Commit to main"
   - Click "Push origin" to upload to GitHub

### Method 2: Using Command Line (Advanced)

1. **Initialize Git Repository**
   ```bash
   cd D:\aurexis-solution-it-website
   git init
   ```

2. **Create .gitignore File**
   Create a file named `.gitignore` in your project root with this content:
   ```
   # Dependencies
   node_modules/
   npm-debug.log*
   yarn-debug.log*
   yarn-error.log*

   # Production builds
   dist/
   build/

   # Environment variables
   .env
   .env.local
   .env.development.local
   .env.test.local
   .env.production.local

   # IDE files
   .vscode/
   .idea/
   *.swp
   *.swo

   # OS files
   .DS_Store
   Thumbs.db

   # Logs
   logs
   *.log

   # Firebase
   .firebase/
   firebase-debug.log
   ```

3. **Add Files to Git**
   ```bash
   git add .
   git commit -m "Initial commit - Aurexis website with dashboard"
   ```

4. **Create Repository on GitHub**
   - Go to https://github.com
   - Click "+" → "New repository"
   - Name: `aurexis-solution-it-website`
   - Don't initialize with README
   - Click "Create repository"

5. **Connect to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/aurexis-solution-it-website.git
   git branch -M main
   git push -u origin main
   ```

### Method 3: Using VS Code (If you use VS Code)

1. **Install Git Extension**
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Search for "Git" and install

2. **Initialize Repository**
   - Open your project folder in VS Code
   - Press Ctrl+Shift+P
   - Type "Git: Initialize Repository"
   - Press Enter

3. **Create .gitignore**
   - Right-click in file explorer
   - New File → `.gitignore`
   - Add the content from Method 2

4. **Stage and Commit**
   - Go to Source Control tab (Ctrl+Shift+G)
   - Click "+" next to files to stage them
   - Add commit message
   - Click "Commit"

5. **Push to GitHub**
   - Click "Publish to GitHub"
   - Choose repository name
   - Select Public/Private
   - Click "Publish"

### Important Files to Include

Make sure these files are in your project:
- `package.json` - Dependencies
- `README.md` - Project description
- `tsconfig.json` - TypeScript config
- `vite.config.ts` - Build config
- All your source code files
- `.gitignore` - Files to ignore

### Files to Exclude (Add to .gitignore)

- `node_modules/` - Dependencies (will be reinstalled)
- `.env.local` - Environment variables (sensitive data)
- `dist/` - Build output
- `.firebase/` - Firebase cache

### After Uploading

1. **Update README.md**
   Add this content to your README.md:
   ```markdown
   # Aurexis Solution IT Website

   A modern React website with customer dashboard and admin panel.

   ## Features
   - Customer Dashboard with project tracking
   - Admin Panel for content management
   - Live Chat Support
   - Real-time notifications
   - Mobile responsive design

   ## Tech Stack
   - React + TypeScript
   - Vite
   - Tailwind CSS
   - Firebase (Authentication & Firestore)
   - Lucide React Icons

   ## Setup
   1. Clone the repository
   2. Install dependencies: `npm install`
   3. Configure Firebase (see FIREBASE_SETUP.md)
   4. Run development server: `npm run dev`

   ## Deployment
   See NETLIFY_DEPLOYMENT_GUIDE.md for deployment instructions.
   ```

2. **Add Topics/Tags**
   - Go to your repository on GitHub
   - Click the gear icon next to "About"
   - Add topics: `react`, `typescript`, `firebase`, `dashboard`, `admin-panel`

3. **Enable GitHub Pages** (Optional)
   - Go to Settings → Pages
   - Source: Deploy from a branch
   - Branch: main
   - Folder: / (root)

### Troubleshooting

**If you get authentication errors:**
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

**If files are too large:**
- Check .gitignore includes `node_modules/`
- Use Git LFS for large files

**If you need to update later:**
```bash
git add .
git commit -m "Update: Added new features"
git push
```

### Security Notes

- Never commit `.env.local` files
- Don't commit API keys or passwords
- Use environment variables for sensitive data
- Make sure `.gitignore` is properly configured

Your project will be available at: `https://github.com/YOUR_USERNAME/aurexis-solution-it-website`
