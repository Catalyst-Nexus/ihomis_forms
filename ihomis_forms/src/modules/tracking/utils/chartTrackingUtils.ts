const MISSING_MARK = "\u2014";

function safeIso(raw) {
  if (!raw) return null;
  const cleaned = String(raw)
    .replace(/^[^(]*\(([^)]+)\).*$/, "$1")
    .trim();
  const parsed = new Date(cleaned);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  const fallback = new Date(raw);
  return Number.isNaN(fallback.getTime()) ? null : fallback.toISOString();
}

function safeDisplay(raw) {
  const iso = safeIso(raw);
  if (!iso) return raw ? String(raw) : MISSING_MARK;
  return new Date(iso).toLocaleDateString();
}

function parseApiStatus(raw = "") {
  if (!raw) return { done: false };
  const lower = String(raw).toLowerCase();
  if (lower.includes("not yet") || lower.includes("no phic")) {
    return { done: false };
  }
  return { done: true, isoDate: safeIso(raw), label: String(raw) };
}

const API_FIELD_MAP = {
  phic: ["phic"],
  records_received: ["records received", "records_received"],
  verify_status: ["verify"],
  scan_status: ["scan"],
  send_status: ["send"],
  records_filed: ["records filed", "records_filed"],
  claim_map: ["claim map", "claim_map", "philhealth"],
  acpn: ["acpm", "acpn"],
};

function matchApiField(stepDescription = "") {
  const desc = String(stepDescription).toLowerCase();
  for (const [field, keywords] of Object.entries(API_FIELD_MAP)) {
    if (keywords.some((keyword) => desc.includes(keyword))) return field;
  }
  return null;
}

function extractAdmittedDate(encoCode = "") {
  const match = String(encoCode).match(/(\d{2}\/\d{2}\/\d{4})/);
  return match ? match[1] : MISSING_MARK;
}

export {
  API_FIELD_MAP,
  extractAdmittedDate,
  matchApiField,
  parseApiStatus,
  safeDisplay,
  safeIso,
};
