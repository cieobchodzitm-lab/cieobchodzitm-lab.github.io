import type { Metadata } from "next";
import Link from "next/link";
import { CONTACTS, LOCATIONS, WEBSITE } from "@/lib/agi-content";
import { AgiPageHead } from "@/components/AgiPageHead";
import { ClaimBadge } from "@/components/ClaimBadge";

export const metadata: Metadata = { title: "Contact" };

const ENQUIRY_TYPES = [
  "Investment enquiries",
  "Partnership opportunities",
  "Media requests",
  "Technical collaboration",
];

export default function ContactPage() {
  return (
    <>
      <AgiPageHead eyebrow="Reach the team" title="Contact" />

      <p className="prose">
        Contact details below are published by Angel Guardian Industry. They are reproduced
        as-is; this site cannot confirm that the addresses are monitored or that mail
        reaches them.
      </p>

      <div className="spacer" />

      <div className="grid-2">
        {CONTACTS.map((channel) => (
          <div key={channel.value} className="card">
            <h3>{channel.label}</h3>
            <p className="mono contact-address">
              {channel.href ? <a href={channel.href}>{channel.value}</a> : channel.value}
            </p>
            <ClaimBadge level={channel.level} />
            <p className="claim-note">{channel.note}</p>
          </div>
        ))}
      </div>

      <div className="spacer" />

      <div className="section-head">
        <h2>What to write about</h2>
      </div>
      <div className="card-grid card-grid--tight">
        {ENQUIRY_TYPES.map((type) => (
          <div key={type} className="card card--flat">
            <p>{type}</p>
          </div>
        ))}
      </div>

      <div className="spacer" />

      <div className="grid-2">
        <div className="card card--flat">
          <h3>Location</h3>
          <p>{LOCATIONS.join(" · ")}</p>
          <p className="claim-note">
            As stated in the source material. No registered company address or registration
            number is published.
          </p>
        </div>
        <div className="card card--flat">
          <h3>Website</h3>
          <p className="mono">{WEBSITE.value}</p>
          <ClaimBadge level={WEBSITE.level} />
          <p className="claim-note">
            {WEBSITE.status}. {WEBSITE.note}
          </p>
        </div>
      </div>

      <div className="spacer" />
      <div className="cta-row">
        <Link href="/agi" className="btn btn--primary">
          Back to overview
        </Link>
        <Link href="/agi/crowdfunding" className="btn">
          Campaign details
        </Link>
      </div>
    </>
  );
}
