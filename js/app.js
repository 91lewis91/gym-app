// ── Settings ──────────────────────────────────────────────────────────────────
let settings = Object.assign({
  setsPerPair: 3,
  restSeconds: 75,
  heightCm: 183,
  goalWeight: 90,
  calorieTarget: 2200,
  proteinTarget: 200,
  carbTarget: 200,
  fatTarget: 70
}, JSON.parse(localStorage.getItem('lgt-settings') || '{}'));

function saveSettings() {
  localStorage.setItem('lgt-settings', JSON.stringify(settings));
}

// ── State ─────────────────────────────────────────────────────────────────────
let activeWorkout = null;
let restInterval  = null;
let woInterval    = null;
let weightChart   = null;
let bfChart       = null;
let strengthChart = null;

// ── Navigation ────────────────────────────────────────────────────────────────
function navigateTo(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
  document.querySelector(`.nav-btn[data-s="${id}"]`).classList.add('active');
  if (id === 'today')    renderToday();
  if (id === 'stats')    renderStats();
  if (id === 'nutrition')renderNutrition();
  if (id === 'settings') renderSettings();
}

document.querySelectorAll('.nav-btn').forEach(b =>
  b.addEventListener('click', () => navigateTo(b.dataset.s))
);

// Stats sub-tabs
document.querySelectorAll('.sub-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.sub-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('panel-' + tab.dataset.panel).classList.add('active');
    if (tab.dataset.panel === 'charts') renderCharts();
  });
});

// ── TODAY ─────────────────────────────────────────────────────────────────────
async function renderToday() {
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  document.getElementById('greeting').textContent = greet + ', Lewis 👋';

  const next = getNextProgram();
  document.getElementById('today-name').textContent    = next.emoji + ' ' + next.name;
  document.getElementById('today-muscles').textContent = next.muscles;

  const workouts = await DB.getWorkouts();
  const week = startOfWeek();
  document.getElementById('stat-week').textContent   = workouts.filter(w => w.date >= week).length;
  document.getElementById('stat-total').textContent  = workouts.length;
  document.getElementById('stat-streak').textContent = calcStreak(workouts);

  await renderMetricsDashboard();
}

async function renderMetricsDashboard() {
  const all = await DB.getMetrics();
  const sorted = all.sort((a, b) => b.date - a.date);
  const latest = sorted[0] || null;
  const prev   = sorted[1] || null;

  const placeholder = document.getElementById('metrics-placeholder');

  if (!latest) {
    placeholder.style.display = 'block';
    return;
  }
  placeholder.style.display = 'none';

  // Weight
  setMetricTile('m-weight', latest.weight, prev?.weight, 'kg', false);

  // BMI
  const h = settings.heightCm / 100;
  const bmi = latest.weight ? +(latest.weight / (h * h)).toFixed(1) : null;
  const prevBmi = prev?.weight ? +(prev.weight / (h * h)).toFixed(1) : null;
  if (bmi) {
    const bmiEl = document.getElementById('bmi-val');
    bmiEl.textContent = bmi;
    bmiEl.className = 'metric-val ' + (bmi < 18.5 ? 'warn' : bmi < 25 ? 'good' : bmi < 30 ? 'warn' : 'bad');
    document.getElementById('bmi-label').textContent = bmiLabel(bmi);
    document.getElementById('bmi-bar-wrap').style.display = 'block';
    // Position cursor: range 15–35 = 100%
    const pct = Math.max(0, Math.min(100, (bmi - 15) / 20 * 100));
    document.getElementById('bmi-cursor').style.left = pct + '%';
    if (prevBmi) {
      const diff = (bmi - prevBmi).toFixed(1);
      const isGood = diff < 0;
      document.getElementById('bmi-trend').innerHTML =
        `<span class="${isGood ? 'trend-down-good' : 'trend-up-bad'}">${diff > 0 ? '▲' : '▼'} ${Math.abs(diff)}</span>`;
    }
  }

  // Body fat
  setMetricTile('m-bf', latest.bodyFat, prev?.bodyFat, '%', false, bfClass(latest.bodyFat));

  // Muscle mass
  setMetricTile('m-muscle', latest.muscleMass, prev?.muscleMass, 'kg', true);

  // Fat-free body weight
  setMetricTile('m-ffbw', latest.fatFreeWeight, prev?.fatFreeWeight, 'kg', true);

  // Subcutaneous fat
  setMetricTile('m-subcut', latest.subcutaneousFat, prev?.subcutaneousFat, '%', false);

  // Goal banner
  if (settings.goalWeight && latest.weight) {
    const diff = (latest.weight - settings.goalWeight).toFixed(1);
    const banner = document.getElementById('goal-banner');
    const text   = document.getElementById('goal-text');
    if (diff > 0) {
      banner.style.display = 'flex';
      text.innerHTML = `<strong>${diff} kg</strong> to your goal weight of ${settings.goalWeight} kg — keep going!`;
    } else {
      banner.style.display = 'flex';
      text.innerHTML = `🏆 <strong>Goal reached!</strong> You're at or below ${settings.goalWeight} kg`;
    }
  }
}

