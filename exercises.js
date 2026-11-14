"use strict";

const EXERCISES = [
  {
    "number": 1,
    "name": "Sprint 5–10 meter",
    "focus": "Hurtighet",
    "short": "3–5 korte spurter · full innsats · god pause",
    "description": "Sprint 5–10 meter fra stående start. Akselerer raskt, men behold god teknikk. Gå rolig tilbake og hvil godt før neste forsøk. Trenger fri løpebane; gjennomfør gjerne før styrkesirkelen."
  },
  {
    "number": 2,
    "name": "Medisinballkast / Armhevinger",
    "focus": "Innkastkraft og overkropp",
    "short": "Medisinball: 4–6 eksplosive kast · eller 6–12 armhevinger",
    "description": "Alternativ A – Medisinballkast over hodet (for lengre innkast): Stå stødig med en lett medisinball, gjerne 1–2 kg. Før ballen bak hodet og kast eksplosivt fremover mot en vegg som tåler kast, eller til en partner på trygg avstand. Bruk hele kroppen og gjennomfør 4–6 kvalitetskast med god pause. Unngå å kaste kontinuerlig gjennom hele intervallet. Alternativ B – Armhevinger: Hold kroppen rett, senk brystet kontrollert og press opp igjen. Bruk benk eller vegg som lettere variant. Gjør 6–12 gode repetisjoner. Velg én variant per runde. Tren også ekte innkast med fotball for å forbedre teknikken."
  },
  {
    "number": 3,
    "name": "Knebøy",
    "focus": "Beinstyrke",
    "short": "Hælene i gulvet · knær over tær · kontroll",
    "description": "Stå omtrent skulderbredt. Senk deg kontrollert så langt du klarer med god teknikk, og press opp igjen. Hold hælene i gulvet og knærne i samme retning som tærne. Ca. 8–12 repetisjoner."
  },
  {
    "number": 4,
    "name": "Sideplanke",
    "focus": "Kjernestabilitet",
    "short": "Albue under skulder · rett kropp · hold",
    "description": "Støtt på underarmen med albuen under skulderen. Løft hoften og hold kroppen i en rett linje. Bytt side halvveis. Start med 10–20 sekunder per side; bøy knærne for lettere variant."
  },
  {
    "number": 5,
    "name": "Lengdehopp fra stillestående",
    "focus": "Spenst",
    "short": "Eksplosivt frem · land mykt · hold balansen",
    "description": "Stå med begge føtter i gulvet. Bruk armene og hopp langt frem. Land mykt med knær over tær og hold balansen i to sekunder. Gjør 4–6 kvalitetshopp, ikke hopp kontinuerlig."
  },
  {
    "number": 6,
    "name": "Hamstring walkouts / Nordic hamstring",
    "focus": "Bakside lår",
    "short": "Walkouts nå · Nordic med sikkert ankel-feste senere",
    "description": "Alternativ A – Hamstring walkouts (uten utstyr): Ligg på ryggen med bøyde knær og hælene i gulvet. Løft hoften og gå med små hælsteg rolig utover og tilbake. Start med 4–6 kontrollerte repetisjoner. Alternativ B – Nordic hamstring (når sikkert feste er klart): Stå på knærne på matte med anklene godt festet. Len kroppen rolig frem, brems med bakside lår og ta imot med hendene. Start med 2–4 korte, kontrollerte repetisjoner. Stopp ved smerte. Bruk kun feste som er kontrollert for belastning og stabilitet."
  },
  {
    "number": 7,
    "name": "Planke med skuldertouch",
    "focus": "Mage og kjernestabilitet",
    "short": "Stå i høy planke · berør motsatt skulder · hold hoftene rolige",
    "description": "Start i armhevingsposisjon med hendene under skuldrene og føttene litt fra hverandre. Løft én hånd og berør motsatt skulder, sett hånden rolig ned og bytt side. Hold hofter og overkropp så stabile som mulig, uten å svaie eller rotere. Gjør 8–12 rolige berøringer totalt. Lettere variant: Stå med hendene på en stabil benk."
  },
  {
    "number": 8,
    "name": "Copenhagen (kort variant)",
    "focus": "Lyskestyrke",
    "short": "Kne på lav benk · løft hoften · kort hold",
    "description": "Ligg på siden med øverste kne støttet på en lav, stabil benk og underarmen i gulvet. Løft hoften kontrollert og hold kort. Start forsiktig med 3–5 korte hold per side. Enklere variant: sideleie med benløft."
  },
  {
    "number": 9,
    "name": "Skøytehopp",
    "focus": "Spenst og stabilitet",
    "short": "Hopp sideveis · land på ett bein · kontroll",
    "description": "Hopp fra ett bein til det andre sideveis. Finn balansen før neste hopp. Hold avstanden kort nok til å unngå nabostasjonen. Gjør 6–8 kontrollerte hopp per side."
  },
  {
    "number": 10,
    "name": "Ettbeins hofteløft",
    "focus": "Sete og bakside lår",
    "short": "Én fot i gulvet · løft hoften · senk rolig",
    "description": "Ligg på ryggen med ett kne bøyd og foten i gulvet. Løft hoften uten å vri bekkenet, og senk kontrollert. Bytt bein. Ca. 8–10 repetisjoner per bein."
  },
  {
    "number": 11,
    "name": "Utfall bakover / hoppende utfall",
    "focus": "Ettbeinsstyrke",
    "short": "Vanlige utfall for styrke · hoppende for viderekomne",
    "description": "Alternativ A – Utfall bakover: Ta et kontrollert steg bakover, senk kroppen og press opp gjennom fremre fot. Bytt bein. Gjør 6–8 repetisjoner per bein. Alternativ B – Hoppende utfall: Start i utfallsposisjon, hopp kontrollert opp, bytt bein i luften og land mykt med god balanse. Gjør 4–6 hopp per bein med pauser, ikke kontinuerlig i hele intervallet. Velg hoppende variant først når vanlige utfall mestres uten smerter."
  },
  {
    "number": 12,
    "name": "Tåhev på ett bein",
    "focus": "Leggstyrke",
    "short": "Helt opp på tå · senk rolig · bytt bein",
    "description": "Stå på ett bein og hold lett i veggen for balanse. Løft hælen høyt, senk rolig og kontrollert. Gjør 10–15 repetisjoner per bein. Varier mellom strakt og lett bøyd kne."
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
  const stationText = stationMeta?.textContent || "1 / 12";
  const [currentRaw, totalRaw] = stationText.split("/").map((part) => Number.parseInt(part.trim(), 10));
  const current = Number.isFinite(currentRaw) ? currentRaw : 1;
  const total = Number.isFinite(totalRaw) ? totalRaw : 12;
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
