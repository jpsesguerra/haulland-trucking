# Haulland Trucking — Website Migration & SEO/AEO Summary

## The Migration: Webflow → Self-Hosted Static HTML

### What Webflow Was Doing (and Costing)
Webflow is a hosted website builder — you're renting the platform, the hosting, and the CMS. Every month, the site depends on Webflow's servers, Webflow's CDN, and Webflow's export limitations. You have limited control over server configuration, redirects, caching headers, and file structure. The exported code is also bloated with Webflow-specific classes and JavaScript that slow page load.

### What We Built Instead
A clean, self-hosted static HTML/CSS/JS site on Hostinger with assets on Cloudinary's CDN. No platform dependency. No monthly SaaS fee for the site itself. Full control over every file, every redirect, every meta tag, and every structured data block.

### Performance Gains From This Switch
- No Webflow JS runtime loading on every page
- Images served from Cloudinary's global CDN with automatic format optimization (`f_auto`, `q_auto`) — the right format and quality per device, automatically
- Responsive images via URL-based transforms (`w_500`, `w_800`) instead of hosting 5 copies of every photo
- Videos served from Cloudinary, not the web server
- Clean, minimal HTML that loads fast on mobile

---

## SEO Work — What We Implemented

### 1. Page Titles & Meta Descriptions (All 8 Pages)
Rewrote every title and description with location-targeted keywords for Hamilton and surrounding area. These are what appear in Google search results.

```
Before: "Bin Rentals | Haulland"
After:  "Bin Rentals Hamilton ON | Roll-Off Bins | Haulland Trucking"
```

Every description includes the phone number, primary service keyword, and a city name — all signals Google uses to match local search intent.

### 2. Canonical Tags (All 8 Pages)
```html
<link rel="canonical" href="https://www.haullandtrucking.com/bin-rentals">
```
Tells Google which version of a URL is the "official" one. Prevents duplicate content penalties from `www` vs non-`www`, `http` vs `https`, or `.html` vs clean URL variations all being treated as separate pages.

### 3. Clean URL Structure + 301 Redirects
The `.htaccess` file does two things:
- Forces HTTPS and `www` (one consistent canonical domain)
- 301-redirects any `.html` URL to the clean version (`/bin-rentals.html` → `/bin-rentals`)

301 is a "permanent" redirect — it transfers 100% of Google's ranking credit (link equity) from the old URL to the new one. No SEO value is lost in the transition from Webflow.

### 4. Sitemap.xml
```xml
<url>
  <loc>https://www.haullandtrucking.com/bin-rentals</loc>
  <priority>0.9</priority>
</url>
```
A machine-readable map of every page on the site submitted directly to Google via Search Console. Tells Google what exists, how important each page is relative to others, and how often to check for changes. Service pages are set to `0.9` (high priority), homepage at `1.0`, Contact at `0.6`.

### 5. Robots.txt
```
User-agent: *
Allow: /
Sitemap: https://www.haullandtrucking.com/sitemap.xml
```
Signals to every search engine crawler: index everything, and here's where to find the sitemap. Simple but required.

### 6. OG / Social Meta Tags (All 8 Pages)
```html
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:url" content="...">
<meta name="twitter:card" content="summary_large_image">
```
Controls how the site appears when shared on Facebook, LinkedIn, iMessage, Slack, etc. Without these, social platforms guess — usually pulling the wrong image or wrong text.

---

## Schema Markup — The AEO Layer

This is the most significant behind-the-scenes work and where the site pulls ahead of most local competitors. Schema markup (also called structured data) is code that speaks directly to search engines and AI systems in a language they understand natively — not inferred from reading the page text, but explicitly declared.

