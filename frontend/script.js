const API = 'http://localhost:3000/api/workouts';
const LS_KEY = 'fittrack_workouts';

let workouts = [];
let useBackend = false;
let chart = null;

// ── Boot ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('date').valueAsDate = new Date();
  document.getElementById('workoutForm').addEventListener('submit', handleSubmit);
  document.getElementById('searchInput').addEventListener('input', renderTable);
  document.getElementById('chartExercise').addEventListener('change', renderChart);
  loadWorkouts();
});

// ── Data layer ──────────────────────────────────────────────────
async function loadWorkouts() {
  try {
    const res = await fetch(API, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error();
    workouts = await res.json();
    useBackend = true;
    setMode(true);
  } catch {
    useBackend = false;
    setMode(false);
    workouts = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  }
  render();
}

async function saveWorkout(data) {
  if (useBackend) {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  } else {
    const workout = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      ...data,
      createdAt: new Date().toISOString(),
    };
    workouts.unshift(workout);
    localStorage.setItem(LS_KEY, JSON.stringify(workouts));
    return workout;
  }
}

async function removeWorkout(id) {
  if (useBackend) {
    await fetch(`${API}/${id}`, { method: 'DELETE' });
  }
  workouts = workouts.filter((w) => w.id !== id);
  if (!useBackend) localStorage.setItem(LS_KEY, JSON.stringify(workouts));
}

// ── Form ────────────────────────────────────────────────────────
async function handleSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.textContent = 'Saving…';

  const data = {
    exercise: document.getElementById('exercise').value.trim(),
    category: document.getElementById('category').value,
    sets: Number(document.getElementById('sets').value),
    reps: Number(document.getElementById('reps').value),
    weight: Number(document.getElementById('weight').value),
    date: document.getElementById('date').value,
    notes: document.getElementById('notes').value.trim(),
  };

  try {
    const workout = await saveWorkout(data);
    if (useBackend) workouts.unshift(workout);
    render();
    e.target.reset();
    document.getElementById('date').valueAsDate = new Date();
  } catch (err) {
    alert('Failed to save workout. ' + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = `
      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
        <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
      </svg>
      Log Workout`;
  }
}

async function handleDelete(id) {
  await removeWorkout(id);
  render();
}

// ── Render ──────────────────────────────────────────────────────
function render() {
  renderStats();
  renderTable();
  populateExerciseFilter();
  renderChart();
}

function renderStats() {
  const total = workouts.length;
  const week = workouts.filter((w) => isThisWeek(w.date)).length;
  const volume = workouts.reduce((s, w) => s + w.sets * w.reps * w.weight, 0);
  const exercises = new Set(workouts.map((w) => w.exercise)).size;

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-week').textContent = week;
  document.getElementById('stat-volume').textContent = fmtVolume(volume);
  document.getElementById('stat-exercises').textContent = exercises;
}

