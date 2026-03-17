# ADUANERO.AI · Venezuela
Motor de Clasificación Arancelaria NANDINA — Decreto N° 2.647

## Tecnologías
- React 18 + Vite
- CSS Modules
- Anthropic Claude API (claude-sonnet-4)

## Instalación local

```bash
npm install
cp .env.example .env.local
# Edita .env.local y agrega tu VITE_ANTHROPIC_API_KEY
npm run dev
```

## Despliegue en Cloudflare Pages

1. Sube el repositorio a GitHub
2. En Cloudflare Pages → "Create a project" → conecta tu repo
3. Configuración de build:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. En **Environment variables**, agrega:
   - `VITE_ANTHROPIC_API_KEY` = tu API key de Anthropic
5. Deploy

## Estructura del proyecto

```
src/
  components/
    Header.jsx / .module.css
    MessageBubble.jsx / .module.css
    InputBar.jsx / .module.css
  utils/
    api.js         ← llamada a Anthropic API
    format.js      ← formateo de moneda
  constants.js     ← SYSTEM_PROMPT + consultas rápidas
  App.jsx          ← estado principal del chat
  index.css        ← variables CSS globales
  main.jsx         ← entry point
```

## Funcionalidades
- Clasificación arancelaria NANDINA a 10 dígitos
- Fundamento RGI (Reglas Generales de Interpretación 1, 3b, 6)
- Notas de Sección y Capítulo citadas
- Preguntas de aclaración inteligentes (máx. 3)
- Valoración aduanera proyectada (CIF, Ad Valorem, Tasa 1%, IVA 16%)
- Detección de Duda Razonable en precios FOB atípicos
- Régimen legal: SENCAMER, MPPS, INSAI, etc.
