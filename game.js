// -------------------------
// YLEISET APUFUNKTIOT
// -------------------------

/**
 * Muotoilee annetun tekstin vertailua varten.
 * Poistaa välilyönnit ja yhdysmerkit, muuttaa pieniksi kirjaimiksi.
 * Näin käyttäjän syötteet ja oikeat vastaukset voidaan verrata joustavasti.
 */
function muotoileVertailuun(teksti) {
  return teksti.trim().replace(/[-\s]/g, '').toLowerCase();
}

// -------------------------
// KYSYMYSTEN TALLENNUS
// -------------------------

/**
 * Kaikki kysymysten tiedot tallennetaan tähän olioon.
 * Avain on syötekentän id, arvo sisältää oikeat vastaukset, yritykset, löydetyt ja väärät vastaukset.
 */
const KYSYMYS_DATA = {};

// -------------------------
// KYSYMYSJÄRJESTYS JA NYKYINEN KYSYMYS
// -------------------------

/**
 * KYSYMYS_JARJESTYS sisältää kaikkien kysymysten syötekenttien id:t siinä järjestyksessä,
 * missä ne lisätään lisaaTapahtumat()-funktiolla.
 */
const KYSYMYS_JARJESTYS = [];

/**
 * nykyinenIndex kertoo, mikä kysymys on parhaillaan näytössä.
 */
let nykyinenIndex = 0;

// -------------------------
// KYSYMYKSEN NÄYTTÄMINEN
// -------------------------

/**
 * Näyttää seuraavan kysymyksen ja piilottaa muut.
 * Jos kaikki kysymykset on käyty, näyttää loppuviestin ja alusta-napin.
 */
function naytaSeuraavaKysymys() {
  KYSYMYS_JARJESTYS.forEach(ID => {
    const ELEM = document.getElementById(ID).closest(".kysymys");
    if (ELEM) ELEM.style.display = "none";
  });

  const LOPPU_OTSIKKO = document.getElementById("loppu-otsikko");
  const NAPPI_ALUSTA = document.getElementById("nappiAloitaAlusta");

  if (LOPPU_OTSIKKO) LOPPU_OTSIKKO.style.display = "none";
  if (NAPPI_ALUSTA) NAPPI_ALUSTA.style.display = "none";

  if (nykyinenIndex < KYSYMYS_JARJESTYS.length) {
    const NYKYINEN_ID = KYSYMYS_JARJESTYS[nykyinenIndex];
    const NYKYINEN_ELEM = document.getElementById(NYKYINEN_ID).closest(".kysymys");
    if (NYKYINEN_ELEM) {
      NYKYINEN_ELEM.style.display = "block";
      // Vie fokuksen syötekenttään
      const INPUT = document.getElementById(NYKYINEN_ID);
      if (INPUT) INPUT.focus();
    }
  } else if (LOPPU_OTSIKKO && NAPPI_ALUSTA) {
    // Kaikki kysymykset käyty, näytetään loppuviesti ja alusta-nappi
    LOPPU_OTSIKKO.style.display = "block";
    NAPPI_ALUSTA.style.display = "inline-block";
  }
}

// -------------------------
// VASTAUKSEN TARKISTUS
// -------------------------

/**
 * Tarkistaa käyttäjän syötteen, päivittää palautteen ja yritykset.
 * Jos yritykset loppuvat tai kaikki oikeat löytyvät, siirrytään seuraavaan kysymykseen viiveellä.
 */
function tarkistaVastaus(syotekenttaId) {
  const DATA = KYSYMYS_DATA[syotekenttaId];
  if (!DATA) return;

  const { oikeat, maxYritykset, loydetyt, vaarat } = DATA;
  const SYOTE_KENTTA = document.getElementById(syotekenttaId);
  const PALAUTE_LISTA = document.getElementById(DATA.palauteId);
  if (!SYOTE_KENTTA || !PALAUTE_LISTA) return;

  const SYOTE = SYOTE_KENTTA.value.trim();
  if (!SYOTE) return;

  const VERTAILTAVA = muotoileVertailuun(SYOTE);
  const LI = document.createElement("li");

  // Tarkista onko vastaus jo annettu
  if (loydetyt.has(VERTAILTAVA) || vaarat.has(VERTAILTAVA)) {
    LI.textContent = `⚠️ ${SYOTE.toUpperCase()} on jo annettu aiemmin`;
    LI.style.color = "orange";
  } else if (oikeat.includes(VERTAILTAVA)) {
    // Oikea vastaus
    loydetyt.add(VERTAILTAVA);
    LI.textContent = `✅ ${SYOTE.toUpperCase()} on oikein`;
    LI.style.color = "green";
  } else {
    // Väärä vastaus
    vaarat.add(VERTAILTAVA);
    LI.textContent = `❌ ${SYOTE.toUpperCase()} ei ole oikein`;
    LI.style.color = "red";
  }

  // Näytä palaute
  PALAUTE_LISTA.appendChild(LI);

  // Päivitä yritykset ja tyhjennä kenttä
  DATA.yritykset++;
  SYOTE_KENTTA.value = "";

  // Jos yritykset loppu tai kaikki oikeat löytyneet
  if (DATA.yritykset >= maxYritykset || loydetyt.size === oikeat.length) {
    if (DATA.yritykset >= maxYritykset && loydetyt.size < oikeat.length) {
      // Kaikki yritykset käytetty, näytä info
      const INFO = document.createElement("li");
      INFO.textContent = `⚠️ Olet käyttänyt kaikki ${maxYritykset} yritystä.`;
      INFO.style.color = "orange";
      PALAUTE_LISTA.appendChild(INFO);
    }

    // Estä syöttö
    SYOTE_KENTTA.disabled = true;

    // Siirry seuraavaan kysymykseen pienen viiveen jälkeen
    nykyinenIndex++;
    setTimeout(() => {
      naytaSeuraavaKysymys();
    }, 2000);
  }

  // Päivitä yhteispisteet
  laskeYhteispisteet();
}

