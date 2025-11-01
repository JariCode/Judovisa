// Haetaan käyttöliittymän elementit
// Tässä haetaan kaikki sivulla tarvittavat HTML-elementit, joita tarvitaan kirjautumiseen, rekisteröintiin ja käyttöliittymän hallintaan.
const USERNAMEINPUT = document.getElementById("username");             // Käyttäjätunnus-kenttä kirjautumislomakkeessa
const PASSWORDINPUT = document.getElementById("password");             // Salasana-kenttä kirjautumislomakkeessa
const LOGINBUTTON = document.getElementById("loginButton");            // Kirjautumisnappi
const FEEDBACK = document.getElementById("loginFeedback");             // Kirjautumisen palauteviesti
const VISAWRAPPER = document.querySelector(".content-wrapper");        // Varsinainen sisältöalue, joka näkyy kirjautumisen jälkeen
const KIRJAUTUMINENDIV = document.getElementById("kirjautuminen");     // Kirjautumisnäkymän div
const REKISTEROINTILOMAKE = document.getElementById("rekisterointiLomake"); // Rekisteröintilomake
const REGISTERBUTTON = document.getElementById("registerButton");      // "Rekisteröidy" -painike kirjautumissivulla
const REKISTEROINTILINKKI = document.getElementById("rekisterointi");  // Linkki, joka näyttää rekisteröintilomakkeen
const SUBMITREGISTER = document.getElementById("submitRegister");      // Rekisteröintilomakkeen "Lähetä" -painike
const REGISTERFEEDBACK = document.getElementById("registerFeedback");  // Rekisteröinnin palauteviesti
const LOGOUTBUTTON = document.getElementById("logoutButton");          // "Kirjaudu ulos" -painike, näkyy sisäänkirjautuneena
const EDITUSERBUTTON = document.getElementById("editUserButton");      // Käyttäjän tietojen muokkauspainike (ei vielä käytössä)
const YLAPAINIKKEET = document.getElementById("ylapainikkeet");        // Yläpalkki, jossa mm. uloskirjautuminen

// Piilotetaan yläpalkki alussa (visaWrapper piilotetaan jo CSS:ssä)
// Käyttöliittymän yläpalkki ei näy ennen kuin käyttäjä on kirjautunut sisään.
YLAPAINIKKEET.style.display = "none";

// Evästeiden hyväksyntä
// Nämä muuttujat hallitsevat evästeilmoitusta. Käyttäjän on hyväksyttävä evästeet ennen kirjautumista tai rekisteröitymistä.
const COOKIEBANNER = document.getElementById("cookie-banner");         // Evästeilmoitusbanneri
const ACCEPTCOOKIESBTN = document.getElementById("acceptCookiesButton"); // "Hyväksy evästeet" -painike
let COOKIESACCEPTED = false;                                           // Boolean-arvo, joka kertoo onko evästeet hyväksytty

// Estetään kenttien käyttö ennen evästeiden hyväksyntää
// Tämä funktio estää kaikkien kirjautumis- ja rekisteröintikenttien käytön kunnes käyttäjä hyväksyy evästeet.
function disableAuth() {
  USERNAMEINPUT.disabled = true;
  PASSWORDINPUT.disabled = true;
  // LOGINBUTTON jätetään aktiiviseksi, jotta voidaan näyttää virheilmoitus painettaessa
  document.getElementById("newUsername").disabled = true;
  document.getElementById("firstName").disabled = true;
  document.getElementById("lastName").disabled = true;
  document.getElementById("email").disabled = true;
  document.getElementById("newPassword").disabled = true;
  SUBMITREGISTER.disabled = true;
}

// Sallitaan kenttien käyttö kun evästeet hyväksytty
// Tämä funktio tekee päinvastoin kuin disableAuth(): se sallii lomakkeiden käytön.
function enableAuth() {
  USERNAMEINPUT.disabled = false;
  PASSWORDINPUT.disabled = false;
  LOGINBUTTON.disabled = false;

  document.getElementById("newUsername").disabled = false;
  document.getElementById("firstName").disabled = false;
  document.getElementById("lastName").disabled = false;
  document.getElementById("email").disabled = false;
  document.getElementById("newPassword").disabled = false;
  SUBMITREGISTER.disabled = false;
}

// Alussa evästeet eivät ole hyväksytty → estetään käyttö
// Jos evästeilmoitus näkyy, lomakkeet lukitaan heti sivun latautuessa.
if (COOKIEBANNER && COOKIEBANNER.style.display !== "none") {
  disableAuth();
}

