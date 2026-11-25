export default function SkillItem({ skill }) {
  return (
    <div className="skill-item">
      <div className="skill-header">
        <span className="skill-name">{skill.name}</span>
        <span className="skill-level">{skill.level}%</span>
      </div>
      <div className="skill-bar">
        <div
          className="skill-progress"
          style={{ width: `${skill.level}%` }}
          role="progressbar"
          aria-valuenow={skill.level}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${skill.name} ${skill.level}%`}
        />
      </div>
    </div>
  );
}
