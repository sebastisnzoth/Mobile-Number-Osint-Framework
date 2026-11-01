# 🛠️ Herramientas OSINT locales (instalación opcional)

La aplicación web del framework **no necesita nada de esto** para funcionar: es un catálogo
estático de 78 técnicas. Este directorio instala, **en tu máquina**, las herramientas de la
categoría 9 🤖 *Automated OSINT Tools* que sí son software instalable.

```bash
npm run tools:install     # instala / verifica todo (repetible e idempotente)
source tools/env.sh       # añade los comandos al PATH de esta terminal
npm run tools:check       # comprueba que CADA comando responde de verdad
```

> Requiere `python3 >= 3.10`, `git` y acceso a `pypi.org`, `files.pythonhosted.org`,
> `github.com` y `api.github.com`. No hace falta Go, Docker ni claves de API para instalar.

## Qué se instala

| Herramienta | Origen | Modo | Comando de prueba |
|---|---|---|---|
| **GHunt** 2.3.4 | PyPI (`mxrch/GHunt`) | venv propio + `pip` | `ghunt --help` ✅ |
| **Spiderfoot** (master) | `github.com/smicallef/spiderfoot` | clon + `requirements.txt` | `spiderfoot --help` ✅ |
| **recon-ng** (master) | `github.com/lanmaster53/recon-ng` | clon + `REQUIREMENTS` | `recon-cli -h` ✅ |
| **number-info** | helper local (este repo) | `phonenumbers` | `number-info +14155552671` ✅ |
| **PhoneInfoga** | release oficial **o** fallback offline | binario si se puede descargar | `phoneinfoga scan -n +14155552671` ✅ |

El instalador genera **6 comandos** en `tools/bin/`: `ghunt`, `spiderfoot`, `recon-ng`,
`recon-cli`, `number-info` y `phoneinfoga`. Cada herramienta Python vive en su **propio
virtualenv** (`tools/.venv/<nombre>`), porque Spiderfoot fija versiones antiguas
(`cryptography<4`, `lxml<5`, …) que chocarían con GHunt.

`number-info` no es solo una utilidad de terminal: **el endpoint `/api/lookup` de la web lo
reutiliza** para mostrar país, operador, tipo de línea, validez y zonas horarias en el panel
*Number lookup*. Si el toolchain no está instalado, la API usa una tabla embebida de códigos
de país igualmente offline.

### Dónde queda todo

```
tools/.venv/     entornos virtuales (ignorados por Git)
tools/.cache/    clones, binarios descargados e install-state.json (ignorados)
tools/bin/       comandos generados (ignorados)
tools/env.sh     genera el PATH (ignorado)
```

Nada de esto se sube al repositorio: son artefactos generados. Si clonas el repo en otra
máquina, basta con `npm run tools:install`. El estado de la última instalación queda en
`tools/.cache/install-state.json` y la web lo expone en `/api/tools`.

## Qué se arregló para que todo responda

- **GHunt**: el programa consulta `raw.githubusercontent.com` para comprobar su versión
  *incluso con `--help`*, lo que hacía fallar el comando en redes restringidas. El instalador
  aplica un **parche mínimo solo al venv generado** (`helpers/utils.py`): el chequeo de versión
  pasa a ser tolerante a fallos de red. No se modifica el upstream ni el código del proyecto.
  Resultado: `ghunt --help` funciona sin internet.
- **PhoneInfoga**: el asset de GitHub Releases redirige a `objects.githubusercontent.com`,
  fuera del allowlist del sandbox, y aquí no hay Go para compilarlo. En lugar de dejar un
  comando roto, el wrapper usa **`tools/phoneinfoga_fallback.py`**, que imprime metadatos
  offline con `libphonenumber` y avisa claramente de que **no es PhoneInfoga** y de que los
  escáneres externos no están disponibles. El código fuente oficial queda clonado en
  `tools/.cache/src/phoneinfoga` por si quieres compilarlo con Go ≥ 1.21 (`make build`) o
  descargar el release a mano. Con internet completo, el instalador baja el binario oficial y
  el wrapper lo ejecuta directamente.
- **Bloqueo de rutas sensibles**: el servidor no sirve `.git`, `node_modules`,
  `tools/.venv` ni `tools/.cache`.

## Limitaciones que siguen siendo reales

- **GHunt**: sus consultas (`ghunt login`, `ghunt email ...`) requieren cookies de una cuenta
  de Google y acceso a `google.com`, no disponibles en este sandbox. Aquí se garantiza la
  instalación y el arranque del CLI, no las consultas reales.
- **Spiderfoot / recon-ng**: arrancan correctamente, pero la mayoría de módulos que consultan
  servicios externos necesitan **claves de API** y salida a internet; en este entorno solo
  funcionan las partes locales.
- **number-info / phoneinfoga fallback / `/api/lookup`**: son 100% offline. **No identifican
  personas**, no devuelven nombres ni direcciones y no hacen peticiones de red.
- **Maltego**, **Lampyre** e **IntelTechniques Telephone Tool** no se pueden instalar: son
  productos propietarios/de pago o páginas web con cuenta. El framework solo las enlaza.

## Uso

```bash
source tools/env.sh

number-info +14155552671                    # metadatos offline
number-info "+55 48 99999-1234" --region BR --json
phoneinfoga version                         # explica el fallback
phoneinfoga scan -n +14155552671            # metadatos offline (no es PhoneInfoga)
ghunt --help                                # funciona sin red tras el parche
spiderfoot --help                           # -s <objetivo> -m <módulo>; requiere API keys
recon-cli -h                                # alternativa no interactiva de recon-ng
recon-ng                                    # shell interactivo
```

La web (`npm start`) muestra el estado de estos comandos en el panel *Local toolchain* y
permite consultar un número desde el panel *Number lookup* (con casilla de consentimiento
obligatoria).

⚠️ **Uso ético únicamente**: investigaciones con consentimiento, seguridad autorizada y
educación. Consultar números de terceros sin base legal puede infringir leyes de privacidad
y términos de servicio. Nada de lo instalado aquí elude controles de acceso ni realiza
consultas masivas automatizadas.
