# TW Portfolio Apps — Netlify Deployment Guide

Five AI-powered technical writing tools, deployed securely on Netlify.
Your Anthropic API key stays server-side — it never touches the browser.

---

## Folder structure

```
your-project/
├── netlify/
│   └── functions/
│       └── claude.js          ← secure API proxy (do not edit)
├── apps/
│   ├── index.html             ← landing page linking all five apps
│   ├── api-doc-generator.html
│   ├── release-notes-writer.html
│   ├── plain-language-simplifier.html
│   ├── sop-template-builder.html
│   └── doc-linter.html
├── netlify.toml               ← Netlify config (do not edit)
├── package.json
└── README.md
```

---

## Step 1 — Set up your folder

1. Create a new folder called `your-project` on your computer
2. Copy the `netlify/` folder and `netlify.toml` and `package.json` into it
3. Create an `apps/` folder
4. Copy all five HTML files into `apps/`

---

## Step 2 — Update each HTML file (one line change each)

Open each HTML file and find this line (it appears once in each file):

```js
const res = await fetch('https://api.anthropic.com/v1/messages', {
```

Replace it with:

```js
const res = await fetch('/api/claude', {
```

Do this for all five files. That's the only code change needed.

Files to update:
- apps/api-doc-generator.html
- apps/release-notes-writer.html
- apps/plain-language-simplifier.html
- apps/sop-template-builder.html
- apps/doc-linter.html

---

## Step 3 — Create a landing page

Create `apps/index.html` with links to all five apps so interviewers
can navigate between them easily. Example:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>TW Portfolio</title>
</head>
<body>
  <h1>Technical Writer Portfolio</h1>
  <ul>
    <li><a href="api-doc-generator.html">API Documentation Generator</a></li>
    <li><a href="release-notes-writer.html">Release Notes Writer</a></li>
    <li><a href="plain-language-simplifier.html">Plain Language Simplifier</a></li>
    <li><a href="sop-template-builder.html">SOP Template Builder</a></li>
    <li><a href="doc-linter.html">Doc Linter & Style Checker</a></li>
  </ul>
</body>
</html>
```

---

## Step 4 — Push to GitHub

1. Go to github.com and create a new repository
   Name it something like `tw-portfolio-apps`
   Set it to Public

2. In your project folder, run:

```bash
git init
git add .
git commit -m "Initial commit — TW portfolio apps"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/tw-portfolio-apps.git
git push -u origin main
```

---

## Step 5 — Deploy on Netlify

1. Go to app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select your repository
4. Build settings (Netlify auto-detects from netlify.toml):
   - Build command: leave blank
   - Publish directory: apps
5. Click "Deploy site"

Your site will be live in about 60 seconds at a URL like:
https://random-name-123.netlify.app

---

## Step 6 — Add your API key (most important step)

1. In the Netlify dashboard, go to:
   Site → Site configuration → Environment variables

2. Click "Add a variable"
   Key:   ANTHROPIC_API_KEY
   Value: sk-ant-YOUR-KEY-HERE

3. Click Save

4. Go to Deploys → Trigger deploy → Deploy site

Your API key is now stored securely on Netlify's servers.
It is never sent to the browser or visible in your HTML files.

---

## Step 7 — Set your custom domain (optional)

In Netlify: Site → Domain management → Add custom domain
E.g. portfolio.yourname.com

Netlify provides free HTTPS automatically.

---

## Testing locally before deploying

Install the Netlify CLI to test the proxy function on your machine:

```bash
npm install
```

Create a file called `.env` in your project root:
```
ANTHROPIC_API_KEY=sk-ant-YOUR-KEY-HERE
```

Then run:
```bash
npx netlify dev
```

Open http://localhost:8888 — all five apps will work exactly as
they will on Netlify, with the API key loaded from .env.

IMPORTANT: Add .env to your .gitignore file so it is never committed:
```
echo ".env" >> .gitignore
```

---

## Security summary

| Where | API key visible? |
|-------|-----------------|
| HTML files | No |
| Browser DevTools | No |
| GitHub repository | No |
| Netlify dashboard | Yes (only you) |
| Netlify function (server) | Yes (only server) |

---

## Costs

Netlify free tier includes:
- 125,000 function invocations per month
- 100 GB bandwidth
- Unlimited sites

Anthropic API costs (approximate per analysis):
- API Doc Generator:        ~$0.003 per generation
- Release Notes Writer:     ~$0.002 per generation
- Plain Language Simplifier:~$0.003 per simplification
- SOP Template Builder:     ~$0.004 per SOP
- Doc Linter:               ~$0.002 per lint run

For a portfolio with occasional demo traffic, expect under $2/month total.

---

## Troubleshooting

**"Function not found" error**
Make sure netlify.toml is in your project root (not inside apps/).

**"Invalid API key" error**
Double-check your ANTHROPIC_API_KEY in Netlify environment variables.
Redeploy after adding the variable.

**App works locally but not on Netlify**
Check the Netlify function logs:
Site → Functions → claude → View logs

**CORS error in browser console**
In netlify/functions/claude.js, change the Access-Control-Allow-Origin
header from '*' to your exact Netlify URL:
'https://your-site-name.netlify.app'

---

## Share your portfolio

Once deployed, your portfolio URL works as:
- A link in your CV / resume
- A link in your LinkedIn profile
- A live demo you open on your laptop in interviews
- A QR code on a printed portfolio sheet

Good luck with your interviews!