// -------------------------
// TAPAHTUMIEN LISÄYS KYSYMYKSIIN
// -------------------------

/**
 * Lisää tapahtumat syötekentälle ja napille.
 * Tallentaa kysymyksen tiedot KYSYMYS_DATA:an ja lisää id:n KYSYMYS_JARJESTYS:iin.
 */
function lisaaTapahtumat(syotekenttaId, nappiId, palauteId, oikeat, maxYritykset) {
  KYSYMYS_DATA[syotekenttaId] = {
    oikeat,
    maxYritykset,
    palauteId,
    loydetyt: new Set(),
    vaarat: new Set(),
    yritykset: 0
  };

  KYSYMYS_JARJESTYS.push(syotekenttaId);

  const SYOTE = document.getElementById(syotekenttaId);
  const NAPPI = document.getElementById(nappiId);
  if (!SYOTE || !NAPPI) return;

  // Enter-näppäin tarkistaa vastauksen
  SYOTE.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      tarkistaVastaus(syotekenttaId);
    }
  });

  // Tarkista-nappi tarkistaa vastauksen
  NAPPI.addEventListener("click", () => {
    tarkistaVastaus(syotekenttaId);
  });
}

// -------------------------
// YHTEISPISTEIDEN LASKENTA
// -------------------------

/**
 * Laskee kaikkien kysymysten oikeat ja väärät vastaukset ja päivittää ne näkyviin.
 */
function laskeYhteispisteet() {
  const YHTEISPISTEET_EL = document.getElementById("yhteispisteet");
  if (!YHTEISPISTEET_EL) return;

  let kaikkiLoydetyt = 0;
  let kaikkiVaarat = 0;

  Object.values(KYSYMYS_DATA).forEach(DATA => {
    kaikkiLoydetyt += DATA.loydetyt.size;
    kaikkiVaarat += DATA.vaarat.size;
  });

  YHTEISPISTEET_EL.textContent =
    `Yhteispisteesi: Oikeat vastaukset ${kaikkiLoydetyt}, Väärät vastaukset ${kaikkiVaarat}`;
}

// -------------------------
// ALUSTUS: "Yritä uudelleen" -nappi
// -------------------------

/**
 * Alusta-nappi palauttaa visan lähtötilaan.
 * Nollaa kaikki löydetyt ja väärät vastaukset sekä yritykset.
 */
const NAPPI_ALUSTA = document.getElementById("nappiAloitaAlusta");
if (NAPPI_ALUSTA) {
  NAPPI_ALUSTA.addEventListener("click", () => {
    Object.entries(KYSYMYS_DATA).forEach(([KEY, DATA]) => {
      DATA.loydetyt.clear();
      DATA.vaarat.clear();
      DATA.yritykset = 0;

      const SYOTE_KENTTA = document.getElementById(KEY);
      if (SYOTE_KENTTA) {
        SYOTE_KENTTA.disabled = false;
        SYOTE_KENTTA.value = "";
      }

      const PALAUTE_LISTA = document.getElementById(DATA.palauteId);
      if (PALAUTE_LISTA) PALAUTE_LISTA.innerHTML = "";
    });

    nykyinenIndex = 0;
    naytaSeuraavaKysymys();
    laskeYhteispisteet();
  });
}

// -------------------------
// KYSYMYSTEN MÄÄRITTELYT
// -------------------------

// Lisää kaikki kysymykset tähän
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
    "morotegari", "kuchikitaoshi", "kibisugaeshi", "uchimatasukashi", "kouchigaeshi"],
  6
);

lisaaTapahtumat(
  "vastausKoshiwaza",
  "nappiKoshiwaza",
  "palauteKoshiwaza",
  ["ogoshi","koshiguruma","ukigoshi","haraigoshi","tsurigoshi","tsurikomigoshi","sodetsurikomigoshi","hanegoshi","utsurigoshi","ushirogoshi"],
  6
);

// -------------------------
// VISAN KÄYNNISTYS
// -------------------------

// Näytä ensimmäinen kysymys kun sivu latautuu
naytaSeuraavaKysymys();














