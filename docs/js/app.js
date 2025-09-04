// Minimal CSV loader + table render (no framework)
// NOTE: Works with the four files provided via the Clerk's email attachments. :contentReference[oaicite:0]{index=0}

async function loadCSV(path) {
  const resp = await fetch(path);
  const text = await resp.text();
  const [headerLine, ...lines] = text.split(/\r?\n/).filter(Boolean);
  const headers = headerLine.split(",").map(h => h.trim());
  return lines.map(line => {
    // Basic split: our seed exports don't contain quoted commas
    const cols = line.split(",").map(s => s.trim());
    const obj = {};
    headers.forEach((h, i) => obj[h] = cols[i] ?? "");
    return obj;
  });
}

// helpers
const num = v => {
  const n = Number(String(v ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : null;
};
const median = arr => {
  const s = arr.filter(x => x != null && !Number.isNaN(x)).sort((a,b)=>a-b);
  if (!s.length) return null;
  const m = Math.floor(s.length/2);
  return s.length%2 ? s[m] : (s[m-1]+s[m])/2;
};

const dataPaths = {
  parcels: "../data/parcels.csv",
  buildings: "../data/buildings.csv",
  land: "../data/land.csv"
};

const state = { rows: [], buildingsByPID: new Map(), landByPID: new Map() };

function fmtDollars(n) {
  if (n == null) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function renderTable(rows) {
  const tbody = document.querySelector("#tbl tbody");
  tbody.innerHTML = "";
  for (const r of rows) {
    const tr = document.createElement("tr");
    const td = vals => vals.map(v => {
      const td = document.createElement("td");
      td.textContent = v ?? "—";
      return td;
    });

    const b = state.buildingsByPID.get(r.parcel_id);
    const yr = b?.bld_year_built || b?.bld_effective_year_built || "";
    const gla = b?.vns_gla || b?.vns_bldg_area_effective || "";

    for (const cell of td([
      r.parcel_id, r.situs_address, r.owner_name, r.class_code,
      r.lot_size_acres ?? "", fmtDollars(r.land_value),
      fmtDollars(r.building_value), fmtDollars(r.total_value), yr, gla
    ])) tr.appendChild(cell);

    tbody.appendChild(tr);
  }
}

function updateKPIs(rows) {
  document.querySelector("#kpi-parcels").textContent = rows.length.toLocaleString();

  const totalSum = rows.reduce((s, r) => s + (r.total_value ?? 0), 0);
  document.querySelector("#kpi-total-av").textContent = totalSum.toLocaleString();

  const lots = rows.map(r => r.lot_size_acres).filter(v => v != null);
  const medLot = median(lots);
  document.querySelector("#kpi-lot").textContent = medLot != null ? medLot.toFixed(2) : "—";

  const classes = [...new Set(rows.map(r => r.class_code).filter(Boolean))];
  document.querySelector("#kpi-classes").textContent = classes.length;

  const years = rows.map(r => {
    const b = state.buildingsByPID.get(r.parcel_id);
    const y = num(b?.bld_year_built) ?? num(b?.bld_effective_year_built);
    return y ?? null;
  }).filter(v => v != null);
  document.querySelector("#kpi-yrbuilt").textContent = median(years) ?? "—";

  const glaCount = rows.filter(r => {
    const b = state.buildingsByPID.get(r.parcel_id);
    return (b?.vns_gla || b?.vns_bldg_area_effective);
  }).length;
  document.querySelector("#kpi-gla").textContent = glaCount.toLocaleString();
}

function applyFilters() {
  const q = document.querySelector("#q").value.toLowerCase();
  const cls = document.querySelector("#classFilter").value;
  let rows = state.rows;

  if (q) {
    rows = rows.filter(r =>
      (r.parcel_id||"").toLowerCase().includes(q) ||
      (r.situs_address||"").toLowerCase().includes(q) ||
      (r.owner_name||"").toLowerCase().includes(q)
    );
  }
  if (cls) rows = rows.filter(r => (r.class_code||"") === cls);

  renderTable(rows);
  updateKPIs(rows);
}

function populateClassFilter() {
  const select = document.querySelector("#classFilter");
  const classes = [...new Set(state.rows.map(r => r.class_code).filter(Boolean))].sort();
  for (const c of classes) {
    const opt = document.createElement("option");
    opt.value = c; opt.textContent = c;
    select.appendChild(opt);
  }
}

(async function init() {
  const [parcels, buildings, land] = await Promise.all([
    loadCSV(dataPaths.parcels),
    loadCSV(dataPaths.buildings),
    loadCSV(dataPaths.land),
  ]);

  for (const b of buildings) state.buildingsByPID.set(b.parcel_id, b);
  for (const l of land) state.landByPID.set(l.parcel_id, l);

  state.rows = parcels.map(p => ({
    parcel_id: p.parcel_id,
    situs_address: p.situs_address || p.rem_prcl_locn || "",
    owner_name: p.owner_name || p.rem_own_name || "",
    class_code: p.class_code || p.rem_use_code || "",
    lot_size_acres: num(p.lot_size_acres),
    land_value: num(p.land_value),
    building_value: num(p.building_value),
    total_value: num(p.total_value),
  }));

  populateClassFilter();
  renderTable(state.rows);
  updateKPIs(state.rows);

  document.querySelector("#q").addEventListener("input", applyFilters);
  document.querySelector("#classFilter").addEventListener("change", applyFilters);
})();
