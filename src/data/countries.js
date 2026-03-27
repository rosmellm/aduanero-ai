export const COUNTRY_RESTRICTIONS = {
  "Cuba": { alert: "Régimen especial ALBA. Verificar acuerdo bilateral vigente.", level: "info" },
  "Bolivia": { alert: "Miembro ALBA. Puede aplicar trato preferencial.", level: "info" },
  "Nicaragua": { alert: "Miembro ALBA. Verificar acuerdo comercial.", level: "info" },
  "Colombia": { alert: "Relaciones comerciales normalizadas desde 2023. Verificar estado actual.", level: "warning" },
  "Guyana": { alert: "Diferendo territorial activo. Revisar normativa de tránsito.", level: "warning" },
  "Israel": { alert: "Venezuela rompió relaciones diplomáticas. Importaciones pueden estar restringidas.", level: "danger" },
  "Irán": { alert: "Relaciones activas. Puede haber sanciones internacionales de terceros países sobre financiamiento.", level: "warning" },
  "China": { alert: "Principal socio comercial. Verificar certificado de origen Form-E si aplica acuerdo.", level: "info" },
  "Brasil": { alert: "Miembro MERCOSUR. Puede aplicar programa de liberación comercial.", level: "info" },
  "Argentina": { alert: "Miembro MERCOSUR. Puede aplicar programa de liberación comercial.", level: "info" },
  "Uruguay": { alert: "Miembro MERCOSUR. Puede aplicar programa de liberación comercial.", level: "info" },
  "Paraguay": { alert: "Miembro MERCOSUR. Puede aplicar programa de liberación comercial.", level: "info" },
  "Estados Unidos": { alert: "Sanciones OFAC activas. Operaciones financieras altamente restringidas. Consultar asesoría legal.", level: "danger" },
  "USA": { alert: "Sanciones OFAC activas. Operaciones financieras altamente restringidas.", level: "danger" },
  "Panamá": { alert: "Hub logístico principal. Sin restricciones especiales.", level: "info" },
  "España": { alert: "Sin restricciones especiales. Relaciones comerciales normales.", level: "info" },
  "Turquía": { alert: "Relaciones activas. Verificar origen real de mercancías trianguladas.", level: "info" },
  "Rusia": { alert: "Relaciones activas. Verificar sanciones internacionales que puedan afectar financiamiento.", level: "warning" },
  "Bielorrusia": { alert: "Verificar sanciones internacionales vigentes sobre este origen.", level: "warning" },
}

export const TRANSPORT_COSTS = {
  maritimo: { label: "Marítimo", fleteMin: 0.02, fleteMax: 0.06, seguroMin: 0.005, seguroMax: 0.01, desc: "Flete: 2-6% del FOB · Seguro: 0.5-1% del FOB" },
  aereo: { label: "Aéreo", fleteMin: 0.15, fleteMax: 0.30, seguroMin: 0.01, seguroMax: 0.02, desc: "Flete: 15-30% del FOB · Seguro: 1-2% del FOB" },
  terrestre: { label: "Terrestre", fleteMin: 0.05, fleteMax: 0.12, seguroMin: 0.005, seguroMax: 0.01, desc: "Flete: 5-12% del FOB · Seguro: 0.5-1% del FOB" },
}

export const PERMIT_TYPES = [
  { id: 1, label: "Permiso MPPS (Salud)", duration: 365 },
  { id: 2, label: "Registro Sanitario MPPS", duration: 730 },
  { id: 3, label: "Permiso MPPAT (Agricultura)", duration: 180 },
  { id: 4, label: "Certificado Sanitario País Origen", duration: 90 },
  { id: 5, label: "Constancia SENCAMER", duration: 365 },
  { id: 6, label: "Licencia Importación MPPCE", duration: 180 },
  { id: 7, label: "Permiso MDD (Defensa)", duration: 365 },
  { id: 8, label: "Permiso MPPIP (Industrias)", duration: 365 },
  { id: 9, label: "Permiso MPPEE (Energía Eléctrica)", duration: 365 },
  { id: 10, label: "Permiso MPPPA (Pesca)", duration: 180 },
  { id: 11, label: "Certificado Kimberley", duration: 365 },
  { id: 12, label: "Permiso RNUOSC (Sustancias Químicas)", duration: 365 },
]
