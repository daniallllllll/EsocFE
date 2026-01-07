export const normalizeIncident = (raw: any) => ({
  ...raw,
  severity: raw.severity?.toLowerCase() === "low"
    ? "Low"
    : raw.severity?.toLowerCase() === "medium"
    ? "Medium"
    : raw.severity?.toLowerCase() === "high"
    ? "High"
    : "Critical",

  status: raw.status?.includes("resolved")
    ? "Resolved"
    : "Open",
});