// Kun käyttäjä hyväksyy evästeet
// Kun käyttäjä painaa "Hyväksy evästeet" -painiketta, banneri piilotetaan ja kentät aktivoidaan.
ACCEPTCOOKIESBTN.addEventListener("click", () => {
  COOKIESACCEPTED = true;
  COOKIEBANNER.style.display = "none";
  enableAuth();

  // Tyhjennetään vanhat virheilmoitukset, jos niitä oli näkyvissä
  FEEDBACK.textContent = "";
  REGISTERFEEDBACK.textContent = "";
});

// Kirjautumisen tarkistus
// Tämä funktio suoritetaan, kun käyttäjä painaa kirjautumispainiketta.
function tarkistaLogin(event) {
  event.preventDefault(); // Estetään lomakkeen oletustoiminta (sivun uudelleenlataus)

  // Estetään kirjautuminen jos evästeitä ei ole hyväksytty
  if (!COOKIESACCEPTED) {
    FEEDBACK.textContent = "Hyväksy evästeet ennen kirjautumista!";
    FEEDBACK.style.color = "red";
    return;
  }

  const username = USERNAMEINPUT.value.trim(); // Poistetaan turhat välilyönnit käyttäjätunnuksesta
  const password = PASSWORDINPUT.value.trim(); // Poistetaan turhat välilyönnit salasanasta

  // Tarkistetaan että molemmat kentät on täytetty
  if (!username || !password) {
    FEEDBACK.textContent = "Täytä kaikki kentät!";
    FEEDBACK.style.color = "red";
    return;
  }

  // Lähetetään kirjautumispyyntö palvelimelle
  // Lähettää tiedot palvelimelle JSON-muodossa ja odottaa vastausta.
 /*fetch("https://judovisa-backend.onrender.com/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include", // 🔑 Tämä tarvitaan, koska backend sallii evästeet
  body: JSON.stringify({ username, password })
})*/

/*Paikallinen backend -yhteys XAMPPille*/
fetch("http://localhost:3001/login", {  // ← paikallinen backend
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username, password })
})

    .then(res => res.json()) // Muutetaan palvelimen vastaus JSON-muotoon
    .then(response => {
      if (response.success) {
        // Kirjautuminen onnistui → näytetään sisältö ja piilotetaan kirjautumislomake
        KIRJAUTUMINENDIV.style.display = "none";
        VISAWRAPPER.style.display = "flex";
        REKISTEROINTILINKKI.style.display = "none";
        YLAPAINIKKEET.style.display = "block";
        FEEDBACK.textContent = "";

        // Asetetaan fokus ensimmäiseen kysymyskenttään (jos sellainen löytyy)
        const firstInput = document.querySelector(".kysymykset input");
        if (firstInput) firstInput.focus();
      } else {
        // Jos palvelin palauttaa virheen (esim. väärä tunnus/salasana)
        FEEDBACK.textContent = response.message;
        FEEDBACK.style.color = "red";
      }
    })
    .catch(err => {
      // Jos yhteys palvelimeen epäonnistuu
      FEEDBACK.textContent = "Virhe yhteydessä palvelimeen.";
      FEEDBACK.style.color = "red";
      console.error(err);
    });
}

// Liitetään tapahtuma kirjautumisnapille
// Tämä yhdistää kirjautumispainikkeen klikkauksen tarkistaLogin()-funktioon.
LOGINBUTTON.addEventListener("click", tarkistaLogin);

// Rekisteröitymisnapin toiminta
// Kun käyttäjä painaa "Rekisteröidy", piilotetaan kirjautumislomake ja näytetään rekisteröintilomake.
REGISTERBUTTON.addEventListener("click", () => {
  if (!COOKIESACCEPTED) {
    FEEDBACK.textContent = "Hyväksy evästeet ennen rekisteröitymistä!";
    FEEDBACK.style.color = "red";
    return;
  }

  // Tyhjennetään mahdolliset vanhat palauteviestit
  REGISTERFEEDBACK.textContent = "";

  // Näytetään rekisteröintilomake ja piilotetaan kirjautumisnäkymä
  KIRJAUTUMINENDIV.style.display = "none";
  REKISTEROINTILOMAKE.style.display = "block";
  REKISTEROINTILINKKI.style.display = "none";

  // Asetetaan fokus ensimmäiseen rekisteröintikenttään
  const firstField = document.getElementById("newUsername");
  if (firstField) firstField.focus();
});