function renderTable() {
  const q = document.getElementById('searchInput').value.toLowerCase().trim();
  const filtered = q
    ? workouts.filter(
        (w) =>
          w.exercise.toLowerCase().includes(q) ||
          w.category.toLowerCase().includes(q)
      )
    : workouts;

  const tbody = document.getElementById('workoutTableBody');

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-row">${
      q ? 'No workouts match your search.' : 'No workouts yet — log your first set above!'
    }</td></tr>`;
    return;
  }

  // Personal bests per exercise (max weight)
  const pbs = {};
  workouts.forEach((w) => {
    if (!pbs[w.exercise] || w.weight > pbs[w.exercise]) pbs[w.exercise] = w.weight;
  });

  tbody.innerHTML = filtered
    .map((w) => {
      const isPR = w.weight > 0 && w.weight === pbs[w.exercise];
      const volume = w.sets * w.reps * w.weight;
      const catClass = 'cat-' + w.category.toLowerCase().replace(/\s+/g, '-');
      return `
        <tr>
          <td class="date-cell">${fmtDate(w.date)}</td>
          <td>
            <span class="exercise-name">${escHtml(w.exercise)}</span>
            ${isPR ? '<span class="pr-badge">PR</span>' : ''}
            ${w.notes ? `<br><span class="notes-cell" title="${escHtml(w.notes)}">${escHtml(w.notes)}</span>` : ''}
          </td>
          <td><span class="cat-badge ${catClass}">${escHtml(w.category)}</span></td>
          <td class="num-cell">${w.sets} × ${w.reps}</td>
          <td class="num-cell">${w.weight} kg</td>
          <td class="num-cell">${fmtVolume(volume)}</td>
          <td><button class="delete-btn" onclick="handleDelete('${w.id}')" aria-label="Delete workout">✕</button></td>
        </tr>`;
    })
    .join('');
}

function populateExerciseFilter() {
  const sel = document.getElementById('chartExercise');
  const current = sel.value;
  const names = [...new Set(workouts.map((w) => w.exercise))].sort();

  sel.innerHTML =
    '<option value="">All exercises (weekly)</option>' +
    names.map((n) => `<option value="${escHtml(n)}">${escHtml(n)}</option>`).join('');

  if (names.includes(current)) sel.value = current;
}

// ── Chart ────────────────────────────────────────────────────────
function renderChart() {
  if (chart) { chart.destroy(); chart = null; }

  const ctx = document.getElementById('progressChart').getContext('2d');
  const sel = document.getElementById('chartExercise').value;

  if (sel) {
    // Line chart: max weight per date for selected exercise
    document.getElementById('chartSub').textContent = `Max weight over time · ${sel}`;

    const byDate = {};
    workouts
      .filter((w) => w.exercise === sel)
      .forEach((w) => {
        if (!byDate[w.date] || w.weight > byDate[w.date]) byDate[w.date] = w.weight;
      });

    const entries = Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b));

    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: entries.map(([d]) => fmtDate(d)),
        datasets: [{
          label: 'Max weight (kg)',
          data: entries.map(([, v]) => v),
          borderColor: '#4ade80',
          backgroundColor: 'rgba(74,222,128,0.07)',
          borderWidth: 2.5,
          pointBackgroundColor: '#4ade80',
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.35,
          fill: true,
        }],
      },
      options: chartOpts({ yLabel: 'kg', beginAtZero: false }),
    });
  } else {
    // Bar chart: workouts per week (last 10 weeks)
    document.getElementById('chartSub').textContent = 'Workouts logged per week';

    const weeks = buildWeekBuckets(10);
    workouts.forEach((w) => {
      const key = weekKey(w.date);
      if (weeks[key] !== undefined) weeks[key]++;
    });

    const entries = Object.entries(weeks);
    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: entries.map(([k]) => k),
        datasets: [{
          label: 'Workouts',
          data: entries.map(([, v]) => v),
          backgroundColor: 'rgba(74,222,128,0.45)',
          borderColor: '#4ade80',
          borderWidth: 1.5,
          borderRadius: 5,
        }],
      },
      options: chartOpts({ yLabel: 'count', beginAtZero: true, stepSize: 1 }),
    });
  }
}

function chartOpts({ yLabel, beginAtZero, stepSize } = {}) {
  const gridColor = '#1a1a24';
  const tickColor = '#55556a';
  const font = { family: 'Inter', size: 11 };

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#6b6b80', font } },
      tooltip: {
        backgroundColor: '#1a1a24',
        titleColor: '#e8e8f0',
        bodyColor: '#9a9ab0',
        borderColor: '#2a2a3a',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: tickColor, font, maxRotation: 40 },
        grid: { color: gridColor },
      },
      y: {
        title: yLabel ? { display: true, text: yLabel, color: '#55556a', font } : undefined,
        ticks: { color: tickColor, font, ...(stepSize ? { stepSize } : {}) },
        grid: { color: gridColor },
        beginAtZero: beginAtZero ?? true,
      },
    },
  };
}

// ── Helpers ──────────────────────────────────────────────────────
function isThisWeek(dateStr) {
  const now = new Date();
  const day = now.getDay() || 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + 1);
  monday.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  return d >= monday && d <= now;
}

function fmtDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtVolume(kg) {
  if (kg === 0) return '0 kg';
  if (kg >= 1000) return (kg / 1000).toFixed(1) + ' t';
  return kg.toLocaleString() + ' kg';
}

function weekKey(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function buildWeekBuckets(n) {
  const buckets = {};
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    buckets[weekKey(d.toISOString().slice(0, 10))] = 0;
  }
  return buckets;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function setMode(online) {
  const pill = document.getElementById('modePill');
  document.getElementById('modeLabel').textContent = online ? 'API connected' : 'Offline mode';
  pill.classList.toggle('online', online);
  pill.classList.toggle('offline', !online);
  document.getElementById('offlineBanner').classList.toggle('hidden', online);
}
