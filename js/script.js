/**
 * ANKI MAKEOVERS — HAUTE ATELIER
 * Modular Dynamic Application Logic, JSON Data Loader, Lookbook Modal & Antigravity Physics
 * 100% Relative-path compatible for GitHub Pages hosting (e.g. username.github.io/repo-name/)
 */

/* -------------------------------------------------------------------------
   0. TAILWIND CONFIGURATION
   ------------------------------------------------------------------------- */
if (typeof tailwind !== 'undefined') {
  tailwind.config = {
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          obsidian: {
            950: '#070709',
            900: '#0d0d0f',
            850: '#121216',
            800: '#17171d',
            700: '#21212a'
          },
          champagne: {
            100: '#fef7ee',
            200: '#f9e8d4',
            300: '#f3d5ba',
            400: '#e8be99',
            500: '#e2b189',
            600: '#c58f68',
            700: '#9e6d4a',
            800: '#7a5135'
          },
          rosegold: {
            300: '#f4c8b8',
            400: '#e8ac9b',
            500: '#d98b77',
            600: '#bd6a55'
          }
        },
        fontFamily: {
          serif: ['"Cormorant Garamond"', 'serif'],
          display: ['"Playfair Display"', 'serif'],
          sans: ['"Plus Jakarta Sans"', 'sans-serif']
        },
        animation: {
          'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          'float-slow': 'float 6s ease-in-out infinite',
          'shimmer': 'shimmer 2.5s infinite linear'
        },
        keyframes: {
          float: {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-8px)' }
          },
          shimmer: {
            '0%': { backgroundPosition: '-200% 0' },
            '100%': { backgroundPosition: '200% 0' }
          }
        }
      }
    }
  };
}

/* -------------------------------------------------------------------------
   1. GLOBAL STATE & CONSTANTS
   ------------------------------------------------------------------------- */
const FALLBACK_IMAGE = './assets/images/placeholder.svg';

const CATEGORY_MAP = {
  nails: { label: "Nails & Art", key: "nails" },
  hair: { label: "Hair Styling & Cuts", key: "hair" },
  makeup: { label: "Makeup & Glam", key: "makeup" }
};

let PORTFOLIO_DATA = [];
let currentCategory = 'all';
let activeModalItem = null;
let activeAngleIndex = 0;
let currentSelectedAddons = new Set();
let currentCalculatedTotal = 0;

// Matter.js Antigravity State
let physicsEngine = null;
let physicsRender = null;
let physicsRunner = null;
let isAntigravityActive = false;
let preloadedCardImages = {};

/* -------------------------------------------------------------------------
   2. DATA NORMALIZATION HELPERS
   ------------------------------------------------------------------------- */
