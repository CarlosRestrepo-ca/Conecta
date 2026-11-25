// Utilidades puras compartidas por los módulos de CONECTA.
// No tienen estado ni acceden al DOM, así que pueden importarse desde cualquier módulo.

// Normaliza texto para búsquedas: sin tildes, en minúsculas y sin espacios extremos.
export function normalizeSearchText(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

// Normaliza el término de búsqueda de usuarios: ignora tildes, mayúsculas y el prefijo @.
export function normalizeUserSearch(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .trim()
    .replace(/^@+/, "");
}

// Convierte una marca de tiempo de Firestore (o una fecha) en texto legible.
export function formatReadTimestamp(timestamp) {
  if (!timestamp) return "";
  const d = timestamp.toDate ? timestamp.toDate() : timestamp;
  return d.toLocaleString();
}
