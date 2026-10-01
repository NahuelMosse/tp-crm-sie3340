export interface Criterio {
  id: string;
  nombre: string;
  /** La acción que se ejecuta sobre cada plataforma, tal como la define la sección 4 */
  procedimiento: string;
  grupo: string;
  parte: 'A' | 'B';
  funcional: boolean;
}

export interface Grupo {
  id: string;
  nombre: string;
  parte: 'A' | 'B';
  funcional: boolean;
  criterios: Omit<Criterio, 'grupo' | 'parte' | 'funcional'>[];
}

export declare const RAIZ: string;
export declare const GRUPOS: Grupo[];
export declare const CRITERIOS: Criterio[];
export declare function criterio(id: string): Criterio | undefined;
