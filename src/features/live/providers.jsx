import { lazy } from "react";

// Live providers: what fills the stage of the Live page. The page never talks
// to Zoom directly — it asks getLiveProvider(session) for a provider and
// renders <provider.Stage session status onRetry />. To change how sessions
// are delivered, add a provider here and set session.provider.type; the page,
// its header, info and states stay as they are.
//
//   V1      zoom  — the session runs in Zoom. Yak shows the stage and a
//                   «الانضمام عبر Zoom» action that opens the meeting link
//                   (session.provider.joinUrl). Embedding the meeting inside
//                   the page needs the Zoom Meeting SDK and a signature from
//                   the backend; that is not set up, so it is not done here.
//                   When it is, load the SDK inside ZoomStage only — it is
//                   already a lazy chunk, fetched only on the Live page.
//   later   yak   — Yak's own live player: add YakLiveStage and register it
//                   below as `yak`.
//
// Provider: { id, label, Stage } — Stage is lazy (wrap it in <Suspense>).

const PROVIDERS = {
  zoom: { id: "zoom", label: "Zoom", Stage: lazy(() => import("../../components/dashboard/live/ZoomStage.jsx")) },
};

export function getLiveProvider(session) {
  return PROVIDERS[session?.provider?.type] || PROVIDERS.zoom;
}