function setMetricTile(id, val, prevVal, unit, higherIsBetter, colorClass) {
  const el = document.getElementById(id);
  const trendEl = document.getElementById(id + '-trend');
  if (!el) return;

  if (val == null || val === undefined) { el.textContent = '—'; return; }

  el.textContent = val + unit;
  if (colorClass) el.className = 'metric-val ' + colorClass;

  if (trendEl && prevVal != null) {
    const diff = (val - prevVal).toFixed(1);
    const isUp = diff > 0;
    const isGood = higherIsBetter ? isUp : !isUp;
    const cls = isGood ? (isUp ? 'trend-up-good' : 'trend-down-good') : (isUp ? 'trend-up-bad' : 'trend-down-bad');
    if (diff !== '0.0') {
      trendEl.innerHTML = `<span class="${cls}">${isUp ? '▲' : '▼'} ${Math.abs(diff)}${unit}</span>`;
    }
  }
}

function bmiLabel(bmi) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25)   return '✓ Healthy range';
  if (bmi < 30)   return 'Above healthy';
  return 'High';
}

function bfClass(bf) {
  if (!bf) return 'neutral';
  if (bf < 14) return 'warn';      // essential / athletic
  if (bf < 18) return 'good';      // fitness range
  if (bf < 25) return 'neutral';   // average
  return 'warn';                    // above average
}

function calcStreak(workouts) {
  const sorted = [...workouts].sort((a, b) => b.date - a.date);
  let streak = 0, prev = null;
  for (const w of sorted) {
    const day = dayFloor(w.date);
    if (!prev) { streak = 1; prev = day; continue; }
    if (prev - day <= 86400000 * 2) { streak++; prev = day; }
    else break;
  }
  return streak;
}

function startOfWeek() {
  const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - d.getDay());
  return d.getTime();
}

function dayFloor(ts) {
  const d = new Date(ts); d.setHours(0,0,0,0); return d.getTime();
}

function getNextProgram() {
  const order = ['push','pull','legs'];
  const last = localStorage.getItem('lgt-last-prog');
  if (!last) return PROGRAMS[0];
  return PROGRAMS[(order.indexOf(last) + 1) % 3];
}

document.getElementById('btn-start-next').addEventListener('click', () =>
  startWorkout(getNextProgram().id)
);

// ── Body Metrics Modal ────────────────────────────────────────────────────────
document.getElementById('btn-open-metrics').addEventListener('click', () => {
  document.getElementById('metrics-modal').classList.add('open');
});
document.getElementById('btn-cancel-metrics').addEventListener('click', () =>
  document.getElementById('metrics-modal').classList.remove('open')
);

document.getElementById('btn-save-metrics').addEventListener('click', async () => {
  const weight = parseFloat(document.getElementById('m-in-weight').value);
  if (!weight || weight < 30 || weight > 300) {
    document.getElementById('m-in-weight').focus(); return;
  }
  await DB.saveMetric({
    weight,
    bodyFat:        parseFloat(document.getElementById('m-in-bf').value)       || null,
    muscleMass:     parseFloat(document.getElementById('m-in-muscle').value)    || null,
    fatFreeWeight:  parseFloat(document.getElementById('m-in-ffbw').value)      || null,
    subcutaneousFat:parseFloat(document.getElementById('m-in-subcut').value)    || null,
    visceralFat:    parseFloat(document.getElementById('m-in-visceral').value)  || null
  });
  ['m-in-weight','m-in-bf','m-in-muscle','m-in-ffbw','m-in-subcut','m-in-visceral']
    .forEach(id => document.getElementById(id).value = '');
  document.getElementById('metrics-modal').classList.remove('open');
  renderToday();
});

