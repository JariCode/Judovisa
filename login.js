// ==============================
// HAETAAN KÄYTTÖLIITTYMÄN ELEMENTIT
// ==============================
const USERNAMEINPUT = document.getElementById("username"); // Kirjautumistunnus
const PASSWORDINPUT = document.getElementById("password"); // Salasana
const LOGINBUTTON = document.getElementById("loginButton"); // Kirjautumisnappi
const FEEDBACK = document.getElementById("loginFeedback"); // Palaute kirjautumisesta
const VISAWRAPPER = document.querySelector(".content-wrapper"); // Judovisan sisältö wrapper
const KIRJAUTUMINENDIV = document.getElementById("kirjautuminen"); // Kirjautumisdiv
const REKISTEROINTILOMAKE = document.getElementById("rekisterointiLomake"); // Rekisteröintilomake
const REGISTERBUTTON = document.getElementById("registerButton"); // Rekisteröintinappi
const REKISTEROINTILINKKI = document.getElementById("rekisterointi"); // Rekisteröitymislinkki
const SUBMITREGISTER = document.getElementById("submitRegister"); // Luo käyttäjä -nappi
const REGISTERFEEDBACK = document.getElementById("registerFeedback"); // Rekisteröintipalaute
const LOGOUTBUTTON = document.getElementById("logoutButton"); // Kirjaudu ulos -nappi
const EDITUSERBUTTON = document.getElementById("editUserButton"); // Muokkaa tietoja -nappi
const YLAPAINIKKEET = document.getElementById("ylapainikkeet"); // Yläpalkki kirjautuneille

// ==============================
// ALOITUS: PIILOTETAAN YLÄPALKKI
// ==============================
YLAPAINIKKEET.style.display = "none";

// ==============================
// KIRJAUTUMISEN TARKISTUS
// ==============================
function tarkistaLogin(event) {
  event.preventDefault();

  const username = USERNAMEINPUT.value.trim();
  const password = PASSWORDINPUT.value.trim();

  if (!username || !password) {
    FEEDBACK.textContent = "Täytä kaikki kentät!";
    FEEDBACK.style.color = "red";
    return;
  }

  fetch("http://localhost:3001/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(response => {
      if (response.success) {
        // Näytetään peli ja piilotetaan kirjautuminen
        KIRJAUTUMINENDIV.style.display = "none";
        VISAWRAPPER.style.display = "flex";
        REKISTEROINTILINKKI.style.display = "none";
        YLAPAINIKKEET.style.display = "block";
        FEEDBACK.textContent = "";

        // Fokus ensimmäiseen inputtiin kysymyksissä
        const firstInput = document.querySelector(".kysymykset input");
        if (firstInput) firstInput.focus();
      } else {
        FEEDBACK.textContent = response.message;
        FEEDBACK.style.color = "red";
      }
    })
    .catch(err => {
      FEEDBACK.textContent = "Virhe yhteydessä palvelimeen.";
      FEEDBACK.style.color = "red";
      console.error(err);
    });
}

// ==============================
// LIITETÄÄN KIRJAUTUMISNAPIN TAPAHTUMA
// ==============================
LOGINBUTTON.addEventListener("click", tarkistaLogin);

// ==============================
// REKISTERÖITYMISNAPIN TOIMINTA
// ==============================
REGISTERBUTTON.addEventListener("click", () => {
  REGISTERFEEDBACK.textContent = "";

  // Piilotetaan kirjautuminen ja näytetään rekisteröintilomake
  KIRJAUTUMINENDIV.style.display = "none";
  REKISTEROINTILOMAKE.style.display = "block";
  REKISTEROINTILINKKI.style.display = "none";

  // Fokus ensimmäiseen kenttään
  const firstField = document.getElementById("newUsername");
  if (firstField) firstField.focus();
});

