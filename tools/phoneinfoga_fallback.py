#!/usr/bin/env python3
"""
Offline fallback for the `phoneinfoga` command.

The official PhoneInfoga is a Go program distributed as a GitHub Release binary.
In environments without that binary (or without a Go compiler), the generated
`tools/bin/phoneinfoga` wrapper calls this script instead. It is NOT PhoneInfoga:
it only prints non-identifying metadata derived from the number prefix with
libphonenumber, and clearly says which scanners are unavailable.

    phoneinfoga version
    phoneinfoga scan -n +14155552671
    phoneinfoga scan -n "555 2671" --region US --json
"""

import argparse
import json
import sys

try:
    from number_info import describe
except ImportError:
    sys.exit("Falta el helper local. Ejecuta: npm run tools:install")

import phonenumbers

BANNER = """PhoneInfoga · OFFLINE FALLBACK (no es el PhoneInfoga oficial)
El binario oficial (Go) no está disponible en este entorno.
Se muestran SOLO metadatos del prefijo; no se identifica a ninguna persona.
"""


def main():
    ap = argparse.ArgumentParser(
        prog="phoneinfoga",
        description="Offline fallback: number-prefix metadata only (no identity lookup)"
    )
    ap.add_argument("command", nargs="?", default="scan", choices=["scan", "version"])
    ap.add_argument("-n", "--number", help="Número a analizar")
    ap.add_argument("--region", help="Región ISO de 2 letras si no lleva prefijo")
    ap.add_argument("--json", action="store_true", help="Salida en JSON")
    args = ap.parse_args()

    if args.command == "version":
        print(BANNER.rstrip())
        print("Motor: libphonenumber (local) · Sin escáneres externos · Sin red")
        return 0

    if not args.number:
        ap.error("scan requiere -n/--number <número>")

    try:
        info = describe(args.number, args.region)
    except phonenumbers.NumberParseException as exc:
        print(f"No se pudo interpretar el número: {exc}", file=sys.stderr)
        return 2

    if args.json:
        print(json.dumps({**info, "engine": "offline-fallback", "official_phoneinfoga": False},
                         indent=2, ensure_ascii=False))
        return 0

    print(BANNER.rstrip())
    print("")
    print(f"  Número        : {info['input']}")
    print(f"  E.164         : {info['e164']}")
    print(f"  País / región : +{info['country_code']} ({info['region']}) — {info['country_or_area'] or 'desconocido'}")
    print(f"  Operador      : {info['carrier'] or 'desconocido'}")
    print(f"  Tipo de línea : {info['line_type']}")
    print(f"  Válido        : {info['is_valid']}")
    print(f"  Zonas horarias: {', '.join(info['timezones']) or 'desconocido'}")
    print("")
    print("  Escáneres externos (Google dorks, HLR, redes sociales): NO disponibles")
    print("  Motivo: requieren red y/o claves de API; este fallback es 100% offline.")
    print("")
    print("  Aviso: uso ético y con consentimiento únicamente.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
