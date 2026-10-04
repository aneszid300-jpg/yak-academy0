// The user's real name, or "" when the account has none.
// Register stores `full_name`; older code expected first_name/last_name.
export function getFullName(user) {
  const meta = user?.user_metadata || {};
  const full = (meta.full_name || "").trim();
  if (full) return full;
  return `${meta.first_name || ""} ${meta.last_name || ""}`.trim();
}

// Dashboard display name.
export function getDisplayName(user) {
  return getFullName(user) || "طالب";
}

// Avatar letter: first letter of the resolved name, "ط" as fallback.
export function getUserInitial(user) {
  const name = getDisplayName(user);
  return name === "طالب" ? "ط" : name.charAt(0).toUpperCase();
}