### What is AEO?
**Answer Engine Optimization** — optimizing for AI-powered search (Google's AI Overviews, ChatGPT, Perplexity, Bing Copilot). These systems don't just rank pages — they extract structured answers. Schema is how you get included in those answers without necessarily being the #1 ranked result.

---

### Schema Block 1 — LocalBusiness (On Every Page)

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Haulland Trucking Inc.",
  "telephone": "+12897688710",
  "email": "mike@haullandtrucking.com",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Hamilton",
    "addressRegion": "ON",
    "addressCountry": "CA"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 43.2557,
    "longitude": -79.8711
  },
  "openingHoursSpecification": [
    {
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
      "opens": "08:00",
      "closes": "17:00"
    }
  ],
  "areaServed": ["Hamilton","Burlington","Brantford","Stoney Creek","Oakville",
    "Milton","Cambridge","Smithville","Mississauga","St. Catharines",
    "Kitchener","Fonthill","Port Dover","Toronto","Niagara Falls","Woodstock"],
  "hasOfferCatalog": {
    "itemListElement": [
      "Gravel, Aggregate, Soil & Clean Fill Delivery",
      "Dirt, Rubble & Snow Removal",
      "Roll-Off Bin Rentals",
      "Contractor Yard Supply",
      "Excavation Partner Services"
    ]
  },
  "sameAs": [
    "https://www.facebook.com/haullandtrucking",
    "https://www.instagram.com/haullandtrucking/"
  ]
}
```

**What this does:**
- Tells Google this is a real local business with a verifiable address, phone, and hours
- The `geo` coordinates tie the business to a specific map location — critical for Google Maps and local pack rankings
- `areaServed` with 16 cities tells Google every city this business serves — without those cities even needing to appear in the visible page text
- `sameAs` links to social profiles help Google verify the business is legitimate and connect the website to the Google Business Profile
- This block on every page means every page reinforces the local business signal, not just the homepage

---

### Schema Block 2 — Service Schemas (On Service Pages)

Added page-specific `@type: Service` blocks on the three highest-value service pages: Bin Rentals, Aggregate/Gravel Delivery, and Dirt/Rubble Removal.

**Example — Bin Rentals:**
```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Roll-Off Bin Rental",
  "name": "Bin Rentals Hamilton — Haulland Trucking",
  "description": "Roll-off bin rentals for construction, excavation, and landscape projects in Hamilton and surrounding area.",
  "provider": {
    "@type": "LocalBusiness",
    "name": "Haulland Trucking Inc.",
    "telephone": "+12897688710"
  },
  "areaServed": {"@type": "City", "name": "Hamilton"},
  "hasOfferCatalog": {
    "itemListElement": [
      "6 Yard Clean Fill Mini Bin",
      "16 Yard Clean Fill Roll-Off Bin",
      "20 Yard Clean Fill Roll-Off Bin",
      "6 Yard Rubble/Asphalt Mini Bin",
      "16 Yard Rubble/Asphalt Roll-Off Bin",
      "20 Yard Rubble/Asphalt Roll-Off Bin",
      "Garbage Bin Rentals"
    ]
  }
}
```

**What this does:**
- When someone asks Google or an AI "who rents 20-yard bins in Hamilton" — this schema gives the exact answer without the engine having to read and interpret the page
- The offer catalog creates a direct match between the search query and a declared service item
- AI systems like Google's AI Overviews pull directly from structured data to build their answer cards — this is how you get featured without being the #1 ranked result

---

## The Combined Effect

| Signal | What Google Sees |
|---|---|
| Title + Meta | Keyword-targeted page for Hamilton |
| Canonical | One authoritative URL, no duplicates |
| LocalBusiness Schema | Verified local business, 16 service cities, exact coordinates |
| Service Schema | Specific services with named offerings per page |
| Sitemap | All 8 pages confirmed, priorities set |
| Clean URLs + 301s | No broken links, full ranking credit preserved from Webflow |
| Cloudinary CDN | Fast load times — a direct ranking factor |
| GA4 | Behavioral data feeding back into rankings over time |

---

## Competitive Advantage

Most local competitors in Hamilton — trucking companies, landscapers, bin rental services — have either no schema at all or only basic title/description tags. The structured data layer here, especially the `areaServed` with 16 cities and the service offer catalogs, positions this site to appear in:

- **Local pack / Google Maps results** — driven by geo coordinates and areaServed
- **AI Overviews** — driven by Service schema with explicit offer catalogs
- **Voice search answers** — driven by structured hours, phone, and service declarations
- **Perplexity / ChatGPT / Bing Copilot answers** — driven by LocalBusiness schema that AI crawlers index directly

The Webflow site had none of this. It was a visually designed site with no machine-readable signals beyond the page title. This build is designed to be understood by both humans and machines.

---

## Next Steps to Activate

1. **Google Search Console** — Submit `https://www.haullandtrucking.com/sitemap.xml` under Sitemaps
2. **Request indexing** — Use URL Inspection on the homepage and each service page, click "Request Indexing"
3. **Clean up `.html` URLs** — The `.htaccess` 301 redirects are in place; request re-indexing on the `.html` versions so Google drops them from the index
4. **Google Business Profile** — Ensure the website URL on the GBP listing is updated to `https://www.haullandtrucking.com` to connect the schema's `sameAs` signal
5. **Schema validation** — Run each page through [Google's Rich Results Test](https://search.google.com/test/rich-results) to confirm all structured data is being read correctly
