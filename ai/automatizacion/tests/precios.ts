import { Browser } from '@playwright/test';
import { citar } from './fuentes';
import { ConPlan, Fuente } from './evaluar';

/**
 * Planes y extensiones pagas, con el precio tal como lo publica el fabricante.
 *
 * El precio no se escribe de memoria: cada plan trae las páginas que lo
 * sostienen, y `constanciaDe` las vuelve a consultar en cada corrida. Si el
 * fabricante cambia el precio o la condición, el test falla en vez de
 * registrar un número viejo.
 */

interface Plan {
  plan: string;
  /** Monto con su período, tal como se lo cobra */
  monto: string;
  modalidad: 'unico' | 'recurrente';
  fuentes: { url: string; buscar: string | RegExp }[];
}

export const ESPOCRM_ADVANCED_PACK: Plan = {
  plan: 'Advanced Pack',
  monto: 'US$ 395 por año y por instalación',
  modalidad: 'recurrente',
  fuentes: [
    { url: 'https://www.espocrm.com/extensions/advanced-pack/', buscar: '1 Year License' },
    { url: 'https://www.espocrm.com/extension-license-agreement/', buscar: 'you must renew or purchase a new license' },
  ],
};

/**
 * El plan de entrada del servicio en la nube. Trae todas las extensiones del
 * fabricante, de modo que es la otra forma de acceder a lo que resuelve el
 * Advanced Pack. Los planes superiores solo agregan volumen y no cambian
 * ningún veredicto.
 */
export const ESPOCRM_CLOUD_BASIC: Plan = {
  plan: 'EspoCRM Cloud Basic',
  monto: 'US$ 15 por usuario por mes, mínimo 3 usuarios',
  modalidad: 'recurrente',
  fuentes: [
    { url: 'https://www.espocrm.com/cloud/', buscar: '$15.00 per user/month minimum 3 users' },
  ],
};

/** Las demás extensiones del fabricante, con la misma licencia anual por instalación. */
const extension = (plan: string, pagina: string, precio: string): Plan => ({
  plan,
  monto: `US$ ${precio} por año y por instalación`,
  modalidad: 'recurrente',
  fuentes: [
    { url: `https://www.espocrm.com/extensions/${pagina}/`, buscar: '1 Year License' },
    { url: 'https://www.espocrm.com/extension-license-agreement/', buscar: 'you must renew or purchase a new license' },
  ],
});

export const ESPOCRM_INTELLIGENCE = extension('Intelligence', 'intelligence', '129');
export const ESPOCRM_VOIP = extension('VoIP Integration', 'voip-integration', '388');
export const ESPOCRM_ZOOM = extension('Zoom Integration', 'zoom-integration', '110');
export const ESPOCRM_GOOGLE = extension('Google Integration', 'google-integration', '190');
export const ESPOCRM_OUTLOOK = extension('Outlook Integration', 'outlook-integration', '240');
export const ESPOCRM_SALES_PACK = extension('Sales Pack', 'sales-pack', '260');

/**
 * El plan de Twenty que agrega las funciones premium —permisos por registro,
 * acceso unificado y registro de auditoría—, en la nube o en la instalación
 * propia. El plan Pro de la nube trae lo mismo que la edición gratuita
 * autoalojada, así que no cambia ningún veredicto.
 */
export const TWENTY_ORGANIZATION: Plan = {
  plan: 'Twenty Organization',
  monto: 'US$ 19 por usuario por mes',
  modalidad: 'recurrente',
  fuentes: [
    { url: 'https://twenty.com/pricing', buscar: 'Organization is $19/user/month' },
    { url: 'https://docs.twenty.com/user-guide/billing/capabilities/pricing-plans', buscar: 'Premium features are only available on the Organization plans' },
  ],
};

/**
 * El servicio en la nube de Twenty, en su plan de entrada. Trae lo mismo que
 * la edición autoalojada gratuita: lo único que cambia es quién sostiene la
 * infraestructura.
 */
