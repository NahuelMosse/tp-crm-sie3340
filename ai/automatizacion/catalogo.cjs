/**
 * El catálogo de criterios, leído de la sección 3 del informe.
 *
 * La sección 3 es la definición: acá no se transcribe nada. Afinar el catálogo
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

const SECCION4 = join(RAIZ, 'humanos', 'informe', '03-criterios-de-analisis.md');

/**
 * @typedef  {object} Criterio
 * @property {string} id             'A.1.1'
 * @property {string} nombre
 * @property {string} procedimiento  La acción que se ejecuta sobre cada plataforma
 * @property {string} necesidad      Qué resuelve para la compañía
 * @property {'funcional'|'tecnica'|'operativa'} tipo
 *
 * @typedef  {object} Grupo
 * @property {string}     id         'A.1'
 * @property {string}     nombre
 * @property {'A'|'B'}    parte
 * @property {boolean}    funcional  Lo declara el propio grupo en la sección 3
 * @property {Criterio[]} criterios
 */
function leer() {
  const texto = readFileSync(SECCION4, 'utf8').replace(/\r\n/g, '\n');
  const grupos = [];
  let actual = null;
  let columnas = [];

  for (const linea of texto.split('\n')) {
    const encabezado = linea.match(/^### ([AB])\.(\d+) (.+)$/);
    if (encabezado) {
      const [, parte, numero, nombre] = encabezado;
      actual = { id: `${parte}.${numero}`, nombre: nombre.trim(), parte, funcional: true, criterios: [] };
      grupos.push(actual);
      columnas = [];
      continue;
    }
    if (!actual) continue;

    // Cada grupo declara debajo del título si sus criterios son funcionales
    if (/^\*Criterios no funcionales\./.test(linea)) { actual.funcional = false; continue; }

    const celdas = linea.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
    // Las columnas se leen por su título: no todas las tablas traen las mismas
    if (celdas[0] === 'ID') { columnas = celdas; continue; }
    if (!/^[AB]\.\d+\.\d+$/.test(celdas[0])) continue;
    const de = (titulo) => celdas[columnas.indexOf(titulo)];
    const tipo = actual.funcional ? 'funcional' : { 'Técnica': 'tecnica', 'Operativa': 'operativa' }[de('Tipo')];
    if (!tipo) throw new Error(`${celdas[0]}: un criterio no funcional declara su tipo, Técnica u Operativa`);
    const necesidad = de('Qué resuelve') ?? de('Fundamento') ?? de('Aplicación en el rubro');
    if (!necesidad) throw new Error(`${celdas[0]}: falta qué resuelve para la compañía`);
    actual.criterios.push({ id: celdas[0], nombre: de('Criterio'), procedimiento: de('Procedimiento de verificación'), necesidad, tipo });
  }

  if (!grupos.length) throw new Error(`No se leyó ningún grupo de ${SECCION4}`);
  const huecos = grupos.filter(g => !g.criterios.length).map(g => g.id);
  if (huecos.length) throw new Error(`Grupos sin criterios en la sección 3: ${huecos.join(', ')}`);
  return grupos;
}

/** Grupos del catálogo, en el orden de la sección 3. */
const GRUPOS = leer();

/** Todos los criterios, aplanados, cada uno con el grupo y la parte a la que pertenece. */
const CRITERIOS = GRUPOS.flatMap(g =>
  g.criterios.map(c => ({ ...c, grupo: g.id, parte: g.parte, funcional: g.funcional })));

/** Un criterio por su identificador, o undefined si no existe. */
const criterio = (id) => CRITERIOS.find(c => c.id === id);

module.exports = { RAIZ, GRUPOS, CRITERIOS, criterio };