// ==============================
// REKISTERÖINTILÄHETYS
// ==============================
SUBMITREGISTER.addEventListener("click", () => {
  REGISTERFEEDBACK.textContent = "";

  // ==============================
  // TARKISTETAAN: ONKO RUKSI VALITTU
  // ==============================
  const accepted = document.getElementById("acceptPrivacyPolicy").checked;
  if (!accepted) {
    REGISTERFEEDBACK.textContent = "Hyväksy käyttöehdot ennen rekisteröitymistä!";
    REGISTERFEEDBACK.style.color = "red";
    return; // Lopetetaan funktio, jos ruksi ei ole valittuna
  }

  // ==============================
  // HAETAAN KENTTIEN ARVOT
  // ==============================
  const data = {
    username: document.getElementById("newUsername").value.trim(),
    firstname: document.getElementById("firstName").value.trim(),
    lastname: document.getElementById("lastName").value.trim(),
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("newPassword").value.trim()
  };

  // ==============================
  // TARKISTETAAN, ETTÄ KAIKKI KENTÄT ON TÄYTETTY
  // ==============================
  if (!data.username || !data.firstname || !data.lastname || !data.email || !data.password) {
    REGISTERFEEDBACK.textContent = "Täytä kaikki kentät!";
    REGISTERFEEDBACK.style.color = "red";
    return;
  }

  // ==============================
  // LÄHETETÄÄN DATA PALVELIMELLE
  // ==============================
  fetch("http://localhost:3001/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(response => {
      if (response.success) {
        REGISTERFEEDBACK.textContent = "Rekisteröinti onnistui! Siirrytään kirjautumiseen...";
        REGISTERFEEDBACK.style.color = "green";

        // ==============================
        // PALAUTETAAN KIRJAUTUMISNÄYTTÖ
        // ==============================
        setTimeout(() => {
          REKISTEROINTILOMAKE.style.display = "none";
          KIRJAUTUMINENDIV.style.display = "block";
          REKISTEROINTILINKKI.style.display = "block";

          USERNAMEINPUT.value = data.username;
          PASSWORDINPUT.value = data.password;
          USERNAMEINPUT.focus();
        }, 1500);
      } else {
        REGISTERFEEDBACK.textContent = response.message;
        REGISTERFEEDBACK.style.color = "red";
      }
    })
    .catch(err => {
      REGISTERFEEDBACK.textContent = "Virhe yhteydessä palvelimeen.";
      REGISTERFEEDBACK.style.color = "red";
      console.error(err);
    });
});

// ==============================
// KIRJAUDU ULOS
// ==============================
LOGOUTBUTTON.addEventListener("click", () => {
  VISAWRAPPER.style.display = "none";
  YLAPAINIKKEET.style.display = "none";
  KIRJAUTUMINENDIV.style.display = "block";
  REKISTEROINTILINKKI.style.display = "block";

  USERNAMEINPUT.value = "";
  PASSWORDINPUT.value = "";
  FEEDBACK.textContent = "";
});

// ==============================
// ENTER-NÄPPÄIMET KIRJAUTUMISESSA
// ==============================
USERNAMEINPUT.addEventListener("keydown", (e) => { if (e.key === "Enter") LOGINBUTTON.click(); });
PASSWORDINPUT.addEventListener("keydown", (e) => { if (e.key === "Enter") LOGINBUTTON.click(); });

// ==============================
// ENTER-NÄPPÄIMET REKISTERÖINNISSÄ
// ==============================
document.getElementById("newUsername").addEventListener("keydown", (e) => { if (e.key === "Enter") SUBMITREGISTER.click(); });
document.getElementById("firstName").addEventListener("keydown", (e) => { if (e.key === "Enter") SUBMITREGISTER.click(); });
document.getElementById("lastName").addEventListener("keydown", (e) => { if (e.key === "Enter") SUBMITREGISTER.click(); });
document.getElementById("email").addEventListener("keydown", (e) => { if (e.key === "Enter") SUBMITREGISTER.click(); });
document.getElementById("newPassword").addEventListener("keydown", (e) => { if (e.key === "Enter") SUBMITREGISTER.click(); });





