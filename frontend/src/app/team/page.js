"use client";

import Link from "next/link";
import Image from "next/image";

const members = [
  {
    name: "Sourav Goyal",
    role: "Product & Partnerships",
    bio: "Leads market expansion and builds partnerships that bring personalised orthotics to new regions.",
    focus: "Roadmap, partner rollout, regulatory",
  },
  {
    name: "Anika Rao",
    role: "Biomechanics Lead",
    bio: "Researches gait data and pressure analytics to keep NeuroSole’s fit personalised at scale.",
    focus: "Biomechanics, sensor models, calibration",
  },
  {
    name: "Lucas Meyer",
    role: "Manufacturing Systems",
    bio: "Automates our additive manufacturing stack so every insole ships within 48 hours.",
    focus: "MES integrations, supply-chain automation",
  },
  {
    name: "Jasmine Lee",
    role: "Clinical Experience",
    bio: "Designs the digital touchpoints that keep practitioners and patients aligned through the NeuroSole journey.",
    focus: "Patient UX, telehealth, onboarding",
  },
];

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/40 to-white text-slate-900">
      <header className="fixed inset-x-0 top-0 z-40 bg-white shadow-sm backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-10">
          <div className="flex items-center space-x-3">
            <Image
              src="/images/gemi2.2.jpeg"
              alt="NeuroSole logo"
              width={72}
              height={72}
              className="h-16 w-16 object-contain md:h-20 md:w-20"
            />
            <div className="flex flex-col">
              <span className="text-xl font-semibold tracking-[0.22em] text-emerald-800 md:text-2xl">
                NeuroSole
              </span>
              <span className="text-[11px] uppercase tracking-[0.45em] text-emerald-500">
                Smart Insoles
              </span>
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <nav className="flex items-center gap-1 rounded-full border border-emerald-100/60 bg-white/80 px-2 py-1 text-sm shadow-[0_12px_28px_rgba(15,118,72,0.14)]">
              <Link
                href="/"
                className="rounded-full px-3 py-2 text-emerald-900/80 transition-colors hover:text-emerald-700"
              >
                Home
              </Link>
              <Link
                href="/#advantages"
                className="rounded-full px-3 py-2 text-emerald-900/80 transition-colors hover:text-emerald-700"
              >
                About
              </Link>
            </nav>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-300 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(16,185,129,0.35)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(16,185,129,0.38)]"
            >
              <span>Launch</span>
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 13L13 3"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
                <path
                  d="M6.2 3H13V9.8"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative min-h-screen px-6 pb-24 pt-40 md:px-12">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-12">
          <header className="space-y-4 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.45em] text-emerald-500">
            Team NeuroSole
          </span>
          <h1 className="text-4xl font-bold text-emerald-900 md:text-5xl">
            Makers behind the personalised orthotic platform
          </h1>
          <p className="mx-auto max-w-3xl text-base text-slate-600 md:text-lg">
            We are engineers, clinicians, and automation specialists accelerating how custom-fit support reaches every patient.
          </p>
          </header>

          <section className="grid gap-6 sm:grid-cols-2">
          {members.map((member) => (
            <article
              key={member.name}
              className="flex h-full flex-col gap-4 rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-[0_20px_38px_rgba(16,185,129,0.12)] backdrop-blur"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-emerald-900">{member.name}</h2>
                  <p className="text-xs font-medium uppercase tracking-[0.25em] text-emerald-500">
                    {member.role}
                  </p>
                </div>
                <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-emerald-100">
                  <Image
                    src="/images/gemi2.2.jpeg"
                    alt={member.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
              </div>
              <p className="text-sm text-slate-600">{member.bio}</p>
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              Focus: <span className="text-emerald-600">{member.focus}</span>
            </div>
          </article>
          ))}
          </section>
        </div>
      </main>
    </div>
  );
}
