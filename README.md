# Aquapolis Athens — Redesign Concept 🌊

Δυναμικό redesign για το [aquapolis.gr](https://aquapolis.gr) — στατικό site χωρίς εξωτερικές βιβλιοθήκες (vanilla HTML/CSS/JS).

## Δυναμικά στοιχεία

- **Fullscreen hero με video background** — δύο πλάνα από το πάρκο εναλλάσσονται με crossfade κάθε 9″
- **Animated preloader** με κύμα που "σχεδιάζεται"
- **Φυσαλίδες** που ανεβαίνουν πάνω από το hero video
- **Staggered τίτλοι** που "αναδύονται" γραμμή-γραμμή
- **Sticky glass navbar** που αλλάζει μορφή στο scroll
- **Marquee ticker** με τις ζώνες του πάρκου
- **Animated counters** στα στατιστικά (ενεργοποιούνται στο scroll)
- **3D tilt** στις κάρτες attractions/εισιτηρίων (mouse hover)
- **Parallax background** στην ενότητα του παιδικού κόσμου
- **Animated SVG wave dividers** ανάμεσα στις ενότητες
- **Lightbox gallery** με τα βίντεο και τις φωτογραφίες του πάρκου
- **Scroll-reveal animations** παντού (IntersectionObserver)
- **Animated gradient** στο CTA band
- Πλήρως responsive + σεβασμός στο `prefers-reduced-motion`

## Δομή

```
index.html        — όλο το markup (ελληνικά)
css/style.css     — design system + animations
js/main.js        — interactions (vanilla JS, χωρίς dependencies)
assets/video/     — συμπιεσμένα MP4 (720p, χωρίς ήχο) για web
assets/img/       — βελτιστοποιημένες φωτογραφίες + posters
```

## Τοπική προβολή

```bash
python3 -m http.server 8000
# άνοιξε http://localhost:8000
```

> Οι τιμές εισιτηρίων και τα στοιχεία επικοινωνίας είναι ενδεικτικά placeholder για το concept.
