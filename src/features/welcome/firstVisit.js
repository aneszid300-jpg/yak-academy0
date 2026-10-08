// بطاقة الترحيب — shown once, on the student's first visit to the dashboard.
// "Seen" lives on the account (Supabase user_metadata.welcome_seen, so it
// holds across devices) and on this device (localStorage, so it holds even
// before the metadata update comes back, or if it fails).

const key = (userId) => `yak:welcome-seen:${userId}`;

export function hasSeenWelcome(user) {
  if (!user) return true;
  if (user.user_metadata?.welcome_seen) return true;
  try {
    return localStorage.getItem(key(user.id)) === "1";
  } catch {
    return false;
  }
}

export function markWelcomeSeen(user, supabase) {
  if (!user) return;
  try {
    localStorage.setItem(key(user.id), "1");
  } catch {
    // storage blocked: the account flag below still records it
  }
  if (!user.user_metadata?.welcome_seen) {
    supabase?.auth?.updateUser?.({ data: { welcome_seen: true } })?.catch?.(() => {});
  }
}
