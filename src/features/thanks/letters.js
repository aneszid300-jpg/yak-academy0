// رسالة الشكر — one letter per bought course, shown once, the moment the
// course becomes the student's (a Slick-Pay payment approved at once, or a
// BaridiMob / CCP proof approved later by the Yak team: either way the
// course's access turns on). Which courses already had their letter is kept on
// this device. The first time it is read, everything already owned counts as
// thanked, so older purchases (and DEV-unlocked units) never pop a letter.

const key = (userId) => `yak:thanked-courses:${userId}`;

function read(userId) {
  try {
    const raw = localStorage.getItem(key(userId));
    return raw == null ? null : JSON.parse(raw);
  } catch {
    return undefined; // storage blocked: never interrupt the student
  }
}

function write(userId, ids) {
  try {
    localStorage.setItem(key(userId), JSON.stringify(ids));
  } catch {
    // storage blocked: nothing to remember
  }
}

/** The first owned course whose letter has not been shown yet, or null. */
export function nextThanks(userId, ownedIds) {
  const seen = read(userId);
  if (seen === undefined) return null;
  if (seen === null) {
    write(userId, ownedIds);
    return null;
  }
  return ownedIds.find((id) => !seen.includes(id)) || null;
}

export function markThanked(userId, courseId) {
  const seen = read(userId) || [];
  if (!seen.includes(courseId)) write(userId, [...seen, courseId]);
}

/** When the course became the student's: the approved purchase, if there is one. */
export const thanksDate = (access) => access?.purchase?.updatedAt || access?.purchase?.createdAt || null;
