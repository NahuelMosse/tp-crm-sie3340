import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Registro del veredicto de cada criterio.
 *
 * La matriz del informe se genera a partir de estos archivos: ningún valor
 * se transcribe a mano. La justificación se escribe acá, junto al código que
 * comprueba el hecho, para que la escriba quien vio el resultado.
 */

/** Vía por la que se obtiene la capacidad. Determina el nivel según el árbol de la sección 3. */
export type Via =
  | 'nativo'        // 5 — disponible al instalar, sin configuración
  | 'configurable'  // 4 — desde el panel de administración, sin escribir código
  | 'desarrollo'    // 3 — mediante código, interfaz de programación o extensión
  | 'externo'       // 2 — solo operando fuera del sistema
  | 'inexistente';  // 1 — no existe en ninguna edición

const NIVEL: Record<Via, 1 | 2 | 3 | 4 | 5> = {
  nativo: 5,
  configurable: 4,
  desarrollo: 3,
  externo: 2,
  inexistente: 1,
};

export type Plataforma = 'espocrm' | 'twenty' | 'bitrix24';

export interface Evaluacion {
  /** Identificador del criterio, por ejemplo 'A.1.1' */
  criterio: string;
  plataforma: Plataforma;
  via: Via;
  /** Si la capacidad exige un plan pago o un módulo adicional. No altera el nivel. */
  licencia?: boolean;
  /** Qué habilita esa licencia y a qué costo, si se conoce */
  detalleLicencia?: string;
  /** Por qué ese valor y no otro. Obligatoria: un registro sin esto no se acepta. */
  justificacion: string;
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
  if (!e.justificacion?.trim()) {
    throw new Error(`[${e.criterio}/${e.plataforma}] la justificación es obligatoria`);
  }

  const registro = {
    ...e,
    nivel: NIVEL[e.via],
    licencia: e.licencia ?? false,
    evidencia: e.evidencia ?? [],
    momento: new Date().toISOString(),
  };

  mkdirSync(DIR, { recursive: true });
  const archivo = join(DIR, `${e.criterio.replace(/\./g, '-')}.${e.plataforma}.json`);
  writeFileSync(archivo, JSON.stringify(registro, null, 2), 'utf8');

  const marca = registro.licencia ? ' (requiere licencia)' : '';
  console.log(`  → ${e.criterio} · ${e.plataforma}: ${registro.nivel} ${e.via}${marca}`);
  console.log(`    ${e.justificacion}`);
  return registro;
}

/**
 * Estados que no reciben puntaje. Los tres quedan fuera del cálculo, tanto del
 * puntaje obtenido como del máximo posible, pero por razones distintas y el
 * informe las distingue.
 */
export type SinPuntaje =
  | 'sin-verificar'  // no se pudo comprobar
  | 'no-aplica'      // la pregunta no corresponde a esta plataforma
  | 'condicionado';  // depende de una decisión de la organización, no del producto

function registrarSinPuntaje(
  estado: SinPuntaje, criterio: string, plataforma: Plataforma, motivo: string,
) {
  if (!motivo?.trim()) {
    throw new Error(`[${criterio}/${plataforma}] el motivo es obligatorio`);
  }
  mkdirSync(DIR, { recursive: true });
  const archivo = join(DIR, `${criterio.replace(/\./g, '-')}.${plataforma}.json`);
  writeFileSync(archivo, JSON.stringify({
    criterio, plataforma, puntua: false, estado, motivo, momento: new Date().toISOString(),
  }, null, 2), 'utf8');
  console.log(`  → ${criterio} · ${plataforma}: ${estado.toUpperCase()} — ${motivo}`);
}

/** La comprobación no se pudo completar. No se deduce ni se estima: se declara. */
export const sinVerificar = (criterio: string, plataforma: Plataforma, motivo: string) =>
  registrarSinPuntaje('sin-verificar', criterio, plataforma, motivo);

/**
 * El criterio carece de sentido para esta plataforma: el consumo de servidor en
 * un servicio en la nube, por ejemplo. No es ventaja ni desventaja.
 */
export const noAplica = (criterio: string, plataforma: Plataforma, motivo: string) =>
  registrarSinPuntaje('no-aplica', criterio, plataforma, motivo);

/**
 * El resultado no lo determina el producto sino cómo lo implemente la
 * organización. Aporta a las conclusiones, no al puntaje.
 */
export const condicionado = (criterio: string, plataforma: Plataforma, motivo: string) =>
  registrarSinPuntaje('condicionado', criterio, plataforma, motivo);