function extractNumericPrice(price) {
  if (typeof price === 'number') return price;
  if (typeof price === 'string') {
    const parsed = parseInt(price.replace(/[^0-9]/g, ''), 10);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function formatDisplayPrice(price) {
  if (typeof price === 'string' && price.trim().startsWith('$')) {
    return price.trim();
  }
  const numeric = extractNumericPrice(price);
  return `$${numeric}`;
}

function normalizePortfolioData(rawList) {
  if (!Array.isArray(rawList)) return [];

  return rawList.map((item, idx) => {
    const id = item.id || `item-${idx + 1}`;
    const categoryKey = (item.category || 'nails').toLowerCase();
    const categoryLabel = CATEGORY_MAP[categoryKey]?.label || 
      (categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1));
    
    // Normalize images (supporting either images or angles array)
    const rawImages = Array.isArray(item.images) && item.images.length > 0 
      ? item.images 
      : (Array.isArray(item.angles) && item.angles.length > 0 ? item.angles : []);

    const images = rawImages.length > 0 ? rawImages.map((img, imgIdx) => ({
      url: img.url || FALLBACK_IMAGE,
      label: img.label || `Angle ${imgIdx + 1}`,
      alt: img.alt || `${item.title || 'Look'} - Angle ${imgIdx + 1}`,
      tag: img.tag || img.label || `Angle ${imgIdx + 1}`
    })) : [
      {
        url: item.heroImage || FALLBACK_IMAGE,
        label: "Front View",
        alt: item.title || "Look Photo",
        tag: "Front Angle"
      }
    ];

    const numericPrice = extractNumericPrice(item.price ?? item.basePrice ?? item.startingPrice);
    const displayPrice = formatDisplayPrice(item.price ?? item.startingPrice ?? numericPrice);

    const techniques = Array.isArray(item.techniques)
      ? item.techniques.join(', ')
      : (item.techniques || 'Bespoke Atelier Craft & Artistry');

    return {
      id: String(id),
      title: item.title || 'Bespoke Creation',
      category: categoryKey,
      categoryLabel: categoryLabel,
      price: displayPrice,
      numericPrice: numericPrice,
      basePrice: numericPrice,
      startingPrice: numericPrice,
      duration: item.duration || '1 hr',
      rating: item.rating || '5.0 ★★★★★',
      reviews: item.reviews || 'Client Acclaim',
      description: item.description || 'Exclusive bespoke haute look handcrafted at Anki Atelier.',
      techniques: techniques,
      techniquesList: Array.isArray(item.techniques) ? item.techniques : [techniques],
      aftercare: item.aftercare || 'Hydrate and care gently; consult our concierge for custom maintenance.',
      images: images,
      heroImage: images[0].url,
      addons: Array.isArray(item.addons) ? item.addons : [
        { name: "Luxury Nourishing Treatment", price: 15 },
        { name: "Long-Wear Gloss Shield", price: 10 }
      ]
    };
  });
}

/* -------------------------------------------------------------------------
   2.5 RESILIENT OFFLINE FALLBACK DATASET (Mirror of data/portfolio.json)
   Ensures cards render seamlessly when opened via local file:// protocol
   while still fetching dynamically over http/https on GitHub Pages.
   ------------------------------------------------------------------------- */
const FALLBACK_PORTFOLIO_DATA = [
  {
    "id": "nail-001",
    "title": "Chrome French Almond",
    "category": "nails",
    "price": "$80",
    "duration": "1h 30m",
    "rating": "4.9 ★★★★★",
    "reviews": "94 reviews",
    "description": "Minimalist glazed chrome over structured soft gel extensions with a flawless Russian dry-manicure foundation.",
    "techniques": [
      "Russian Dry Manicure",
      "Chrome Pigment Buffing",
      "Soft Gel Sculpting",
      "Apex Architecture"
    ],
    "aftercare": "Hydrate cuticles daily with organic jojoba oil; avoid using nail tips as tools.",
    "images": [
      {
        "url": "./assets/images/nails/chrome-1.jpg",
        "label": "Top View",
        "alt": "Top angle view of chrome nails"
      },
      {
        "url": "./assets/images/nails/chrome-2.jpg",
        "label": "Apex Angle",
        "alt": "Side profile showing nail apex structure"
      },
      {
        "url": "./assets/images/nails/chrome-3.jpg",
        "label": "Macro Texture",
        "alt": "Macro close-up of mirror chrome finish"
      }
    ],
    "addons": [
      { "name": "Austrian Micro-Crystal Accent", "price": 15 },
      { "name": "Deep Keratin Strengthening Treatment", "price": 12 },
      { "name": "Rose & Gold Leaf Cuticle Massage", "price": 18 }
    ]
  },
  {
    "id": "nail-002",
    "title": "Velvet Noir & 24K Flakes",
    "category": "nails",
    "price": "$110",
    "duration": "2h 00m",
    "rating": "5.0 ★★★★★",
    "reviews": "67 reviews",
    "description": "Multi-dimensional magnetic velvet effect mimicking plush black silk, accented with hand-laid 24-karat crushed gold leaf flakes.",
    "techniques": [
      "Dual-Magnet Velvet Manipulation",
      "24K Gold Leaf Floating",
      "Square-Couture Shaping",
      "Diamond High-Gloss Seal"
    ],
    "aftercare": "Reapply cuticle balm every evening; wear gloves when using household cleaning solutions.",
    "images": [
      {
        "url": "./assets/images/nails/velvet-1.jpg",
        "label": "Front View",
        "alt": "Front view of velvet noir nails"
      },
      {
        "url": "./assets/images/nails/velvet-2.jpg",
        "label": "Side Angle",
        "alt": "Side angle displaying 24K gold foil depth"
      },
      {
        "url": "./assets/images/nails/velvet-3.jpg",
        "label": "Glow Lighting",
        "alt": "Magnetic shimmer in flash studio lighting"
      }
    ],
    "addons": [
      { "name": "Full 24K Gold Accent Finger", "price": 20 },
      { "name": "Matte Velvet Hybrid Finish", "price": 10 }
    ]
  },
  {
    "id": "hair-001",
    "title": "Couture Balayage & Silk Waves",
    "category": "hair",
    "price": "$185",
    "duration": "2h 30m",
    "rating": "5.0 ★★★★★",
    "reviews": "128 reviews",
    "description": "Seamless sun-drenched micro-foilyage melted into soft warm champagne hues, finished with red-carpet silk ribbon waves.",
    "techniques": [
      "Clay Micro-Balayage",
      "K18 Molecular Peptide Repair",
      "Gloss Acidic Toner Glaze",
      "Botanical Silk Blowout"
    ],
    "aftercare": "Cleanse with sulfate-free purple or brass-toning shampoo once weekly; apply heat protectant before styling.",
    "images": [
      {
        "url": "./assets/images/hair/balayage-1.jpg",
        "label": "Full Back View",
        "alt": "Back view showing dimensional champagne balayage"
      },
      {
        "url": "./assets/images/hair/balayage-2.jpg",
        "label": "3/4 Profile",
        "alt": "Three-quarter profile showing face-framing ribbons"
      },
      {
        "url": "./assets/images/hair/balayage-3.jpg",
        "label": "Macro Dimension",
        "alt": "Close-up view of tone blend and healthy hair shine"
      }
    ],
    "addons": [
      { "name": "K18 Molecular Peptide Infusion", "price": 35 },
      { "name": "Glass Gloss Acidic Glaze Upgrade", "price": 40 },
      { "name": "Scalp Exfoliation & Massage Ritual", "price": 25 }
    ]
  },
  {
    "id": "makeup-001",
    "title": "Editorial Glass Skin & Bronze Glam",
    "category": "makeup",
    "price": "$160",
    "duration": "1h 45m",
    "rating": "4.9 ★★★★★",
    "reviews": "82 reviews",
    "description": "Luminous dewy skin preparation paired with soft bronze sculpted contours, feathered laminated brows, and bespoke silk wispy lashes.",
    "techniques": [
      "Lymphatic Facial Sculpting Prep",
      "Micro-Concealing Precision Layering",
      "Handcrafted Mink Lash Mapping",
      "Airbrush Hydro-Setting"
    ],
    "aftercare": "Melt away gently with a cleansing balm or two-phase oil cleanser; avoid scrubbing lash line vigorously.",
    "images": [
      {
        "url": "./assets/images/makeup/editorial-1.jpg",
        "label": "Front Portrait",
        "alt": "Full front portrait showing luminous skin and bronze eyes"
      },
      {
        "url": "./assets/images/makeup/editorial-2.jpg",
        "label": "Profile Contouring",
        "alt": "Profile angle showing bone structure and cheekbone glow"
      },
      {
        "url": "./assets/images/makeup/editorial-3.jpg",
        "label": "Macro Eye Artistry",
        "alt": "Macro detail of feathered brows and precision liner"
      }
    ],
    "addons": [
      { "name": "Luxe Mink Lash Cluster Customization", "price": 25 },
      { "name": "24K Gold Under-Eye Prep Patches", "price": 15 },
      { "name": "Take-Home Touch-Up Luxury Kit", "price": 30 }
    ]
  }
];

/* -------------------------------------------------------------------------
   3. ASYNCHRONOUS DATA LOADER (FETCH with graceful offline fallback)
   ------------------------------------------------------------------------- */
async function loadPortfolioData() {
  const grid = document.getElementById('portfolio-grid');
  const skeleton = document.getElementById('loading-skeleton');
  const errorContainer = document.getElementById('portfolio-error');
  const emptyState = document.getElementById('empty-state');

  if (skeleton) skeleton.classList.remove('hidden');
  if (errorContainer) errorContainer.classList.add('hidden');
  if (emptyState) emptyState.classList.add('hidden');

  let rawData = null;

  try {
    // Relative path safe for GitHub Pages (https://user.github.io/repo-name/)
    const response = await fetch('./data/portfolio.json', { cache: 'no-store' });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    rawData = await response.json();
    console.log('[Anki Makeovers] Successfully loaded dynamic portfolio from ./data/portfolio.json');

  } catch (err) {
    console.warn('[Anki Makeovers] fetch("./data/portfolio.json") was blocked by browser security (file:/// protocol detected). Gracefully using local starter dataset for instant offline viewing.', err);
    // Seamless fallback to bundled starter dataset when run offline or directly via file://
    rawData = FALLBACK_PORTFOLIO_DATA;
  }

  // Populate and render
  if (rawData && rawData.length > 0) {
    PORTFOLIO_DATA = normalizePortfolioData(rawData);
    if (skeleton) skeleton.classList.add('hidden');
    if (errorContainer) errorContainer.classList.add('hidden');

    updateCategoryCounters();
    renderPortfolioGrid();
    preloadImagesForPhysics();
  } else {
    if (skeleton) skeleton.classList.add('hidden');
    if (errorContainer) errorContainer.classList.remove('hidden');
  }
}

/* -------------------------------------------------------------------------
   4. CATEGORY COUNTERS & FILTER TABS
   ------------------------------------------------------------------------- */
function updateCategoryCounters() {
  const counts = {
    all: PORTFOLIO_DATA.length,
    nails: 0,
    hair: 0,
    makeup: 0
  };

  PORTFOLIO_DATA.forEach(item => {
    if (counts[item.category] !== undefined) {
      counts[item.category]++;
    }
  });

  document.querySelectorAll('#category-tabs .cat-pill').forEach(btn => {
    const cat = btn.getAttribute('data-cat');
    const badge = btn.querySelector('.count-badge');
    if (badge && counts[cat] !== undefined) {
      badge.innerText = counts[cat];
    }
  });
}

function filterCategory(cat) {
  currentCategory = cat;
  document.querySelectorAll('#category-tabs .cat-pill').forEach(btn => {
    if (btn.getAttribute('data-cat') === cat) {
      btn.className = "cat-pill active px-4 sm:px-5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 border flex items-center space-x-2 bg-champagne-500 text-obsidian-950 border-champagne-500 shadow-md";
    } else {
      btn.className = "cat-pill px-4 sm:px-5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 border flex items-center space-x-2 bg-obsidian-900/80 text-zinc-300 border-white/10 hover:border-champagne-500/40 hover:text-champagne-300";
    }
  });
  renderPortfolioGrid();
}

/* -------------------------------------------------------------------------
   5. PORTFOLIO GRID RENDERING
   ------------------------------------------------------------------------- */
function renderPortfolioGrid() {
  const grid = document.getElementById('portfolio-grid');
  const emptyState = document.getElementById('empty-state');
  if (!grid) return;

  const filtered = currentCategory === 'all'
    ? PORTFOLIO_DATA
    : PORTFOLIO_DATA.filter(item => item.category === currentCategory);

  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  grid.innerHTML = filtered.map(item => {
    const heroPhoto = item.images && item.images[0] ? item.images[0].url : FALLBACK_IMAGE;
    const angleCount = item.images ? item.images.length : 1;
    const angleLabel = angleCount === 1 ? '1 Angle' : `${angleCount} Angles`;

    return `
      <article class="glass-card rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col group cursor-pointer transition-all duration-300" onclick="openLookbookModal('${item.id}')">
        <!-- Card Thumbnail Hero with Angle Badge -->
        <div class="relative w-full h-72 sm:h-80 overflow-hidden bg-obsidian-950">
          <img 
            src="${heroPhoto}" 
            alt="${item.title}" 
            loading="lazy" 
            onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}';"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          >
          
          <!-- Category Badge -->
          <div class="absolute top-4 left-4 z-10">
            <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-obsidian-950/80 backdrop-blur-md text-champagne-300 border border-champagne-500/20">
              ${item.categoryLabel}
            </span>
          </div>

          <!-- Angles Count Indicator -->
          <div class="absolute top-4 right-4 z-10">
            <span class="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide bg-obsidian-950/80 backdrop-blur-md text-zinc-300 border border-white/10 flex items-center space-x-1.5 group-hover:border-champagne-500/40 transition-colors">
              <svg class="w-3 h-3 text-champagne-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span>${angleLabel}</span>
            </span>
          </div>

          <!-- Hover Prompt Overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
            <div class="w-full flex items-center justify-between text-xs text-champagne-300 font-medium">
              <span class="flex items-center space-x-1">
                <span>View Multi-Angle Lookbook</span>
              </span>
              <span class="w-6 h-6 rounded-full bg-champagne-500/20 flex items-center justify-center text-champagne-300">
                →
              </span>
            </div>
          </div>
        </div>

        <!-- Card Content -->
        <div class="p-5 sm:p-6 flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between text-xs text-zinc-400 mb-2">
              <span class="flex items-center space-x-1 text-champagne-400">
                <span>${item.rating}</span>
              </span>
              <span class="flex items-center space-x-1">
                <svg class="w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>${item.duration}</span>
              </span>
            </div>

            <h3 class="text-xl font-serif text-zinc-100 group-hover:text-champagne-300 transition-colors leading-snug">
              ${item.title}
            </h3>

            <p class="mt-2 text-xs text-zinc-400 line-clamp-2 font-light leading-relaxed">
              ${item.description}
            </p>
          </div>

          <!-- Footer: Price & Quick Action -->
          <div class="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
            <div>
              <span class="text-[10px] uppercase tracking-wider text-zinc-500 block">Starting From</span>
              <span class="text-lg font-serif font-bold text-champagne-400">${item.price}</span>
            </div>

            <button class="px-3.5 py-1.5 rounded-full border border-champagne-500/20 group-hover:border-champagne-400 group-hover:bg-champagne-500/10 text-champagne-300 text-xs font-medium transition-all">
              Explore Angles
            </button>
          </div>

        </div>
      </article>
    `;
  }).join('');
}

/* -------------------------------------------------------------------------
   6. MULTI-ANGLE LOOKBOOK MODAL LOGIC
   ------------------------------------------------------------------------- */
function openLookbookModal(id) {
  const item = PORTFOLIO_DATA.find(x => x.id === id);
  if (!item) return;

  activeModalItem = item;
  activeAngleIndex = 0;
  currentSelectedAddons.clear();
  currentCalculatedTotal = item.basePrice;

  // Populate text fields
  const catEl = document.getElementById('modal-category');
  const titleEl = document.getElementById('modal-title');
  const durEl = document.getElementById('modal-duration');
  const rateEl = document.getElementById('modal-rating');
  const revEl = document.getElementById('modal-reviews');
  const descEl = document.getElementById('modal-description');
  const techEl = document.getElementById('modal-techniques');
  const afterEl = document.getElementById('modal-aftercare');

  if (catEl) catEl.innerText = item.categoryLabel;
  if (titleEl) titleEl.innerText = item.title;
  if (durEl) durEl.innerText = item.duration;
  if (rateEl) rateEl.innerText = item.rating;
  if (revEl) revEl.innerText = `(${item.reviews})`;
  if (descEl) descEl.innerText = item.description;
  if (techEl) techEl.innerText = item.techniques;
  if (afterEl) afterEl.innerText = item.aftercare;

  // Populate Add-ons
  renderModalAddons(item);
  updateModalPriceDisplay();

  // Render Angle Reel
  renderAngleThumbnails(item);
  updateModalActiveAngle();

  // Show Modal with Animation
  const modal = document.getElementById('lookbook-modal');
  const container = document.getElementById('modal-container');
  if (modal && container) {
    modal.classList.remove('hidden');
    setTimeout(() => {
      modal.classList.remove('opacity-0');
      container.classList.remove('scale-95');
      container.classList.add('scale-100');
    }, 10);
  }

  document.body.style.overflow = 'hidden';
}

function closeLookbookModal() {
  const modal = document.getElementById('lookbook-modal');
  const container = document.getElementById('modal-container');
  if (!modal || !container) return;

  modal.classList.add('opacity-0');
  container.classList.remove('scale-100');
  container.classList.add('scale-95');

  setTimeout(() => {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }, 300);
}

function renderModalAddons(item) {
  const container = document.getElementById('modal-addons-list');
  if (!container) return;

  if (!item.addons || item.addons.length === 0) {
    container.innerHTML = '<p class="text-xs text-zinc-500 italic">No add-ons available for this look.</p>';
    return;
  }

  container.innerHTML = item.addons.map((addon, idx) => `
    <label class="flex items-center justify-between p-2.5 rounded-lg bg-obsidian-950/80 border border-white/5 hover:border-champagne-500/25 cursor-pointer transition-colors text-xs text-zinc-300">
      <div class="flex items-center space-x-2.5">
        <input type="checkbox" onchange="toggleAddon(${idx}, ${addon.price})" class="w-4 h-4 rounded text-champagne-500 bg-obsidian-900 border-zinc-700 focus:ring-0 cursor-pointer">
        <span>${addon.name}</span>
      </div>
      <span class="font-serif font-bold text-champagne-400">+$${addon.price}</span>
    </label>
  `).join('');
}

function toggleAddon(index, price) {
  if (currentSelectedAddons.has(index)) {
    currentSelectedAddons.delete(index);
    currentCalculatedTotal -= price;
  } else {
    currentSelectedAddons.add(index);
    currentCalculatedTotal += price;
  }
  updateModalPriceDisplay();
}

function updateModalPriceDisplay() {
  const priceEl = document.getElementById('modal-calculated-price');
  const ctaEl = document.getElementById('modal-book-cta-text');
  if (priceEl) priceEl.innerText = `$${currentCalculatedTotal}`;
  if (ctaEl) ctaEl.innerText = `Book This Exact Style ($${currentCalculatedTotal} Total)`;
}

function renderAngleThumbnails(item) {
  const reel = document.getElementById('modal-thumbnail-reel');
  if (!reel) return;

  reel.innerHTML = item.images.map((img, idx) => `
    <button onclick="setAngle(${idx})" class="angle-thumb-btn flex-1 min-w-[70px] sm:min-w-[80px] p-1 rounded-xl border transition-all text-left relative overflow-hidden group ${idx === activeAngleIndex ? 'border-champagne-400 bg-champagne-500/10' : 'border-white/10 hover:border-white/30'}" data-index="${idx}">
      <div class="w-full h-14 rounded-lg overflow-hidden bg-obsidian-900 mb-1">
        <img 
          src="${img.url}" 
          alt="${img.alt || img.label}" 
          onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}';"
          class="w-full h-full object-cover"
        >
      </div>
      <span class="block text-[10px] text-zinc-300 font-medium truncate">${img.label}</span>
      <span class="block text-[8px] text-champagne-400/80 truncate uppercase">${img.tag || img.label}</span>
    </button>
  `).join('');
}

function updateModalActiveAngle() {
  if (!activeModalItem) return;
  const currentAngle = activeModalItem.images[activeAngleIndex];
  const img = document.getElementById('modal-main-image');
  
  if (img && currentAngle) {
    img.classList.add('opacity-0');
    setTimeout(() => {
      img.onerror = () => {
        img.onerror = null;
        img.src = FALLBACK_IMAGE;
      };
      img.src = currentAngle.url;
      img.alt = currentAngle.alt || currentAngle.label;
      img.classList.remove('opacity-0');
    }, 150);
  }

  const labelEl = document.getElementById('modal-angle-label');
  const indexEl = document.getElementById('modal-angle-index');
  if (labelEl && currentAngle) labelEl.innerText = currentAngle.label;
  if (indexEl) indexEl.innerText = `${activeAngleIndex + 1} of ${activeModalItem.images.length}`;

  document.querySelectorAll('.angle-thumb-btn').forEach(btn => {
    const idx = parseInt(btn.getAttribute('data-index'), 10);
    if (idx === activeAngleIndex) {
      btn.className = "angle-thumb-btn flex-1 min-w-[70px] sm:min-w-[80px] p-1 rounded-xl border transition-all text-left relative overflow-hidden group border-champagne-400 bg-champagne-500/10";
    } else {
      btn.className = "angle-thumb-btn flex-1 min-w-[70px] sm:min-w-[80px] p-1 rounded-xl border transition-all text-left relative overflow-hidden group border-white/10 hover:border-white/30";
    }
  });
}

function nextAngle() {
  if (!activeModalItem || !activeModalItem.images.length) return;
  activeAngleIndex = (activeAngleIndex + 1) % activeModalItem.images.length;
  updateModalActiveAngle();
}

function prevAngle() {
  if (!activeModalItem || !activeModalItem.images.length) return;
  activeAngleIndex = (activeAngleIndex - 1 + activeModalItem.images.length) % activeModalItem.images.length;
  updateModalActiveAngle();
}

function setAngle(idx) {
  activeAngleIndex = idx;
  updateModalActiveAngle();
}

function bookFromModal() {
  if (!activeModalItem) return;
  closeLookbookModal();
  openBookingDrawer(activeModalItem, currentCalculatedTotal);
}

/* -------------------------------------------------------------------------
   7. BOOKING INQUIRY DRAWER LOGIC
   ------------------------------------------------------------------------- */
function openBookingDrawer(selectedItem = null, customTotal = null) {
  const drawer = document.getElementById('booking-drawer');
  const panel = document.getElementById('drawer-panel');
  if (!drawer || !panel) return;

  const item = selectedItem || PORTFOLIO_DATA[0] || {
    title: "Bespoke Consultation",
    heroImage: FALLBACK_IMAGE,
    startingPrice: 80,
    duration: "1h 30m"
  };

  const price = customTotal !== null ? customTotal : (item.startingPrice || 80);

  const thumbEl = document.getElementById('drawer-style-thumb');
  const titleEl = document.getElementById('drawer-style-title');
  const priceEl = document.getElementById('drawer-style-price');
  
  if (thumbEl) {
    thumbEl.onerror = () => {
      thumbEl.onerror = null;
      thumbEl.src = FALLBACK_IMAGE;
    };
    thumbEl.src = item.heroImage || item.images?.[0]?.url || FALLBACK_IMAGE;
  }
  if (titleEl) titleEl.innerText = item.title;
  if (priceEl) priceEl.innerText = `Estimated Total: $${price} (${item.duration})`;

  const dateInput = document.getElementById('client-date');
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = new Date().toISOString().split("T")[0];
    dateInput.value = tomorrow.toISOString().split("T")[0];
  }

  drawer.classList.remove('hidden');
  setTimeout(() => {
    drawer.classList.remove('opacity-0');
    panel.classList.remove('translate-x-full');
  }, 10);

  document.body.style.overflow = 'hidden';
}

