/**
 * Content source for the public "Angel Guardian Industry" (AGI) section.
 *
 * Everything here is transcribed from the company's own project README.
 * Claims are NOT published as bare assertions: each carries a `ClaimLevel`
 * so the UI can show whether it is confirmable, self-reported, or planned.
 * Nothing in this file has been independently audited by the site operator.
 */

export type ClaimLevel = "confirmed" | "self-reported" | "planned";

export const CLAIM_META: Record<
  ClaimLevel,
  { label: string; pill: string; note: string }
> = {
  confirmed: {
    label: "Confirmed",
    pill: "pill--ok",
    note: "Publicly documented or independently checkable.",
  },
  "self-reported": {
    label: "Self-reported",
    pill: "pill--warn",
    note: "Stated by Angel Guardian Industry. Not independently validated by this site.",
  },
  planned: {
    label: "Planned",
    pill: "pill--muted",
    note: "Intended future state — not yet in effect. Treat as aspiration, not fact.",
  },
};

export interface Claim {
  level: ClaimLevel;
  /** Headline figure or short phrase. */
  value: string;
  /** What the figure is supposed to measure. */
  label: string;
  /** The honest caveat that must travel with the figure. */
  detail: string;
}

export interface ProjectSummary {
  slug: string;
  name: string;
  tagline: string;
  stage: string;
  stageLevel: ClaimLevel;
  blurb: string;
}

export interface SpecRow {
  k: string;
  v: string;
  level: ClaimLevel;
}

export interface ContactChannel {
  label: string;
  value: string;
  href?: string;
  level: ClaimLevel;
  note?: string;
}

/* ------------------------------------------------------------------ */
/* Identity                                                            */
/* ------------------------------------------------------------------ */

export const AGI = {
  name: "Angel Guardian Industry",
  motto: "Where technology meets humanity",
  mottoPl: "Aniele stróżu mój, ty zawsze przy mnie stój",
  mottoPlEn: "Guardian Angel, always by my side",
  tagline:
    "Rescue, defense and communication systems built around autonomous, AI-driven field technology.",
  mission:
    "Develop next-generation rescue, defense and communication systems that save lives through autonomous AI-driven technology.",
  licenceShort: "Proprietary & Confidential",
  year: 2025,
  legal: {
    licence: "Proprietary & confidential",
    patentNote:
      "Patent application reported as pending on an \"Integrated Helmet-Drone Deployment Mechanism\". Filing, docket and jurisdiction status are not verified on this site.",
    tradeSecret:
      "EN-MASCA swarm coordination algorithm is described as a trade secret; no public implementation or benchmark is available for review.",
  },
} as const;

/* ------------------------------------------------------------------ */
/* Achievements                                                        */
/* ------------------------------------------------------------------ */

export const ACHIEVEMENTS: Claim[] = [
  {
    level: "self-reported",
    value: "95%",
    label: "Detection rate",
    detail:
      "Reported across a 100-run internal simulation set. Simulation conditions, ground truth and dataset are not published, and no independent or field validation has been shown.",
  },
  {
    level: "self-reported",
    value: "TOPR",
    label: "Rescue-service engagement",
    detail:
      "A working relationship with TOPR (Tatrzańskie Ochotnicze Pogotowie Ratunkowe) is reported by the founder. Partnership status and terms are not publicly confirmed by TOPR on this site.",
  },
  {
    level: "self-reported",
    value: "PCT",
    label: "Patent status",
    detail:
      "Described as a pending international (PCT) application. No application number is published here, so the status cannot be checked by a reader.",
  },
  {
    level: "self-reported",
    value: "~341 KB",
    label: "Technical documentation",
    detail:
      "Volume of the internal documentation set as last counted by the author. Volume is not a measure of technical completeness.",
  },
  {
    level: "self-reported",
    value: "EN-MASCA",
    label: "Swarm algorithm",
    detail:
      "Named proprietary swarm-coordination algorithm. No paper, reference implementation or third-party evaluation exists for it.",
  },
];

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