// ── WORKOUT SELECT ────────────────────────────────────────────────────────────
document.querySelectorAll('.prog-card').forEach(card =>
  card.addEventListener('click', () => startWorkout(card.dataset.prog))
);
document.getElementById('btn-log-cycling').addEventListener('click', () =>
  document.getElementById('cycling-modal').classList.add('open')
);

// ── ACTIVE WORKOUT ────────────────────────────────────────────────────────────
async function startWorkout(programId) {
  const program = PROGRAMS.find(p => p.id === programId);
  const lastSets = {};
  for (const pair of program.pairs)
    for (const exId of pair)
      lastSets[exId] = await DB.getLastSetsForExercise(exId);

  activeWorkout = { program, startTime: Date.now(), lastSets };
  renderActiveWorkout();
  document.getElementById('workout-active').classList.add('open');
  document.getElementById('wo-footer').style.display = 'flex';
  woInterval = setInterval(tickWoTimer, 1000);
}

function tickWoTimer() {
  if (!activeWorkout) return;
  const s = Math.floor((Date.now() - activeWorkout.startTime) / 1000);
  document.getElementById('wo-elapsed').textContent =
    String(Math.floor(s / 60)).padStart(2,'0') + ':' + String(s % 60).padStart(2,'0');
}

function renderActiveWorkout() {
  const { program, lastSets } = activeWorkout;
  document.getElementById('wo-title').textContent = program.emoji + ' ' + program.name;
  const body = document.getElementById('wo-body');
  body.innerHTML = '';

  program.pairs.forEach((pair, pi) => {
    const sec = document.createElement('div');
    sec.innerHTML = `
      <div class="pair-header">
        <span class="pair-lbl">Superset ${pi + 1} of ${program.pairs.length}</span>
        <span class="pair-chip">SS</span>
      </div>`;

    pair.forEach(exId => {
      const ex   = EXERCISES[exId];
      const prev = lastSets[exId] || [];
      const ol   = overloadSuggestion(ex, prev);

      const block = document.createElement('div');
      block.className = 'ex-block';
      block.dataset.ex = exId;

      let rows = `
        <div class="set-cols">
          <span></span><span>Weight kg</span><span>Reps</span><span>✓</span><span>F</span>
        </div>`;

      for (let i = 0; i < settings.setsPerPair; i++) {
        const p    = prev[i];
        const sugW = ol ? ol.weight : (p ? p.weight : '');
        const sugR = p ? p.reps : ex.repsMin;
        rows += `
          <div class="set-row" data-i="${i}">
            <span class="set-num">${i + 1}</span>
            <input class="set-in w-in" type="number" inputmode="decimal"
                   placeholder="kg" value="${sugW}" data-ex="${exId}" data-i="${i}">
            <input class="set-in r-in" type="number" inputmode="numeric"
                   placeholder="${ex.repsMin}" value="${sugR}" data-ex="${exId}" data-i="${i}">
            <button class="log-btn" data-ex="${exId}" data-i="${i}">✓</button>
            <button class="fail-btn" data-ex="${exId}" data-i="${i}" title="Taken to failure">F</button>
          </div>
          ${p ? `<div class="prev-hint">Last: ${p.weight} kg × ${p.reps} reps</div>` : '<div style="height:4px"></div>'}`;
      }

      block.innerHTML = `
        <div class="ex-hdr">
          <div>
            <div class="ex-name">${ex.name}</div>
            <div class="ex-muscles">${ex.muscles.split('·')[0].replace(/\(.*\)/, '').trim()}</div>
          </div>
          <button class="info-btn" data-ex="${exId}">ℹ Info</button>
        </div>
        ${ol ? `<div class="ol-badge">⬆ Try ${ol.weight} kg — you earned it</div>` : ''}
        <div class="target-lbl">Target: ${settings.setsPerPair} sets · ${ex.repsMin}–${ex.repsMax} reps · F = taken to failure</div>
        ${rows}`;

      sec.appendChild(block);
    });

    body.appendChild(sec);
  });

  // Log button: tap once = done (green), starts rest timer
  body.querySelectorAll('.log-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('.set-row');
      const wIn = row.querySelector('.w-in');
      const rIn = row.querySelector('.r-in');
      if (!wIn.value || !rIn.value) { wIn.focus(); return; }
      const isDone = btn.classList.toggle('done');
      wIn.classList.toggle('done', isDone);
      rIn.classList.toggle('done', isDone);
      if (isDone) startRestTimer();
    });
  });

  // Fail button: independent toggle, red when active
  body.querySelectorAll('.fail-btn').forEach(btn =>
    btn.addEventListener('click', () => btn.classList.toggle('active'))
  );

  body.querySelectorAll('.info-btn').forEach(btn =>
    btn.addEventListener('click', () => showFormGuide(btn.dataset.ex))
  );
}

