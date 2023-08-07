const worker = new Worker(new URL("./db.js", import.meta.url), { type: "module" });
const $iniciarBaseDeDatos = document.querySelector("#btnIniciarBaseDeDatos"),
  $insertar = document.querySelector("#btnInsertar"),
  $obtener = document.querySelector("#btnObtener"),
  $nombre = document.querySelector("#nombre"),
  $fechaNacimiento = document.querySelector("#fechaNacimiento"),
  $contenedorPersonas = document.querySelector("#contenedorPersonas");

$insertar.addEventListener("click", () => {
  worker.postMessage(["insertar_persona", { nombre: $nombre.value, fechaNacimiento: $fechaNacimiento.value }]);
});
$obtener.addEventListener("click", () => {
  worker.postMessage(["obtener_personas"]);
});
$iniciarBaseDeDatos.onclick = () => {
  worker.postMessage(["iniciar"]);
}
worker.onmessage = evento => {
  const accion = evento.data[0];
  const argumentos = evento.data[1];
  switch (accion) {
    case "iniciado":
      [$nombre, $fechaNacimiento, $insertar, $obtener].forEach(elemento => elemento.disabled = false);
      break;
    case "persona_insertada":
      console.log({ argumentos });
      break;
    case "personas_obtenidas":
      const personas = argumentos;
      $contenedorPersonas.innerHTML = "";
      for (const persona of personas) {
        $contenedorPersonas.innerHTML += `<strong>${persona.nombre}</strong> ${persona.fechaNacimiento}<br>`;
      }
      break;
  }
}

