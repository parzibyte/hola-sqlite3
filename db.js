import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
const NOMBRE_BASE_DE_DATOS = "personas.sqlite"
let db;
const iniciar = async () => {
	const sqlite3 = await sqlite3InitModule({
		print: console.log,
		printErr: console.error,
	});
	if ('opfs' in sqlite3) {
		db = new sqlite3.oo1.OpfsDb(NOMBRE_BASE_DE_DATOS);
		console.log('OPFS is available, created persisted database at', db.filename);
	} else {
		db = new sqlite3.oo1.DB(NOMBRE_BASE_DE_DATOS, 'ct');
		console.log('OPFS is not available, created transient database', db.filename);
	}
	await db.exec(`CREATE TABLE IF NOT EXISTS personas(
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				nombre TEXT NOT NULL,
				fechaNacimiento TEXT NOT NULL)`);
}

const insertarPersona = async (nombre, fechaNacimiento) => {
	const filas = await db.exec({
		sql: "INSERT INTO personas(nombre, fechaNacimiento) VALUES (?, ?) RETURNING *",
		bind: [nombre, fechaNacimiento],
		returnValue: "resultRows",
		rowMode: "object",
	});
	return filas[0];
}
const obtenerPersonas = async () => {
	return await db.exec({
		sql: "SELECT id, nombre, fechaNacimiento FROM personas",
		returnValue: "resultRows",
		rowMode: "object",
	});
}
self.onmessage = async (evento) => {
	const accion = evento.data[0];
	const argumentos = evento.data[1];
	switch (accion) {
		case "iniciar":
			await iniciar();
			self.postMessage(["iniciado"]);
			break;
		case "insertar_persona":
			const personaRecienInsertada = await insertarPersona(argumentos.nombre, argumentos.fechaNacimiento);
			self.postMessage(["persona_insertada", personaRecienInsertada]);
			break;
		case "obtener_personas":
			const personas = await obtenerPersonas();
			self.postMessage(["personas_obtenidas", personas]);
			break;
	}
}
