# Monetization & Game Portal Publishing Guide
## Dodge the Spikes 2: Arc Dodger

Congratulations on your game! This guide explains step-by-step how to publish **Dodge the Spikes 2** to top web game portals, set up monetization, and start earning revenue.

---

## 1. Quick Download Package Guide

Your downloaded packages contain:
* `game-portal-html5.zip`: **The ready-to-upload build**. Inside the ZIP is `index.html` and the `assets/` folder at the root level. This matches the exact format required by itch.io, CrazyGames, GameDistribution, Poki, and Newgrounds.
* `dodge-the-spikes-2-source.zip`: The complete React 19 + TypeScript + Tailwind CSS + Vite source code.
* `dodge-the-spikes-2-complete-pack.zip`: All source code, pre-built game, and documentation combined.

---

## 2. Publishing to Game Portals (Ranked by Revenue Potential)

### A. CrazyGames (Developer Portal: https://developer.crazygames.com)
* **Audience**: 30+ million monthly active players. High CPMs in US/EU.
* **Upload Steps**:
  1. Register a free developer account at [CrazyGames Developer Portal](https://developer.crazygames.com).
  2. Click **Submit Game**.
  3. Enter title: `Dodge the Spikes 2: Neon Reflex`.
  4. Under **Game File**, upload `game-portal-html5.zip`.
  5. Specify game orientation: **Portrait** (mobile-first) or **Flexible**.
  6. Submit for review! CrazyGames usually approves within 2–5 business days.
* **Monetization**:
  * CrazyGames pays developers 50% revenue share from video/banner ads.
  * You can integrate their lightweight JavaScript SDK (`CrazyGames SDK v2/v3`) for midgame ad breaks between game over screens.

---

### B. GameDistribution (https://gamedistribution.com)
* **Audience**: Syndicates your game to thousands of publisher websites worldwide (including Yahoo, Spil Games, Orange, etc.).
* **Upload Steps**:
  1. Sign up as a developer on [GameDistribution](https://gamedistribution.com).
  2. Click **Add Game** -> HTML5 game.
  3. Upload `game-portal-html5.zip`.
  4. Fill in game tags: `Arcade`, `Action`, `Reflex`, `Casual`, `Dodging`, `Sci-Fi`.
* **Monetization**:
  * Automatic revenue sharing via their publisher ad network.
  * Monthly payouts to PayPal or Bank Wire transfer once you meet the threshold ($100).

---

### C. itch.io (https://itch.io)
* **Audience**: Indie gaming community, donations, pay-what-you-want, and direct sponsorship sales.
* **Upload Steps**:
  1. Create an itch.io account and click **Create new project**.
  2. Set **Classification** to *Games*.
  3. Set **Kind of project** to *HTML (You have a ZIP file or HTML file that will be played in the browser)*.
  4. Upload `game-portal-html5.zip`.
  5. Check the box: `This file will be played in the browser`.
  6. Set Viewport dimensions: **480 x 850** (or check *Mobile friendly*).
  7. Set Pricing to **$0 or donate** (players can tip or pay any amount).
  8. Click Save & Publish!

---

### D. Poki (https://developers.poki.com)
* **Audience**: Premier HTML5 web gaming portal with 50M+ users.
* **Upload Steps**:
  1. Submit a proposal through [Poki for Developers](https://developers.poki.com).
  2. Provide a link to your game or upload the build.
  3. Poki curates games and provides high ad fill rates if approved.

---

### E. Newgrounds (https://www.newgrounds.com)
* **Audience**: Dedicated retro and web arcade fanbase.
* **Upload Steps**:
  1. Go to your Newgrounds account dashboard -> **Submit Game**.
  2. Choose **HTML5 Game (.zip)**.
  3. Upload `game-portal-html5.zip`.
  4. You can enable Newgrounds ad revenue sharing and player medal achievements!

---

## 3. Embedding Ad Networks (AdSense / H5 Games Ads)

If you host the game on your own custom domain or gaming site:
1. Apply for **Google AdSense for Games (H5 Games Ads)**:
   https://support.google.com/adsense/answer/10183188
2. Add the AdSense script tag to `dist/index.html` (or `index.html` in source):
   ```html
   <script async
     src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
     crossorigin="anonymous">
   </script>
   ```
3. Trigger rewarded ads when the player dies (e.g. "Watch ad to revive with 1 extra heart").

---

## 4. How to Build & Customize From Source

1. Unzip `dodge-the-spikes-2-source.zip`.
2. Open terminal in the unzipped folder:
   ```bash
   npm install
   npm run dev
   ```
3. Open `http://localhost:3000` in your browser.
4. When you're ready to produce a fresh build:
   ```bash
   npm run build
   ```
5. The output in `dist/` is your updated HTML5 game. Zip the files inside `dist/` and upload them to any portal!
