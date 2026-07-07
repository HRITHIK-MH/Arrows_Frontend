const normalizeName = (name) => String(name || "").trim();

const isGenericName = (name) => {
  const normalized = normalizeName(name).toLowerCase();
  return [
    "business stakeholder",
    "businessstakeholder",
    "account manager",
    "accountmanager",
    "recruiter",
  ].includes(normalized);
};

export const deriveNameFromEmail = (email) => {
  const rawEmail = String(email || "").trim();
  const localPart = rawEmail.split("@")[0] || "";
  const firstSegment = localPart.split(/[_\.+-]+/).filter(Boolean)[0] || localPart;
  return capitalize(firstSegment);
};

export const getInitials = (name) => {
  const normalized = normalizeName(name).replace(/[_\.+-]+/g, " ");
  if (!normalized) {
    return "U";
  }

  const parts = normalized
    .split(/\s+/)
    .map((part) => String(part || "").trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return "U";
  }

  if (parts.length === 1) {
    const word = parts[0];
    return word.slice(0, 2).toUpperCase();
  }

  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
};

const capitalize = (value) => {
  const normalized = String(value || "").trim();
  if (!normalized) return "";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

export const getDisplayName = (name, email) => {
  const storedName = normalizeName(name);
  const looksLikeEmail = storedName.includes("@") && storedName.split("@").length === 2;
  if (storedName && !looksLikeEmail && !isGenericName(storedName)) {
    return storedName;
  }

  return deriveNameFromEmail(looksLikeEmail ? storedName : email);
};

export const getAvatarInitials = (name, email) => {
  const storedName = normalizeName(name);
  const looksLikeEmail = storedName.includes("@") && storedName.split("@").length === 2;
  if (storedName && !looksLikeEmail && !isGenericName(storedName)) {
    return getInitials(storedName);
  }

  const rawEmail = String(email || "").trim();
  const localPart = rawEmail.split("@")[0];
  if (!localPart) {
    return "U";
  }

  const parts = localPart.split(/[_\.+-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }

  const word = parts[0] || localPart;
  return word.slice(0, 2).toUpperCase() || "U";
};

const ROLE_DISPLAY_MAP = {
  accountmanager: "Account Manager",
  businessstakeholder: "Business Stakeholder",
  recruiter: "Recruiter",
};

export const formatRoleLabel = (role) => {
  const normalized = String(role || "").trim().toLowerCase().replace(/[-_\s]+/g, "");
  return ROLE_DISPLAY_MAP[normalized] || String(role || "").trim();
};
