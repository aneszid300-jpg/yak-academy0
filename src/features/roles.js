// Who is signed in: a student (default) or a professor.
//
// The role lives in the account's Supabase `app_metadata`, which only the
// server / the Supabase dashboard can write — a student cannot make
// themselves a professor (unlike `user_metadata`, which the user can edit).
// A professor account carries:
//   app_metadata.role         = "professor"
//   app_metadata.professor_id = the professor's id in data/professors.js
//
// This only decides which dashboard is shown. Anything private a professor
// sees later (students, sales) must also be checked by the backend.

export const isProfessor = (user) => user?.app_metadata?.role === "professor";

export const professorIdOf = (user) => (isProfessor(user) ? user.app_metadata.professor_id || null : null);
