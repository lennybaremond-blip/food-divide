/* main.js – Graphiques (Chart.js) et animations (GSAP). Les données viennent de data.js. */

/* ---------- 1. Réglages ---------- */
const COLORS = { poor: "#c2491a", rich: "#2152a3" };
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches; // l'utilisateur veut moins d'animations ?
Chart.defaults.font.family = '"Source Sans 3", Arial, sans-serif';
Chart.defaults.font.size = 13;

/* ---------- 2. Éléments HTML ---------- */
const selectA = document.getElementById("decile-a");
const selectB = document.getElementById("decile-b");
const selectSort = document.getElementById("sort");
const factText = document.getElementById("fact");

/* ---------- 3. État : les choix du lecteur ---------- */
let decileA = 0;      // 0 = décile 1 (les plus pauvres)
let decileB = 9;      // 9 = décile 10 (les plus riches)
let sortMode = "gap";

/* ---------- 4. Fonctions utiles ---------- */
function decileName(i) {
  if (i === 0) return "Decile 1 (poorest 10%)";
  if (i === 9) return "Decile 10 (richest 10%)";
  return "Decile " + (i + 1);
}

// Les 24 aliments avec les valeurs des 2 déciles choisis, triés
function getRows() {
  const rows = FOOD_GROUPS.map((g) => ({ group: g, label: g.label, a: g.deciles[decileA], b: g.deciles[decileB] }));
  if (sortMode === "gap") rows.sort((x, y) => y.b / y.a - x.b / x.a);
  if (sortMode === "spend") rows.sort((x, y) => y.b - x.b);
  if (sortMode === "alpha") rows.sort((x, y) => x.label.localeCompare(y.label));
  return rows;
}

// Remplit une liste avec les 10 déciles et grise les choix impossibles
function fillSelects() {
  for (let i = 0; i < 10; i++) {
    selectA.add(new Option(decileName(i), i, false, i === decileA));
    selectB.add(new Option(decileName(i), i, false, i === decileB));
  }
}
function disableImpossibleOptions() {
  for (const o of selectA.options) o.disabled = Number(o.value) >= decileB;
  for (const o of selectB.options) o.disabled = Number(o.value) <= decileA;
}

/* ---------- 5. Graphique 1 : barres horizontales ---------- */
let rows = getRows();

const foodChart = new Chart(document.getElementById("food-chart"), {
  type: "bar",
  data: {
    labels: rows.map((r) => r.label),
    datasets: [
      { label: decileName(decileA), data: rows.map((r) => r.a), backgroundColor: COLORS.poor },
      { label: decileName(decileB), data: rows.map((r) => r.b), backgroundColor: COLORS.rich }
    ]
  },
  options: {
    indexAxis: "y",              // barres horizontales
    maintainAspectRatio: false,
    scales: {
      x: { beginAtZero: true, title: { display: true, text: "Pence per person per week" } },
      y: { ticks: { autoSkip: false } }
    },
    plugins: {
      legend: { position: "top" },   // Interaction n°1 : clic sur la légende = masquer un groupe
      tooltip: {                     // Interaction n°2 : infobulle avec l'écart
        callbacks: {
          label: (item) => " " + item.dataset.label + ": " + item.parsed.x.toFixed(0) + "p",
          afterBody: (items) => {
            const row = rows[items[0].dataIndex];
            const lines = ["Gap: ×" + (row.b / row.a).toFixed(2)];
            if (row.group.rse.includes("Very High")) lines.push("⚠ Small sample, read with caution");
            return lines;
          }
        }
      }
    },
    // Interaction n°3 : clic sur une barre = phrase de résumé
    onClick: (event, elements) => { if (elements.length > 0) showFact(rows[elements[0].index]); },
    // Interaction n°4 : curseur en forme de main sur une barre
    onHover: (event, elements) => { event.native.target.style.cursor = elements.length > 0 ? "pointer" : "default"; }
  }
});

// Écrit la phrase sous le graphique, puis GSAP l'anime (lien Chart.js → GSAP)
function showFact(row) {
  const richSpendsMore = row.b >= row.a;
  const big = richSpendsMore ? row.b : row.a;
  const small = richSpendsMore ? row.a : row.b;
  factText.textContent = row.label + ": " + decileName(richSpendsMore ? decileB : decileA) + " spends " +
    (big / small).toFixed(1) + " times as much as " + decileName(richSpendsMore ? decileA : decileB) +
    " (" + big.toFixed(0) + "p against " + small.toFixed(0) + "p a week).";
  if (!reduceMotion) gsap.from(factText, { opacity: 0, x: -20, duration: 0.4 });
}

