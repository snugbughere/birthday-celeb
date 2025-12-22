# Surabhi Birthday Web App

A small static web app that shows a countdown before Surabhi's birthday and a fancy greeting page with music and friends' video wishes afterwards.

## Tech

- Plain HTML, CSS, JavaScript (no framework).
- All configuration in `config.js`.
- Hosted on GitHub Pages.

## How it works

- On load, `index.html` includes `config.js` and `script.js`.
- `config.js` defines:
  - `targetDate` for the countdown.
  - `musicUrl` for the birthday song.
  - `wishes[]` with video/thumbnail paths and messages.
- `script.js`:
  - Reads `CONFIG`.
  - Decides whether to show countdown screen or birthday screen using the current time vs `targetDate`.
  - Uses `setInterval` to update the `<span>` elements for days/hours/minutes/seconds every second.
  - Renders a grid of wishes from `CONFIG.wishes`.
  - Opens a modal to play the selected video when a card is clicked.
  - Plays/pauses the birthday music on button click.
  - Adds floating glowing dots and a confetti animation when the birthday screen shows.

Because GitHub Pages is static hosting, there is no backend. The browser downloads the HTML/CSS/JS files and executes the JavaScript directly to update the DOM and control audio/video.

## Setup

1. Clone or download this repo.
2. Place your song in `assets/music/birthday-song.mp3`.
3. Place each friend's:
   - Video in `assets/videos/`.
   - Thumbnail in `assets/thumbs/`.
4. Update `config.js` with:
   - Your correct `targetDate` (ISO-style string).
   - `musicUrl` if you change the filename.
   - `wishes[]` entries with correct video/thumbnail paths.

## Run locally

Just open `index.html` in a browser (VS Code Live Server recommended).

## Deploy to GitHub Pages

1. Create a GitHub repo (e.g., `surabhi-birthday`).
2. Push the project (see commands in this README).
3. In GitHub repo settings, enable GitHub Pages:
   - Settings → Pages → Source: `main` branch, `/root` folder.
4. After a few minutes, visit:
   - `https://<your-username>.github.io/surabhi-birthday/`.

## Git commands
git init
git add .git commit -m “Initial birthday app”
git branch -M main
git remote add origin https://github.com//surabhi-birthday.git
git push -u origin main

To update :-
git add .
git commit -m “Update wishes / music / text”
git push


GitHub Pages and video limits to consider
Key GitHub limits for your use case:
	•	Recommended repo size: keep under about 1 GB; GitHub discourages repos over 5 GB.
	•	Published GitHub Pages site: may be no larger than 1 GB.
	•	Per-file upload limit (normal Git, without Git LFS):
	•	GitHub blocks files larger than 100 MB.
	•	Bandwidth: soft limit around 100 GB/month for GitHub Pages traffic, usually plenty for a personal birthday site.
Practical guidance:
	•	Keep each video file well under 100 MB (e.g., 10–30 MB) and compress/rescale if needed.
	•	If you somehow needed many large videos, you could:
	•	Host videos on YouTube (unlisted) or another video host and embed them, or
	•	Use Git LFS for large files (but that also has storage and bandwidth quotas).
For our scenario (a few personal birthday wishes), a handful of compressed MP4s stored directly in the repo is safe and simple.