function overloadSuggestion(ex, prevSets) {
  if (!prevSets.length) return null;
  const relevant = prevSets.slice(0, settings.setsPerPair);
  if (relevant.length < settings.setsPerPair) return null;
  if (!relevant.every(s => s.reps >= ex.repsMax && !s.toFailure)) return null;
  const avgW = relevant.reduce((s, r) => s + r.weight, 0) / relevant.length;
  return { weight: Math.round((avgW + 2.5) * 2) / 2 };
}

// ── Rest timer ────────────────────────────────────────────────────────────────
function startRestTimer() {
  clearInterval(restInterval);
  let secs = settings.restSeconds;
  const el  = document.getElementById('rest-timer');
  const txt = document.getElementById('rt-time');
  el.classList.add('active');
  txt.textContent = fmtTime(secs);
  restInterval = setInterval(() => {
    secs--;
    txt.textContent = fmtTime(secs);
    if (secs <= 0) {
      clearInterval(restInterval);
      el.classList.remove('active');
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    }
  }, 1000);
}

document.getElementById('btn-skip-rest').addEventListener('click', () => {
  clearInterval(restInterval);
  document.getElementById('rest-timer').classList.remove('active');
});

function fmtTime(s) {
  return String(Math.floor(s / 60)).padStart(2,'0') + ':' + String(Math.max(0, s % 60)).padStart(2,'0');
}

// ── Save / finish workout ─────────────────────────────────────────────────────
document.getElementById('btn-finish').addEventListener('click', async () => {
  if (!confirm('Finish and save this workout?')) return;
  await saveWorkout();
});

document.getElementById('btn-cancel-wo').addEventListener('click', () => {
  if (!confirm('Cancel? Progress will not be saved.')) return;
  closeWorkout();
});

async function saveWorkout() {
  const { program, startTime } = activeWorkout;
  const durationMin = Math.max(1, Math.round((Date.now() - startTime) / 60000));
  const workoutId   = await DB.saveWorkout({
    programId: program.id, programName: program.name, date: Date.now(), durationMin
  });

  const sets = [];
  document.querySelectorAll('.ex-block').forEach(block => {
    const exId = block.dataset.ex;
    block.querySelectorAll('.set-row').forEach((row, i) => {
      const w = parseFloat(row.querySelector('.w-in').value);
      const r = parseInt(row.querySelector('.r-in').value);
      if (w > 0 && r > 0) sets.push({
        workoutId, exerciseId: exId, setNumber: i, weight: w, reps: r,
        toFailure: row.querySelector('.fail-btn').classList.contains('active')
      });
    });
  });

  await DB.saveSets(sets);
  localStorage.setItem('lgt-last-prog', program.id);
  clearInterval(woInterval);
  clearInterval(restInterval);
  document.getElementById('rest-timer').classList.remove('active');

  document.getElementById('wo-body').innerHTML = `
    <div class="complete">
      <div class="complete-icon">🏆</div>
      <div class="complete-title">Session complete!</div>
      <div class="complete-stats">${durationMin} min · ${sets.length} sets logged</div>
      <button class="btn btn-primary btn-block" id="btn-wo-done">Back to home</button>
    </div>`;
  document.getElementById('wo-footer').style.display = 'none';
  document.getElementById('btn-wo-done').addEventListener('click', closeWorkout);
}

function closeWorkout() {
  activeWorkout = null;
  clearInterval(woInterval);
  clearInterval(restInterval);
  document.getElementById('workout-active').classList.remove('open');
  document.getElementById('rest-timer').classList.remove('active');
  document.getElementById('wo-footer').style.display = 'flex';
  navigateTo('today');
}

