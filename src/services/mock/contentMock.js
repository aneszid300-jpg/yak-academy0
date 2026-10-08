// ╔══════════════════════════════════════════════════════════════════════╗
// ║  MOCK / DEVELOPMENT ONLY — NOT A FILE STORE.                          ║
// ║  The professor's uploads, kept in the shared mock (classMock.js) so   ║
// ║  students on this device see the exercise files. Replaced by the    ║
// ║  real backend adapter (same functions, same shapes).                  ║
// ╚══════════════════════════════════════════════════════════════════════╝

import { ContentError } from "../contentContract.js";
import { deleteFile, getFile, me, newId, now, putFile, snapshot, update } from "./classMock.js";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const toPublic = ({ userId, ...upload }) => upload; // eslint-disable-line no-unused-vars

export const contentMockAdapter = {
  name: "mock",

  /** The signed-in professor's uploads, newest first. */
  async listUploads() {
    const user = await me();
    if (!user) throw new ContentError("unauthenticated");
    return snapshot()
      .uploads.filter((u) => u.userId === user.id)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .map(toPublic);
  },

  async uploadFile({ courseId, kind, file, name, size, type }) {
    await wait(700); // a real upload takes a moment
    const user = await me();
    if (!user) throw new ContentError("unauthenticated");
    const upload = {
      id: newId("up"),
      userId: user.id,
      professorId: user.professorId,
      courseId,
      kind,
      name,
      size,
      type,
      // Exercises go to the students at once; a flashcards PDF waits for the AI.
      status: kind === "exercises" ? "published" : "processing",
      createdAt: now(),
    };
    await putFile(upload.id, file);
    update((d) => d.uploads.push(upload));
    return toPublic(upload);
  },

  async deleteUpload(id) {
    const user = await me();
    update((d) => {
      d.uploads = d.uploads.filter((u) => !(u.id === id && u.userId === user?.id));
    });
    await deleteFile(id).catch(() => {});
  },

  /** Exercise files the students can see (every professor's), sync. */
  publishedExercises() {
    return snapshot().uploads.filter((u) => u.kind === "exercises" && u.status === "published").map(toPublic);
  },

  /** A URL the viewer can open, or null. */
  async fileUrl(id) {
    const blob = await getFile(id).catch(() => null);
    return blob ? URL.createObjectURL(blob) : null;
  },
};
