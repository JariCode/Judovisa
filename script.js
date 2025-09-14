// -------------------------
// YLEISET APUFUNKTIOT
// -------------------------

/**
 * Muotoilee annetun tekstin vertailua varten.
 * - Poistaa ylimääräiset välilyönnit
 * - Poistaa yhdysmerkit
 * - Muuttaa kaiken pieniksi kirjaimiksi
 * -> Tämä mahdollistaa joustavamman vertailun käyttäjän syötteiden ja oikeiden vastausten välillä.
 */
function muotoileVertailuun(teksti) {
  return teksti.trim().replace(/-/g, '').replace(/\s+/g, ' ').toLowerCase();
}

// -------------------------
// KYSYMYSTEN TALLENNUS
// -------------------------

// Tänne tallennetaan kaikki kysymyksiin liittyvä data (oikeat vastaukset, yritykset, löydetyt vastaukset jne.)
const kysymysData = {};

// -------------------------
// YKSI KYSYMYS KERRALLAAN
// -------------------------

/**
 * Kysymysten järjestys muodostuu automaattisesti aina kun kutsutaan lisaaTapahtumat().
 * -> Näin uusia kysymyksiä voi lisätä helposti ilman manuaalista järjestyslistan ylläpitoa.
 */
const kysymysJarjestys = [];
let nykyinenIndex = 0; // Pitää kirjaa mikä kysymys on menossa

/**
 * Näyttää seuraavan kysymyksen ja piilottaa muut.
 * - Piilottaa aina kaikki muut kysymykset
 * - Näyttää vain nykyisen kysymyksen
 * - Jos kysymykset loppuvat, näyttää loppu-otsikon ja "Yritä uudelleen" -napin
 * - Vie aina kursorin näkyvän kysymyksen input-kenttään
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

  // Piilotetaan ne aluksi aina
  if (loppuOtsikko) loppuOtsikko.style.display = "none";
  if (nappiAlusta) nappiAlusta.style.display = "none";

  // Jos kysymyksiä on jäljellä
  if (nykyinenIndex < kysymysJarjestys.length) {
    const nykyinenId = kysymysJarjestys[nykyinenIndex];
    const nykyinenElem = document.getElementById(nykyinenId).closest(".kysymys");
    if (nykyinenElem) {
      nykyinenElem.style.display = "block";

      // Kursori suoraan input-kenttään → helpottaa käyttöä
      const input = document.getElementById(nykyinenId);
      if (input) input.focus();
    }
  } else if (loppuOtsikko && nappiAlusta) {
    // Jos kaikki kysymykset on käyty, näytetään loppuviesti ja alusta-nappi
    loppuOtsikko.style.display = "block";
    nappiAlusta.style.display = "inline-block";
  }
}

// -------------------------
// PÄÄTOIMINNALLISUUS
// -------------------------

/**
 * Tarkistaa käyttäjän syötteen tietylle kysymykselle.
 * - Vertaa syötettä oikeisiin vastauksiin
 * - Lisää palautteen listaan (oikein/väärin/jo annettu)
 * - Päivittää yritysten määrän
 * - Jos kysymys on valmis → siirrytään automaattisesti seuraavaan
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

  // Tarkistuslogiikka
  if (loydetyt.has(vertailtava) || vaarat.has(vertailtava)) {
    // Sama vastaus annettu jo
    li.textContent = `⚠️ ${syote.toUpperCase()} on jo annettu aiemmin`;
    li.style.color = "orange";
  } else if (oikeat.includes(vertailtava)) {
    // Oikea vastaus
    loydetyt.add(vertailtava);
    li.textContent = `✅ ${syote.toUpperCase()} on oikein`;
    li.style.color = "green";
  } else {
    // Väärä vastaus
    vaarat.add(vertailtava);
    li.textContent = `❌ ${syote.toUpperCase()} ei ole oikein`;
    li.style.color = "red";
  }

  palauteLista.appendChild(li);
  data.yritykset++;
  syoteKentta.value = "";

  // Jos kysymys valmis (yritykset loppu tai kaikki oikeat löytyneet)
  if (data.yritykset >= maxYritykset || loydetyt.size === oikeat.length) {
    if (data.yritykset >= maxYritykset) {
      const info = document.createElement("li");
      info.textContent = `⚠️ Olet käyttänyt kaikki ${maxYritykset} yritystä.`;
      info.style.color = "orange";
      palauteLista.appendChild(info);
    }

    // Input pois käytöstä
    syoteKentta.disabled = true;

    // Siirrytään seuraavaan kysymykseen
    nykyinenIndex++;
    naytaSeuraavaKysymys();
  }

  // Päivitetään yhteispisteet joka syötteen jälkeen
  laskeYhteispisteet();
}

/**
 * Lisää uuden kysymyksen järjestelmään:
 * - Tallentaa kysymystiedot
 * - Lisää sen kysymysjärjestykseen
 * - Liittää tapahtumat Enter-näppäimelle ja tarkistusnapille
 */
function lisaaTapahtumat(syotekenttaId, nappiId, palauteId, oikeat, maxYritykset) {
  // Tallennetaan kysymyksen data
  kysymysData[syotekenttaId] = {
    oikeat,
    maxYritykset,
    palauteId,
    loydetyt: new Set(),
    vaarat: new Set(),
    yritykset: 0
  };

  // Lisätään kysymys järjestykseen (näytetään siinä järjestyksessä missä tämä funktio kutsutaan)
  kysymysJarjestys.push(syotekenttaId);

  const syote = document.getElementById(syotekenttaId);
  const nappi = document.getElementById(nappiId);
  if (!syote || !nappi) return;

  // Enter-näppäimellä vastaus tarkistetaan
  syote.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      tarkistaVastaus(syotekenttaId);
    }
  });

  // Tarkista-nappi tekee saman
  nappi.addEventListener("click", () => {
    tarkistaVastaus(syotekenttaId);
  });
}

/**
 * Laskee kaikkien kysymysten yhteispisteet ja päivittää ne näkyviin.
 * - Lasketaan löydetyt oikeat ja väärät yhteensä
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

// Alusta-nappi palauttaa visan lähtötilanteeseen
const nappiAlusta = document.getElementById("nappiAloitaAlusta");
if (nappiAlusta) {
  nappiAlusta.addEventListener("click", () => {
    // Nollataan kaikki kysymykset ja palautetaan kentät alkuun
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
    naytaSeuraavaKysymys(); // Näyttää ensimmäisen kysymyksen ja vie kursorin siihen
    laskeYhteispisteet();
  });
}

// -------------------------
// KYSYMYSTEN MÄÄRITTELYT
// -------------------------
// Tänne lisätään kaikki kysymykset lisaaTapahtumat-funktiolla

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

// Kun sivu latautuu, näytetään ensimmäinen kysymys automaattisesti
naytaSeuraavaKysymys();

//Mobiili navi
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    menuToggle.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
  });
}












