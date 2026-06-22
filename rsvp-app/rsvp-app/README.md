# RSVP App

A private event RSVP system with unique per-guest links.

## How it works
- Host visits the site directly → asked for password → manages guest list
- Each guest gets a unique link (e.g. `https://yoursite.vercel.app/?id=abc123`)
- Guest taps link → sees their personal RSVP form → confirms attendance + seats
- Host dashboard updates in real time

## Deploy to Vercel (5 minutes)

### 1. Push to GitHub
1. Go to github.com → New repository → name it `rsvp-app` → Create
2. Upload the two files: `public/index.html` and `vercel.json`

### 2. Deploy on Vercel
1. Go to vercel.com → Sign up with GitHub
2. Click "Add New Project" → Import your `rsvp-app` repo
3. Leave all settings as default → click "Deploy"
4. Done — Vercel gives you a live URL like `https://rsvp-app-xxx.vercel.app`

### 3. First login
- Visit your live URL
- Default host password is: `changeme123`
- Go to ⚙ Settings immediately and change it to something personal

## Customise your domain (optional)
In Vercel → your project → Settings → Domains → add your own domain.

## Default host password
`changeme123` — change this immediately after first login via the Settings panel.
