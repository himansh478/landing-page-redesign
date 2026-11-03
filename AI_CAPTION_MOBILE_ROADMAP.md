# AI Caption on Phones: Roadmap

**Date:** 3 November 2026
**Goal:** most Cwaya users are on phones, so AI Caption must work well on a phone: upload, captions, style, fix words, export and share, with no laptop needed.

---

## 1. Where we are today

| Part | On a phone today | Why |
|---|---|---|
| Sign in with Google | Works | Simple page |
| Upload a video, make captions | Works | The heavy work runs on our servers |
| Team list (`ALLOWED_EMAILS`) | Works | Server-side check |
| **The editor** | **Blocked** | A CSS rule hides it on screens 1100 px wide or less and shows "needs a wider screen" (`src/app/(captions)/captions.css`, `@media (max-width: 1100px)`) |
| Export MP4 | Not reachable, and some phones may fail | Lives inside the editor (see risks) |

**Why the editor was built for laptops:**
1. **Layout:** four areas side by side: caption list (340 px), preview, style panel (320 px), and a timeline below (`.studio` grid in `captions.css`). A phone is about 400 px wide.
2. **Mouse and keyboard:** dragging on the preview and timeline, plus keyboard shortcuts (Space, S, Ctrl+Z) in `src/app/(captions)/ai-caption/studio/[id]/page.tsx`.
3. **Heavy work in the browser:** the drawing engine (CanvasKit, 7 MB), face tracking (MediaPipe, about 27 MB) and video export all run on the device, to keep videos private.
4. **Browser storage:** projects are saved in the browser's private storage (OPFS, `src/captions/lib/storage.ts`).

**What is already phone-friendly in the code:**
- Fonts download one at a time, only when a template needs them (`src/captions/engine/fonts.ts`).
- Face tracking loads only when someone turns on a face tool (`src/captions/engine/faces.ts`).
- Export writes straight to storage as it goes, so it doesn't need much memory (`src/captions/engine/export.ts`).
- The preview and timeline already use pointer events, which also work with touch (`Preview.tsx`, `Timeline.tsx`).

**Phone risks found in the code:**
- Export asks for H.264 *High* profile at 12 Mbps (`canEncodeVideo` in `src/captions/lib/browser.ts`). Some phone video encoders refuse this, so the app would say it can't make the video.
- Saving to browser storage uses `createWritable` (`storage.ts`), which still needs testing in iPhone Safari.
- Server export is switched off on the live site, because Vercel can't receive a whole video. So a phone that can't encode has no fallback today.

---

## 2. The plan

### Phase 1: Test on real phones (3 to 4 days)
**Who:** you test on your phones; I add a hidden test switch and fix what we find.
- Phones: one mid-range Android (₹10,000 to ₹20,000) in Chrome, and one iPhone (12 or newer) in Safari.
- I add a hidden switch (`?phone=1`) that opens today's editor on a phone, just for testing.
- We measure:
  - Does the preview play smoothly?
  - Does export work, and how long does a 60 s Reel take?
  - Does it crash or slow the phone down?
  - Which export settings does each phone accept?

**Done when:** we have a short report listing what works on each phone.

### Phase 2: "Quick Mode" for phones (1 to 2 weeks). The main step.
A simple four-screen flow replaces the "needs a wider screen" message on phones:
1. **Upload:** this already works.
2. **Pick a style:** swipe through big template cards. Your last style and favourites come first.
3. **Check words:** only the words the app flagged ("Check 3 words"). Tap one to fix it, or press "Looks right". Tap any caption to edit its text.
4. **Preview and export:** a full-screen 9:16 preview with play and pause. Simple sliders for caption position (top, middle, bottom) and size, an Undo button, then **Export**, which offers **Save to phone** and **Share** to Instagram and WhatsApp.

How I build it:
- New phone screens in `src/captions/components/mobile/`, reusing the same caption engine and saved projects.
- Phones get Quick Mode automatically, and a "Full editor" link is kept for later.
- The laptop editor stays exactly as it is.

**Done when:** on the test Android phone, a 60-second Hinglish Reel goes from upload to an exported, shareable MP4 in under 3 minutes, and all the existing laptop tests still pass.

### Phase 3: Phone-safe export (3 to 5 days, done together with Phase 2)
- Try lighter settings in order until the phone accepts one:
  - profile: High, then Main, then Baseline
  - size: 1080p, then 720p
  - bitrate: 12, then 8, then 5 Mbps
