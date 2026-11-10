import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { criterio as delCatalogo } from '../catalogo.cjs';
import { reparos, fuentes } from '../reglas.cjs';

/**
 * Registro del veredicto de cada criterio.
 *
 * La matriz del informe se genera a partir de estos archivos: ningún valor
 * se transcribe a mano. La justificación se escribe acá, junto al código que
 * comprueba el hecho, para que la escriba quien vio el resultado.
 *
 * Las reglas que valida este módulo son las de la sección 3 del informe.
 * Si una evaluación no las cumple, el test falla en vez de generar un dato
 * que después haya que corregir en la matriz.
 */

/**
 * Primera escala — ¿queda resuelta la necesidad con la versión evaluada?
 *
 *   2  La necesidad queda resuelta (de fábrica o configurando una vez)
 *   1  Queda resuelta con un costo o salvedad permanente (procedimiento en cada uso)
 *   0  La versión evaluada no la resuelve, aunque un plan pago o una extensión lo hiciera
 *
 * No cumplir vale cero para que el resultado recorra el rango completo: si el
 * valor mas bajo sumara, ninguna plataforma podria quedar en cero.
 */
export type Cumplimiento = 2 | 1 | 0;

/**
 * Segunda escala — ¿cuánto trabajo cuesta dejarlo funcionando?
 *
 *   0  Viene listo, no hay nada que implementar
 *   1  Se resuelve una vez con las opciones del sistema, sin programar
 *   2  Hay que escribir código, o el procedimiento se repite en cada uso
 *
 * Corre al reves que el cumplimiento porque mide costo, no merito: acá el
 * cero es lo bueno. No se puntúa en los criterios no funcionales —no hay
 * nada que poner en marcha— ni cuando el cumplimiento es 0.
 */
export type Costo = 2 | 1 | 0;

export type Plataforma = 'espocrm' | 'twenty' | 'bitrix24';

/**
 * Constancia de una fuente del fabricante.
 *
 * Lo que no se puede comprobar ejercitando el sistema se resuelve consultando
 * la fuente oficial, y entonces hace falta el texto **textual** que sostiene el
 * veredicto: una paráfrasis no se puede contrastar, que es justamente para lo
 * que sirve la constancia.
 */
export interface Fuente {
  /** Dirección exacta consultada */
  url: string;
  /** Texto textual del fabricante que responde el criterio */
  cita: string;
  /** Fecha de la consulta, en formato ISO. Lo publicado cambia */
  consultado: string;
  /** Captura de la página, prueba de que ese texto estaba publicado ese día */
  captura?: string;
}

/** La licencia no es trabajo sino dinero: va a la proyección de costo, no a las escalas. */
export interface Licencia {
  /** Plan o módulo que habilita la capacidad */
  plan: string;
  /** Monto conocido, tal como lo publica el fabricante */
  monto: string;
  modalidad: 'unico' | 'recurrente';
}

/**
 * Lo que cambiaría contratando un plan o una extensión. Es un comentario: no
 * puntúa, porque se evalúa solo la versión elegida. Solo se registra donde el
 * plan modifica la respuesta.
 */
export interface ConPlan {
  /** Nombre comercial del plan */
  plan: string;
  monto: string;
  modalidad: 'unico' | 'recurrente';
  cumple: Cumplimiento;
  costo?: Costo;
  justificacion: string;
}

