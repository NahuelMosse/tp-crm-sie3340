import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import { copyFileSync, mkdirSync, renameSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

/**
 * Conserva el video de cada criterio evaluado.
 *
 * Playwright graba en `test-results/` y vacía esa carpeta en cada corrida; la
 * documentación de las pruebas necesita el video de la última evaluación de
 * cada criterio, así que se copia a `evidencia/videos/` apenas termina.
 * Solo se conserva lo que pasó: el video de una prueba que falló no respalda
 * ningún veredicto.
 *
 * Mientras la prueba prepara el escenario por detrás o espera al sistema, en
 * pantalla no pasa nada. La prueba anota el momento de cada acción —cada clic,
 * cada tecla, cada movimiento del ratón— (`tests/humano.ts`), y cada tramo sin
 * acciones de más de un segundo y medio se acorta a un segundo: se ve cómo
 * termina lo anterior y cómo empieza lo que sigue. Lo que sí se hizo queda a
 * su ritmo. Sin ffmpeg, el video se guarda entero.
 */

const SIN_ACCION_MIN = 1.5; // segundos: una pausa más corta es parte del ritmo de una persona
const QUEDA_DESPUES = 0.6;  // lo que se conserva después de la última acción: el efecto del clic
const QUEDA_ANTES = 0.4;    // y antes de la siguiente, para verla venir

const ANTES_DE_EMPEZAR = 1.0; // lo que se ve del sistema abierto antes de la primera acción

/**
 * Los tramos en que la prueba no hizo nada, con lo que se deja ver de cada
 * borde. El comienzo —el navegador en blanco mientras abre el sistema— se
 * corta hasta un momento antes de la primera acción con el ratón o el teclado.
 */
function cortesDe(todas: [number, number, string?][]): [number, number][] {
  // Los tramos marcados como corte —la página redimensionándose mientras se captura— se quitan siempre
  const cortes: [number, number][] = todas.filter(([, , tipo]) => tipo === 'corte').map(([a, b]) => [a, b]);
  const ordenadas = todas.filter(([, , tipo]) => tipo !== 'corte').sort((a, b) => a[0] - b[0]);
  const primera = ordenadas.find(([, , tipo]) => tipo !== 'goto' && tipo !== 'reload');
  if (primera && primera[0] > ANTES_DE_EMPEZAR) cortes.push([0, primera[0] - ANTES_DE_EMPEZAR]);
  let hasta = primera ? primera[0] : 0;
  for (const [inicio, fin] of ordenadas) {
    if (inicio - hasta > SIN_ACCION_MIN) cortes.push([hasta + QUEDA_DESPUES, inicio - QUEDA_ANTES]);
    hasta = Math.max(hasta, fin);
  }
  cortes.push([hasta + QUEDA_DESPUES, 1e9]);
  return cortes.filter(([a, b]) => b > a);
}

/** Acorta los tramos sin acciones. Devuelve false si no había ninguno. */
function acortarPausas(origen: string, destino: string, acciones: [number, number, string?][]): boolean {
  const cortes = cortesDe(acciones);
  if (!cortes.length) return false;
  const fuera = cortes.map(([a, b]) => `between(t,${a.toFixed(2)},${b.toFixed(2)})`).join('+');
  const codificacion = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', origen,
    '-vf', `select='not(${fuera})',setpts=N/FRAME_RATE/TB`, '-r', '25',
    '-c:v', 'libvpx', '-b:v', '3M', '-crf', '8', '-deadline', 'realtime', '-cpu-used', '6', destino]);
  if (codificacion.status !== 0) throw new Error('ffmpeg no pudo acortar el video');
  return true;
}

export default class Videos implements Reporter {
  onTestEnd(test: TestCase, result: TestResult) {
    const criterio = test.title.match(/^([AB]\.\d+\.\d+) /)?.[1];
    const video = result.attachments.find(a => a.name === 'video' && a.path);
    const plataforma = test.parent.project()?.name;
    if (!criterio || !video || !plataforma || result.status !== 'passed') return;
    mkdirSync('evidencia/videos', { recursive: true });
    const destino = `evidencia/videos/${criterio.replace(/\./g, '-')}.${plataforma}.webm`;
    const provisorio = `${destino}.tmp.webm`;
    const anotadas = result.attachments.find(a => a.name === 'acciones' && a.body);
    try {
      const acciones = anotadas ? JSON.parse(anotadas.body!.toString()) : [];
      if (acciones.length && acortarPausas(video.path!, provisorio, acciones)) return renameSync(provisorio, destino);
    } catch {
      rmSync(provisorio, { force: true });
    }
    copyFileSync(video.path!, destino);
  }
}
