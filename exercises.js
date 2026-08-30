"use strict";

const EXERCISES = [
  {
    number: 1,
    name: "Knebøyhopp",
    focus: "Spenst",
    short: "Kontrollert ned · eksplosivt opp · myk landing",
    description: "Begge jobber samtidig. Stå omtrent skulderbredt, gå kontrollert ned, hopp eksplosivt rett opp og land mykt. Prioriter gode hopp og fine landinger fremfor flest mulig repetisjoner."
  },
  {
    number: 2,
    name: "Hamstring walkouts",
    focus: "Hamstring",
    short: "Hoften oppe · små steg ut og inn med hælene",
    description: "Begge jobber samtidig. Ligg på ryggen med hælene i gulvet og løft hoften. Gå hælene rolig utover til beina nesten er strake, og gå inn igjen. Hold hoften så høyt og stabilt som mulig."
  },
  {
    number: 3,
    name: "Utfall bakover",
    focus: "Ettbeinsstyrke",
    short: "Steg bak · kontroll ned · press opp",
    description: "Begge jobber samtidig. Ta et kontrollert steg bak, senk det bakerste kneet mot gulvet og press deg opp gjennom fremre fot. Bytt bein. Hold overkroppen stabil og la kneet følge retningen på tærne."
  },
  {
    number: 4,
    name: "Pogo hops",
    focus: "Spenst",
    short: "Små raske hopp · kort bakkekontakt",
    description: "Begge jobber samtidig. Gjør små, raske hopp rett opp hovedsakelig fra anklene, med nesten strake knær. Tenk kortest mulig kontakt med gulvet, lett landing og stabil overkropp."
  },
  {
    number: 5,
    name: "Push-ups",
    focus: "Styrke",
    short: "Rett kropp · kontrollert ned · press opp",
    description: "Begge jobber samtidig. Hold kroppen som en rett linje, senk brystet kontrollert mot gulvet og press opp igjen. Velg heller færre gode repetisjoner enn å miste kroppskontrollen. Bruk knærne i gulvet ved behov."
  },
  {
    number: 6,
    name: "Raske føtter over linje",
    focus: "Hurtighet",
    short: "Korte steg · høy frekvens · lett på foten",
    description: "Begge jobber samtidig på hver sin korte del av en gulvlinje. Flytt begge føttene raskt side–side over linjen med korte, lette steg. Ikke hopp høyt; målet er høy fotfrekvens og kort kontakt med gulvet."
  },
  {
    number: 7,
    name: "Ettbeins hopp på stedet",
    focus: "Spenst & stabilitet",
    short: "Eksplosivt opp · stabil landing · bytt bein halvveis",
    description: "Begge jobber samtidig. Gjør små, eksplosive hopp på ett bein. Land kontrollert på samme fot og finn balansen før neste hopp. Bytt bein omtrent halvveis i arbeidsperioden."
  },
  {
    number: 8,
    name: "Planke med skuldertouch",
    focus: "Kjerne",
    short: "Stabil hofte · annenhver hånd til motsatt skulder",
    description: "Begge jobber samtidig. Stå i høy plankeposisjon. Løft én hånd og berør motsatt skulder, annenhver side. Hold kroppen stram og hoften så rolig som mulig – målet er å motstå rotasjon."
  },
  {
    number: 9,
    name: "Skøytehopp",
    focus: "Sideveis spenst",
    short: "Hopp sideveis · land på ett bein · kontroll",
    description: "Begge jobber samtidig på hver sin lille sone. Hopp sidelengs fra ett bein til det andre som en skøyteløper. Land mykt og kontrollert. Hold hoppene korte nok til at dere ikke kommer inn i nabostasjonen."
  },
  {
    number: 10,
    name: "Sprint på stedet",
    focus: "Hurtighet",
    short: "5 sek maks fart · 5–7 sek hvile · gjenta",
    description: "Begge jobber samtidig. Sprint på stedet med maksimal fot- og armfrekvens i omtrent 5 sekunder. Hvil 5–7 sekunder og gjenta. Hold kroppen høy og jobb raskt med armene – ikke gjør hele arbeidsperioden som ett langt drag."
  }
];

const exerciseList = document.getElementById("exerciseList");
const currentExercise = document.getElementById("currentExercise");
const exerciseEyebrow = document.getElementById("exerciseEyebrow");
const exerciseName = document.getElementById("exerciseName");
const exerciseFocus = document.getElementById("exerciseFocus");
const exerciseCue = document.getElementById("exerciseCue");
const stationMeta = document.getElementById("stationMeta");
const modeBadge = document.getElementById("modeBadge");

function renderExerciseLibrary() {
  if (!exerciseList) return;
  exerciseList.innerHTML = EXERCISES.map((exercise) => `
    <article class="exercise-item">
      <div class="exercise-number">${exercise.number}</div>
      <div class="exercise-copy">
        <div class="exercise-item-head">
          <h3>${exercise.name}</h3>
          <span>${exercise.focus}</span>
        </div>
        <p>${exercise.description}</p>
        <div class="exercise-key">${exercise.short}</div>
      </div>
    </article>
  `).join("");
}

function readStationState() {
  const stationText = stationMeta?.textContent || "1 / 10";
  const [currentRaw, totalRaw] = stationText.split("/").map((part) => Number.parseInt(part.trim(), 10));
  const current = Number.isFinite(currentRaw) ? currentRaw : 1;
  const total = Number.isFinite(totalRaw) ? totalRaw : 10;
  const phase = (modeBadge?.textContent || "").toLowerCase();

  if (phase.startsWith("rundepause")) return { station: 1, total, label: "Neste runde starter med" };
  if (phase.startsWith("pause")) return { station: Math.min(total, current + 1), total, label: "Neste stasjon" };
  if (phase.startsWith("gjør klar")) return { station: 1, total, label: "Første stasjon" };
  return { station: current, total, label: "Aktuell øvelse" };
}

let lastExerciseKey = "";
function updateCurrentExercise() {
  if (!currentExercise) return;
  const state = readStationState();
  const exercise = EXERCISES[state.station - 1];
  const key = `${state.station}|${state.total}|${state.label}|${modeBadge?.textContent || ""}`;
  if (key === lastExerciseKey) return;
  lastExerciseKey = key;

  if (!exercise) {
    exerciseEyebrow.textContent = `${state.label} · stasjon ${state.station}`;
    exerciseName.textContent = `Egen stasjon ${state.station}`;
    exerciseFocus.textContent = "Valgfri";
    exerciseCue.textContent = "Det er ikke lagt inn en fast øvelse for denne stasjonen.";
    return;
  }

  exerciseEyebrow.textContent = `${state.label} · stasjon ${exercise.number}`;
  exerciseName.textContent = exercise.name;
  exerciseFocus.textContent = exercise.focus;
  exerciseCue.textContent = exercise.short;
}

renderExerciseLibrary();
updateCurrentExercise();

if (stationMeta && modeBadge) {
  const observer = new MutationObserver(updateCurrentExercise);
  observer.observe(stationMeta, { childList: true, characterData: true, subtree: true });
  observer.observe(modeBadge, { childList: true, characterData: true, subtree: true });
}
