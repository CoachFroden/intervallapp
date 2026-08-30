"use strict";

const $ = (id) => document.getElementById(id);
const els = {
  setup: $("setupPanel"), timer: $("timerPanel"), done: $("donePanel"), status: $("appStatus"),
  work: $("workInput"), rest: $("restInput"), stations: $("stationsInput"), rounds: $("roundsInput"), roundPause: $("roundPauseInput"), prep: $("prepInput"),
  totalTime: $("totalTime"), workTime: $("workTime"), intervalCount: $("intervalCount"), start: $("startButton"),
  modeBadge: $("modeBadge"), timerValue: $("timerValue"), timerCaption: $("timerCaption"), ring: $("ringValue"), roundMeta: $("roundMeta"), stationMeta: $("stationMeta"), nextLine: $("nextLine"), totalProgress: $("totalProgress"),
  pause: $("pauseButton"), skip: $("skipButton"), stop: $("stopButton"), stopModal: $("stopModal"), continueBtn: $("continueButton"), confirmStop: $("confirmStopButton"),
  doneTime: $("doneTime"), doneWork: $("doneWork"), doneIntervals: $("doneIntervals"), newSession: $("newSessionButton"), toast: $("toast")
};

const SETTINGS_KEY = "intervall-settings-v2";
const PRESETS = {
  standard: { work: 30, rest: 15, stations: 10, rounds: 2, roundPause: 90, prep: 15 },
  sprint: { work: 20, rest: 20, stations: 8, rounds: 3, roundPause: 75, prep: 15 },
  hard: { work: 45, rest: 15, stations: 8, rounds: 2, roundPause: 90, prep: 15 }
};
const RING_CIRC = 2 * Math.PI * 99;
els.ring.style.strokeDasharray = `${RING_CIRC}`;
els.ring.style.strokeDashoffset = `${RING_CIRC}`;

let config = null;
let mode = "idle";
let currentRound = 1;
let currentStation = 1;
let segmentDurationMs = 0;
let segmentStartedAt = 0;
let segmentEndsAt = 0;
let pausedRemainingMs = 0;
let elapsedBeforeSegmentMs = 0;
let totalWorkoutMs = 0;
let loopId = null;
let isPaused = false;
let lastShownSecond = null;
let audioCtx = null;
let audioReady = false;
let wakeLock = null;
let readyVoicePlayed = false;
let toastTimer = null;

const sounds = {};
const SOUND_FILES = {
  beep: "beep.wav",
  longBeep: "langbeep.wav",
  roundEnd: "endbuzzer.wav",
  ready: "gjordereklare.mp3",
  pauseWarn: "pauseneroveromti.mp3"
};

function clampInt(value, min, max, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

function readConfig() {
  return {
    work: clampInt(els.work.value, 1, 3600, 30),
    rest: clampInt(els.rest.value, 0, 3600, 15),
    stations: clampInt(els.stations.value, 1, 100, 10),
    rounds: clampInt(els.rounds.value, 1, 50, 2),
    roundPause: clampInt(els.roundPause.value, 0, 3600, 90),
    prep: clampInt(els.prep.value, 0, 120, 15)
  };
}

function writeConfig(c) {
  els.work.value = c.work;
  els.rest.value = c.rest;
  els.stations.value = c.stations;
  els.rounds.value = c.rounds;
  els.roundPause.value = c.roundPause;
  els.prep.value = c.prep;
  updateSummary();
}

function normalizeInputs() {
  writeConfig(readConfig());
  saveSettings();
}

function workoutDurationMs(c) {
  const workMs = c.work * c.stations * c.rounds * 1000;
  const restMs = c.rest * Math.max(0, c.stations - 1) * c.rounds * 1000;
  const roundPauseMs = c.roundPause * Math.max(0, c.rounds - 1) * 1000;
  return workMs + restMs + roundPauseMs;
}

function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h) return `${h} t ${m} min`;
  if (m) return sec ? `${m} min ${sec} sek` : `${m} min`;
  return `${sec} sek`;
}

function updateSummary() {
  const c = readConfig();
  const workoutSec = workoutDurationMs(c) / 1000;
  els.totalTime.textContent = formatDuration(workoutSec + c.prep);
  els.workTime.textContent = formatDuration(c.work * c.stations * c.rounds);
  els.intervalCount.textContent = `${c.stations * c.rounds}`;
}

