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

## Quickstart (Local Preview + GitHub Pages)

- Data: `/data/parcels.csv`, `/data/land.csv`, `/data/buildings.csv`, `/data/nhdra.csv`
- Docs/UI: `/docs/index.html` (table + summary), `/docs/js/app.js`

### Local preview
1. Open `docs/index.html` in a browser **OR** serve locally:
   - PowerShell: `cd .\docs; python -m http.server 8080`
   - Visit http://localhost:8080

### Publish (GitHub Pages)
1. Repo Settings → Pages → **Branch** = `main`, **Folder** = `/docs`.
2. Your site will publish at: `https://<your-username>.github.io/<repo>/`

### Data assumptions
- `parcels.csv` has: `parcel_id`, `situs_address`, `owner_name`, `lot_size_acres`, `land_value`, `building_value`, `total_value`, `class_code`.
- `buildings.csv` has: `parcel_id`, `bld_year_built`, `bld_effective_year_built`, `vns_gla`, `bld_grade`, `bld_condition`.
- `land.csv` has: `parcel_id`, optional `lnd_site_index`, `lnd_pricing_code`, `lnd_assess_val`.
- `nhdra.csv` is optional context.

