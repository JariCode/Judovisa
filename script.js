// -------------------------
// YLEISET APUFUNKTIOT
// -------------------------

/**
 * Muotoilee annetun tekstin vertailua varten.
 * Poistaa ylimääräiset välilyönnit, yhdysmerkit ja muuttaa tekstin pieniksi kirjaimiksi.
 * @param {string} teksti
 * @returns {string}
 */
function muotoileVertailuun(teksti) {
  return teksti.trim().replace(/-/g, '').replace(/\s+/g, ' ').toLowerCase();
}

// -------------------------
// KYSYMYSTEN TALLENNUS
// -------------------------
const kysymysData = {};

// -------------------------
// YKSI KYSYMYS KERRALLAAN
// -------------------------

/**
 * Kysymysten järjestys muodostuu automaattisesti lisaaTapahtumat kutsuista.
 */
const kysymysJarjestys = [];
let nykyinenIndex = 0;

/**
 * Näyttää seuraavan kysymyksen, piilottaa muut kysymykset ja hallitsee loppu-otsikon sekä "Yritä uudelleen" napin näkyvyyden.
 */
function naytaSeuraavaKysymys() {
  // Piilotetaan kaikki kysymykset
  kysymysJarjestys.forEach(id => {
    const elem = document.getElementById(id).closest(".kysymys");
    if (elem) elem.style.display = "none";
  });

  // Haetaan loppu-otsikko ja alusta-nappi
  const loppuOtsikko = document.getElementById("loppu-otsikko");
  const nappiAlusta = document.getElementById("nappiAloitaAlusta");

  // Aluksi piilotetaan loppu-otsikko ja alusta-nappi
  if (loppuOtsikko) loppuOtsikko.style.display = "none";
  if (nappiAlusta) nappiAlusta.style.display = "none";

  // Näytetään nykyinen kysymys, jos kysymyksiä on jäljellä
  if (nykyinenIndex < kysymysJarjestys.length) {
    const nykyinenElem = document.getElementById(kysymysJarjestys[nykyinenIndex]).closest(".kysymys");
    if (nykyinenElem) nykyinenElem.style.display = "block";
  } else if (loppuOtsikko && nappiAlusta) {
    // Visa päättynyt -> näytetään loppu-otsikko ja alusta-nappi
    loppuOtsikko.style.display = "block";
    nappiAlusta.style.display = "inline-block";
  }
}

// -------------------------
// PÄÄTOIMINNALLISUUS
// -------------------------

/**
 * Tarkistaa käyttäjän syötteen annetulle kysymykselle.
 * @param {string} syotekenttaId - syötekentän ID
 */
function tarkistaVastaus(syotekenttaId) {
  const data = kysymysData[syotekenttaId];
  if (!data) return;

  const { oikeat, maxYritykset, loydetyt, vaarat } = data;
  const syoteKentta = document.getElementById(syotekenttaId);
  const palauteLista = document.getElementById(data.palauteId);
  if (!syoteKentta || !palauteLista) return;

  const syote = syoteKentta.value.trim();
  if (!syote) return;

  const vertailtava = muotoileVertailuun(syote);
  const li = document.createElement("li");

  if (loydetyt.has(vertailtava) || vaarat.has(vertailtava)) {
    li.textContent = `⚠️ ${syote.toUpperCase()} on jo annettu aiemmin`;
    li.style.color = "orange";
  } else if (oikeat.includes(vertailtava)) {
    loydetyt.add(vertailtava);
    li.textContent = `✅ ${syote.toUpperCase()} on oikein`;
    li.style.color = "green";
  } else {
    vaarat.add(vertailtava);
    li.textContent = `❌ ${syote.toUpperCase()} ei ole oikein`;
    li.style.color = "red";
  }

  palauteLista.appendChild(li);
  data.yritykset++;
  syoteKentta.value = "";

  // Jos kysymys valmis, siirrytään seuraavaan
  if (data.yritykset >= maxYritykset || loydetyt.size === oikeat.length) {
    if (data.yritykset >= maxYritykset) {
      const info = document.createElement("li");
      info.textContent = `⚠️ Olet käyttänyt kaikki ${maxYritykset} yritystä.`;
      info.style.color = "orange";
      palauteLista.appendChild(info);
    }

    syoteKentta.disabled = true;
    nykyinenIndex++;
    naytaSeuraavaKysymys(); // Seuraava kysymys tai loppu-otsikko näkyviin
  }

  laskeYhteispisteet(); // Päivitetään pisteet
}