function closeBookingDrawer() {
  const drawer = document.getElementById('booking-drawer');
  const panel = document.getElementById('drawer-panel');
  if (!drawer || !panel) return;

  drawer.classList.add('opacity-0');
  panel.classList.add('translate-x-full');

  setTimeout(() => {
    drawer.classList.add('hidden');
    document.body.style.overflow = '';
  }, 300);
}

function handleBookingSubmit(e) {
  e.preventDefault();
  const nameInput = document.getElementById('client-name');
  const dateInput = document.getElementById('client-date');
  const timeInput = document.getElementById('client-time');

  const name = nameInput ? nameInput.value : 'Guest';
  const date = dateInput ? dateInput.value : 'Selected Date';
  const time = timeInput ? timeInput.value : 'Selected Time';

  closeBookingDrawer();

  const code = '#ANKI-' + Math.floor(1000 + Math.random() * 9000);
  const toastTitle = document.getElementById('toast-title');
  const toastMsg = document.getElementById('toast-message');
  const toastCode = document.getElementById('toast-code');

  if (toastTitle) toastTitle.innerText = `Reservation Confirmed, ${name.split(' ')[0]}!`;
  if (toastMsg) toastMsg.innerHTML = `Your consultation is scheduled for <span class="text-zinc-100 font-medium">${date} at ${time}</span>.`;
  if (toastCode) toastCode.innerText = code;

  showToast();
  if (e.target && typeof e.target.reset === 'function') {
    e.target.reset();
  }
}