// Recopie les lignes dans le graphique et dans le tableau
function drawRows() {
  foodChart.data.labels = rows.map((r) => r.label);
  foodChart.data.datasets[0].data = rows.map((r) => r.a);
  foodChart.data.datasets[1].data = rows.map((r) => r.b);
  foodChart.update();
  drawTable();
}

// Après un changement : GSAP fait glisser les barres (lien GSAP → Chart.js), puis on retrie
function updateFoodChart(animate) {
  const newRows = getRows();
  foodChart.data.datasets[0].label = decileName(decileA);
  foodChart.data.datasets[1].label = decileName(decileB);
  if (!animate || reduceMotion) { rows = newRows; drawRows(); return; }

  gsap.to(foodChart.data.datasets[0].data, { endArray: rows.map((r) => r.group.deciles[decileA]), duration: 0.8, ease: "power2.out" });
  gsap.to(foodChart.data.datasets[1].data, {
    endArray: rows.map((r) => r.group.deciles[decileB]),
    duration: 0.8,
    ease: "power2.out",
    onUpdate: () => foodChart.update("none"),        // redessine à chaque image
    onComplete: () => { rows = newRows; drawRows(); } // remet les aliments dans le bon ordre
  });
}

/* ---------- 6. Tableau de données (lecteurs d'écran) ---------- */
function drawTable() {
  document.getElementById("th-a").textContent = decileName(decileA);
  document.getElementById("th-b").textContent = decileName(decileB);
  document.getElementById("table-body").innerHTML = rows.map((r) =>
    "<tr><td>" + r.label + "</td><td>" + r.a.toFixed(0) + "p</td><td>" + r.b.toFixed(0) + "p</td><td>×" + (r.b / r.a).toFixed(2) + "</td></tr>"
  ).join("");
}

/* ---------- 7. Contrôles : un seul écouteur pour tout le formulaire ---------- */
fillSelects();
disableImpossibleOptions();
drawTable();

document.getElementById("controls").addEventListener("change", (event) => {
  if (event.target === selectA) decileA = Number(selectA.value);
  if (event.target === selectB) decileB = Number(selectB.value);
  if (event.target === selectSort) sortMode = selectSort.value;
  disableImpossibleOptions();
  updateFoodChart(event.target !== selectSort); // pas d'animation pour un simple tri
});

/* ---------- 8. Graphique 2 : courbes 2001-2025 ---------- */
const toPounds = (values) => values.map((pence) => pence / 100);   // 100 pence = 1 £

const trendChart = new Chart(document.getElementById("trend-chart"), {
  type: "line",
  data: {
    labels: EVOLUTION.years,
    datasets: [
      { label: "Poorest 10%", data: toPounds(EVOLUTION.homeD1), borderColor: COLORS.poor, backgroundColor: COLORS.poor, pointRadius: 0, tension: 0.2 },
      { label: "Richest 10%", data: toPounds(EVOLUTION.homeD10), borderColor: COLORS.rich, backgroundColor: COLORS.rich, pointRadius: 0, tension: 0.2 }
    ]
  },
  options: {
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },   // une infobulle pour les 2 courbes
    scales: {
      x: { ticks: { maxRotation: 0, autoSkipPadding: 12 } },
      y: { beginAtZero: true, title: { display: true, text: "£ per person per week" } }
    },
    plugins: { tooltip: { callbacks: { label: (item) => " " + item.dataset.label + ": £" + item.parsed.y.toFixed(2) } } }
  }
});

// Boutons "At home / Eating out"
document.getElementById("place").addEventListener("change", (event) => {
  const out = event.target.value === "out";
  trendChart.data.datasets[0].data = toPounds(out ? EVOLUTION.outD1 : EVOLUTION.homeD1);
  trendChart.data.datasets[1].data = toPounds(out ? EVOLUTION.outD10 : EVOLUTION.homeD10);
  trendChart.update();
});

/* ---------- 9. Animation d'arrivée (GSAP) ---------- */
if (!reduceMotion) gsap.from(".article-header > *", { opacity: 0, y: 20, duration: 0.6, stagger: 0.15 });
