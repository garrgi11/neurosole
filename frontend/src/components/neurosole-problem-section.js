'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

const createGradientPlaceholder = (id, from, via, to) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="grad-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${from}" />
          <stop offset="50%" stop-color="${via}" />
          <stop offset="100%" stop-color="${to}" />
        </linearGradient>
      </defs>
      <rect width="800" height="1000" fill="url(#grad-${id})" />
      <circle cx="200" cy="260" r="160" fill="rgba(255,255,255,0.18)" />
      <circle cx="560" cy="620" r="240" fill="rgba(255,255,255,0.12)" />
      <path d="M0 720 C240 640 460 820 800 720 L800 1000 L0 1000 Z" fill="rgba(255,255,255,0.16)" />
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const INSIGHT_CARDS = [
  {
    badge: '01',
    title: 'Delayed Access to Care',
    body:
      'Orthopedic appointments for custom insoles often take 15 days to 1+ month, leaving people waiting in discomfort.',
    image: createGradientPlaceholder('01', '#34d399', '#6ee7b7', '#a7f3d0'),
    imageAlt: 'Illustration highlighting delayed access to orthotic care',
  },
  {
    badge: '02',
    title: 'Growing Market, Growing Gaps',
    body:
      "Despite an $8 billion insole market that's rapidly expanding, current solutions can't keep pace with rising demand.",
    image: createGradientPlaceholder('02', '#0ea5e9', '#38bdf8', '#bfdbfe'),
    imageAlt: 'Illustration representing growing market gaps',
  },
  {
    badge: '03',
    title: 'Painful Shoe Trials',
    body:
      "Without proper insoles, customers can't fully test new footwear, leading to foot pain, injuries, and dissatisfaction.",
    image: createGradientPlaceholder('03', '#a855f7', '#c084fc', '#ede9fe'),
    imageAlt: 'Illustration showing painful shoe trials',
  },
  {
    badge: '04',
    title: 'Fragmented Rehab Insights',
    body:
      'Clinicians lack real-time recovery data, so treatment plans lag behind what patients actually experience day to day.',
    image: createGradientPlaceholder('04', '#f97316', '#fb923c', '#fed7aa'),
    imageAlt: 'Illustration depicting fragmented rehab insights',
  },
  {
    badge: '05',
    title: 'Manual Fit Adjustments',
    body:
      'Most inserts still require repeat in-person tweaks, adding cost for clinics and frustration for wearers who need fast relief.',
    image: createGradientPlaceholder('05', '#0f766e', '#14b8a6', '#5eead4'),
    imageAlt: 'Illustration showing manual fit adjustments',
  },
];

