'use strict';

const api = window.jigglerApi;

const statusEl = document.getElementById('status');
const intervalEl = document.getElementById('interval');
const pauseEl = document.getElementById('pause');
const toggleEl = document.getElementById('toggle');
const quitEl = document.getElementById('quit');

function render(state) {
  if (!state) return;
  const running = Boolean(state.running);
  statusEl.textContent = running ? 'Jiggling' : 'Idle';
  statusEl.classList.toggle('on', running);
  statusEl.classList.toggle('off', !running);
  toggleEl.textContent = running ? 'Stop' : 'Start';
  if (document.activeElement !== intervalEl) {
    intervalEl.value = String(state.settings.intervalSeconds);
  }
  pauseEl.checked = Boolean(state.settings.pauseOnUserInput);
}

async function refresh() {
  const state = await api.getState();
  render(state);
}

toggleEl.addEventListener('click', async () => {
  const state = await api.getState();
  await api.setEnabled(!state.running);
});

intervalEl.addEventListener('change', async () => {
  const parsed = Number.parseInt(intervalEl.value, 10);
  if (!Number.isFinite(parsed)) return;
  await api.setInterval(parsed);
});

pauseEl.addEventListener('change', async () => {
  await api.setPauseOnUserInput(pauseEl.checked);
});

quitEl.addEventListener('click', () => api.quit());

api.onStateChanged(render);
refresh();
