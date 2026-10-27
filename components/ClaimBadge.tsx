import { CLAIM_META, type ClaimLevel } from "@/lib/agi-content";

/**
 * Small pill that travels next to every claim in the AGI section.
 * It exists so a reader can never mistake a founder's assertion for a fact.
 */
export function ClaimBadge({
  level,
  withNote = false,
}: {
  level: ClaimLevel;
  withNote?: boolean;
}) {
  const meta = CLAIM_META[level];
  return (
    <>
      <span className={`pill ${meta.pill}`} title={meta.note}>
        <span className="dot" />
        {meta.label}
      </span>
      {withNote && <p className="claim-note">{meta.note}</p>}
    </>
  );
}

/** Legend shown once, at the top of the section. */
export function VerificationLegend({ intro }: { intro: string }) {
  const levels: ClaimLevel[] = ["confirmed", "self-reported", "planned"];
  return (
    <aside className="verify-banner" role="note">
      <p className="verify-banner__intro">{intro}</p>
      <ul className="verify-banner__keys">
        {levels.map((level) => (
          <li key={level}>
            <ClaimBadge level={level} />
            <span>{CLAIM_META[level].note}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