function showToast() {
  const toast = document.getElementById('booking-toast');
  if (!toast) return;
  toast.classList.remove('translate-y-[-150%]');
  toast.classList.add('translate-y-0');

  setTimeout(() => {
    hideToast();
  }, 6000);
}

function hideToast() {
  const toast = document.getElementById('booking-toast');
  if (!toast) return;
  toast.classList.remove('translate-y-0');
  toast.classList.add('translate-y-[-150%]');
}

// Global Keyboard Shortcuts
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeLookbookModal();
    closeBookingDrawer();
  } else if (e.key === 'ArrowRight') {
    const modal = document.getElementById('lookbook-modal');
    if (modal && !modal.classList.contains('hidden')) {
      nextAngle();
    }
  } else if (e.key === 'ArrowLeft') {
    const modal = document.getElementById('lookbook-modal');
    if (modal && !modal.classList.contains('hidden')) {
      prevAngle();
    }
  }
});

/* -------------------------------------------------------------------------
   8. "GOOGLE ANTIGRAVITY" MATTER.JS PHYSICS SIMULATION
   ------------------------------------------------------------------------- */
function preloadImagesForPhysics() {
  preloadedCardImages = {};
  PORTFOLIO_DATA.forEach(item => {
    const img = new Image();
    img.src = item.heroImage || FALLBACK_IMAGE;
    img.onerror = () => {
      img.onerror = null;
      img.src = FALLBACK_IMAGE;
    };
    preloadedCardImages[item.id] = img;
  });
}

