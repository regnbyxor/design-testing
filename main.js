const FILES = [
  'MM-THERM-LEAK-001.json',
  'MM-ACOUSTIC-LEAK-002.json',
  'MM-THERM-ELEC-003.json',
  'MM-BEARING-CORR-004.json',
  'MM-STEAMTRAP-EFF-005.json'
  'neta_100_18_thermographic_measurement_method.json',
];

const BASE = 'Measurement Methods/';

const select      = document.getElementById('mm-select');
const tableWrapper = document.getElementById('table-wrapper');
const tbody       = document.getElementById('mm-tbody');
const placeholder = document.getElementById('placeholder');

// Populate dropdown
FILES.forEach(file => {
  const opt = document.createElement('option');
  opt.value = file;
  opt.textContent = file.replace('.json', '');
  select.appendChild(opt);
});

select.addEventListener('change', () => {
  const file = select.value;
  if (!file) {
    tableWrapper.hidden = true;
    placeholder.hidden = false;
    return;
  }
  fetch(BASE + file)
    .then(r => r.json())
    .then(data => renderTable(data))
    .catch(() => {
      tbody.innerHTML = '<tr><td colspan="2">Failed to load file.</td></tr>';
      tableWrapper.hidden = false;
      placeholder.hidden = true;
    });
});

function tagList(items) {
  if (!items || items.length === 0) return '—';
  const div = document.createElement('div');
  div.className = 'tag-list';
  items.forEach(item => {
    const span = document.createElement('span');
    span.className = 'tag';
    span.textContent = item;
    div.appendChild(span);
  });
  return div;
}

function measurementsTable(measurements) {
  if (!measurements || measurements.length === 0) return '—';
  const table = document.createElement('table');
  table.className = 'sub-table';
  table.innerHTML = `<thead><tr>
    <th>Name</th><th>Type</th><th>Unit</th><th>Source</th>
  </tr></thead>`;
  const tb = document.createElement('tbody');
  measurements.forEach(m => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${m.name ?? '—'}</td>
      <td>${m.type ?? '—'}</td>
      <td>${m.unit ?? '—'}</td>
      <td>${m.source ?? '—'}</td>`;
    tb.appendChild(tr);
  });
  table.appendChild(tb);
  return table;
}

function calculationsTable(calcs) {
  if (!calcs || calcs.length === 0) return '—';
  const table = document.createElement('table');
  table.className = 'sub-table';
  table.innerHTML = `<thead><tr><th>Name</th><th>Formula</th></tr></thead>`;
  const tb = document.createElement('tbody');
  calcs.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${c.name ?? '—'}</td><td><code>${c.formula ?? '—'}</code></td>`;
    tb.appendChild(tr);
  });
  table.appendChild(tb);
  return table;
}

function outputsTable(results) {
  if (!results || results.length === 0) return '—';
  const table = document.createElement('table');
  table.className = 'sub-table';
  table.innerHTML = `<thead><tr><th>Name</th><th>Type</th><th>Unit / Values</th></tr></thead>`;
  const tb = document.createElement('tbody');
  results.forEach(r => {
    const tr = document.createElement('tr');
    let extra = '—';
    if (r.unit) {
      extra = r.unit;
    } else if (r.values) {
      const wrap = document.createElement('div');
      wrap.className = 'values-list';
      r.values.forEach(v => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.textContent = v;
        wrap.appendChild(span);
      });
      extra = wrap.outerHTML;
    }
    tr.innerHTML = `<td>${r.name ?? '—'}</td><td>${r.type ?? '—'}</td><td>${extra}</td>`;
    tb.appendChild(tr);
  });
  table.appendChild(tb);
  return table;
}

function addRow(fragment, label, value) {
  const tr = document.createElement('tr');
  const tdLabel = document.createElement('td');
  tdLabel.textContent = label;
  const tdValue = document.createElement('td');
  if (typeof value === 'string') {
    tdValue.textContent = value;
  } else {
    tdValue.appendChild(value);
  }
  tr.appendChild(tdLabel);
  tr.appendChild(tdValue);
  fragment.appendChild(tr);
}

function addSection(fragment, title) {
  const tr = document.createElement('tr');
  tr.className = 'section-header';
  tr.innerHTML = `<td colspan="2">${title}</td>`;
  fragment.appendChild(tr);
}

function renderTable(data) {
  const frag = document.createDocumentFragment();

  // Overview
  addSection(frag, 'Overview');
  addRow(frag, 'ID',          data.id ?? '—');
  addRow(frag, 'Name',        data.name ?? '—');
  addRow(frag, 'Description', data.description ?? '—');

  // Failure modes
  addSection(frag, 'Failure Modes');
  addRow(frag, 'Failure Modes', tagList(data.failure_modes));

  // Inputs
  addSection(frag, 'Inputs');
  addRow(frag, 'Tools',        tagList(data.inputs?.tools));
  addRow(frag, 'Measurements', measurementsTable(data.inputs?.measurements));

  // Processing
  addSection(frag, 'Processing');
  addRow(frag, 'Calculations', calculationsTable(data.processing?.calculations));
  addRow(frag, 'Logic',        tagList(data.processing?.logic));

  // Outputs
  addSection(frag, 'Outputs');
  addRow(frag, 'Results', outputsTable(data.outputs?.results));

  tbody.innerHTML = '';
  tbody.appendChild(frag);
  tableWrapper.hidden = false;
  placeholder.hidden = true;
}