- Keep the screen on during export (Wake Lock), and show "Keep this screen open".
- iPhone: if writing to browser storage fails, build the video in memory instead. This is safe because clips are limited to 1 minute.
- If a phone truly can't make video, say so clearly, offer the subtitle file (SRT) for now, and point to Phase 6.

**Done when:** export works on both test phones, or the app tells the user clearly what to do.

> **After Phases 1 to 3 (about 3 weeks), phone users can make and share captioned Reels.** This is the point to announce it.

### Phase 4: Full editor on phones and tablets (2 to 3 weeks, after Quick Mode is in use)
For people who want full control on a phone:
- **Tablet (768 to 1100 px):** the preview, with one panel beside it and the timeline below.
- **Phone:** the preview on top and a tab bar at the bottom (Captions, Style, Adjust, Word, Review, Export). Panels open as sheets that slide up.
- **Touch timeline:** swipe to scroll, pinch to zoom, tap to select, and long-press for Split, Merge or Delete. Handles are at least 44 px, big enough for fingers.
- Stop the page scrolling while a caption is dragged, using `touch-action` on the preview and timeline.
- On-screen buttons replace the keyboard shortcuts: Play, Undo, Redo, Split.

**Done when:** every editor action can be done by touch, and the laptop editor is unchanged.

### Phase 5: Speed, battery and storage (about 1 week, then ongoing)
- A lighter preview on phones (for example 540p), while export stays full quality.
- Face tools: a lighter scan on phones, a progress bar and a Cancel button.
- Storage: show space used, clean up old projects automatically, and handle a "storage full" message properly.
- Big phone videos (4K, or the HEVC format iPhones record in): check they open, and shrink them for the preview.
- If the phone closes the tab during an export, pick the project up again where it stopped.

### Phase 6: Server export for weaker phones (optional; decide after Phase 1)
Only if Phase 1 shows many phones can't make video:
- The phone uploads the video straight to cloud storage, such as Supabase Storage or Cloudflare R2, not through Vercel.
- Our Modal worker lays the captions on (the code for this already exists), and the person downloads the result.
- The video is deleted right after.
- Costs extra per video in upload and processing, so it needs a price decision first.

### Phase 7: App-like polish (about 1 week)
- **Add to Home Screen:** AI Caption opens like an app, with its own icon (PWA).
- **Share straight to Instagram and WhatsApp** from the export screen.
- A phone-first home page: a big upload button and recent projects as cards.
- Simple numbers to watch: phone versus laptop users, how many exports succeed, and the most common errors. This needs error tracking turned on.

---

## 3. Order and timing

| Order | Phase | About how long | Who | You get |
|---|---|---|---|---|
| 1 | Test on real phones | 3 to 4 days | You test, I fix | A report on what works where |
| 2 | Quick Mode | 1 to 2 weeks | Me | Phone users can caption and export |
| 3 | Phone-safe export | 3 to 5 days, alongside 2 | Me | Export works on common phones |
| | **Launch to phone users** | **About 3 weeks in** | | |
| 4 | Full editor on phones and tablets | 2 to 3 weeks | Me | Full control by touch |
| 5 | Speed, battery, storage | About 1 week, then ongoing | Me | Fewer crashes, faster |
| 6 | Server export | Decide after Phase 1 | Me, plus your price decision | Weak phones can export too |
| 7 | App-like polish | About 1 week | Me | Home-screen app, one-tap sharing |

These times depend on what Phase 1 finds. iPhones in particular may need extra fixes.

---

## 4. What I need from you
1. **Test phones:** one mid-range Android, and an iPhone if you can, with about 30 minutes per test round.
2. **A few real 40 to 60 second Reels**, filmed on a phone, for testing.
3. **Decision now:** Quick Mode first (recommended) or the full phone editor first.
4. **Decision later:** server export for weak phones (Phase 6), which costs money per video.

---

## 5. Risks
| Risk | How we handle it |
|---|---|
| iPhone Safari's video-export support differs between iOS versions | Test early (Phase 1), use lighter settings (Phase 3), and add server export if needed (Phase 6) |
| Phones get hot or slow during export | A 60 s Reel only, a lighter preview, keep the screen on, and a clear progress bar |
| More users means higher Groq, Gemini and Modal costs (about ₹1.4 to ₹1.8 per minute of video) | Keep the team list (`ALLOWED_EMAILS`) until prices and free minutes are decided |
| Breaking the laptop editor | Phone screens are separate files, and the existing tests run after every phase |

## 6. How we'll know it works
- On a mid-range Android, a 60 s Reel goes from upload to export in **under 3 minutes**.
- Export works on **both test phones**, with no crashes.
- Once tracking is on: **9 out of 10** phone users who upload also finish an export.
