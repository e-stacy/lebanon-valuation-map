# Lebanon Valuation Map (Heat Map of Over/Under-Assessment)

This repository scaffolds a public, map-based analysis of **assessment-to-sale ratios (ASR)** for the City of Lebanon, NH. It loads **parcel geometry** and **tabular datasets** to compute and visualize over/under-valuation by parcel and neighborhood.

## Folder Structure
lebanon-valuation-map/
+-- data/
¦   +-- parcels.geojson
¦   +-- assessing.csv
¦   +-- sales.csv
+-- map/
¦   +-- index.html
¦   +-- app.js
¦   +-- style.css
+-- docs/
¦   +-- methodology.md
¦   +-- data_dictionary.md
+-- LICENSE
+-- .gitignore

## Quick Start
1) Put your real files in `data/` (parcels.geojson, assessing.csv, sales.csv).
2) Open `map/index.html` locally to preview.
3) Push to GitHub, then enable **Pages** (Settings ? Pages ? Deploy from branch ? `/map`).