// ── Form guide ────────────────────────────────────────────────────────────────
function showFormGuide(exId) {
  const ex = EXERCISES[exId], fg = ex.formGuide;
  document.getElementById('fg-title').textContent   = ex.name;
  document.getElementById('fg-muscles').textContent = ex.muscles;
  document.getElementById('fg-setup').textContent   = fg.setup;
  document.getElementById('fg-cues').innerHTML      = fg.cues.map(c => `<li>${c}</li>`).join('');
  document.getElementById('fg-mistakes').innerHTML  = fg.mistakes.map(m => `<li>${m}</li>`).join('');
  const n = document.getElementById('fg-note');
  if (fg.note) { n.textContent = fg.note; n.style.display = 'block'; } else n.style.display = 'none';
  document.getElementById('fg-modal').classList.add('open');
}
document.getElementById('btn-close-fg').addEventListener('click', () =>
  document.getElementById('fg-modal').classList.remove('open')
);
document.getElementById('fg-modal').addEventListener('click', e => {
  if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
});

// ── STATS ─────────────────────────────────────────────────────────────────────
async function renderStats() {
  await renderHistory();
}

async function renderHistory() {
  const workouts = await DB.getWorkouts();
  const cycling  = await DB.getCyclingSessions();
  const container = document.getElementById('hist-list');

  if (!workouts.length && !cycling.length) {
    container.innerHTML = `
      <div class="empty">
        <div class="empty-icon">📋</div>
        <div class="empty-text">No sessions logged yet.<br>Complete your first workout to start your history.</div>
      </div>`;
    return;
  }

  let html = '';
  for (const w of workouts) {
    const prog = PROGRAMS.find(p => p.id === w.programId) || {};
    html += `
      <div class="hist-item">
        <div class="hist-emoji">${prog.emoji || '🏋️'}</div>
        <div class="hist-info">
          <div class="hist-name">${w.programName || prog.name || 'Workout'}</div>
          <div class="hist-meta">${fmtDate(w.date)}</div>
        </div>
        <div class="hist-dur">${w.durationMin || '—'} min</div>
      </div>`;
  }
  if (cycling.length) {
    html += `<div class="section-title" style="margin-top:16px">Cycling</div>`;
    for (const s of cycling)
      html += `
        <div class="hist-item">
          <div class="hist-emoji">🚴</div>
          <div class="hist-info">
            <div class="hist-name">Cycling</div>
            <div class="hist-meta">${fmtDate(s.date)} · ${s.distanceKm || '?'} km · ${s.caloriesBurnt || '?'} kcal</div>
          </div>
          <div class="hist-dur">${s.durationMin} min</div>
        </div>`;
  }
  container.innerHTML = html;
}

function fmtDate(ts) {
  return new Date(ts).toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short', year:'numeric' });
}

// ── Charts ────────────────────────────────────────────────────────────────────
async function renderCharts() {
  const metrics  = await DB.getMetrics();
  const sorted   = metrics.sort((a, b) => a.date - b.date);

  // Weight chart
  const wEmpty = document.getElementById('weight-chart-empty');
  if (sorted.length >= 2) {
    wEmpty.style.display = 'none';
    const labels  = sorted.map(m => fmtShort(m.date));
    const weights = sorted.map(m => m.weight);
    const rolling = rollingAvg(weights, 7);
    if (weightChart) weightChart.destroy();
    weightChart = new Chart(document.getElementById('weight-chart'), {
      type: 'line',
      data: { labels, datasets: [
        { label: 'Weight', data: weights, borderColor: '#253047', borderWidth: 1, pointRadius: 2, tension: .3 },
        { label: '7-day avg', data: rolling, borderColor: '#4F8EF7', borderWidth: 2, pointRadius: 0, tension: .4 }
      ]},
      options: chartOpts()
    });
  } else { wEmpty.style.display = 'block'; }

  // Body fat chart
  const bfData = sorted.filter(m => m.bodyFat);
  const bfEmpty = document.getElementById('bf-chart-empty');
  if (bfData.length >= 2) {
    bfEmpty.style.display = 'none';
    if (bfChart) bfChart.destroy();
    bfChart = new Chart(document.getElementById('bf-chart'), {
      type: 'line',
      data: { labels: bfData.map(m => fmtShort(m.date)), datasets: [{
        label: 'Body Fat %', data: bfData.map(m => m.bodyFat),
        borderColor: '#F59E0B', backgroundColor: 'rgba(245,158,11,.1)',
        borderWidth: 2, pointRadius: 3, fill: true, tension: .3
      }]},
      options: { ...chartOpts(), plugins: { legend: { display: false } } }
    });
  } else { bfEmpty.style.display = 'block'; }

  // Strength chart
  const sel = document.getElementById('str-select');
  if (!sel.options.length) {
    sel.innerHTML = Object.entries(EXERCISES).map(([id, ex]) =>
      `<option value="${id}">${ex.name}</option>`).join('');
    sel.onchange = () => renderStrengthChart(sel.value);
  }
  renderStrengthChart(sel.value);
}