function toggleAntigravity(enable) {
  if (enable) {
    startAntigravity();
  } else {
    stopAntigravity();
  }
}

function startAntigravity() {
  if (isAntigravityActive) return;
  if (typeof Matter === 'undefined') {
    console.warn('Matter.js physics engine not loaded.');
    return;
  }
  isAntigravityActive = true;

  const viewport = document.getElementById('antigravity-viewport');
  if (viewport) viewport.style.display = 'block';

  const container = document.getElementById('matter-canvas-container');
  if (!container) return;
  container.innerHTML = '';

  const width = window.innerWidth;
  const height = window.innerHeight;

  const Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Bodies = Matter.Bodies,
        Composite = Matter.Composite,
        Mouse = Matter.Mouse,
        MouseConstraint = Matter.MouseConstraint;

  physicsEngine = Engine.create({
    gravity: {
      x: 0,
      y: -0.04, // Gentle upward buoyant drift
      scale: 0.001
    }
  });

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  // Boundaries
  const wallThickness = 120;
  const ground = Bodies.rectangle(width / 2, height + wallThickness / 2, width * 2, wallThickness, { isStatic: true });
  const ceiling = Bodies.rectangle(width / 2, -wallThickness / 2, width * 2, wallThickness, { isStatic: true });
  const leftWall = Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height * 2, { isStatic: true });
  const rightWall = Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height * 2, { isStatic: true });

  Composite.add(physicsEngine.world, [ground, ceiling, leftWall, rightWall]);

  const cardWidth = Math.min(260, Math.floor(width * 0.42));
  const cardHeight = Math.min(180, Math.floor(cardWidth * 0.72));

  // Spawn cards dynamically from fetched PORTFOLIO_DATA
  const cardBodies = [];
  const itemsToSpawn = PORTFOLIO_DATA.length > 0 ? PORTFOLIO_DATA : [];

  itemsToSpawn.forEach((item, index) => {
    const cols = Math.min(3, Math.floor(width / (cardWidth + 40)));
    const col = index % (cols || 1);
    const row = Math.floor(index / (cols || 1));

    const startX = (width / (cols + 1)) * (col + 1) + (Math.random() * 40 - 20);
    const startY = height - 140 - (row * (cardHeight + 40));

    const body = Bodies.rectangle(startX, startY, cardWidth, cardHeight, {
      restitution: 0.65,
      frictionAir: 0.025,
      chamfer: { radius: 16 },
      label: 'portfolioCard',
      portfolioId: item.id,
      portfolioData: item
    });

    Matter.Body.setVelocity(body, {
      x: (Math.random() - 0.5) * 4,
      y: -Math.random() * 6 - 2
    });

    cardBodies.push(body);
  });

  Composite.add(physicsEngine.world, cardBodies);
  spawnCosmeticParticles(8);

  const mouse = Mouse.create(canvas);
  const mouseConstraint = MouseConstraint.create(physicsEngine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2,
      render: { visible: false }
    }
  });
  Composite.add(physicsEngine.world, mouseConstraint);

  let dragStartPos = null;
  Matter.Events.on(mouseConstraint, 'startdrag', function(event) {
    dragStartPos = { x: mouse.position.x, y: mouse.position.y };
  });

  Matter.Events.on(mouseConstraint, 'enddrag', function(event) {
    if (!dragStartPos) return;
    const dx = mouse.position.x - dragStartPos.x;
    const dy = mouse.position.y - dragStartPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 8 && event.body && event.body.portfolioId) {
      openLookbookModal(event.body.portfolioId);
    }
  });

  function renderLoop() {
    if (!isAntigravityActive) return;

    Engine.update(physicsEngine, 1000 / 60);

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(7, 7, 9, 0.75)';
    ctx.fillRect(0, 0, width, height);

    const mx = mouse.position.x;
    const my = mouse.position.y;
    const grad = ctx.createRadialGradient(mx, my, 0, mx, my, 180);
    grad.addColorStop(0, 'rgba(226, 177, 137, 0.1)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    const bodies = Composite.allBodies(physicsEngine.world);
    bodies.forEach(body => {
      if (body.isStatic) return;

      ctx.save();
      ctx.translate(body.position.x, body.position.y);
      ctx.rotate(body.angle);

      if (body.label === 'portfolioCard') {
        drawPhysicsCard(ctx, body, cardWidth, cardHeight);
      } else if (body.label === 'crystal') {
        drawPhysicsCrystal(ctx, body);
      } else if (body.label === 'cosmetic') {
        drawPhysicsCosmetic(ctx, body);
      }

      ctx.restore();
    });

    requestAnimationFrame(renderLoop);
  }

  requestAnimationFrame(renderLoop);
}