export default function NeuroSoleProblemSection() {
  const textRef = useRef(null);
  const imageRef = useRef(null);
  const insightRefs = useRef([]);

  const [textVisible, setTextVisible] = useState(false);
  const [imageVisible, setImageVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const insights = useMemo(() => [...INSIGHT_CARDS], []);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setTextVisible(true);
      setImageVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === textRef.current && entry.isIntersecting) {
            setTextVisible(true);
          }
          if (entry.target === imageRef.current && entry.isIntersecting) {
            setImageVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    const textEl = textRef.current;
    const imageEl = imageRef.current;

    if (textEl) observer.observe(textEl);
    if (imageEl) observer.observe(imageEl);

    return () => {
      if (textEl) observer.unobserve(textEl);
      if (imageEl) observer.unobserve(imageEl);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const updateActive = () => {
      const elements = insightRefs.current.filter(Boolean);
      if (!elements.length) {
        return;
      }

      const viewportCenter = window.innerHeight / 2;
      let closest = 0;
      let minDistance = Number.POSITIVE_INFINITY;

      elements.forEach((element, index) => {
        const rect = element.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const distance = Math.abs(center - viewportCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closest = index;
        }
      });

      setActiveIndex((prev) => (prev === closest ? prev : closest));
    };

    updateActive();

    let rafId = 0;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateActive);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const textMotionClass = textVisible
    ? 'translate-x-0 opacity-100'
    : '-translate-x-8 opacity-0';

  const imageMotionClass = imageVisible ? 'opacity-100' : 'opacity-0';

  return (
    <section className="relative overflow-visible bg-gradient-to-b from-white via-emerald-50/60 to-white py-20 px-6 md:px-12">
      <div className="absolute inset-x-0 top-10 -z-10 mx-auto h-64 max-w-4xl rounded-full bg-emerald-100/40 blur-3xl" aria-hidden />
      <div className="mx-auto flex max-w-6xl flex-col gap-14 lg:grid lg:grid-cols-2 lg:items-start">
        <div
          ref={textRef}
          className={`transition-all duration-700 ease-out ${textMotionClass}`}
          style={{ transitionDelay: textVisible ? '80ms' : '0ms' }}
        >
          <span className="text-sm font-semibold uppercase tracking-[0.45em] text-emerald-600">
            Why NeuroSole
          </span>
          <h2
            className="mt-4 text-balance font-semibold leading-tight text-slate-900"
            style={{ fontSize: 'clamp(2.4rem, 4vw, 3.4rem)' }}
          >
            🛑 The Problem.
          </h2>
          <p
            className="mt-5 text-base text-slate-600 md:text-lg"
            style={{ fontSize: 'clamp(1.06rem, 1.4vw, 1.24rem)' }}
          >
            The insoles industry is moving fast, but the patient journey still lags behind. Here are the gaps we are
            closing first.
          </p>

          <div className="mt-14 flex flex-col gap-[70vh] pb-[70vh]">
            {insights.map((card, index) => (
              <article
                key={card.title}
                ref={(element) => {
                  insightRefs.current[index] = element ?? undefined;
                }}
                className={`relative pl-10 transition-all duration-600 ease-out ${
                  activeIndex === index
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-12 opacity-30'
                }`}
                style={{ transitionDelay: textVisible ? `${220 + index * 140}ms` : '0ms' }}
              >
                <div
                  className={`absolute left-0 top-2 h-3 w-3 rounded-full transition-all duration-500 ${
                    activeIndex === index
                      ? 'bg-gradient-to-br from-emerald-500 via-emerald-400 to-lime-300 shadow-[0_0_0_6px_rgba(16,185,129,0.18)]'
                      : 'bg-emerald-300/70 shadow-none'
                  }`}
                  aria-hidden
                />
                {index < insights.length - 1 && (
                  <div
                    className="absolute left-1 top-6 h-[calc(70vh-1.2rem)] w-px rounded-full"
                    style={{
                      background:
                        'linear-gradient(to bottom, rgba(16,185,129,0.35), rgba(16,185,129,0.08))',
                      opacity: activeIndex === index ? 0.4 : 0.12,
                    }}
                    aria-hidden
                  />
                )}
                <h3
                  className={`text-lg font-semibold md:text-xl transition-colors duration-500 ${
                    activeIndex === index ? 'text-slate-900' : 'text-slate-500/75'
                  }`}
                >
                  {card.title}
                </h3>
                <p
                  className={`mt-3 text-sm md:text-base transition-colors duration-500 ${
                    activeIndex === index ? 'text-slate-600' : 'text-slate-400/60'
                  }`}
                  style={{ maxWidth: '34rem' }}
                >
                  {card.body}
                </p>
              </article>
            ))}
            <div aria-hidden className="h-[40vh]" />
          </div>
        </div>

        <div
          ref={imageRef}
          className={`relative flex w-full justify-center transition-opacity duration-700 ease-out lg:sticky lg:top-[6.5rem] lg:h-[calc(100vh-8rem)] lg:justify-end ${imageMotionClass}`}
          style={{ transitionDelay: imageVisible ? '180ms' : '0ms' }}
        >
          <div className="relative w-full max-w-sm rounded-[3rem] border border-emerald-100/80 bg-white shadow-[0_30px_90px_rgba(16,185,129,0.2)] md:max-w-md lg:flex lg:h-full lg:items-center">
            <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-emerald-100/30 via-white to-emerald-50/20" aria-hidden />
            <div className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-[2.6rem] border border-emerald-100/80 bg-white shadow-inner">
              {insights.map((card, index) => (
                <Image
                  key={card.title}
                  src={card.image}
                  alt={card.imageAlt}
                  fill
                  sizes="(max-width: 768px) 80vw, (max-width: 1280px) 420px, 460px"
                  className="h-full w-full object-cover transition-opacity duration-700 ease-out"
                  style={{ opacity: activeIndex === index ? 1 : 0 }}
                  priority={index === 0}
                />
              ))}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/0 via-white/25 to-emerald-100/30 mix-blend-screen" aria-hidden />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