function saveSettings() {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(readConfig())); } catch (_) {}
}

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    if (saved && typeof saved === "object") writeConfig({ ...PRESETS.standard, ...saved });
  } catch (_) {}
}

function showToast(message) {
  clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("show");
  toastTimer = setTimeout(() => els.toast.classList.remove("show"), 2800);
}

async function initAudio() {
  if (audioReady) {
    if (audioCtx?.state === "suspended") await audioCtx.resume();
    return true;
  }
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") await audioCtx.resume();
    await Promise.all(Object.entries(SOUND_FILES).map(async ([name, url]) => {
      const res = await fetch(url, { cache: "force-cache" });
      if (!res.ok) throw new Error(`Kunne ikke laste ${url}`);
      const buf = await res.arrayBuffer();
      sounds[name] = await audioCtx.decodeAudioData(buf.slice(0));
    }));
    audioReady = true;
    return true;
  } catch (error) {
    console.warn("Lyd kunne ikke klargjøres", error);
    showToast("Lyd kunne ikke lastes. Timeren virker fortsatt.");
    return false;
  }
}

function playSound(name) {
  if (!audioCtx || !sounds[name]) return;
  try {
    const src = audioCtx.createBufferSource();
    src.buffer = sounds[name];
    src.connect(audioCtx.destination);
    src.start();
  } catch (error) { console.warn("Lydfeil", error); }
}

function vibrate(pattern = 35) {
  try { navigator.vibrate?.(pattern); } catch (_) {}
}

async function requestWakeLock() {
  if (!("wakeLock" in navigator) || wakeLock || document.visibilityState !== "visible") return;
  try {
    wakeLock = await navigator.wakeLock.request("screen");
    wakeLock.addEventListener("release", () => { wakeLock = null; });
  } catch (error) {
    console.debug("Wake Lock utilgjengelig", error);
  }
}

async function releaseWakeLock() {
  if (!wakeLock) return;
  try { await wakeLock.release(); } catch (_) {}
  wakeLock = null;
}

function setView(view) {
  els.setup.style.display = view === "setup" ? "block" : "none";
  els.timer.classList.toggle("visible", view === "timer");
  els.done.classList.toggle("visible", view === "done");
  els.status.classList.toggle("live", view === "timer" && !isPaused);
  els.status.textContent = view === "timer" ? (isPaused ? "Pauset" : "Pågår") : view === "done" ? "Ferdig" : "Klar";
}

function modeDetails() {
  if (mode === "prep") return { label: "Gjør klar", color: "var(--accent)", next: "Arbeid" };
  if (mode === "work") return { label: "Arbeid", color: "var(--work)", next: getNextLabel() };
  if (mode === "rest") return { label: "Pause", color: "var(--rest)", next: `Stasjon ${currentStation + 1}` };
  if (mode === "roundPause") return { label: "Rundepause", color: "var(--accent-2)", next: `Runde ${currentRound + 1}` };
  return { label: "Ferdig", color: "var(--work)", next: "" };
}

function getNextLabel() {
  if (currentStation < config.stations) return config.rest > 0 ? "Pause" : `Stasjon ${currentStation + 1}`;
  if (currentRound < config.rounds) return config.roundPause > 0 ? "Rundepause" : `Runde ${currentRound + 1}`;
  return "Ferdig";
}

function currentRemainingMs(now = Date.now()) {
  if (isPaused) return pausedRemainingMs;
  return Math.max(0, segmentEndsAt - now);
}

function startSegment(nextMode, seconds, startAt = Date.now()) {
  mode = nextMode;
  segmentDurationMs = Math.max(0, seconds * 1000);
  segmentStartedAt = startAt;
  segmentEndsAt = startAt + segmentDurationMs;
  lastShownSecond = null;
  readyVoicePlayed = false;
  updateTimerUI(startAt);
}

function beginWorkout() {
  currentRound = 1;
  currentStation = 1;
  elapsedBeforeSegmentMs = 0;
  isPaused = false;
  pausedRemainingMs = 0;
  totalWorkoutMs = workoutDurationMs(config);
  setView("timer");
  requestWakeLock();
  if (config.prep > 0) {
    startSegment("prep", config.prep);
    setTimeout(() => {
      if (mode === "prep" && !isPaused && !readyVoicePlayed) {
        playSound("ready");
        readyVoicePlayed = true;
      }
    }, 450);
  } else {
    playSound("longBeep");
    startSegment("work", config.work);
  }
  scheduleLoop();
}

