# skill-compass-website

Source of the website for [skill-compass](https://github.com/SWAGGATH4K1NG/skill-compass), a platform-agnostic Agent Skill that helps you navigate your installed skills.

## Structure

```
public/                  # everything in here is published
├── index.html
└── assets/
    ├── css/styles.css
    └── js/script.js
```

Plain static HTML, CSS and JavaScript. No build step, no dependencies.

## Deploy (Cloudflare Pages)

| Setting | Value |
|---|---|
| Framework preset | None |
| Build command | *(empty)* |
| Build output directory | `public` |
| Root directory | *(empty)* |
| Production branch | `main` |

Every push to `main` redeploys the site. Visitor analytics use Cloudflare Web Analytics, enabled in the Pages project under **Metrics**; no script is needed in the code.

## Local preview

Open `public/index.html` in a browser, or serve the folder:

```bash
npx serve public
```
