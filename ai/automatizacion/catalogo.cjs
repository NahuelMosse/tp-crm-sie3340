/**
 * El catálogo de criterios, leído de la sección 4 del informe.
 *
 * La sección 4 es la definición: acá no se transcribe nada. Afinar el catálogo
 * —agregar un criterio, renombrarlo, moverlo de grupo— se hace en el informe y
 * la automatización lo sigue sola.
 *
 * Es CommonJS a propósito: lo consumen los generadores, que son módulos ES, y
 * los tests, que Playwright compila a CommonJS. Al revés no funcionaría.
 */
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

/** Raíz del repositorio, desde ai/automatizacion. */
const RAIZ = join(__dirname, '..', '..');

const SECCION4 = join(RAIZ, 'humanos', 'informe', '04-criterios-de-analisis.md');

/**
 * @typedef  {object} Criterio
 * @property {string} id             'A.1.1'
 * @property {string} nombre
 * @property {string} procedimiento  La acción que se ejecuta sobre cada plataforma
 *
 * @typedef  {object} Grupo
 * @property {string}     id         'A.1'
 * @property {string}     nombre
 * @property {'A'|'B'}    parte
 * @property {boolean}    funcional  Lo declara el propio grupo en la sección 4
 * @property {Criterio[]} criterios
 */
function leer() {
  const texto = readFileSync(SECCION4, 'utf8').replace(/\r\n/g, '\n');
  const grupos = [];
  let actual = null;

  for (const linea of texto.split('\n')) {
    const encabezado = linea.match(/^### ([AB])\.(\d+) (.+)$/);
    if (encabezado) {
      const [, parte, numero, nombre] = encabezado;
      actual = { id: `${parte}.${numero}`, nombre: nombre.trim(), parte, funcional: true, criterios: [] };
      grupos.push(actual);
      continue;
    }
    if (!actual) continue;

    // Cada grupo declara debajo del título si sus criterios son funcionales
    if (/^\*Criterios no funcionales\./.test(linea)) { actual.funcional = false; continue; }

    const celdas = linea.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
    if (!/^[AB]\.\d+\.\d+$/.test(celdas[0])) continue;
    actual.criterios.push({ id: celdas[0], nombre: celdas[1], procedimiento: celdas[2] });
  }

  if (!grupos.length) throw new Error(`No se leyó ningún grupo de ${SECCION4}`);
  const huecos = grupos.filter(g => !g.criterios.length).map(g => g.id);
  if (huecos.length) throw new Error(`Grupos sin criterios en la sección 4: ${huecos.join(', ')}`);
  return grupos;
}

/** Grupos del catálogo, en el orden de la sección 4. */
const GRUPOS = leer();

/** Todos los criterios, aplanados, cada uno con el grupo y la parte a la que pertenece. */
const CRITERIOS = GRUPOS.flatMap(g =>
  g.criterios.map(c => ({ ...c, grupo: g.id, parte: g.parte, funcional: g.funcional })));

/** Un criterio por su identificador, o undefined si no existe. */
const criterio = (id) => CRITERIOS.find(c => c.id === id);

module.exports = { RAIZ, GRUPOS, CRITERIOS, criterio };
