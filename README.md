# ANKI MAKEOVERS — Haute Beauty & Glamour Studio

A dynamic, high-luxury atelier portfolio web application featuring multi-angle lookbooks, dynamic JSON dataset loading, interactive category filtering, and a zero-gravity **Google Antigravity** Matter.js physics simulation.

Engineered for 100% native compatibility with **GitHub Pages** hosting (`https://<username>.github.io/<repository-name>/`).

---

## 📁 Repository Structure

```text
/
├── index.html                   # Main landing page with dynamic skeleton loader
├── 404.html                     # Custom luxury fallback page for GitHub Pages
├── style.css                    # Luxury glassmorphism, gold gradients & theme
├── .nojekyll                    # Tells GitHub Pages to bypass Jekyll and serve static files
├── .gitignore                   # Ignores OS & IDE artifacts
├── data/
│   └── portfolio.json           # All portfolio items, multiple angles, pricing & details
├── assets/
│   └── images/                  # Categorized local photography angles
│       ├── placeholder.svg      # Graceful fallback if an image isn't uploaded yet
│       ├── nails/               # Nails & art photography
│       ├── hair/                # Hair styling & cuts photography
│       └── makeup/              # Makeup & glam photography
└── js/
    └── script.js                # Async JSON loader, category filter, Lookbook modal & Matter.js
```

---

## 🚀 How to Deploy to GitHub Pages (Step-by-Step)

Follow these quick steps to publish your portfolio online for free on GitHub Pages:

### Step 1: Push Code to GitHub
Open your terminal in this folder and run:
```bash
git init
git add .
git commit -m "Initial commit of dynamic Anki Makeovers portfolio"
git branch -M main
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
git push -u origin main
```

### Step 2: Enable GitHub Pages
1. Go to your repository on [GitHub](https://github.com).
2. Click on **Settings** (top tabs).
3. In the left sidebar, click **Pages** (under the "Code and automation" section).
4. Under **Build and deployment**:
   - **Source**: Select `Deploy from a branch`.
   - **Branch**: Select `main` and folder `/ (root)`.
5. Click **Save**.

Within 1–2 minutes, your site will be live at:
```text
https://<YOUR-USERNAME>.github.io/<YOUR-REPO-NAME>/
```

---

## 💎 How to Add New Portfolio Looks

All content is managed through `data/portfolio.json`:

1. **Add Photos**: Place your photos in `assets/images/<category>/` (e.g., `assets/images/nails/my-style-1.jpg`).
2. **Add Entry**: Open `data/portfolio.json` and insert a new object into the list:

```json
{
  "id": "nail-003",
  "title": "Rose Quartz Glaze",
  "category": "nails",
  "price": "$90",
  "duration": "1h 45m",
  "rating": "5.0 ★★★★★",
  "reviews": "42 reviews",
  "description": "Hand-painted translucent rose quartz veining with 24K gold foil flakes.",
  "techniques": [
    "Blooming Gel Veining",
    "Gold Foil Floating",
    "Soft Gel Sculpting"
  ],
  "aftercare": "Hydrate cuticles twice daily; avoid using nail tips as tools.",
  "images": [
    {
      "url": "./assets/images/nails/my-style-1.jpg",
      "label": "Top View",
      "alt": "Top angle of rose quartz nails"
    },
    {
      "url": "./assets/images/nails/my-style-2.jpg",
      "label": "Side Contour",
      "alt": "Side apex profile"
    }
  ],
  "addons": [
    { "name": "Crystal Cluster Accent", "price": 15 },
    { "name": "Keratin Seal Treatment", "price": 12 }
  ]
}
```

3. Commit and push:
```bash
git add .
git commit -m "Add new look"
git push
```
GitHub Pages will automatically update your site within moments!

---

## 💻 Local Testing (Before Pushing)

Because modern web browsers block `fetch()` calls on `file:///` URLs due to CORS security rules, use any local development server to test locally:

- **VS Code**: Right-click `index.html` > **"Open with Live Server"**.
- **Node.js**: Run `npx serve .`
- **Python**: Run `python -m http.server 8000` and visit `http://localhost:8000`.

*(On GitHub Pages, it runs over HTTPS where `fetch()` works natively without any setup).*
