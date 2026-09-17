import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

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
 * Primera escala — ¿queda resuelta la necesidad?
 *
 *   3  La necesidad queda resuelta (de fábrica, configurando una vez, o con plan pago)
 *   2  Queda resuelta con un costo o salvedad permanente (procedimiento en cada uso)
 *   1  No queda resuelta: no existe en ninguna edición del producto
 */
export type Cumplimiento = 3 | 2 | 1;

/**
 * Segunda escala — ¿cuánto trabajo cuesta dejarlo funcionando?
 *
 *   3  Viene listo, no hay nada que implementar
 *   2  Se resuelve una vez con las opciones del sistema, sin programar
 *   1  Hay que escribir código, o el procedimiento se repite en cada uso
 *
 * No se puntúa en los criterios no funcionales —no hay nada que poner en
 * marcha— ni cuando el cumplimiento es 1.
 */
export type Costo = 3 | 2 | 1;

/**
 * Alternativa evaluada. Un plan que cambia lo que el producto resuelve es una
 * alternativa propia; los que solo agregan volumen no generan una nueva.
 */
export type Plataforma =
  | 'espocrm'
  | 'espocrm-advanced'
  | 'twenty'
  | 'bitrix24'
  | 'bitrix24-basic';

/** La licencia no es trabajo sino dinero: va a la proyección de costo, no a las escalas. */
export interface Licencia {
  /** Plan o módulo que habilita la capacidad */
  plan: string;
  /** Monto conocido, tal como lo publica el fabricante */
  monto: string;
  modalidad: 'unico' | 'recurrente';
}

export interface Evaluacion {
  /** Identificador del criterio, por ejemplo 'A.1.1' */
  criterio: string;
  plataforma: Plataforma;
  cumple: Cumplimiento;
  /**
   * Costo de implementación. Se omite en los criterios no funcionales.
   * Con cumple 1 no corresponde; con cumple 2 es siempre 1.
   */
  costo?: Costo;
  licencia?: Licencia;
  /** Por qué ese valor y no otro. Obligatoria: un registro sin esto no se acepta. */
  justificacion: string;
  /**
   * Documentación oficial del fabricante. Obligatoria cuando cumple es 1:
   * que algo no aparezca en la instalación de prueba no prueba que no exista.
   */
  documentacion?: string;
  /** Capturas o videos que respaldan el veredicto */
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
  const donde = `[${e.criterio}/${e.plataforma}]`;

  if (!e.justificacion?.trim()) {
    throw new Error(`${donde} la justificación es obligatoria`);
  }
  if (![3, 2, 1].includes(e.cumple)) {
    throw new Error(`${donde} cumple debe ser 3, 2 o 1 — llegó ${e.cumple}`);
  }

  // Sección 3.5: el valor 1 es el más exigente de demostrar.
  if (e.cumple === 1 && !e.documentacion?.trim()) {
    throw new Error(
      `${donde} el valor 1 exige constancia en la documentación oficial del fabricante. ` +
      `Que no aparezca en la instalación de prueba no prueba que el producto no lo tenga.`,
    );
  }

  // Sección 3.3: cuando no lo resuelve, no hay implementación que costear.
  if (e.cumple === 1 && e.costo !== undefined) {
    throw new Error(`${donde} con cumple 1 el costo no se puntúa: no hay nada que implementar`);
  }

  // Sección 3.3: repetir un procedimiento en cada uso es la forma más cara.
  if (e.cumple === 2 && e.costo !== undefined && e.costo !== 1) {
    throw new Error(`${donde} con cumple 2 el costo es siempre 1 — llegó ${e.costo}`);
  }
  const costo = e.cumple === 2 ? 1 : e.costo;

  const registro = {
    ...e,
    costo,
    licencia: e.licencia ?? null,
    evidencia: e.evidencia ?? [],
    momento: new Date().toISOString(),
  };

  mkdirSync(DIR, { recursive: true });
  const archivo = join(DIR, `${e.criterio.replace(/\./g, '-')}.${e.plataforma}.json`);
  writeFileSync(archivo, JSON.stringify(registro, null, 2), 'utf8');

  const partes = [`cumple ${e.cumple}`];
  if (costo !== undefined) partes.push(`costo ${costo}`);
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
  if (!motivo?.trim()) {
    throw new Error(`[${criterio}/${plataforma}] el motivo es obligatorio`);
  }
  mkdirSync(DIR, { recursive: true });
  const archivo = join(DIR, `${criterio.replace(/\./g, '-')}.${plataforma}.json`);
  writeFileSync(archivo, JSON.stringify({
    criterio, plataforma, puntua: false, motivo, momento: new Date().toISOString(),
  }, null, 2), 'utf8');
  console.log(`  → ${criterio} · ${plataforma}: SIN VERIFICAR — ${motivo}`);
}