function drawPhysicsCard(ctx, body, w, h) {
  const item = body.portfolioData;
  const hw = w / 2;
  const hh = h / 2;

  ctx.beginPath();
  roundRect(ctx, -hw, -hh, w, h, 14);
  ctx.fillStyle = 'rgba(23, 23, 29, 0.95)';
  ctx.fill();

  ctx.strokeStyle = 'rgba(226, 177, 137, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const thumbW = 75;
  const thumbH = h - 16;
  ctx.save();
  ctx.beginPath();
  roundRect(ctx, -hw + 8, -hh + 8, thumbW, thumbH, 10);
  ctx.clip();

  const img = preloadedCardImages[item.id];
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, -hw + 8, -hh + 8, thumbW, thumbH);
  } else {
    ctx.fillStyle = '#17171d';
    ctx.fillRect(-hw + 8, -hh + 8, thumbW, thumbH);
  }
  ctx.restore();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.stroke();

  const textX = -hw + thumbW + 18;

  ctx.fillStyle = '#e2b189';
  ctx.font = '600 9px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(item.categoryLabel.toUpperCase(), textX, -hh + 24);

  ctx.fillStyle = '#f4f4f5';
  ctx.font = '500 13px "Cormorant Garamond", serif';
  const shortTitle = item.title.length > 18 ? item.title.substring(0, 16) + '...' : item.title;
  ctx.fillText(shortTitle, textX, -hh + 44);

  ctx.fillStyle = '#f3d5ba';
  ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`${item.price}`, textX, -hh + 66);

  ctx.fillStyle = '#71717a';
  ctx.font = '9px "Plus Jakarta Sans", sans-serif';
  const angleText = item.images ? `${item.images.length} Angles • Tap to view` : `Tap to view`;
  ctx.fillText(angleText, textX, -hh + 86);
}

