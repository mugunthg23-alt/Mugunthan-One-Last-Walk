# A Small Thank You — Cinematic Farewell Website

> *"This chapter is ending, but the people and memories remain."*  
> **Last Working Day: 17 September 2026** • **Mugunthan**

---

## 🌟 Overview

A personalized, cinematic digital farewell experience created for colleagues on your last working day. Colleagues open one link, experience a Netflix/Apple-grade title transition, find their name in an interactive searchable directory, and read a personal, heartfelt note written specifically for them.

### Features
- **Screen 1 — Cinematic Title Reveal**: Minimalist dark visual title sequence with animated date (`17 September 2026`), philosophical preamble, and glowing `ENTER` button (with Skip Intro option).
- **Screen 2 — Personal Message Transition**: Narrative bridge (*"I could have written a farewell email... but some people deserve more than a CC list"*).
- **Screen 3 — Searchable Name Directory**: High-performance search, alphabetical quick jumps, category tags, interactive monogram cards, touch-optimized mobile cards, and fallback team note.
- **Screen 4 — Personalized Cinematic Letter**: Paragraph-by-paragraph reveals, featured collaborator badge, custom quote, memorable moment highlight, Mugunthan's signature, and one-click direct URL copy.
- **Screen 5 — Final Chapter Anthem**: Floating memory words (*Meetings, UATs, Deadlines, Coffee, Launches, Laughs, Memories*), transitioning to *"DIFFERENT DESKS. DIFFERENT JOURNEYS. ONE CHAPTER WE SHARED."*
- **Easter Egg**: Typing *"Mugunthan"* in the search bar triggers a dedicated tribute response reminding the reader that today is about celebrating *them*.
- **Ambient Sound Synthesizer**: Built-in Web Audio API warm ambient drone (starts strictly upon explicit user toggle, default muted, zero external dependencies).
- **Private Admin / Editor**: Accessible via `?admin=true` or discreet footer link to add, edit, delete, preview, and export `people.json`.

---

## 📂 Project Structure

```
├── public/
│   └── (static assets)
├── src/
│   ├── components/
│   │   ├── AdminScreen.tsx             # Colleague editor & JSON exporter
│   │   ├── CinematicBackground.tsx     # 60fps canvas particles, ambient lighting & audio toggle
│   │   ├── DirectoryScreen.tsx         # Search & filterable name cards
│   │   ├── EasterEggModal.tsx          # "Mugunthan" easter egg tribute
│   │   ├── FinalScreen.tsx             # "Before you leave..." animated chapter anthem
│   │   ├── IntroScreen.tsx             # Screen 1 cinematic entrance
│   │   ├── PersonalMessageScreen.tsx   # Screen 4 personalized thank-you letter
│   │   └── TransitionScreen.tsx        # Screen 2 narrative transition
│   ├── data/
│   │   ├── people.json                 # ⭐️ PRIMARY LOCATION TO EDIT NAMES & MESSAGES
│   │   └── peopleService.ts            # Data loader, slug resolver, and storage
│   ├── utils/
│   │   └── audio.ts                    # Ambient Web Audio synthesizer
│   ├── types.ts                        # TypeScript interfaces
│   ├── App.tsx                         # Master router & transition state
│   ├── index.css                       # Tailwind CSS & cinematic glow styles
│   └── main.tsx                        # React 19 entry point
├── index.html                          # Meta tags, Open Graph, & typography
├── metadata.json                       # App configuration
├── package.json                        # Dependencies & build scripts
└── vite.config.ts                      # Vite configuration
```

---

## ✏️ How to Edit Names and Messages

All colleague names and messages are stored in **one single file**:

### Location: `src/data/people.json`

You can edit this JSON file directly in your code editor. Each entry has the following structure:

```json
{
  "id": "ashwini-k82m",
  "name": "Ashwini",
  "shortName": "Ashwini",
  "role": "Engineering Lead",
  "team": "Core Platform",
  "category": "Technology",
  "featured": true,
  "specialQuote": "Some people don't just become colleagues. They become part of the journey.",
  "sharedMemory": "Late evening release sanity tests and our deep architectural debates.",
  "message": [
    "Working with you has been one of the truly meaningful parts of this chapter.",
    "Thank you for the conversations and the calm reassurance during release hours.",
    "Thank you for being such an irreplaceable part of mine."
  ]
}
```

### Alternatively: Use the Built-In Visual Admin Editor
1. Open the website and click the discreet `• edit data` link at the bottom-right (or visit `?admin=true` in the URL).
2. Add new people, edit messages, toggle **Featured**, and click **Preview**.
3. Click **Export people.json** to download the updated file, and replace `src/data/people.json` in your repository!

---

## 🔗 How to Send Individual Direct Links

Colleagues can find their name on the main page, or you can send them a direct private link using their ID or slug:

```
https://your-domain.com/?to=ashwini-k82m
https://your-domain.com/?to=arthur-v91p
https://your-domain.com/?to=keerthi-r38x
```

When they open this link, the site directly opens their personalized letter.

---

## 🚀 Local Development & Build Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally in Development Mode
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 3. Build for Production
```bash
npm run build
```
The compiled, production-ready static assets will be output to the `dist/` directory.

### 4. Preview Production Build
```bash
npm run preview
```

---

## 🌐 Free Deployment Instructions

The project builds standard static HTML/JS/CSS, so it can be deployed for free in under 2 minutes to any of the following providers:

### Option A: Vercel (Recommended)
1. Push your code to a GitHub repository.
2. Sign in to [Vercel](https://vercel.com).
3. Click **"New Project"** and import your repository.
4. Framework Preset: **Vite**.
5. Click **"Deploy"**.

### Option B: Netlify
1. Sign in to [Netlify](https://netlify.com).
2. Click **"Add new site"** -> **"Import an existing project"**.
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Click **"Deploy site"**.

### Option C: GitHub Pages
1. In `vite.config.ts`, set `base: '/<repo-name>/'` (if using a project repository).
2. Add the `gh-pages` deployment action or run `npm run build` and publish the `dist` directory to your `gh-pages` branch.

---

## 🎨 Visual Tone & Etiquette
- **Aesthetic**: Deep `#05070B` cinematic slate, warm `#E5C378` gold highlights, subtle corporate blue depth.
- **Audio**: Web Audio API synthesizer. Starts strictly muted. Respects browser autoplay.
- **Responsive**: Tested on mobile phones, tablets, and wide desktop displays.