export const TWENTY_PRO: Plan = {
  plan: 'Twenty Cloud Pro',
  monto: 'US$ 9 por usuario por mes, con pago anual',
  modalidad: 'recurrente',
  fuentes: [
    { url: 'https://twenty.com/pricing', buscar: 'Cloud Pro is $9/user/month' },
  ],
};

/** Vuelve a consultar las páginas del plan y devuelve sus citas textuales. */
export async function constanciaDe(navegador: Browser, p: Plan, prefijo: string): Promise<Fuente[]> {
  const citas: Fuente[] = [];
  for (const [i, f] of p.fuentes.entries()) {
    citas.push(await citar(navegador, { ...f, captura: `${prefijo}-precio-${i + 1}` }));
  }
  // El monto registrado tiene que ser el publicado: si el fabricante lo cambió, se corta acá.
  // La mayoría de los fabricantes pegan el signo al número ($19); Bitrix24 lo separa con un
  // espacio (US$ 69), así que se aceptan las dos formas.
  const importe = p.monto.match(/US\$ ([\d.,]+)/)?.[1];
  if (importe && !citas.some(c => c.cita.includes(`$${importe}`) || c.cita.includes(`US$ ${importe}`))) {
    throw new Error(`${p.plan}: el precio registrado (US$ ${importe}) no coincide con lo publicado. ` +
      `Citas: ${citas.map(c => `«${c.cita.slice(0, 120)}»`).join(' · ')}`);
  }
  return citas;
}

/** El veredicto con el plan, listo para `conPlan`. */
export const conPlanDe = (p: Plan, v: Omit<ConPlan, 'plan' | 'monto' | 'modalidad'>): ConPlan =>
  ({ plan: p.plan, monto: p.monto, modalidad: p.modalidad, ...v });

// Bitrix24
// Los cuatro planes comerciales de la nube, con el precio mensual pagando mes a mes: es el que
// paga una compañía que todavía no se comprometió a un año. El fabricante publica también el
// precio con pago anual, más bajo; ninguno de los dos cambia lo que el plan habilita.
export const BITRIX24_BASIC: Plan = {
  plan: 'Bitrix24 Basic',
  monto: 'US$ 69 por mes, hasta 5 usuarios',
  modalidad: 'recurrente',
  fuentes: [{ url: 'https://www.bitrix24.es/prices/', buscar: /US\$\s*69/ }],
};

export const BITRIX24_STANDARD: Plan = {
  plan: 'Bitrix24 Standard',
  monto: 'US$ 144 por mes, hasta 50 usuarios',
  modalidad: 'recurrente',
  fuentes: [{ url: 'https://www.bitrix24.es/prices/', buscar: /US\$\s*144/ }],
};

export const BITRIX24_PROFESSIONAL: Plan = {
  plan: 'Bitrix24 Professional',
  monto: 'US$ 289 por mes, hasta 100 usuarios',
  modalidad: 'recurrente',
  fuentes: [{ url: 'https://www.bitrix24.es/prices/', buscar: /US\$\s*289/ }],
};

export const BITRIX24_ENTERPRISE: Plan = {
  plan: 'Bitrix24 Enterprise',
  monto: 'US$ 579 por mes, desde 250 usuarios',
  modalidad: 'recurrente',
  fuentes: [{ url: 'https://www.bitrix24.es/prices/', buscar: /US\$\s*579/ }],
};

// La API REST y los webhooks entrantes no vienen en las ediciones Essentials ni en la gratuita: los trae la
// familia Vibe+, cuyo plan de entrada es Basic Vibe+.
export const BITRIX24_BASIC_VIBE: Plan = {
  plan: 'Bitrix24 Basic Vibe+',
  monto: 'US$ 89 por mes, hasta 5 usuarios',
  modalidad: 'recurrente',
  fuentes: [
    { url: 'https://www.bitrix24.es/prices/', buscar: /US\$\s*89/ },
    { url: 'https://www.bitrix24.es/prices/', buscar: 'Aplicaciones de Market y REST API ilimitadas' },
  ],
};
