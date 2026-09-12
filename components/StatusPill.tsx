export type ServiceStatus =
  | "operational"
  | "degraded"
  | "down"
  | "untracked";

const LABELS: Record<ServiceStatus, string> = {
  operational: "Operational",
  degraded: "Degraded",
  down: "Down",
  untracked: "Untracked",
};

export function StatusPill({ status }: { status: ServiceStatus | string }) {
  const key = (Object.keys(LABELS).includes(status) ? status : "untracked") as ServiceStatus;
  return (
    <span className={`pill pill--${key}`}>
      <span className="dot" />
      {LABELS[key]}
    </span>
  );
}