/**
 * Las reglas de la sección 3 del informe, en un solo lugar.
 *
 * Las aplican los tests al registrar un veredicto y el verificador sobre los
 * archivos ya escritos. Estar en un único módulo es lo que garantiza que un
 * resultado editado a mano pase por el mismo control que uno recién generado.
 */
const { criterio: delCatalogo } = require('./catalogo.cjs');

/** Deja siempre una lista, haya venido una fuente sola, varias o ninguna. */
const fuentes = (d) => (d === undefined || d === null ? [] : Array.isArray(d) ? d : [d]);

/**
 * Comprueba una evaluación contra la sección 3.
 * Devuelve la lista de incumplimientos; vacía si está bien.
 */
function reparos(e) {
  const mal = [];
  const cat = delCatalogo(e.criterio);

  if (!cat) mal.push('el criterio no figura en el catálogo de la sección 4');

  // Sin verificar es el único estado sin valor: no se le exige nada más que el motivo.
  if (e.puntua === false) {
    if (!e.motivo?.trim()) mal.push('sin verificar exige declarar el motivo');
    return mal;
  }

  // Sección 6: cada requerimiento dice cómo lo hace la plataforma, qué trae y por qué ese valor.
  if (!e.comoLoHace?.trim()) mal.push('falta cómo lo hace la plataforma, o qué ofrece en su lugar');
  if (e.cumple > 0 && !e.caracteristicas?.trim()) mal.push('falta qué características trae la solución');
  if (!e.justificacion?.trim()) mal.push('la justificación es obligatoria');
  if (![2, 1, 0].includes(e.cumple)) mal.push(`cumple debe ser 2, 1 o 0 — llegó ${e.cumple}`);

  // Sección 3.5: se evalúa como una auditoría sobre la versión elegida. Lo que se afirma
  // —que lo resuelve o que no— se respalda con lo observado en ella o con la fuente oficial.
  if (!e.evidencia?.length && !fuentes(e.documentacion).length) {
    mal.push('sin respaldo: hace falta una captura del sistema o una fuente oficial con su cita textual');
  }

  // Una paráfrasis no se puede contrastar, que es para lo que sirve la constancia.
  fuentes(e.documentacion).forEach((f, i) => {
    if (!f?.url?.trim()) mal.push(`la fuente ${i + 1} no declara la dirección consultada`);
    if (!f?.cita?.trim()) mal.push(`la fuente ${i + 1} no trae el texto textual que sostiene el veredicto`);
    if (!f?.consultado?.trim()) mal.push(`la fuente ${i + 1} no declara la fecha de consulta`);
  });

  // Sección 3.3: cuando no lo resuelve, no hay implementación que costear.
  if (e.cumple === 0 && e.costo !== undefined && e.costo !== null) {
    mal.push('con cumple 0 el costo no se puntúa: no hay nada que implementar');
  }

  // Sección 3.3: repetir un procedimiento en cada uso es la forma más cara.
  if (e.cumple === 1 && e.costo !== undefined && e.costo !== null && e.costo !== 2) {
    mal.push(`con cumple 1 el costo es siempre 2 — llegó ${e.costo}`);
  }

  // Sección 3.3: el costo mide poner algo en marcha, y en un criterio no
  // funcional no hay nada que poner en marcha.
  if (cat && !cat.funcional && e.costo !== undefined && e.costo !== null) {
    mal.push(`${cat.grupo} son criterios no funcionales: no llevan costo de implementación`);
  }

  // Lo que agrega un plan pago es un comentario: no puntúa. Un plan que no cambia la
  // respuesta no aporta nada al comentario y no se registra.
  // La cambia si resuelve más, o si resuelve lo mismo con menos trabajo.
  const costoBase = e.cumple === 1 ? 2 : e.costo;
  (e.conPlan ?? []).forEach((x, i) => {
    const nombre = x?.plan ?? i + 1;
    if (!x?.plan?.trim()) mal.push(`el plan ${i + 1} no declara cuál es`);
    if (!x?.monto?.trim()) mal.push(`el plan ${nombre} no declara su precio`);
    if (!x?.justificacion?.trim()) mal.push(`el plan ${nombre} no justifica su veredicto`);
    if (![2, 1, 0].includes(x?.cumple)) mal.push(`el plan ${nombre} no trae un cumplimiento válido`);
    const resuelveMas = x?.cumple > e.cumple;
    const cuestaMenos = x?.cumple === e.cumple && x?.costo !== undefined && costoBase !== undefined && x.costo < costoBase;
    if (!resuelveMas && !cuestaMenos) {
      mal.push(`el plan ${nombre} no cambia la respuesta de la versión evaluada: no se registra`);
    }
  });

  return mal;
}

module.exports = { reparos, fuentes };