// Rekisteröintilähetys
// Tämä funktio suoritetaan, kun käyttäjä lähettää rekisteröintilomakkeen.
SUBMITREGISTER.addEventListener("click", () => {
  if (!COOKIESACCEPTED) {
    REGISTERFEEDBACK.textContent = "Hyväksy evästeet ennen rekisteröitymistä!";
    REGISTERFEEDBACK.style.color = "red";
    return;
  }

  // Haetaan lomakkeen tiedot ja tallennetaan ne objektiin
  const data = {
    username: document.getElementById("newUsername").value.trim(),
    firstname: document.getElementById("firstName").value.trim(),
    lastname: document.getElementById("lastName").value.trim(),
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("newPassword").value.trim()
  };

  // Tarkistetaan että kaikki kentät on täytetty ennen lähettämistä
  if (
    !data.username ||
    !data.firstname ||
    !data.lastname ||
    !data.email ||
    !data.password
  ) {
    REGISTERFEEDBACK.textContent = "Täytä kaikki kentät!";
    REGISTERFEEDBACK.style.color = "red";
    return;
  }

  // Lähetetään rekisteröintipyyntö palvelimelle
  fetch("http://localhost:3001/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
    .then(res => res.json()) // Muutetaan vastaus JSON-muotoon
    .then(response => {
      if (response.success) {
        // Jos rekisteröinti onnistuu, näytetään onnistumisviesti
        REGISTERFEEDBACK.textContent = "Rekisteröinti onnistui! Siirrytään kirjautumiseen...";
        REGISTERFEEDBACK.style.color = "green";

        // Pieni viive ennen siirtymistä takaisin kirjautumissivulle
        setTimeout(() => {
          REKISTEROINTILOMAKE.style.display = "none";
          KIRJAUTUMINENDIV.style.display = "block";
          REKISTEROINTILINKKI.style.display = "block";

          // Täytetään kirjautumiskentät valmiiksi uusilla tiedoilla
          USERNAMEINPUT.value = data.username;
          PASSWORDINPUT.value = data.password;
          USERNAMEINPUT.focus();
        }, 1500);
      } else {
        // Jos palvelin palauttaa virheen (esim. käyttäjätunnus varattu)
        REGISTERFEEDBACK.textContent = response.message;
        REGISTERFEEDBACK.style.color = "red";
      }
    })
    .catch(err => {
      // Yhteysvirhe tai muu ongelma
      REGISTERFEEDBACK.textContent = "Virhe yhteydessä palvelimeen.";
      REGISTERFEEDBACK.style.color = "red";
      console.error(err);
    });
});

// Kirjaudu ulos
// Tämä funktio palauttaa näkymän takaisin kirjautumissivulle ja piilottaa muun sisällön.
LOGOUTBUTTON.addEventListener("click", () => {
  VISAWRAPPER.style.display = "none";       // Piilottaa sisällön
  YLAPAINIKKEET.style.display = "none";     // Piilottaa yläpalkin
  KIRJAUTUMINENDIV.style.display = "block"; // Näyttää kirjautumislomakkeen
  REKISTEROINTILINKKI.style.display = "block"; // Näyttää "Rekisteröidy"-linkin

  // Tyhjennetään kentät ja palauteviestit
  USERNAMEINPUT.value = "";
  PASSWORDINPUT.value = "";
  FEEDBACK.textContent = "";
});

// Lisätään Enter-näppäin kirjautumiskentille
USERNAMEINPUT.addEventListener("keydown", (e) => {
  if (e.key === "Enter") LOGINBUTTON.click();
});

PASSWORDINPUT.addEventListener("keydown", (e) => {
  if (e.key === "Enter") LOGINBUTTON.click();
});

// Lisätään Enter-näppäin rekisteröintikentille
document.getElementById("newUsername").addEventListener("keydown", (e) => {
  if (e.key === "Enter") SUBMITREGISTER.click();
});
document.getElementById("firstName").addEventListener("keydown", (e) => {
  if (e.key === "Enter") SUBMITREGISTER.click();
});
document.getElementById("lastName").addEventListener("keydown", (e) => {
  if (e.key === "Enter") SUBMITREGISTER.click();
});
document.getElementById("email").addEventListener("keydown", (e) => {
  if (e.key === "Enter") SUBMITREGISTER.click();
});
document.getElementById("newPassword").addEventListener("keydown", (e) => {
  if (e.key === "Enter") SUBMITREGISTER.click();
});





