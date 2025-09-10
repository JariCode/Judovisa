// Funktio muotoilee annetun tekstin vertailua varten
// Poistaa ylimääräiset välilyönnit, yhdysmerkit ja muuttaa tekstin pieniksi kirjaimiksi
function muotoileVertailuun(teksti) {
  return teksti.trim().replace(/-/g, '').replace(/\s+/g, ' ').toLowerCase();
}

// Yleinen tarkistusfunktio visalle
// syotekenttaId: tekstikentän ID
// palauteId: palautelistan ID
// oikeat: taulukko oikeista vastauksista
// maxYritykset: sallittu määrä syöttökertoja
function tarkistaVastaus(syotekenttaId, palauteId, oikeat, maxYritykset = 4) {

  // Luodaan kysymyskohtaiset Setit ja yrityslaskuri, jos niitä ei vielä ole
  if (!window[`${syotekenttaId}_loydetyt`]) window[`${syotekenttaId}_loydetyt`] = new Set();
  if (!window[`${syotekenttaId}_vaarat`]) window[`${syotekenttaId}_vaarat`] = new Set();
  if (!window[`${syotekenttaId}_yritykset`]) window[`${syotekenttaId}_yritykset`] = 0;

  const loydetyt = window[`${syotekenttaId}_loydetyt`]; // oikeat vastaukset
  const vaarat = window[`${syotekenttaId}_vaarat`];     // väärät vastaukset
  let yritykset = window[`${syotekenttaId}_yritykset`]; // käytetyt yritykset

  // Haetaan DOM-elementit
  const syoteKentta = document.getElementById(syotekenttaId);
  const palauteLista = document.getElementById(palauteId);

  // Haetaan käyttäjän syöte
  const syote = syoteKentta.value.trim();
  if (!syote) return; // jos tyhjä, ei tehdä mitään

  // Jos yritykset loppu
  if (yritykset >= maxYritykset) {
    const li = document.createElement("li");
    li.textContent = `⚠️ Olet käyttänyt kaikki ${maxYritykset} yritystä.`;
    li.style.color = "orange";
    palauteLista.appendChild(li);
    syoteKentta.disabled = true;
    laskeYhteispisteet(); // päivitetään yhteispisteet myös tässä tilanteessa
    return;
  }

  // Muotoillaan syöte vertailua varten
  const vertailtava = muotoileVertailuun(syote);

  // Jos vastaus on jo annettu aiemmin
  if (loydetyt.has(vertailtava) || vaarat.has(vertailtava)) {
    const li = document.createElement("li");
    li.textContent = `⚠️ ${syote.toUpperCase()} on jo annettu aiemmin`;
    li.style.color = "orange";
    palauteLista.appendChild(li);
    syoteKentta.value = "";
    return;
  }

  // Tarkistetaan oikeellisuus
  const li = document.createElement("li");
  if (oikeat.includes(vertailtava)) {
    loydetyt.add(vertailtava);
    li.textContent = `✅ ${syote.toUpperCase()} on oikein`;
    li.style.color = "green";
  } else {
    vaarat.add(vertailtava);
    li.textContent = `❌ ${syote.toUpperCase()} ei ole oikein`;
    li.style.color = "red";
  }
  palauteLista.appendChild(li);

  // Poistetaan aiemmat puuttuvat-rivit
  const vanhatInfo = palauteLista.querySelectorAll(".puuttuvat");
  vanhatInfo.forEach(el => el.remove());

  // Näytetään puuttuvien oikeiden määrä (maxYritykset - oikeat vastaukset)
  const puuttuvat = Math.max(0, maxYritykset - loydetyt.size);
  if (puuttuvat > 0 && yritykset + 1 < maxYritykset) {
    const info = document.createElement("li");
    info.textContent = `ℹ️ Puuttuvia oikeita vastauksia: ${puuttuvat}`;
    info.style.color = "blue";
    info.classList.add("puuttuvat");
    palauteLista.appendChild(info);
  }

  // Lisätään yksi käytetty yritys
  window[`${syotekenttaId}_yritykset`]++;

  // Jos kaikki oikein tai yritykset loppu, näytetään yhteenveto
  if (loydetyt.size === maxYritykset || window[`${syotekenttaId}_yritykset`] >= maxYritykset) {
    const yhteenveto = document.createElement("li");
    yhteenveto.textContent = `🔎 Yhteenveto: Oikeat ${loydetyt.size}, Väärät ${vaarat.size}`;
    yhteenveto.style.color = "purple";
    palauteLista.appendChild(yhteenveto);
    syoteKentta.disabled = true;
  }

  // Tyhjennetään kenttä seuraavaa syöttöä varten
  syoteKentta.value = "";

  // Päivitetään loppupisteet reaaliajassa
  laskeYhteispisteet();
}

// Funktio nappien ja Enterin sitomiseen
function lisaaTapahtumat(syotekenttaId, nappiId, palauteId, oikeat, maxYritykset = 4) {

  // Enter-näppäin tarkistaa vastauksen
  document.getElementById(syotekenttaId).addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      tarkistaVastaus(syotekenttaId, palauteId, oikeat, maxYritykset);
    }
  });

  // Nappia painettaessa tarkistus
  document.getElementById(nappiId).addEventListener("click", function() {
    tarkistaVastaus(syotekenttaId, palauteId, oikeat, maxYritykset);
  });
}

// Funktio laskee kaikkien kysymysten yhteispisteet
function laskeYhteispisteet() {
  const yhteispisteetEl = document.getElementById("yhteispisteet");
  if (!yhteispisteetEl) return;

  // Lasketaan kaikkien kysymysten oikeat
  const kaikkiLoydetyt = Object.keys(window)
    .filter(k => k.endsWith("_loydetyt"))
    .map(k => window[k])
    .reduce((sum, setti) => sum + setti.size, 0);

  // Lasketaan kaikkien kysymysten väärät
  const kaikkiVaarat = Object.keys(window)
    .filter(k => k.endsWith("_vaarat"))
    .map(k => window[k])
    .reduce((sum, setti) => sum + setti.size, 0);

  // Päivitetään HTML-elementti
  yhteispisteetEl.textContent = `Yhteispisteesi: Oikeat vastauksesi ${kaikkiLoydetyt}, Väärät vastauksesi ${kaikkiVaarat}`;
}

// Käyttöesimerkit kysymyksistä

// Kesagatame: max 4 yritystä
lisaaTapahtumat(
  "vastausKesagatame",
  "nappiKesagatame",
  "palauteKesagatame",
  ["kesagatame", "kuzurekesagatame", "katagatame", "makurakesagatame"],
  4
);

// Koshiwaza: max 6 yritystä
lisaaTapahtumat(
  "vastausKoshiwaza",
  "nappiKoshiwaza",
  "palauteKoshiwaza",
  ["ogoshi", "koshiguruma", "ukigoski", "haraigoshi", "tsurigoshi", "tsurikomigoshi", "sodetsurikomigoshi", "hanegoshi", "utsurigoshi", "ushirogoshi"],
  6
);







