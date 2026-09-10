# Evidencia de las pruebas

Capturas y videos generados automáticamente sobre las tres herramientas.

## Los videos son didácticos

No son grabaciones crudas del navegador. Cada video trae:

- **Portada** con la herramienta, el criterio y el número de caso
- **Cartel de "qué vamos a medir"** antes de empezar
- **Banner arriba** que va diciendo el paso actual (PASO 1, PASO 2…)
- **Recuadro rojo** sobre el elemento que se está por tocar
- **Pantalla de cierre** con el resultado

Se entienden solos, sin que nadie los explique.

## Dos tipos de corrida

| Corrida | Para qué | Los tiempos |
|---|---|---|
| **Limpia** | Medir clicks y segundos | ✅ Válidos |
| **Narrada** | Grabar el video explicativo | ❌ Inflados por los carteles |

Los carteles y el ritmo lento agregan segundos. Para el criterio 3, **los números salen de la corrida limpia**; el video es para mostrar, no para medir.

Ejemplo real en EspoCRM, misma prueba:

| | Login | Total |
|---|---|---|
| Limpia | 5,6 s | 10,0 s |
| Narrada | 18,2 s | 38,4 s |

## Cómo regenerarlas

Desde `ai/automatizacion/`:

```bash
npx playwright test                    # medición limpia
$env:NARRAR="1"; npx playwright test   # video didáctico (PowerShell)
NARRAR=1 npx playwright test           # video didáctico (bash)
```

## Archivos

| Prefijo | Herramienta |
|---|---|
| `espocrm-*` | EspoCRM 10.0.4 |
| `twenty-*` | Twenty v2.37.4 |
| `bitrix24-*` | Bitrix24 Free |

Las capturas van numeradas por paso (`-a-`, `-b-`, `-c-`…) y las que llevan `narrado` muestran los carteles.
