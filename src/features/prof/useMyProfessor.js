import { useMemo } from "react";
import { useClassVersion } from "../../services/classService.js";
import { useAuth } from "../../hooks/useAuth.js";
import { professorIdOf } from "../roles.js";
import { getProfessor, getProfessorCourses } from "../../data/professors.js";
import { allLiveSessions } from "../../services/liveService.js";
import { sessionBelongsToCourse } from "../live/access.js";
import { getCourseContent } from "../courses/content.js";

// The signed-in professor and everything that is theirs, from the same data
// the students see: their courses (data/courses.js professorId), each course's
// content (features/courses/content.js), their Live sessions, and real totals.
// professor is null when the account is not linked to a professor record.
export function useMyProfessor() {
  const { user } = useAuth();
  const id = professorIdOf(user);
  const version = useClassVersion(); // scheduled sessions, uploads

  return useMemo(() => {
    const professor = id ? getProfessor(id) : null;
    if (!professor) return { professor: null, courses: [], contents: [], sessions: [], totals: null };

    const courses = getProfessorCourses(id);
    const contents = courses.map((course) => ({ course, content: getCourseContent(course.id) }));
    // A session with a professor is theirs only; one without, by its course.
    const sessions = allLiveSessions().filter((s) => (s.professorId ? s.professorId === id : courses.some((c) => sessionBelongsToCourse(s, c))));

    const sum = (pick) => contents.reduce((n, { content }) => n + (content ? pick(content) : 0), 0);
    const totals = {
      courses: courses.length,
      lessons: sum((c) => c.lessons.length),
      live: sessions.length,
      qcm: sum((c) => c.qcm.reduce((n, d) => n + d.questions, 0)),
      exercises: sum((c) => c.exercises.length),
    };
    return { professor, courses, contents, sessions, totals };
  }, [id, version]);
}
