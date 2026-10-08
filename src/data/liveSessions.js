// Live sessions (الجلسات المباشرة). Today this is the one session the Home
// card has always shown (legacy, hard-coded); the backend will return the
// same shape later.
//
// Shape of one session:
//   {
//     id: "physics-review",           // stable slug, used in /dashboard/live/:sessionId
//     title: "جلسة مراجعة شاملة في الفيزياء",
//     subjectKey: "physics",          // SUBJECT_NAMES in data/courses.js
//     kind: "مراجعة شاملة",            // session type shown in «معلومات الجلسة»
//     professorId: "zid-anes",        // data/professors.js, or null
//     courseId: null,                 // the unit the session belongs to (access); null =
//                                     // any unit of the subject (features/live/access.js)
//     date: null,                     // "YYYY-MM-DD", or null = every day (legacy card)
//     startsAt: "20:00",              // local time, HH:MM
//     endsAt: "22:00",
//     description: null,              // «حول الجلسة»; hidden while null
//     topics: [],                     // «المحاور» (strings)
//     resources: [],                  // { title, url } — PDFs, exercises
//     recordingUrl: null,             // after the session ends
//     provider: {
//       type: "zoom",                 // features/live/providers.jsx (V1: Zoom; later: "yak")
//       joinUrl: null,                // the Zoom meeting link — set it here (or from the backend);
//     },                              // while null the page says the link is not available yet
//   }

export const LIVE_SESSIONS = [
  {
    id: "physics-review",
    title: "جلسة مراجعة شاملة في الفيزياء",
    subjectKey: "physics",
    kind: "مراجعة شاملة",
    professorId: "zid-anes",
    courseId: null,
    date: null,
    startsAt: "20:00",
    endsAt: "22:00",
    description: null,
    topics: [],
    resources: [],
    recordingUrl: null,
    provider: { type: "zoom", joinUrl: null },
  },
];

export function getLiveSession(sessionId) {
  return LIVE_SESSIONS.find((session) => session.id === sessionId) || null;
}

