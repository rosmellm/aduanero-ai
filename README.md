# ADUANERO.AI · Venezuela
Motor de Clasificación Arancelaria NANDINA — Decreto N° 4.944
Gaceta Oficial N° 6.804 Extraordinario — 24 de abril de 2024

## Tecnologías
- React 18 + Vite
- CSS Modules
- Anthropic Claude API (claude-sonnet-4)
- Base arancelaria real: 11.915 subpartidas NANDINA extraídas del PDF oficial

## Instalación local
```bash
npm install
cp .env.example .env.local
# Edita .env.local y agrega tu VITE_ANTHROPIC_API_KEY
npm run dev
```

## Despliegue en Cloudflare Pages
1. Sube el repositorio a GitHub
2. Cloudflare Pages → Create → Connect to Git → selecciona el repo
3. Build command: `npm run build`
4. Build output directory: `dist`
5. Environment variables: `VITE_ANTHROPIC_API_KEY` = tu API key
6. Save and Deploy

## Estructura
```
public/
  arancel.json     ← 11.915 subpartidas extraídas del Decreto N° 4.944
src/
  components/      ← Header, MessageBubble, InputBar
  utils/
    api.js         ← inyecta datos reales del arancel en cada consulta
    format.js      ← formateo de moneda
  constants.js     ← system prompt + consultas rápidas
  App.jsx          ← estado del chat
```

## Funcionamiento del RAG
Cada consulta del usuario activa un motor de búsqueda semántica local que:
1. Busca las subpartidas más relevantes en arancel.json (11.915 entradas)
2. Extrae las notas de capítulo aplicables
3. Inyecta los datos reales en el prompt de Claude
4. Claude clasifica citando el código exacto del arancel oficial
