function muotoileVertailuun(teksti) {
  return teksti
    .trim()
    .replace(/-/g, '')     // Poistaa yhdysmerkit
    .replace(/\s+/g, ' ')  // Yhdistää moninkertaiset välilyönnit
    .toLowerCase();
}

function tarkistaKesagatame() {
  const oikeat = [
    "kesagatame",
    "kuzurekesagatame",
    "katagatame",
    "makurakesagatame"
  ];

  const syoteKentta = document.getElementById("vastausKesagatame");
  const palauteLista = document.getElementById("palauteKesagatame");
  const syote = syoteKentta.value;

  const syotteet = syote
    .split(/[\s,]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const vertailtavat = syotteet.map(muotoileVertailuun);
  const uniikit = new Set(vertailtavat);

  // 🔍 Estetään duplikaatit
  if (uniikit.size < vertailtavat.length) {
    palauteLista.innerHTML = "";
    const li = document.createElement("li");
    li.textContent = "⚠️ Et voi käyttää samaa vastausta useammin kuin kerran. Aloita alusta.";
    li.style.color = "orange";
    palauteLista.appendChild(li);
    syoteKentta.value = "";
    return;
  }

  // ✅ Tarkistus
  palauteLista.innerHTML = "";

  let oikeinLkm = 0;

  syotteet.forEach(vastaus => {
    const vertailtava = muotoileVertailuun(vastaus);
    const li = document.createElement("li");
    if (oikeat.includes(vertailtava)) {
      oikeinLkm++;
      li.textContent = `✅ ${vastaus.replace(/-/g, '').toUpperCase()} on oikein`;
      li.style.color = "green";
    } else {
      li.textContent = `❌ ${vastaus.replace(/-/g, '').toUpperCase()} ei ole oikein`;
      li.style.color = "red";
    }
    palauteLista.appendChild(li);
  });

  const puuttuvat = oikeat.filter(oikea => !vertailtavat.includes(oikea));

  if (puuttuvat.length > 0) {
    const li = document.createElement("li");
    li.textContent = `ℹ️ Puuttuvia oikeita vastauksia: ${puuttuvat.length} kpl`;
    li.style.color = "blue";
    palauteLista.appendChild(li);
  }

  // 🎉 Näytetään oikeat vastaukset vain jos kaikki on oikein
  if (oikeinLkm === oikeat.length) {
    const li = document.createElement("li");
    li.textContent = `🎯 Kaikki oikein! Oikeat vastaukset: ${oikeat.map(v => v.toUpperCase()).join(', ')}`;
    li.style.color = "darkgreen";
    palauteLista.appendChild(li);
  }
}