async function startSession() {
  if (mode !== "idle" && mode !== "done") return;
  normalizeInputs();
  config = readConfig();
  els.start.disabled = true;
  const oldText = els.start.textContent;
  els.start.textContent = "Klargjør lyd …";
  await initAudio();
  els.start.disabled = false;
  els.start.textContent = oldText;
  beginWorkout();
}

function scheduleLoop() {
  clearTimeout(loopId);
  if (isPaused || mode === "idle" || mode === "done") return;
  loopId = setTimeout(timerLoop, 100);
}

function timerLoop() {
  if (isPaused || mode === "idle" || mode === "done") return;
  const now = Date.now();
  let guard = 0;
  while (now >= segmentEndsAt && mode !== "done" && mode !== "idle" && !isPaused && guard < 250) {
    advanceSegment(segmentEndsAt, true);
    guard++;
  }
  if (guard >= 250) {
    console.warn("Timer catch-up guard triggered");
    finishSession();
    return;
  }
  updateTimerUI(now);
  scheduleLoop();
}

function advanceSegment(boundaryAt = Date.now(), fromClock = false) {
  if (mode === "idle" || mode === "done") return;
  if (mode !== "prep") elapsedBeforeSegmentMs += segmentDurationMs;

  const playBoundaryCue = fromClock && (Date.now() - boundaryAt) < 1600;

  if (mode === "prep") {
    if (playBoundaryCue) { playSound("longBeep"); vibrate([45, 40, 70]); }
    startSegment("work", config.work, boundaryAt);
    return;
  }

  if (mode === "work") {
    if (playBoundaryCue) {
      const finishingRound = currentStation === config.stations;
      playSound(finishingRound ? "roundEnd" : "longBeep");
      vibrate(finishingRound ? [80, 45, 100] : 45);
    }
    if (currentStation < config.stations) {
      if (config.rest > 0) startSegment("rest", config.rest, boundaryAt);
      else {
        currentStation++;
        startSegment("work", config.work, boundaryAt);
      }
      return;
    }
    if (currentRound < config.rounds) {
      if (config.roundPause > 0) startSegment("roundPause", config.roundPause, boundaryAt);
      else {
        currentRound++;
        currentStation = 1;
        startSegment("work", config.work, boundaryAt);
      }
      return;
    }
    finishSession();
    return;
  }

  if (mode === "rest") {
    currentStation++;
    if (playBoundaryCue) { playSound("longBeep"); vibrate(55); }
    startSegment("work", config.work, boundaryAt);
    return;
  }

  if (mode === "roundPause") {
    currentRound++;
    currentStation = 1;
    if (playBoundaryCue) { playSound("longBeep"); vibrate([45, 35, 45]); }
    startSegment("work", config.work, boundaryAt);
  }
}

function maybePlayCountdownCue(secondsLeft) {
  if (secondsLeft === lastShownSecond) return;
  lastShownSecond = secondsLeft;

  if (mode === "roundPause" && secondsLeft === 12) playSound("pauseWarn");
  if (secondsLeft === 3 || secondsLeft === 2 || secondsLeft === 1) {
    playSound("beep");
    vibrate(25);
  }
}

function updateTimerUI(now = Date.now()) {
  if (!config || mode === "idle" || mode === "done") return;
  const remainingMs = currentRemainingMs(now);
  const secondsLeft = Math.max(0, Math.ceil(remainingMs / 1000));
  const d = modeDetails();
  const progress = segmentDurationMs > 0 ? Math.min(1, Math.max(0, 1 - remainingMs / segmentDurationMs)) : 1;

  document.documentElement.style.setProperty("--mode-color", d.color);
  els.modeBadge.textContent = isPaused ? `${d.label} · pauset` : d.label;
  els.timerValue.textContent = secondsLeft;
  els.timerCaption.textContent = secondsLeft === 1 ? "sekund" : "sekunder";
  els.ring.style.strokeDashoffset = `${RING_CIRC * (1 - progress)}`;
  els.roundMeta.textContent = `${currentRound} / ${config.rounds}`;
  els.stationMeta.textContent = `${currentStation} / ${config.stations}`;
  els.nextLine.innerHTML = d.next ? `Neste: <strong>${d.next}</strong>` : "";
  els.pause.textContent = isPaused ? "Fortsett" : "Pause";

  const currentWorkoutElapsed = mode === "prep" ? 0 : Math.min(totalWorkoutMs, elapsedBeforeSegmentMs + Math.max(0, segmentDurationMs - remainingMs));
  const pct = totalWorkoutMs > 0 ? (currentWorkoutElapsed / totalWorkoutMs) * 100 : 0;
  els.totalProgress.style.width = `${Math.max(0, Math.min(100, pct))}%`;

  if (!isPaused) maybePlayCountdownCue(secondsLeft);
}