export const PROJECTS: ProjectSummary[] = [
  {
    slug: "phantom-rescue",
    name: "PHANTOM RESCUE",
    tagline: "Autonomous SAR drone system with integrated helmet deployment",
    stage: "Prototype phase",
    stageLevel: "self-reported",
    blurb:
      "The lead programme: an autonomous search-and-rescue drone intended to carry and deploy a protective helmet to a located casualty, coordinating in a swarm over a mesh network.",
  },
  {
    slug: "phantom-scout",
    name: "PHANTOM SCOUT",
    tagline: "Humanoid reconnaissance unit for field coordination",
    stage: "Concept phase",
    stageLevel: "self-reported",
    blurb:
      "An R&D study of a ground-based humanoid unit for reconnaissance and field coordination. No hardware has been demonstrated.",
  },
  {
    slug: "global-rescue-initiative",
    name: "Global Rescue Initiative",
    tagline: "Strategic framework for international drone coordination",
    stage: "Framework / vision",
    stageLevel: "self-reported",
    blurb:
      "A policy and architecture proposal for coordinating rescue drones across national SAR organisations. It is a position document, not a deployed system.",
  },
];

export const PHANTOM_RESCUE = {
  name: "PHANTOM RESCUE",
  stage: "Prototype phase",
  stageLevel: "self-reported" as ClaimLevel,
  summary:
    "PHANTOM RESCUE is described as an autonomous search-and-rescue drone system whose distinguishing feature is an integrated helmet-deployment mechanism: the aircraft locates a casualty, then delivers a protective helmet to them. Units are intended to operate as a coordinated swarm and to remain linked over an ad-hoc mesh network when conventional coverage is unavailable.",
  specs: [
    {
      k: "Swarm coordination",
      v: "EN-MASCA proprietary swarm algorithm (closed source)",
      level: "self-reported",
    },
    {
      k: "Sensing",
      v: "LiDAR and thermal imagery, fused for target detection",
      level: "self-reported",
    },
    {
      k: "Networking",
      v: "Ad-hoc mesh network between units",
      level: "self-reported",
    },
    {
      k: "Payload",
      v: "Integrated helmet-deployment mechanism (patent application reported pending)",
      level: "self-reported",
    },
  ] as SpecRow[],
  intendedUsers: [
    "Mountain rescue (TOPR named as an intended partner organisation)",
    "Border Guard",
    "Fire service (PSP / OSP units)",
  ],
  openQuestions: [
    "What are the flight envelope, endurance and payload mass of the current prototype?",
    "Under what conditions was the 95% detection figure measured, and against what ground truth?",
    "Which airframe and autopilot hardware is used, and what is its certification path?",
    "Has any unit flown a supervised field trial, and if so, with which authority?",
    "What is the applicable UAS category and operational authorisation under EU 2019/947?",
  ],
  docsNote:
    "The source material links to detailed documents (technical specifications, certification roadmap, field-testing protocol). Those documents are not published in this repository, so no links to them are shown here.",
};

export const PHANTOM_SCOUT = {
  name: "PHANTOM SCOUT",
  stage: "Concept phase",
  stageLevel: "self-reported" as ClaimLevel,
  summary:
    "PHANTOM SCOUT is an R&D concept for a humanoid reconnaissance unit intended to support field coordination alongside aerial assets. At concept phase there is no demonstrated hardware, no published specification and no development timeline.",
  status: [
    "Concept phase — no hardware demonstrated",
    "No public specification, bill of materials or schedule",
    "Relationship to the aerial PHANTOM programme is described but not documented",
  ],
  docsNote:
    "The source material links to a technical overview document that is not present in this repository.",
};

export const GLOBAL_RESCUE = {
  name: "Global Rescue Initiative",
  stage: "Framework / vision",
  stageLevel: "self-reported" as ClaimLevel,
  summary:
    "The Global Rescue Initiative is presented as a strategic framework for international drone coordination between national search-and-rescue organisations. It is a proposal about how such coordination could work — governance, interoperability and cross-border operating rules — rather than an operating programme.",
  pillars: [
    "Common tasking and hand-off between national SAR organisations",
    "Interoperable telemetry, identification and deconfliction for rescue UAS",
    "A shared position on cross-border operational authorisations",
  ],
  docsNote:
    "The source material links to a vision document that is not present in this repository.",
};

/* ------------------------------------------------------------------ */
/* Funding                                                             */
/* ------------------------------------------------------------------ */