export interface Evaluacion {
  /** Identificador del criterio, por ejemplo 'A.1.1' */
  criterio: string;
  plataforma: Plataforma;
  cumple: Cumplimiento;
  /**
   * Por qué un criterio funcional cumple con reparo: exige código, exige una tarea manual en
   * cada uso, o resuelve solo una parte. Solo con cumple 1.
   */
  reparo?: 'codigo' | 'manual' | 'parcial';
  /**
   * Costo de implementación. No lo llevan los criterios no funcionales.
   * Con cumple 0 no corresponde; con cumple 1 es siempre 2.
   */
  costo?: Costo;
  licencia?: Licencia;
  /** Lo que cambiaría contratando un plan; comentario, no puntúa */
  conPlan?: ConPlan[];
  /** Para quien decide, en una o dos oraciones: qué hace la plataforma con esa necesidad (formatos,
   *  límites, el reparo de un 1, lo que falta en un 0), sin el camino en la pantalla. Es el texto
   *  de la sección 6 en la entrega. */
  resumen: string;
  /** Cómo lo resuelve la plataforma: el camino concreto en el sistema, o qué ofrece en su lugar */
  comoLoHace: string;
  /** Lo que trae la solución: tipos de dato, límites, alcance. Obligatorias si cumple */
  caracteristicas?: string;
  /** Por qué ese valor y no otro. Obligatoria: un registro sin esto no se acepta. */
  justificacion: string;
  /** Fuentes oficiales con su texto textual */
  documentacion?: Fuente | Fuente[];
  /** Capturas o videos del sistema resolviéndolo */
  evidencia?: string[];
  /** Dato medido, cuando el criterio lo produce: cantidad de pasos, segundos, memoria */
  medicion?: string;
}

const DIR = 'resultados';

/**
 * Registra el resultado de evaluar un criterio sobre una plataforma.
 * Un archivo por evaluación: dos tests en paralelo no se pisan.
 */
export function registrar(e: Evaluacion) {
  const delCat = delCatalogo(e.criterio);
  const mal = reparos(e);
  if (mal.length) {
    throw new Error(`[${e.criterio}/${e.plataforma}] no cumple la sección 3:\n  - ${mal.join('\n  - ')}`);
  }

  // Sección 3.3: con cumple 1 el costo es siempre 2, pero solo donde hay costo
  // que medir. Los criterios no funcionales no lo llevan nunca.
  const costo = !delCat!.funcional ? undefined : e.cumple === 1 ? 2 : e.costo;

  const registro = {
    ...e,
    criterioNombre: delCat!.nombre,
    costo,
    licencia: e.licencia ?? null,
    conPlan: e.conPlan ?? [],
    documentacion: fuentes(e.documentacion),
    evidencia: e.evidencia ?? [],
    momento: new Date().toISOString(),
  };

  mkdirSync(DIR, { recursive: true });
  writeFileSync(join(DIR, archivoDe(e.criterio, e.plataforma)), JSON.stringify(registro, null, 2), 'utf8');

  const partes = [`cumple ${registro.cumple}`];
  if (registro.costo !== undefined) partes.push(`costo ${registro.costo}`);
  if (e.licencia) partes.push(`licencia: ${e.licencia.plan}`);
  console.log(`  → ${e.criterio} · ${e.plataforma}: ${partes.join(' · ')}`);
  console.log(`    ${e.justificacion}`);
  return registro;
}

/**
 * Declara un criterio como no verificado. Es el único estado sin valor, y
 * responde al avance del trabajo, no a una característica de la plataforma:
 * cuando la comprobación se realiza, el criterio puntúa como cualquier otro.
 *
 * Si un criterio parece no aplicar a una plataforma, está mal formulado:
 * corresponde reescribirlo desde la necesidad del negocio, no declararlo aparte.
 */
export function sinVerificar(criterio: string, plataforma: Plataforma, motivo: string) {
  if (!delCatalogo(criterio)) {
    throw new Error(`[${criterio}/${plataforma}] el criterio no figura en el catálogo de la sección 4`);
  }
  if (!motivo?.trim()) {
    throw new Error(`[${criterio}/${plataforma}] el motivo es obligatorio`);
  }
  mkdirSync(DIR, { recursive: true });
  writeFileSync(join(DIR, archivoDe(criterio, plataforma)), JSON.stringify({
    criterio, plataforma, puntua: false, motivo, momento: new Date().toISOString(),
  }, null, 2), 'utf8');
  console.log(`  → ${criterio} · ${plataforma}: SIN VERIFICAR — ${motivo}`);
}

export const archivoDe = (criterio: string, plataforma: Plataforma | string) =>
  `${criterio.replace(/\./g, '-')}.${plataforma}.json`;
