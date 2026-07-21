export const CLIENT_TABLE_STORAGE_KEY = "clients:table:v1";

export const DEFAULT_CLIENTS = [];

const SEEDED_CLIENT_IDS = new Set(["C1292938", "C1292432", "C1292921", "C1294956"]);
const SEEDED_CLIENT_NAMES = new Set([
  "hcl",
  "tcs",
  "wipro",
  "verizon",
  "methodhub",
  "arrows inc",
  "novalabs",
  "abc technologies",
  "nova solutions",
  "pixelsoft pvt ltd",
  "finedge systems",
  "cloudnet corp",
  "insight labs",
  "codebase solutions",
  "brandhive digital",
]);

const isSeededClientRow = (row) => {
  const clientId = String(row?.clientId || row?.clientID || row?.id || "").trim();
  const clientName = String(row?.clientName || row?.name || "").trim().toLowerCase();

  return SEEDED_CLIENT_IDS.has(clientId) || SEEDED_CLIENT_NAMES.has(clientName);
};

const firstNonEmpty = (...values) =>
  values.map((value) => String(value ?? "").trim()).find(Boolean) || "";

const getClientDbId = (client = {}) =>
  firstNonEmpty(
    client?.backendClientId,
    client?.clientDbId,
    client?.clientDBId,
    client?.clientDatabaseId,
    client?.clientUuid,
    client?.clientUUID,
    client?.uuid,
    client?.id,
    client?._id,
    client?.clientId,
    client?.clientID,
    client?.clientMasterId,
    client?.clientMasterID,
  );

export const loadClientRows = () => {
  if (typeof window === "undefined") return DEFAULT_CLIENTS;

  try {
    const savedData = window.localStorage.getItem(CLIENT_TABLE_STORAGE_KEY);
    const parsedData = savedData ? JSON.parse(savedData) : null;
    if (Array.isArray(parsedData)) {
      const cleanedRows = parsedData.filter((row) => !isSeededClientRow(row));
      if (cleanedRows.length !== parsedData.length) {
        window.localStorage.setItem(CLIENT_TABLE_STORAGE_KEY, JSON.stringify(cleanedRows));
      }
      return cleanedRows;
    }
  } catch (error) {
    console.error("Failed to load saved clients:", error);
  }

  return DEFAULT_CLIENTS;
};

export const saveClientRows = (rows) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(CLIENT_TABLE_STORAGE_KEY, JSON.stringify(rows));
  } catch (error) {
    console.error("Failed to save clients:", error);
  }
};

export const getClientOptions = (rows = []) => {
  const seen = new Set();

  return rows.reduce((options, client) => {
    const clientName = String(client?.clientName || "").trim();
    const clientId = String(getClientDbId(client) || client?.clientId || client?.clientID || "").trim();
    if (!clientName || !clientId) return options;

    const optionKey = `${clientId.toLowerCase()}::${clientName.toLowerCase()}`;
    if (seen.has(optionKey)) return options;
    seen.add(optionKey);

    options.push({
      value: clientId,
      label: clientName,
      clientId,
      id: clientId,
      clientName,
    });

    return options;
  }, []);
};
