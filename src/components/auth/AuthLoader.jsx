// Shown while the session is being checked, so protected pages never flash.
export default function AuthLoader() {
  return (
    <div className="grid min-h-screen place-items-center bg-bg-main" role="status" aria-label="جاري التحميل">
      <span className="size-8 animate-spin rounded-full border-[3px] border-lavender-mist border-t-electric-violet" />
    </div>
  );
}
