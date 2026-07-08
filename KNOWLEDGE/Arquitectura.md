---
category: Sistema
---

# Arquitectura del Sistema

Vero Quant Lab está compuesto por:

## Frontend

Next.js + TypeScript + Tailwind CSS. Desplegado en Vercel.

## Trading Engine

Python + Binance API. Corre en VPS Hetzner.

## Comunicación

El frontend consulta datos a través del sistema de archivos local (JSONL). En el futuro se migrará a API.
