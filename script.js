// -------------------------
// YLEISET APUFUNKTIOT
// -------------------------

/**
 * Muotoilee annetun tekstin vertailua varten.
 * - poistaa alusta ja lopusta välilyönnit
 * - muuttaa kaikki kirjaimet pieniksi
 * - poistaa yhdysmerkit
 * - korvaa moninkertaiset välilyönnit yhdellä
 * @param {string} teksti - käyttäjän syöte
 * @returns {string} - muokattu vertailukelpoinen teksti
 */
function muotoileVertailuun(teksti) {
  return teksti.trim().replace(/-/g, '').replace(/\s+/g, ' ').toLowerCase();
}

// -------------------------
// KYSYMYSTEN TALLENNUS
// -------------------------

/**
 * Tallentaa kaikki kysymysten tiedot keskitetysti.
 * Jokaiselle kysymykselle luodaan oma olio, joka sisältää:
 * - oikeat vastaukset (taulukko)
 * - maxYritykset (numero)
 * - palautelistan id (string)
 * - löydetyt vastaukset (Set)
 * - väärät vastaukset (Set)
 * - käytetyt yritykset (numero)
 */
const kysymysData = {};

// -------------------------
// PÄÄTOIMINNALLISUUS
// -------------------------

/**
 * Tarkistaa käyttäjän vastauksen annetulle kysymykselle.
 * @param {string} syotekenttaId - syötekentän ID (esim. "vastausKesagatame")
 */
function tarkistaVastaus(syotekenttaId) {
  const data = kysymysData[syotekenttaId]; // haetaan kysymyksen asetukset
  if (!data) return; // jos asetuksia ei löydy, poistutaan

  const { oikeat, maxYritykset, loydetyt, vaarat } = data;
  const syoteKentta = document.getElementById(syotekenttaId);
  const palauteLista = document.getElementById(data.palauteId);

  if (!syoteKentta || !palauteLista) return; // jos DOM-elementtiä ei löydy, poistutaan

  // Haetaan käyttäjän syöte
  const syote = syoteKentta.value.trim();
  if (!syote) return; // jos kenttä tyhjä, ei tehdä mitään

  // Muotoillaan syöte vertailua varten
  const vertailtava = muotoileVertailuun(syote);

  // Luodaan lista-elementti palautetta varten
  const li = document.createElement("li");

  // Tarkistetaan, onko vastaus jo annettu
  if (loydetyt.has(vertailtava) || vaarat.has(vertailtava)) {
    li.textContent = `⚠️ ${syote.toUpperCase()} on jo annettu aiemmin`;
    li.style.color = "orange";
  }
  // Oikea vastaus
  else if (oikeat.includes(vertailtava)) {
    loydetyt.add(vertailtava);
    li.textContent = `✅ ${syote.toUpperCase()} on oikein`;
    li.style.color = "green";
  }
  // Väärä vastaus
  else {
    vaarat.add(vertailtava);
    li.textContent = `❌ ${syote.toUpperCase()} ei ole oikein`;
    li.style.color = "red";
  }

  // Lisätään palauterivi DOMiin
  palauteLista.appendChild(li);

  // Kasvatetaan käytettyjen yritysten määrää yhdellä
  data.yritykset++;

  // Jos nyt on käytetty kaikki sallitut yritykset → näytetään viesti heti
  if (data.yritykset >= maxYritykset) {
    const info = document.createElement("li");
    info.textContent = `⚠️ Olet käyttänyt kaikki ${maxYritykset} yritystä.`;
    info.style.color = "orange";
    palauteLista.appendChild(info);

    // Lukitaan syötekenttä, ettei käyttäjä voi antaa enää vastauksia
    syoteKentta.disabled = true;
  }

  // Tyhjennetään kenttä seuraavaa syöttöä varten
  syoteKentta.value = "";

  // Päivitetään loppupisteet reaaliajassa
  laskeYhteispisteet();
}

/**
 * Lisää tapahtumakuuntelijat kysymykseen.
 * Tallentaa myös kysymyksen asetukset kysymysData-objektiin.
 * @param {string} syotekenttaId - tekstikentän ID
 * @param {string} nappiId - napin ID
 * @param {string} palauteId - palautelistan ID
 * @param {string[]} oikeat - oikeiden vastausten lista
 * @param {number} maxYritykset - maksimiyritysten määrä
 */
function lisaaTapahtumat(syotekenttaId, nappiId, palauteId, oikeat, maxYritykset) {
  // Tallennetaan kysymyksen data keskitetysti
  kysymysData[syotekenttaId] = {
    oikeat,
    maxYritykset,
    palauteId,
    loydetyt: new Set(),
    vaarat: new Set(),
    yritykset: 0
  };

  // Haetaan DOM-elementit
  const syote = document.getElementById(syotekenttaId);
  const nappi = document.getElementById(nappiId);

  if (!syote || !nappi) return; // tarkistus, ettei DOM-virheitä

  // Enter-näppäin tarkistaa vastauksen
  syote.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      tarkistaVastaus(syotekenttaId);
    }
  });

  // Nappia painettaessa tarkistus
  nappi.addEventListener("click", () => {
    tarkistaVastaus(syotekenttaId);
  });
}

/**
 * Laskee kaikkien kysymysten yhteispisteet ja päivittää ne DOMiin.
 */
function laskeYhteispisteet() {
  const yhteispisteetEl = document.getElementById("yhteispisteet");
  if (!yhteispisteetEl) return;

  let kaikkiLoydetyt = 0;
  let kaikkiVaarat = 0;

  // Käydään läpi kaikki tallennetut kysymykset
  Object.values(kysymysData).forEach(data => {
    kaikkiLoydetyt += data.loydetyt.size;
    kaikkiVaarat += data.vaarat.size;
  });

  // Päivitetään DOM
  yhteispisteetEl.textContent =
    `Yhteispisteesi: Oikeat vastauksesi ${kaikkiLoydetyt}, Väärät vastauksesi ${kaikkiVaarat}`;
}

// -------------------------
// KYSYMYSTEN MÄÄRITTELYT
// -------------------------

// Kesagatame: max 5 yritystä
lisaaTapahtumat(
  "vastausKesagatame",
  "nappiKesagatame",
  "palauteKesagatame",
  ["kesagatame", "kuzurekesagatame", "katagatame", "makurakesagatame", "ushirokesagatame"],
  5
);

// Shihogatame: max 3 yritystä
lisaaTapahtumat(
  "vastausShihogatame",
  "nappiShihogatame",
  "palauteShihogatame",
  ["tateshihogatame", "kamishihogatame", "yokoshihogatame"],
  3
);

// Koshiwaza: max 6 yritystä
lisaaTapahtumat(
  "vastausKoshiwaza",
  "nappiKoshiwaza",
  "palauteKoshiwaza",
  ["ogoshi", "koshiguruma", "ukigoshi", "haraigoshi", "tsurigoshi", "tsurikomigoshi", "sodetsurikomigoshi", "hanegoshi", "utsurigoshi", "ushirogoshi"],
  6
);







