# Aquapolis Athens — Scrollytelling Redesign 🌊

Δυναμικό, αφηγηματικό redesign για το [aquapolis.gr](https://aquapolis.gr) — στατικό site χωρίς εξωτερικές βιβλιοθήκες (vanilla HTML/CSS/JS). Το scroll **είναι** η διαδρομή: μια τεράστια SVG νεροτσουλήθρα σχεδιάζεται όσο κατεβαίνεις τη σελίδα.

## Η ιστορία (5 κεφάλαια)

| Κεφάλαιο | Σκηνή | Scroll effect |
|---|---|---|
| 01 · Ο Πύργος | Ανέβασμα στα 22μ | Οι πλατφόρμες «ανάβουν» από κάτω προς τα πάνω, σημαία στην κορυφή |
| 02 · Η Πτώση | Pinned σκηνή 300vh | Speedometer 0→45 km/h, badge υψομέτρου 22μ→0μ, γραμμές ταχύτητας, αφηγηματικά callouts («Κρατήσου…», «SPLASH!») |
| 03 · Οι Διαδρομές | Κάρτες attractions | Το μονοπάτι-τσουλήθρα περνάει ανάμεσα από τις κάρτες |
| 04 · Το Splash | Παιδικός κόσμος | Splash burst (ακτίνες + σταγόνες) με elastic overshoot, morphing blob mask |
| 05 · Το Κύμα | Gallery + χαλάρωση | Τρία στρώματα κυμάτων κινούνται με διαφορετικές ταχύτητες |

## Τα δυναμικά shapes της διαδρομής

- **SVG slide path** που «φιδώνει» σε όλο το story, χτίζεται δυναμικά ώστε να περνά από κάθε κεφάλαιο (ξαναχτίζεται σε resize) και **σχεδιάζεται προοδευτικά με το scroll** (stroke-dashoffset)
- **Rider-σαμπρέλα** που ταξιδεύει πάνω στο μονοπάτι (`getPointAtLength`) με περιστροφή κατά την εφαπτομένη και ουρά από σταγόνες
- **Τερματική πισίνα με splash** στο τέλος της διαδρομής
- **Altitude HUD** (σταθερός μετρητής 22μ→0μ) που ακολουθεί τη συνολική πρόοδο
- Ghost αριθμοί κεφαλαίων, hero με crossfading videos, φυσαλίδες, marquee, counters, 3D tilt, lightbox gallery, animated wave dividers

## Δομή

```
index.html        — markup της ιστορίας (ελληνικά)
css/style.css     — design system + animations
js/main.js        — scroll engine + path builder (vanilla, χωρίς dependencies)
assets/video/     — συμπιεσμένα MP4 (720p, χωρίς ήχο)
assets/img/       — βελτιστοποιημένες φωτογραφίες + posters
```

## Τοπική προβολή

```bash
python3 -m http.server 8000
# άνοιξε http://localhost:8000
```

Πλήρως responsive· με `prefers-reduced-motion` όλα τα σχήματα εμφανίζονται στην τελική τους κατάσταση χωρίς κίνηση.

> Οι τιμές εισιτηρίων και τα στοιχεία επικοινωνίας είναι ενδεικτικά placeholder για το concept.