function togglePause() {
  if (mode === "idle" || mode === "done") return;
  if (!isPaused) {
    pausedRemainingMs = currentRemainingMs();
    isPaused = true;
    clearTimeout(loopId);
    loopId = null;
  } else {
    const elapsedInSegment = Math.max(0, segmentDurationMs - pausedRemainingMs);
    segmentStartedAt = Date.now() - elapsedInSegment;
    segmentEndsAt = Date.now() + pausedRemainingMs;
    isPaused = false;
    requestWakeLock();
    scheduleLoop();
  }
  setView("timer");
  updateTimerUI();
}

function skipSegment() {
  if (mode === "idle" || mode === "done") return;
  if (isPaused) {
    isPaused = false;
    pausedRemainingMs = 0;
  }
  advanceSegment(Date.now(), false);
  if (mode !== "done") {
    updateTimerUI();
    requestWakeLock();
    scheduleLoop();
  }
}

function openStopModal() {
  if (mode === "idle" || mode === "done") return;
  els.stopModal.classList.add("open");
}

function closeStopModal() { els.stopModal.classList.remove("open"); }

function stopSession() {
  clearTimeout(loopId);
  loopId = null;
  mode = "idle";
  isPaused = false;
  currentRound = 1;
  currentStation = 1;
  segmentDurationMs = 0;
  elapsedBeforeSegmentMs = 0;
  closeStopModal();
  setView("setup");
  updateSummary();
  requestWakeLock();
}

function finishSession() {
  clearTimeout(loopId);
  loopId = null;
  mode = "done";
  isPaused = false;
  els.doneTime.textContent = formatDuration(totalWorkoutMs / 1000);
  els.doneWork.textContent = formatDuration(config.work * config.stations * config.rounds);
  els.doneIntervals.textContent = `${config.stations * config.rounds}`;
  setView("done");
  requestWakeLock();
  vibrate([90, 60, 90, 60, 130]);
}

function resetToSetup() {
  mode = "idle";
  setView("setup");
  updateSummary();
  requestWakeLock();
}

document.querySelectorAll(".preset").forEach((button) => {
  button.addEventListener("click", () => {
    const preset = PRESETS[button.dataset.preset];
    if (!preset) return;
    writeConfig(preset);
    saveSettings();
    showToast(`Oppsett: ${button.childNodes[0].textContent.trim()}`);
  });
});

[els.work, els.rest, els.stations, els.rounds, els.roundPause, els.prep].forEach((input) => {
  input.addEventListener("input", updateSummary);
  input.addEventListener("change", normalizeInputs);
});

els.start.addEventListener("click", startSession);
els.pause.addEventListener("click", togglePause);
els.skip.addEventListener("click", skipSegment);
els.stop.addEventListener("click", openStopModal);
els.continueBtn.addEventListener("click", closeStopModal);
els.confirmStop.addEventListener("click", stopSession);
els.newSession.addEventListener("click", resetToSetup);
els.stopModal.addEventListener("click", (event) => { if (event.target === els.stopModal) closeStopModal(); });

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && els.stopModal.classList.contains("open")) closeStopModal();
  if (event.code === "Space" && mode !== "idle" && mode !== "done" && !els.stopModal.classList.contains("open")) {
    event.preventDefault();
    togglePause();
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    requestWakeLock();
    if (!isPaused && mode !== "idle" && mode !== "done") timerLoop();
  } else {
    releaseWakeLock();
  }
});

window.addEventListener("pageshow", requestWakeLock);
document.addEventListener("pointerdown", requestWakeLock, { passive: true });
document.addEventListener("touchstart", requestWakeLock, { passive: true });

window.addEventListener("beforeunload", (event) => {
  releaseWakeLock();
  if (mode !== "idle" && mode !== "done") {
    event.preventDefault();
    event.returnValue = "";
  }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => console.warn("Service worker-feil", error));
  });
}

loadSettings();
normalizeInputs();
setView("setup");
requestWakeLock();