/**
 * Lisää kysymykselle tapahtumat (Enter + nappi) ja tallentaa sen tiedot.
 */
function lisaaTapahtumat(syotekenttaId, nappiId, palauteId, oikeat, maxYritykset) {
  // Tallennetaan kysymys dataan
  kysymysData[syotekenttaId] = {
    oikeat,
    maxYritykset,
    palauteId,
    loydetyt: new Set(),
    vaarat: new Set(),
    yritykset: 0
  };

  // Lisätään automaattisesti kysymysjärjestykseen
  kysymysJarjestys.push(syotekenttaId);

  const syote = document.getElementById(syotekenttaId);
  const nappi = document.getElementById(nappiId);
  if (!syote || !nappi) return;

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
 * Laskee kaikkien kysymysten yhteispisteet ja päivittää DOMiin.
 */
function laskeYhteispisteet() {
  const yhteispisteetEl = document.getElementById("yhteispisteet");
  if (!yhteispisteetEl) return;

  let kaikkiLoydetyt = 0;
  let kaikkiVaarat = 0;

  Object.values(kysymysData).forEach(data => {
    kaikkiLoydetyt += data.loydetyt.size;
    kaikkiVaarat += data.vaarat.size;
  });

  yhteispisteetEl.textContent =
    `Yhteispisteesi: Oikeat vastauksesi ${kaikkiLoydetyt}, Väärät vastauksesi ${kaikkiVaarat}`;
}

// -------------------------
// ALUSTUS: "Yritä uudelleen" -nappi
// -------------------------

const nappiAlusta = document.getElementById("nappiAloitaAlusta");
if (nappiAlusta) {
  nappiAlusta.addEventListener("click", () => {
    // Nollataan kaikki kysymykset
    Object.entries(kysymysData).forEach(([key, data]) => {
      data.loydetyt.clear();
      data.vaarat.clear();
      data.yritykset = 0;

      const syoteKentta = document.getElementById(key);
      if (syoteKentta) syoteKentta.disabled = false;

      const palauteLista = document.getElementById(data.palauteId);
      if (palauteLista) palauteLista.innerHTML = "";
    });

    // Aloitetaan alusta
    nykyinenIndex = 0;
    naytaSeuraavaKysymys();
    laskeYhteispisteet();
  });
}

// -------------------------
// KYSYMYSTEN MÄÄRITTELYT
// -------------------------

lisaaTapahtumat(
  "vastausKesagatame",
  "nappiKesagatame",
  "palauteKesagatame",
  ["kesagatame","kuzurekesagatame","katagatame","makurakesagatame","ushirokesagatame"],
  5
);

lisaaTapahtumat(
  "vastausShihogatame",
  "nappiShihogatame",
  "palauteShihogatame",
  ["tateshihogatame","kamishihogatame","yokoshihogatame"],
  3
);

lisaaTapahtumat(
  "vastausTewaza",
  "nappiTewaza",
  "palauteTewaza",
  ["seoinage", "kataguruma", "taiotoshi", "ipponseoinage", "seoiotoshi", "sukuinage", "obiotoshi", "ukiotoshi","sumiotoshi", "yamaarashi", "obitorigaeshi", 
    "morotegari", "kuchikitaoshi", "kibisugaeshi", "uchimatasukashi", "kouchigaeshi"  ],
  6
);

lisaaTapahtumat(
  "vastausKoshiwaza",
  "nappiKoshiwaza",
  "palauteKoshiwaza",
  ["ogoshi","koshiguruma","ukigoshi","haraigoshi","tsurigoshi","tsurikomigoshi","sodetsurikomigoshi","hanegoshi","utsurigoshi","ushirogoshi"],
  6
);

// Näytetään ensimmäinen kysymys sivun latautuessa
naytaSeuraavaKysymys();











