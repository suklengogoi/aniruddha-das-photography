# Aniruddha Das Photography

Static website for Aniruddha Das Photography, a wedding photography and films team in Beltola, Guwahati.
Plain HTML, CSS and JavaScript — no frameworks, no build step.

## Pages

| File | What it is |
|---|---|
| `index.html` | Home: video hero, about, 5 album folders, moving film strip, services over a fixed photo, contact |
| `gallery.html?album=couples` | One page for every album (`couples`, `bridal`, `ceremony`, `details`, `monochrome`) |
| `films.html` | All films and reels, played in a pop-up player with sound |
| `404.html` | Not-found page |

## Editing content

Almost everything lives in **`js/data.js`**:

- **Contact details** (phone, WhatsApp, email, Instagram, Facebook)
- **Albums**: title, short description, photo count, cover photo and the two photos fanned behind it
- **Films**: title, type, duration, and whether it is featured at the top of the films page

Contact links in the page headers and footers are written directly in the HTML files too, so change them there as well if the number or email ever changes.

### Adding photos to an album

1. Export the photo at **4:5** (portrait).
2. Save two WebP versions in `assets/img/<album>/`: `21.webp` (1200×1500) and `21-sm.webp` (560×700).
3. Increase `count` for that album in `js/data.js`.

Photos are numbered `01`, `02`, … with no gaps.

### Adding a film

1. Put the MP4 (H.264) in `assets/video/films/<id>.mp4`.
2. Add a poster `assets/video/posters/<id>.webp`, plus a small 400×500 poster `<id>-sm.webp` and a 5-second muted preview `assets/video/previews/<id>.mp4` if it should appear in the home page strip.
3. Add it to `films` in `js/data.js`. (The home strip order is set in `js/main.js`, search for `var order`.)

## Publishing on GitHub Pages

1. Create a new repository and upload **everything in this folder** (including the hidden `.nojekyll` file) to the root.
2. Go to **Settings → Pages**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`.
3. The site will be live at `https://<username>.github.io/<repo-name>/` after a minute or two.

All paths are relative, so it works under any repository name.

## Folder structure

```
├── index.html, gallery.html, films.html, 404.html
├── css/style.css
├── js/data.js        ← content
├── js/main.js        ← behaviour
└── assets/
    ├── brand/        favicon, app icon, social share image
    ├── img/          photos by album + site/ background
    └── video/        hero, films/, previews/, posters/
```

Largest single file is about 10 MB (well under GitHub's 100 MB limit).
