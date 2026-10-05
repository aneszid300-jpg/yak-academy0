// A professor's photo, or the first letter of their name when there is none.
// Used by the course details window and the professor profile.
export default function ProfessorAvatar({ professor, size = 40 }) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.42) };
  if (professor.photo) {
    return <img className="professor-avatar" src={professor.photo} alt={professor.name} style={style} />;
  }
  return (
    <span className="professor-avatar is-initial" style={style} aria-hidden="true">
      {professor.name.trim().charAt(0)}
    </span>
  );
}
