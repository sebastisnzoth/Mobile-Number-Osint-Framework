#!/usr/bin/env python3
"""
Offline phone-number metadata helper.

This is NOT PhoneInfoga and it does NOT identify a person. It only derives
non-identifying metadata from the number prefix using Google's libphonenumber
(python-phonenumbers): country, operator, line type, validity and formats.
No network requests are made and no personal data is returned.

Uso / Usage:
    python3 number_info.py +14155552671
    python3 number_info.py "555 2671" --region US --json

Ethical use only: consent-based investigations and education.
"""

import argparse
import json
import sys

try:
    import phonenumbers
    from phonenumbers import carrier, geocoder, timezone
except ImportError:
    sys.exit("Falta 'phonenumbers'. Ejecuta: npm run tools:install  (o pip install phonenumbers)")

TYPES = {
    phonenumbers.PhoneNumberType.FIXED_LINE: "fixed line",
    phonenumbers.PhoneNumberType.MOBILE: "mobile",
    phonenumbers.PhoneNumberType.FIXED_LINE_OR_MOBILE: "fixed line or mobile",
    phonenumbers.PhoneNumberType.TOLL_FREE: "toll free",
    phonenumbers.PhoneNumberType.PREMIUM_RATE: "premium rate",
    phonenumbers.PhoneNumberType.SHARED_COST: "shared cost",
    phonenumbers.PhoneNumberType.VOIP: "VoIP",
    phonenumbers.PhoneNumberType.PERSONAL_NUMBER: "personal number",
    phonenumbers.PhoneNumberType.PAGER: "pager",
    phonenumbers.PhoneNumberType.UAN: "UAN",
    phonenumbers.PhoneNumberType.VOICEMAIL: "voicemail",
    phonenumbers.PhoneNumberType.UNKNOWN: "unknown",
}


def describe(raw, region=None, lang="en"):
    number = phonenumbers.parse(raw, region)
    e164 = phonenumbers.format_number(number, phonenumbers.PhoneNumberFormat.E164)
    return {
        "input": raw,
        "e164": e164,
        "international": phonenumbers.format_number(number, phonenumbers.PhoneNumberFormat.INTERNATIONAL),
        "national": phonenumbers.format_number(number, phonenumbers.PhoneNumberFormat.NATIONAL),
        "country_code": number.country_code,
        "region": phonenumbers.region_code_for_number(number),
        "country_or_area": geocoder.description_for_number(number, lang) or None,
        "carrier": carrier.name_for_number(number, lang) or None,
        "line_type": TYPES.get(phonenumbers.number_type(number), "unknown"),
        "is_possible": phonenumbers.is_possible_number(number),
        "is_valid": phonenumbers.is_valid_number(number),
        "timezones": list(timezone.time_zones_for_number(number)),
        "note": "Derived from the number prefix only. No identity, name or address is looked up.",
    }


def main():
    ap = argparse.ArgumentParser(description="Offline phone-number metadata (no identity lookup)")
    ap.add_argument("number", help="Número en cualquier formato, p. ej. +14155552671")
    ap.add_argument("--region", help="Región de dos letras si el número no trae prefijo (BR, US, IN...)")
    ap.add_argument("--lang", default="en", help="Idioma para país/operador (por defecto: en)")
    ap.add_argument("--json", action="store_true", help="Salida en JSON")
    args = ap.parse_args()

    try:
        info = describe(args.number, args.region, args.lang)
    except phonenumbers.NumberParseException as exc:
        print(f"No se pudo interpretar el número: {exc}", file=sys.stderr)
        return 2

    if args.json:
        print(json.dumps(info, indent=2, ensure_ascii=False))
    else:
        print(f"  Número        : {info['input']}")
        print(f"  E.164         : {info['e164']}")
        print(f"  Internacional : {info['international']}")
        print(f"  Nacional      : {info['national']}")
        print(f"  Código país   : +{info['country_code']}  ({info['region']})")
        print(f"  País / área   : {info['country_or_area'] or 'desconocido'}")
        print(f"  Operador      : {info['carrier'] or 'desconocido'}")
        print(f"  Tipo de línea : {info['line_type']}")
        print(f"  Zonas horarias: {', '.join(info['timezones']) or 'desconocido'}")
        print(f"  Válido        : {info['is_valid']}  (posible: {info['is_possible']})")
        print(f"  Nota          : {info['note']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
