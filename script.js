/****************************
 * CONFIGURACIÓN
 ****************************/
const SHEET_URL = "https://script.google.com/macros/s/AKfycbxCyOyZc-ie0N9yEH4E5wsVgQeJba2YEmWjbQLcNm4ZEjZ8TNAKOff7pEWD7BUgyNHQ/exec"; // México
const WHATSAPP_NUMERO = "522731180394"; // México

/****************************
 * PARTIDOS
 ****************************/
const partidosData = [
  "Puebla vs Mazatlán",
"Necaxa vs Monterrey",
"Pachuca vs León",
"Juárez vs Guadalajara",
"Cruz Azul vs Atlas",
"Querétaro vs Tijuana",
"América vs Atl. San Luis",
"Tigres vs Pumas",
"Toluca vs Santos",
"Inter vs Lecce"
];

/****************************
 * VARIABLES
 ****************************/
let quinielas = [];
let seleccionActual = [];

/****************************
 * PINTAR PARTIDOS
 ****************************/
const cont = document.getElementById("partidos");

partidosData.forEach((p, i) => {
  const local = p.split(" vs ")[0];
  const visitante = p.split(" vs ")[1];

  cont.innerHTML += `
    <div class="partido">
      <span class="equipo local">${local}</span>
      <div class="botones">
        <button onclick="sel(${i}, 'L', this)">L</button>
        <button onclick="sel(${i}, 'E', this)">E</button>
        <button onclick="sel(${i}, 'V', this)">V</button>
      </div>
      <span class="equipo visitante">${visitante}</span>
    </div>
  `;
});

/****************************
 * SELECCIÓN L / E / V
 ****************************/
function sel(i, v, btn) {
  seleccionActual[i] = v;
  btn.parentNode.querySelectorAll("button").forEach(b => b.classList.remove("seleccionado"));
  btn.classList.add("seleccionado");
}

/****************************
 * CALCULAR TOTAL
 ****************************/
function calcularTotal(cantidad) {
  let total = 0;
  const p6 = Math.floor(cantidad / 6);
  total += p6 * 50;
  cantidad %= 6;
  const p3 = Math.floor(cantidad / 3);
  total += p3 * 25;
  cantidad %= 3;
  total += cantidad * 10;
  return total;
}

/****************************
 * GENERAR FOLIO
 ****************************/
function generarFolio() {
  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let folio = "";
  for (let i = 0; i < 4; i++) folio += letras.charAt(Math.floor(Math.random() * letras.length));
  for (let i = 0; i < 4; i++) folio += Math.floor(Math.random() * 10);
  return folio;
}

/****************************
 * AGREGAR QUINIELA
 ****************************/
function agregar() {
  const nombre = document.getElementById("nombre").value.trim();
  const telefono = document.getElementById("telefono").value.trim();

  if (!nombre || !telefono) { alert("Ingresa nombre y teléfono"); return; }
  if (seleccionActual.length < partidosData.length) { alert("Selecciona todos los partidos"); return; }

  const participante = {
    folio: generarFolio(),
    nombre,
    telefono,
    pronosticos: [...seleccionActual]
  };

  quinielas.push(participante);

  // Guardar en Google Sheets
  fetch(SHEET_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      folio: participante.folio,
      nombre: participante.nombre,
      telefono: participante.telefono,
      p1: participante.pronosticos[0],
      p2: participante.pronosticos[1],
      p3: participante.pronosticos[2],
      p4: participante.pronosticos[3],
      p5: participante.pronosticos[4],
      p6: participante.pronosticos[5],
      p7: participante.pronosticos[6],
      p8: participante.pronosticos[7],
      p9: participante.pronosticos[8],
      p10: participante.pronosticos[9],
      total: calcularTotal(quinielas.length)
    })
  });

  mostrarRegistros();
  actualizar();
  limpiar();
}

/****************************
 * ACTUALIZAR TOTALES + WHATSAPP
 ****************************/
function actualizar() {
  const totalQ = quinielas.length;
  const totalP = calcularTotal(totalQ);

  document.getElementById("totalQ").innerText = totalQ;
  document.getElementById("totalP").innerText = totalP;

  let texto = "⚽ Quinielas GL ⚽\n\n";
  quinielas.forEach((q, i) => {
    texto += `${i + 1}) ${q.nombre} (${q.telefono})\nFolio: ${q.folio}\n`;
    q.pronosticos.forEach((p, j) => { texto += `P${j+1}: ${p}\n`; });
    texto += "\n";
  });
  texto += `Total quinielas: ${totalQ}\nTotal a pagar: $${totalP} MXN`;

  const wa = document.getElementById("whatsapp");
  wa.href = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(texto)}`;
  wa.style.pointerEvents = "auto";
  wa.style.opacity = "1";
}

/****************************
 * MOSTRAR REGISTROS EN TABLA
 ****************************/
function mostrarRegistros() {
  const tbody = document.querySelector("#registros tbody");
  tbody.innerHTML = "";
  quinielas.forEach((q, i) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${i+1}</td>
      <td>${q.folio}</td>
      <td>${q.nombre}</td>
      <td>${q.telefono}</td>
      <td>${q.pronosticos[0]}</td>
      <td>${q.pronosticos[1]}</td>
      <td>${q.pronosticos[2]}</td>
      <td>${q.pronosticos[3]}</td>
      <td>${q.pronosticos[4]}</td>
      <td>${q.pronosticos[5]}</td>
      <td>${q.pronosticos[6]}</td>
      <td>${q.pronosticos[7]}</td>
      <td>${q.pronosticos[8]}</td>
      <td>${q.pronosticos[9]}</td>
    `;
    tbody.appendChild(fila);
  });
}

/****************************
 * LIMPIAR SELECCIÓN
 ****************************/
function limpiar() {
  seleccionActual = [];
  document.querySelectorAll(".partido button").forEach(b => b.classList.remove("seleccionado"));
}

/****************************
 * ALEATORIO
 ****************************/
function aleatorio() {
  seleccionActual = [];
  document.querySelectorAll(".partido").forEach((p, i) => {
    const r = Math.floor(Math.random() * 3);
    const opciones = ["L","E","V"];
    seleccionActual[i] = opciones[r];
    p.querySelectorAll("button").forEach(b=>b.classList.remove("seleccionado"));
    p.querySelectorAll("button")[r].classList.add("seleccionado");
  });
}

/****************************
 * REINICIAR
 ****************************/
function reiniciar() {
  quinielas = [];
  mostrarRegistros();
  actualizar();
  limpiar();
}
