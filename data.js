/**
 * data.js — Données nettoyées issues de tableur/SAE303_tableur_donnees.xlsx
 * Source : DEFRA, Family Food datasets (EIDExp_17Sep26.ods), Living Costs and Food Survey.
 * Unité : pence par personne et par semaine (household supplies), 2024-25.
 * deciles[0] = décile 1 (10 % les plus pauvres) … deciles[9] = décile 10 (10 % les plus riches).
 * rse = fiabilité (Relative Standard Error) pour D1 et D10 : "High"/"Very High" = à lire avec prudence.
 */
const FOOD_GROUPS = [
  { label: "Whole milk", deciles: [43.37, 28.97, 30.17, 25.39, 21.36, 18.94, 14.84, 20.43, 15.58, 19.01], rse: ["High", "High"] },
  { label: "Other milk & cream", deciles: [153.52, 186.21, 183.84, 190.38, 184.9, 201.32, 187.7, 190.13, 231.52, 230.14], rse: ["Medium", "Medium"] },
  { label: "Cheese", deciles: [72.68, 87.95, 108.66, 113.21, 117.68, 130.43, 113.9, 127.2, 142.84, 138.89], rse: ["High", "Medium"] },
  { label: "Fresh meat (beef, lamb, pork)", deciles: [137.49, 141.57, 146.94, 141.35, 135.03, 158.56, 183.58, 151.59, 145.58, 191.02], rse: ["Very High", "High"] },
  { label: "Poultry & meat products", deciles: [501.49, 450.96, 546.29, 540.11, 625.76, 596.14, 699.48, 569.1, 569.05, 631.14], rse: ["Medium", "Medium"] },
  { label: "Fish", deciles: [114.7, 118.89, 127.44, 133.21, 150.85, 140.45, 152.84, 149.53, 198.44, 247.21], rse: ["High", "High"] },
  { label: "Eggs", deciles: [55.24, 45.49, 53.54, 44.84, 49.02, 59.05, 45.29, 48.37, 54.79, 70.86], rse: ["High", "High"] },
  { label: "Fats & oils", deciles: [72.45, 62.57, 62.41, 71.86, 82.17, 75.69, 75.54, 83.36, 84.68, 72.17], rse: ["Medium", "Medium"] },
  { label: "Sugar & preserves", deciles: [18.28, 26.8, 28.51, 23.6, 27.78, 21.5, 22.2, 21.42, 30.5, 21.62], rse: ["High", "High"] },
  { label: "Chips & processed potatoes", deciles: [105.72, 140.58, 107.9, 125.8, 134.51, 121.54, 140.14, 124.55, 129.89, 99.42], rse: ["Medium", "High"] },
  { label: "Fresh green vegetables", deciles: [42.73, 37.99, 46.94, 41.48, 47.44, 58.27, 54.94, 63.26, 72.02, 80.86], rse: ["High", "High"] },
  { label: "Other fresh vegetables", deciles: [136.06, 114.83, 120.43, 135.27, 136.27, 152.09, 124.91, 150.1, 181.38, 194.78], rse: ["High", "Medium"] },
  { label: "Processed vegetables", deciles: [74.16, 92.47, 108.01, 100.44, 89.83, 104.08, 110.42, 117.51, 134.41, 174.42], rse: ["High", "Medium"] },
  { label: "Fresh fruit", deciles: [171.12, 188.74, 174.84, 182.99, 206.27, 202.9, 213.09, 205.61, 265.52, 322.65], rse: ["Medium", "Medium"] },
  { label: "Processed fruit", deciles: [81.12, 81.56, 91.27, 72.94, 93.64, 95.34, 80.89, 109.17, 130.63, 140.72], rse: ["Very High", "High"] },
  { label: "Bread", deciles: [99.34, 117.41, 121.88, 143.72, 148.23, 149.81, 136.8, 141.26, 158.96, 138.46], rse: ["Medium", "Medium"] },
  { label: "Flour", deciles: [5.19, 7.44, 4.88, 6.54, 6.14, 10.11, 3.3, 5.22, 5.58, 5.95], rse: ["Very High", "Very High"] },
  { label: "Cakes, buns & pastries", deciles: [89.8, 90.74, 96.29, 128.52, 110.77, 105.71, 96.54, 98.61, 109.47, 99.35], rse: ["Medium", "Medium"] },
  { label: "Other cereals (pasta, rice…)", deciles: [222.95, 250.86, 232.32, 259, 263.07, 265.99, 301.41, 299.37, 339.72, 342.76], rse: ["Medium", "Medium"] },
  { label: "Tea, coffee & hot drinks", deciles: [43.73, 65.34, 77.62, 79.29, 74.88, 73.19, 93.09, 88.88, 88.18, 108.96], rse: ["High", "High"] },
  { label: "Ready meals, sauces & other", deciles: [196.69, 190.79, 202.78, 206.85, 219.93, 232.77, 205.59, 243.64, 233.2, 274.4], rse: ["High", "Medium"] },
  { label: "Soft drinks", deciles: [121.8, 125.13, 125.88, 151.11, 153.27, 165.03, 125.36, 129.67, 124.64, 130.36], rse: ["High", "High"] },
  { label: "Confectionery", deciles: [124.22, 143.42, 132.09, 168.82, 158.79, 153.37, 164.3, 157.53, 172.6, 167.28], rse: ["High", "Medium"] },
  { label: "Alcoholic drinks", deciles: [166.13, 206.1, 335.47, 383.15, 319.76, 350.5, 383.16, 387.83, 664.21, 517.28], rse: ["High", "High"] }
];

/** Onglet Evolution : dépense alimentaire totale (hors alcool), pence/personne/semaine, prix courants. */
const EVOLUTION = {
  years: ["2001-02", "2002-03", "2003-04", "2004-05", "2005-06", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015", "2015-16", "2016-17", "2017-18", "2018-19", "2019-20", "2020-21", "2021-22", "2022-23", "2023-24", "2024-25"],
  homeD1: [1513.4, 1459.06, 1494.23, 1642.19, 1577.52, 1583.82, 1645.16, 1737.13, 1725.2, 1782.01, 1918.46, 2017.02, 2062.04, 2037.99, 2067.16, 2074.75, 1965.39, 2111.14, 2170.05, 2408.28, 2607.97, 2230.56, 2627, 2465.63, 2790.84],
  homeD10: [2450.9, 2523.75, 2623.77, 2610.88, 2879.63, 2835.65, 2837.1, 2949.74, 3093.81, 3037.95, 3155.38, 3378.05, 3437.11, 3344.61, 3285.15, 3354.14, 3328.95, 3369.57, 3540.7, 3498, 4413.44, 3606.22, 3480.71, 4079.69, 4055.08],
  outD1: [312.3, 322.97, 335.82, 371.55, 392.54, 394.93, 360.57, 325.42, 366.44, 397.95, 368.4, 418.27, 369.78, 438.66, 379.43, 369.53, 476.82, 443.83, 537.31, 541.68, 157.94, 274.46, 440.09, 300.64, 519.19],
  outD10: [1560.73, 1539.22, 1498.52, 1627.43, 1675.82, 1687.41, 1757.09, 1741.65, 1737.4, 1737.68, 1811.07, 1941.29, 1772.85, 1959.37, 2131.75, 2142.85, 2071.15, 1947.32, 2270.04, 2069.54, 566.33, 1447.09, 1260.8, 1690.96, 1698.63]
};
