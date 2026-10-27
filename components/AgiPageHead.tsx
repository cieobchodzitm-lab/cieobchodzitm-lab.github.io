import Link from "next/link";
import type { ClaimLevel } from "@/lib/agi-content";
import { ClaimBadge } from "@/components/ClaimBadge";

/** Shared heading block for the AGI sub-pages. */
export function AgiPageHead({
  eyebrow,
  title,
  stage,
  stageLevel,
}: {
  eyebrow: string;
  title: string;
  stage?: string;
  stageLevel?: ClaimLevel;
}) {
  return (
    <div className="page-head">
      <Link href="/agi" className="back-link">
        ← Angel Guardian Industry
      </Link>
      <p className="kicker">{eyebrow}</p>
      <h1>{title}</h1>
      {stage && stageLevel && (
        <p className="stage">
          <ClaimBadge level={stageLevel} />
          <span>{stage}</span>
        </p>
      )}
    </div>
  );
}