export const FUNDING = {
  platform: "Zrzutka.pl",
  goal: "250 000 PLN",
  statedLaunch: "Q4 2025",
  link: "https://zrzutka.pl/phantom-defense",
  linkLevel: "planned" as ClaimLevel,
  caveats: [
    "The stated launch window (Q4 2025) has already passed relative to the current date. Whether the campaign is live, paused, or never launched is not confirmed here.",
    "The campaign URL could not be verified as active from the environment where this page was generated.",
    "All amounts below are the author's own milestone targets. There is no third-party escrow, milestone audit or delivery guarantee attached to them.",
    "Contributing to a crowdfunding campaign is not an investment and carries no expectation of return.",
  ],
  stretchGoals: [
    {
      amount: "250 000 PLN",
      milestone: "8–10 prototypes plus a TOPR testing programme",
      level: "planned" as ClaimLevel,
    },
    {
      amount: "375 000 PLN",
      milestone: "Extended testing plus certification work",
      level: "planned" as ClaimLevel,
    },
    {
      amount: "450 000 PLN",
      milestone: "PHANTOM EW — RF detection module",
      level: "planned" as ClaimLevel,
    },
    {
      amount: "500 000 PLN",
      milestone: "PHANTOM RELAY — mesh communication module",
      level: "planned" as ClaimLevel,
    },
  ] as { amount: string; milestone: string; level: ClaimLevel }[],
};

/* ------------------------------------------------------------------ */
/* Team                                                                */
/* ------------------------------------------------------------------ */

export const FOUNDER = {
  name: "Zbigniew Szymon Kołacz",
  role: "Founder & Chief Inventor",
  bio: "Described as a systems architect, AI specialist and mission-driven technologist.",
  level: "self-reported" as ClaimLevel,
};

export const OPEN_ROLES = [
  {
    title: "CTO",
    focus: "AI + sensor fusion",
    level: "confirmed" as ClaimLevel,
  },
  {
    title: "Hardware Lead",
    focus: "Field testing",
    level: "confirmed" as ClaimLevel,
  },
  {
    title: "SAR Operations Specialist",
    focus: "Operational doctrine and field trials",
    level: "confirmed" as ClaimLevel,
  },
];

export const SUPPORTERS = [
  {
    name: "TOPR",
    detail:
      "Tatrzańskie Ochotnicze Pogotowie Ratunkowe — named as a supporter in the source material.",
    level: "self-reported" as ClaimLevel,
  },
  {
    name: "Early backers and advisors",
    detail: "Unnamed individuals.",
    level: "self-reported" as ClaimLevel,
  },
  {
    name: "SAR community worldwide",
    detail: "Named collectively.",
    level: "self-reported" as ClaimLevel,
  },
];

/* ------------------------------------------------------------------ */
/* Contact                                                             */
/* ------------------------------------------------------------------ */

export const CONTACTS: ContactChannel[] = [
  {
    label: "General / SAR enquiries",
    value: "kontakt@angelguardian.tech",
    href: "mailto:kontakt@angelguardian.tech",
    level: "self-reported",
    note: "Published in the source material. Deliverability has not been verified here.",
  },
  {
    label: "Investment, partnerships, media",
    value: "ceo@angelguardian.tech",
    href: "mailto:ceo@angelguardian.tech",
    level: "self-reported",
    note: "Published in the source material. Deliverability has not been verified here.",
  },
];

export const WEBSITE = {
  value: "www.angelguardian.tech",
  status: "Listed as \"coming soon\" in the source material",
  level: "planned" as ClaimLevel,
  note: "The domain did not resolve when this page was generated, so no link is offered.",
};

export const LOCATIONS = ["Poland", "Estonia"];

/* ------------------------------------------------------------------ */
/* Site copy                                                           */
/* ------------------------------------------------------------------ */

export const VERIFICATION_BANNER =
  "This section republishes Angel Guardian Industry's own project material. Claims are labelled rather than asserted: anything marked self-reported has not been independently validated, and anything marked planned describes an intention, not a current fact. Do not treat this page as due diligence.";

export const NAV = [
  { href: "/agi", label: "Overview" },
  { href: "/agi/phantom-rescue", label: "Phantom Rescue" },
  { href: "/agi/phantom-scout", label: "Phantom Scout" },
  { href: "/agi/global-rescue-initiative", label: "Global Rescue" },
  { href: "/agi/crowdfunding", label: "Crowdfunding" },
  { href: "/agi/team", label: "Team" },
  { href: "/agi/contact", label: "Contact" },
] as const;
