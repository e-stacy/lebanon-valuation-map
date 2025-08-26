const map = L.map('map').setView([43.6427, -72.2518], 13); // Lebanon, NH approx

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Load CSVs (assessing + sales), then GeoJSON
let assessing = new Map();
let sales = new Map(); // most recent valid sale per parcel

function parseAssessing(results) {
  for (const row of results.data) {
    const id = (row.parcel_id || '').trim();
    if (!id) continue;
    assessing.set(id, {
      assessed_value: parseFloat(row.assessed_value || 0),
      neighborhood: row.neighborhood || '',
      class: row.class || ''
    });
  }
}

function parseSales(results) {
  for (const row of results.data) {
    const id = (row.parcel_id || '').trim();
    if (!id) continue;
    const arms = (row.arms_length || '1').toString().trim();
    if (arms !== '1') continue;
    const price = parseFloat(row.sale_price || 0);
    const date = row.sale_date || '';
    if (!sales.has(id)) {
      sales.set(id, { sale_price: price, sale_date: date });
    } else {
      const prev = sales.get(id);
      if (date && (!prev.sale_date || date > prev.sale_date)) {
        sales.set(id, { sale_price: price, sale_date: date });
      }
    }
  }
}

function colorScale(diff) {
  // diff = (assessed/sale) - 1.0  -> diverging scale
  if (diff === null || isNaN(diff)) return '#cccccc';
  if (diff < -0.30) return '#08306b';
  if (diff < -0.20) return '#2171b5';
  if (diff < -0.10) return '#6baed6';
  if (diff < -0.05) return '#9ecae1';
  if (diff < 0.05) return '#f7f7f7';
  if (diff < 0.10) return '#fcbba1';
  if (diff < 0.20) return '#fb6a4a';
  if (diff < 0.30) return '#cb181d';
  return '#99000d';
}

function styleFeature(f) {
  const id = (f.properties.parcel_id || '').trim();
  let ratio = null;
  if (assessing.has(id) && sales.has(id)) {
    const a = assessing.get(id).assessed_value;
    const s = sales.get(id).sale_price;
    if (a > 0 && s > 0) ratio = (a / s) - 1.0;
  }
  return {
    weight: 0.3,
    color: '#666',
    fillOpacity: 0.8,
    fillColor: colorScale(ratio)
  };
}

function onEachFeature(f, layer) {
  const id = (f.properties.parcel_id || '').trim();
  const a = assessing.get(id);
  const s = sales.get(id);
  const assessed = a ? a.assessed_value : null;
  const price = s ? s.sale_price : null;
  let ratio = (assessed && price) ? (assessed/price)-1.0 : null;
  const pct = (ratio===null) ? '—' : (ratio*100).toFixed(1) + '%';
  let html = `<b>Parcel:</b> ${id || '—'}<br/>`;
  html += `<b>Assessed:</b> ${assessed ? assessed.toLocaleString() : '—'}<br/>`;
  html += `<b>Sale:</b> ${price ? price.toLocaleString() : '—'}${s && s.sale_date ? ' ('+s.sale_date+')' : ''}<br/>`;
  html += `<b>? (Assessed/Sale - 1):</b> ${pct}`;
  layer.bindPopup(html);
}

function loadGeoJSON() {
  fetch('../data/parcels.geojson')
    .then(r => r.json())
    .then(geo => {
      const layer = L.geoJSON(geo, {
        style: styleFeature,
        onEachFeature
      }).addTo(map);
      map.fitBounds(layer.getBounds());
      addLegend();
    });
}

function addLegend() {
  const legend = L.control({position: 'bottomright'});
  legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'legend');
    const grades = [-999,-0.30,-0.20,-0.10,-0.05,0.05,0.10,0.20,0.30,999];
    const labels = ['Under <-30%','-30 to -20%','-20 to -10%','-10 to -5%','-5 to +5%','+5 to +10%','+10 to +20%','+20 to +30%','>+30%'];
    for (let i=1; i<grades.length; i++) {
      const val = (grades[i-1] + grades[i]) / 2;
      const diff = (i===1) ? -0.40 : (i===grades.length-1 ? 0.40 : val);
      div.innerHTML += '<i style="background:' + colorScale(diff) + '"></i> ' + labels[i-1] + '<br/>';
    }
    return div;
  };
  legend.addTo(map);
}

// Load CSVs then GeoJSON
Papa.parse('../data/assessing.csv', {
  header: true,
  download: true,
  complete: (res) => {
    parseAssessing(res);
    Papa.parse('../data/sales.csv', {
      header: true,
      download: true,
      complete: (res2) => {
        parseSales(res2);
        loadGeoJSON();
      }
    });
  }
});