async function renderStrengthChart(exId) {
  const allSets  = await DB.getAllSets();
  const workouts = await DB.getWorkouts();
  const wMap     = Object.fromEntries(workouts.map(w => [w.id, w]));
  const byWo     = {};
  for (const s of allSets.filter(s => s.exerciseId === exId)) {
    (byWo[s.workoutId] = byWo[s.workoutId] || []).push(s);
  }
  const points = Object.entries(byWo)
    .map(([wid, sets]) => ({ date: wMap[wid]?.date || 0, weight: Math.max(...sets.map(s => s.weight)) }))
    .filter(p => p.date).sort((a, b) => a.date - b.date);

  if (strengthChart) strengthChart.destroy();
  const empty = document.getElementById('str-chart-empty');
  if (points.length < 2) { empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  strengthChart = new Chart(document.getElementById('str-chart'), {
    type: 'line',
    data: {
      labels: points.map(p => fmtShort(p.date)),
      datasets: [{ label: 'Max kg', data: points.map(p => p.weight),
        borderColor: '#22D3A5', backgroundColor: 'rgba(34,211,165,.1)',
        borderWidth: 2, pointRadius: 4, fill: true, tension: .3 }]
    },
    options: { ...chartOpts(), plugins: { legend: { display: false } } }
  });
}

function fmtShort(ts) {
  return new Date(ts).toLocaleDateString('en-GB', { day:'numeric', month:'short' });
}

function rollingAvg(arr, w) {
  return arr.map((_, i) => {
    const sl = arr.slice(Math.max(0, i - w + 1), i + 1);
    return Math.round(sl.reduce((a, b) => a + b, 0) / sl.length * 10) / 10;
  });
}

function chartOpts() {
  return {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#5E7296', font: { size: 11 } } } },
    scales: {
      x: { ticks: { color: '#3a4d6b', font: { size: 10 } }, grid: { color: '#1C2538' } },
      y: { ticks: { color: '#3a4d6b', font: { size: 10 } }, grid: { color: '#1C2538' } }
    }
  };
}

// ── NUTRITION ─────────────────────────────────────────────────────────────────
async function renderNutrition() {
  const entries = await DB.getTodayNutrition();
  const tot = entries.reduce((a, e) => ({
    cal: a.cal + (e.calories||0), pro: a.pro + (e.protein||0),
    carb: a.carb + (e.carbs||0),  fat: a.fat + (e.fat||0)
  }), { cal:0, pro:0, carb:0, fat:0 });

  const pct = (v, t) => Math.min(100, Math.round(v / t * 100)) + '%';

  document.getElementById('n-cal').textContent  = Math.round(tot.cal);
  document.getElementById('n-pro').textContent  = Math.round(tot.pro)  + 'g';
  document.getElementById('n-carb').textContent = Math.round(tot.carb) + 'g';
  document.getElementById('n-fat').textContent  = Math.round(tot.fat)  + 'g';
  document.getElementById('n-cal-tgt').textContent  = `/ ${settings.calorieTarget} kcal`;
  document.getElementById('n-pro-tgt').textContent  = `${Math.round(tot.pro)}g / ${settings.proteinTarget}g`;
  document.getElementById('n-carb-tgt').textContent = `${Math.round(tot.carb)}g / ${settings.carbTarget}g`;
  document.getElementById('n-fat-tgt').textContent  = `${Math.round(tot.fat)}g / ${settings.fatTarget}g`;
  document.getElementById('bar-cal').style.width  = pct(tot.cal,  settings.calorieTarget);
  document.getElementById('bar-pro').style.width  = pct(tot.pro,  settings.proteinTarget);
  document.getElementById('bar-carb').style.width = pct(tot.carb, settings.carbTarget);
  document.getElementById('bar-fat').style.width  = pct(tot.fat,  settings.fatTarget);

  const log = document.getElementById('food-log');
  if (!entries.length) {
    log.innerHTML = '<div style="color:var(--muted);font-size:13px;padding:8px 0">Nothing logged yet today.</div>';
    return;
  }
  log.innerHTML = entries.map(e => `
    <div class="food-item">
      <div>
        <div class="food-item-name">${e.name}</div>
        <div class="food-item-macros">${e.calories} kcal · P:${e.protein}g · C:${e.carbs}g · F:${e.fat}g</div>
      </div>
      <button class="food-del" data-id="${e.id}">×</button>
    </div>`).join('');

  log.querySelectorAll('.food-del').forEach(btn =>
    btn.addEventListener('click', async () => {
      await DB.deleteNutrition(parseInt(btn.dataset.id));
      renderNutrition();
    })
  );
}

document.getElementById('btn-add-food').addEventListener('click', async () => {
  const name = document.getElementById('f-name').value.trim();
  if (!name) { document.getElementById('f-name').focus(); return; }
  await DB.saveNutrition({
    name,
    calories: parseFloat(document.getElementById('f-cal').value)  || 0,
    protein:  parseFloat(document.getElementById('f-pro').value)  || 0,
    carbs:    parseFloat(document.getElementById('f-carb').value) || 0,
    fat:      parseFloat(document.getElementById('f-fat').value)  || 0
  });
  ['f-name','f-cal','f-pro','f-carb','f-fat'].forEach(id => document.getElementById(id).value = '');
  renderNutrition();
});

// ── SETTINGS ──────────────────────────────────────────────────────────────────
function renderSettings() {
  document.getElementById('sets-val').textContent = settings.setsPerPair;
  document.getElementById('rest-val').textContent = settings.restSeconds + 's';
  document.getElementById('height-in').value      = settings.heightCm;
  document.getElementById('goal-in').value        = settings.goalWeight;
  document.getElementById('cal-in').value         = settings.calorieTarget;
  document.getElementById('pro-in').value         = settings.proteinTarget;
  document.getElementById('carb-in').value        = settings.carbTarget;
  document.getElementById('fat-in').value         = settings.fatTarget;
}

function step(key, delta, min, max) {
  settings[key] = Math.max(min, Math.min(max, settings[key] + delta));
  saveSettings(); renderSettings();
}

document.getElementById('sets-minus').addEventListener('click', () => step('setsPerPair', -1, 2, 5));
document.getElementById('sets-plus').addEventListener('click',  () => step('setsPerPair',  1, 2, 5));
document.getElementById('rest-minus').addEventListener('click', () => step('restSeconds', -15, 30, 180));
document.getElementById('rest-plus').addEventListener('click',  () => step('restSeconds',  15, 30, 180));

document.getElementById('btn-save-targets').addEventListener('click', () => {
  settings.heightCm      = parseInt(document.getElementById('height-in').value)  || 183;
  settings.goalWeight    = parseFloat(document.getElementById('goal-in').value)  || 90;
  settings.calorieTarget = parseInt(document.getElementById('cal-in').value)     || 2200;
  settings.proteinTarget = parseInt(document.getElementById('pro-in').value)     || 200;
  settings.carbTarget    = parseInt(document.getElementById('carb-in').value)    || 200;
  settings.fatTarget     = parseInt(document.getElementById('fat-in').value)     || 70;
  saveSettings();
  const ok = document.getElementById('save-ok');
  ok.style.display = 'inline';
  setTimeout(() => ok.style.display = 'none', 2000);
});

// ── CYCLING MODAL ─────────────────────────────────────────────────────────────
document.getElementById('btn-save-cycling').addEventListener('click', async () => {
  const dur = parseInt(document.getElementById('cy-dur').value);
  if (!dur) { document.getElementById('cy-dur').focus(); return; }
  await DB.saveCycling({
    durationMin:   dur,
    distanceKm:    parseFloat(document.getElementById('cy-dist').value) || 0,
    caloriesBurnt: parseInt(document.getElementById('cy-cal').value)    || 0
  });
  ['cy-dur','cy-dist','cy-cal'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('cycling-modal').classList.remove('open');
  renderHistory();
});
document.getElementById('btn-cancel-cycling').addEventListener('click', () =>
  document.getElementById('cycling-modal').classList.remove('open')
);

// ── PWA install ───────────────────────────────────────────────────────────────
let installPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault(); installPrompt = e;
  document.getElementById('install-row').style.display = 'flex';
});
document.getElementById('btn-install').addEventListener('click', async () => {
  if (!installPrompt) return;
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  document.getElementById('install-row').style.display = 'none';
});

// ── Init ──────────────────────────────────────────────────────────────────────
navigateTo('today');