function drawPhysicsCrystal(ctx, body) {
  ctx.beginPath();
  ctx.arc(0, 0, body.circleRadius || 14, 0, Math.PI * 2);
  ctx.fillStyle = body.crystalColor || 'rgba(243, 213, 186, 0.8)';
  ctx.shadowColor = '#e2b189';
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawPhysicsCosmetic(ctx, body) {
  ctx.fillStyle = '#1a1a24';
  ctx.fillRect(-8, -14, 16, 28);
  ctx.strokeStyle = '#e2b189';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(-8, -14, 16, 28);

  ctx.fillStyle = '#e2b189';
  ctx.fillRect(-8, -2, 16, 4);

  ctx.fillStyle = '#d98b77';
  ctx.beginPath();
  ctx.moveTo(-6, -14);
  ctx.lineTo(6, -14);
  ctx.lineTo(3, -22);
  ctx.lineTo(-6, -14);
  ctx.fill();
}

function spawnCosmeticParticles(count = 5) {
  if (!physicsEngine || !isAntigravityActive) return;

  const Bodies = Matter.Bodies,
        Composite = Matter.Composite;

  const width = window.innerWidth;
  const height = window.innerHeight;

  const charms = [];
  for (let i = 0; i < count; i++) {
    const x = Math.random() * (width - 100) + 50;
    const y = Math.random() * 200 + 50;

    if (Math.random() > 0.5) {
      const crystal = Bodies.circle(x, y, 12 + Math.random() * 6, {
        restitution: 0.85,
        frictionAir: 0.02,
        label: 'crystal',
        crystalColor: Math.random() > 0.5 ? 'rgba(226, 177, 137, 0.85)' : 'rgba(244, 200, 184, 0.85)'
      });
      Matter.Body.setVelocity(crystal, { x: (Math.random() - 0.5) * 5, y: -Math.random() * 4 });
      charms.push(crystal);
    } else {
      const cosmetic = Bodies.rectangle(x, y, 20, 36, {
        restitution: 0.7,
        frictionAir: 0.02,
        chamfer: { radius: 4 },
        label: 'cosmetic'
      });
      Matter.Body.setVelocity(cosmetic, { x: (Math.random() - 0.5) * 5, y: -Math.random() * 4 });
      charms.push(cosmetic);
    }
  }

  Composite.add(physicsEngine.world, charms);
}

function stopAntigravity() {
  if (!isAntigravityActive) return;
  isAntigravityActive = false;

  const viewport = document.getElementById('antigravity-viewport');
  if (viewport) viewport.style.display = 'none';

  if (physicsEngine) {
    Matter.Composite.clear(physicsEngine.world, false);
    Matter.Engine.clear(physicsEngine);
    physicsEngine = null;
  }

  const container = document.getElementById('matter-canvas-container');
  if (container) container.innerHTML = '';
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
}

/* -------------------------------------------------------------------------
   9. INITIALIZATION ON DOM READY
   ------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  loadPortfolioData();
});
