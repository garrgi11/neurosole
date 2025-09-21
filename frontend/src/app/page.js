'use client';

import Image from "next/image";
import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import AnimatedCurvyLine from "@/components/animated-curvy-line";
import NeuroSoleProblemSection from "@/components/neurosole-problem-section";
import { Button } from "@/components/ui/button";

const BASE_CARD_SHADOW = "0 30px 60px rgba(16,185,129,0.28)";

export default function Home() {
  const slides = useMemo(
    () => [
      {
        id: "global-overview",
        image: "/images/main.avif",
        heading: "Soles, Solved Fast",
        description:
          "Every day without proper insoles risks discomfort and injury. NeuroSole uses advanced 3D printing to deliver precision-fit insoles without the wait—reducing waste and creating a data-driven shoe profile for the future of footwear manufacturing.",
        ctaLabel: "Build Your Fit Profile",
      },
      {
        id: "precision-personalisation",
        image: "/images/68911fe0c0c9d5b007515cdc_title_image_A1_framed.avif",
        heading: "Comfort. Custom. Clean.",
        description:
          "NeuroSole tackles three pain points at once: long orthopedic wait times, unsustainable insole waste, and inconsistent shoe fit. Our 3D-printed solution ensures your comfort today while paving the way for greener, smarter footwear tomorrow.",
        ctaLabel: "Make Your Pair",
      },
      //{
     //   id: "scale-business",
       // image: "/images/main.avif",
     //   heading: "Scale Your Orthotic Business",
     //   description:
      //    "Automate measurements, approvals, and fulfilment from one dashboard while patients //enjoy frictionless comfort.",
       // ctaLabel: "Explore the NeuroSole platform",
      //},
    ],
    []
  );

  const navLinks = useMemo(
    () => [
      { label: "Home", href: "#top" },
      { label: "About", href: "#advantages" },
      { label: "Testimonials", href: "#" },
      { label: "Team", href: "/team" },
    ],
    []
  );

  const advantages = useMemo(
    () => [
      {
        title: "Adaptive Fit Intelligence",
        description:
          "Machine learning analyses gait and pressure data to auto-adjust support profiles in near-real time.",
        icon: "🧠",
        background: "linear-gradient(135deg, rgba(236,253,245,0.96), rgba(167,243,208,0.9))",
        textColor: "#064e3b",
        bodyColor: "rgba(6, 78, 59, 0.7)",
        minHeight: "clamp(160px, 18vw, 220px)",
        entryOffset: { x: "-14px", y: "-16px" },
        grid: {
          lgColumn: "2 / span 5",
          lgRow: "1 / span 2",
        },
        zIndex: 6,
      },
      {
        title: "Cloud-Tuned Manufacturing",
        description:
          "Distributed print centres receive clean, validated build specs instantly, cutting lead times by 60%.",
        icon: "⚙️",
        background: "linear-gradient(135deg, rgba(239,246,255,0.96), rgba(191,219,254,0.9))",
        textColor: "#0f172a",
        bodyColor: "rgba(15, 23, 42, 0.72)",
        minHeight: "clamp(200px, 22vw, 280px)",
        entryOffset: { x: "-12px", y: "36px" },
        grid: {
          lgColumn: "2 / span 5",
          lgRow: "3 / span 2",
        },
        zIndex: 5,
      },
      {
        title: "Clinician Co-Pilot",
        description:
          "A shared dashboard flags healing risks, tracks compliance, and keeps practitioners in sync with patients.",
        icon: "🩺",
        background: "linear-gradient(135deg, rgba(237,233,254,0.96), rgba(196,181,253,0.9))",
        textColor: "#312e81",
        bodyColor: "rgba(49, 46, 129, 0.72)",
        minHeight: "clamp(200px, 22vw, 280px)",
        entryOffset: { x: "12px", y: "-34px" },
        grid: {
          lgColumn: "7 / span 5",
          lgRow: "1 / span 2",
        },
        zIndex: 5,
      },
      {
        title: "Sustainable Supply Chain",
        description:
          "Modular foam lattices reduce material waste while automated recycling keeps inserts in circulation longer.",
        icon: "🌿",
        background: "linear-gradient(135deg, rgba(240,253,250,0.96), rgba(134,239,172,0.9))",
        textColor: "#065f46",
        bodyColor: "rgba(6, 95, 70, 0.72)",
        minHeight: "clamp(160px, 18vw, 220px)",
        entryOffset: { x: "12px", y: "30px" },
        grid: {
          lgColumn: "7 / span 5",
          lgRow: "3 / span 2",
        },
        zIndex: 6,
      },
    ],
    []
  );

  const totalSlides = slides.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentSlide = slides[currentIndex];
  const problemSectionRef = useRef(null);
  const brandSectionRef = useRef(null);
  const advantagesSectionRef = useRef(null);
  const navContainerRef = useRef(null);
  const [isProblemVisible, setIsProblemVisible] = useState(false);
  const [brandScrollProgress, setBrandScrollProgress] = useState(0);
  const [isAdvantagesVisible, setIsAdvantagesVisible] = useState(false);
  const [navHighlight, setNavHighlight] = useState({
    x: 0,
    width: 0,
    opacity: 0,
  });
  const problemPoints = useMemo(
    () => [
      {
        title: "Delayed Access to Care",
        body:
          "Orthopedic appointments for custom insoles often take 15 days to 1+ month, leaving people waiting in discomfort.",
      },
      {
        title: "♻ Waste & Cost",
        body:
          "Traditional insoles create e-waste and drain money with replacements that don’t last. Frequent purchases harm the planet, burden budgets, and highlight the need for smarter, sustainable footwear solutions worldwide. ",
      },
      {
        title: "📊No Shoe Profiles",
        body:
          "Lack of universal shoe profiles keeps brands from building perfectly fitted shoes—insoles shouldn’t be permanent fixes. Data-driven profiles would revolutionize footwear design, ensuring precision comfort and eliminating unnecessary insoles entirely.",
      },
    ],
    []
  );
  const [photoStyle, setPhotoStyle] = useState({
    transform: "perspective(1200px) translate3d(0,0,0) scale(1)",
    boxShadow: BASE_CARD_SHADOW,
  });

  const brandNameStyle = useMemo(() => {
    const scale = 0.55 + brandScrollProgress * 0.65; // 0.55 -> 1.2
    const letterSpacing = Math.max(0.12, 0.85 - brandScrollProgress * 0.55);
    const opacity = Math.min(1, 0.25 + brandScrollProgress * 0.75);
    const fontSizeVw = 4.8 + brandScrollProgress * 8; // vw basis 4.8 -> 12.8
    return {
      transform: `scale(${scale.toFixed(3)})`,
      letterSpacing: `${letterSpacing.toFixed(3)}em`,
      opacity,
      fontSize: `clamp(2.8rem, ${fontSizeVw.toFixed(2)}vw, 13rem)`,
      transformOrigin: "center",
      whiteSpace: "nowrap",
      lineHeight: 1,
      maxWidth: "92vw",
      margin: "0 auto",
    };
  }, [brandScrollProgress]);

  const brandGlowStyle = useMemo(() => {
    const scale = 0.8 + brandScrollProgress * 0.35;
    const opacity = 0.25 + brandScrollProgress * 0.5;
    return {
      transform: `scale(${scale.toFixed(3)})`,
      opacity,
    };
  }, [brandScrollProgress]);
  const updateNavHighlight = useCallback((element) => {
    const container = navContainerRef.current;
    if (!container || !element) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const itemRect = element.getBoundingClientRect();

    setNavHighlight({
      x: itemRect.left - containerRect.left,
      width: itemRect.width,
      opacity: 1,
    });
  }, []);

  const handleNavItemEnter = useCallback(
    (event) => {
      updateNavHighlight(event.currentTarget);
    },
    [updateNavHighlight]
  );

  const handleNavLeave = useCallback(() => {
    setNavHighlight((prev) => ({ ...prev, opacity: 0 }));
  }, []);

  const goToSlide = useCallback(
    (updater) => {
      setCurrentIndex((prevIndex) => {
        const nextIndex =
          typeof updater === "function" ? updater(prevIndex) : updater;
        return ((nextIndex % totalSlides) + totalSlides) % totalSlides;
      });
    },
    [totalSlides]
  );

  const handleNext = useCallback(() => {
    goToSlide((prev) => prev + 1);
  }, [goToSlide]);

  const handlePrevious = useCallback(() => {
    goToSlide((prev) => prev - 1);
  }, [goToSlide]);

  // Manual navigation only (no auto-advance)

  useEffect(() => {
    const node = problemSectionRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          setIsProblemVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const node = advantagesSectionRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          setIsAdvantagesVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateProgress = () => {
      const section = brandSectionRef.current;
      if (!section) {
        return;
      }

      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const sectionHeight = rect.height || 1;
      const start = viewportHeight;
      const end = -sectionHeight;
      const rawProgress = (start - rect.top) / (start - end || 1);
      const clampedProgress = Math.min(Math.max(rawProgress, 0), 1);

      setBrandScrollProgress((prev) =>
        Math.abs(prev - clampedProgress) < 0.01 ? prev : clampedProgress
      );
    };

    updateProgress();

    const scrollListenerOptions = { passive: true };
    window.addEventListener("scroll", updateProgress, scrollListenerOptions);
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress, scrollListenerOptions);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  const handlePhotoPointerMove = useCallback((event) => {
    if (event.pointerType === "touch") {
      return;
    }

    const card = event.currentTarget.getBoundingClientRect();
    const xRatio = (event.clientX - card.left) / card.width;
    const yRatio = (event.clientY - card.top) / card.height;

    const rotateX = (0.5 - yRatio) * 10;
    const rotateY = (xRatio - 0.5) * 14;
    const translateX = (xRatio - 0.5) * 32;
    const translateY = (yRatio - 0.5) * 28;
    const depthBoost =
      26 +
      Math.max(0, xRatio - 0.65) * 55 +
      Math.max(0, 0.35 - yRatio) * 55;

    const glow = 0.35 + Math.max(0, xRatio - 0.55) * 0.65;

    setPhotoStyle({
      transform: `perspective(1200px) translate3d(${translateX.toFixed(
        1
      )}px, ${translateY.toFixed(1)}px, ${depthBoost.toFixed(1)}px) rotateX(${rotateX.toFixed(
        2
      )}deg) rotateY(${rotateY.toFixed(2)}deg) scale(1.04)`,
      boxShadow: `0 28px 60px rgba(16,185,129,0.35), 0 12px 45px rgba(74,222,128,${glow.toFixed(
        2
      )})`,
    });
  }, []);

  const handlePhotoPointerLeave = useCallback(() => {
    setPhotoStyle({
      transform: "perspective(1200px) translate3d(0,0,0) scale(1)",
      boxShadow: BASE_CARD_SHADOW,
    });
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white via-emerald-50 to-white text-slate-900">
      <section id="home" className="relative min-h-screen overflow-hidden pt-32 md:pt-36">
        {/* Background images */}
        <div className="absolute inset-0">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={slide.image}
                alt={slide.heading ?? "NeuroSole"}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-emerald-100/65 to-white/80" />
        </div>

        {/* Header */}
        <header className="fixed inset-x-0 top-0 z-40 bg-white shadow-sm backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 text-emerald-900 md:px-10">
            <div className="flex items-center space-x-3">
              <Image
                src="/images/gemi2.2.jpeg"
                alt="NeuroSole showcase"
                width={96}
                height={96}
                className="h-20 w-20 object-contain md:h-24 md:w-24"
                priority
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

            <div className="hidden items-center gap-3 ml-auto md:flex">
              <nav
                ref={navContainerRef}
                onMouseLeave={handleNavLeave}
                className="relative flex items-center gap-1 rounded-full border border-emerald-100/60 bg-white/80 px-2 py-1 text-sm shadow-[0_12px_28px_rgba(15,118,72,0.14)] backdrop-blur transition-colors duration-200 hover:border-slate-200 hover:bg-slate-100"
              >
                <div
                  className="nav-hover-highlight"
                  style={{
                    opacity: navHighlight.opacity,
                    transform: `translateX(${navHighlight.x}px) translateY(-50%)`,
                    width: navHighlight.width ? `${navHighlight.width}px` : 0,
                  }}
                />
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onMouseEnter={handleNavItemEnter}
                    onFocus={handleNavItemEnter}
                    className="nav-font-morph group relative mx-1 rounded-full px-3 py-2 text-[0.95rem] font-medium text-emerald-900/80 transition-colors hover:text-emerald-700 focus-visible:text-emerald-700"
                  >
                    <span className="relative z-10 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden />
                      {link.label}
                    </span>
                  </a>
                ))}
              </nav>

              <Button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-300 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(16,185,129,0.35)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(16,185,129,0.38)]">
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
              </Button>
            </div>

            <button
              type="button"
              className="text-emerald-900 md:hidden"
              aria-label="Open navigation menu"
            >
              <svg
                className="h-7 w-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 flex min-h-[calc(100vh-140px)] items-center justify-center px-6 pb-16 pt-6 md:px-12">
          <div
            className="relative w-full max-w-3xl text-center"
            aria-live="polite"
            aria-atomic="true"
          >
            <div
              key={currentSlide.id}
              className="flex min-h-[280px] flex-col items-center justify-center gap-8"
            >
              <h1 className="mx-auto max-w-[20ch] text-center text-5xl font-bold leading-tight text-emerald-900 md:text-6xl lg:text-7xl">
                {currentSlide.heading}
              </h1>
              <div className="flex max-w-xl flex-col items-center gap-6">
                {currentSlide.description && (
                  <p className="text-center text-lg leading-relaxed text-slate-700 md:text-xl">
                    {currentSlide.description}
                  </p>
                )}
                {currentSlide.ctaLabel && (
                  <Button className="bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-300 px-8 py-4 text-base font-medium text-white shadow-lg transition-transform duration-300 hover:scale-[1.03] md:text-lg">
                    {currentSlide.ctaLabel}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Nav buttons */}
        <button
          type="button"
          onClick={handlePrevious}
          aria-label="Previous slide"
          className="group absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-emerald-200 bg-white/80 p-1.5 text-xl text-emerald-600 transition-all duration-200 hover:scale-110 hover:bg-emerald-100 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 sm:left-10 sm:p-2 sm:text-2xl"
        >
          <span aria-hidden="true">◀</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Next slide"
          className="group absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-emerald-200 bg-white/80 p-1.5 text-xl text-emerald-600 transition-all duration-200 hover:scale-110 hover:bg-emerald-100 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 sm:right-10 sm:p-2 sm:text-2xl"
        >
          <span aria-hidden="true">▶</span>
        </button>
      </section>

      <section
        ref={problemSectionRef}
        className="relative z-10 neuro-grid-bg text-emerald-900"
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-20 md:flex-row md:items-center md:px-12 lg:gap-20">
          <div
            className={`md:w-1/2 transition-all duration-700 ease-out ${
              isProblemVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-8 translate-y-6 md:-translate-x-16"
            }`}
            style={{ transitionDelay: isProblemVisible ? "40ms" : "0ms" }}
          >
            <div className="space-y-10 text-left md:max-w-xl">
              <div className="space-y-4">
                <p className="text-sm font-medium uppercase tracking-[0.4em] text-emerald-500">
                  Why NeuroSole
                </p>
                <h2 className="text-3xl font-semibold text-emerald-900 md:text-4xl">
                   The Problem
                </h2>
                <p className="text-base text-slate-600 md:text-lg">
                  The insoles industry is moving fast, but the patient journey still lags behind. Here are the gaps we are closing first.
                </p>
              </div>

              <div className="relative grid gap-6">
                <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-px bg-gradient-to-b from-emerald-200 via-emerald-400 to-transparent md:block" />
                {problemPoints.map((point, index) => (
                  <article
                    key={point.title}
                    className="group relative overflow-hidden rounded-3xl border border-emerald-100 bg-white p-6 shadow-[0_18px_38px_rgba(15,104,69,0.15)] transition-transform duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-[0_22px_45px_rgba(15,118,72,0.18)]"
                  >
                    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-100 via-emerald-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="flex items-start gap-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-emerald-900">
                          {point.title}
                        </h3>
                        <p className="text-base leading-relaxed text-slate-600">
                          {point.body}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
          <div
            className={`flex justify-center md:w-1/2 transition-all duration-700 ease-out ${
              isProblemVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-8 translate-y-6 md:translate-x-16"
            }`}
            style={{ transitionDelay: isProblemVisible ? "120ms" : "0ms" }}
          >
            <div
              onPointerMove={handlePhotoPointerMove}
              onPointerLeave={handlePhotoPointerLeave}
              className="relative h-80 w-80 overflow-hidden rounded-[2.5rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-emerald-100/40 md:h-[26rem] md:w-[26rem]"
              style={{
                transform: photoStyle.transform,
                boxShadow: photoStyle.boxShadow,
                transition: "transform 180ms ease-out, box-shadow 220ms ease-out",
                willChange: "transform",
              }}
            >
              <Image
                src="/images/flatfeet_1512x.webp"
                alt="NeuroSole insole"
                fill
                sizes="(max-width: 768px) 320px, 416px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section
        ref={brandSectionRef}
        className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-slate-50 to-white"
        aria-labelledby="brand-evolution"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,rgba(148,163,184,0.12)0%,rgba(110,231,183,0.08)35%,rgba(255,255,255,0)_80%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white via-white/60 to-transparent" />
        <div className="pointer-events-none absolute inset-0">
          <AnimatedCurvyLine
            className="h-full w-full opacity-65 mix-blend-multiply"
            stroke="rgba(100, 116, 139, 0.55)"
            thickness={0.85}
            pointCount={48}
          />
        </div>
        <div className="relative mx-auto flex min-h-screen w-full max-w-[92vw] flex-col items-center justify-center px-6 py-24 text-center md:px-12 lg:py-32">
          <div className="relative flex w-full items-center justify-center overflow-visible">
            <div
              className="brand-glow pointer-events-none absolute -inset-x-20 -top-24 bottom-[-20%] md:-inset-x-36"
              style={brandGlowStyle}
              aria-hidden="true"
            />
            <h2
              id="brand-evolution"
              className="font-black uppercase text-[clamp(3.2rem,7vw,8.5rem)] leading-none tracking-[0.32em] drop-shadow-[0_30px_55px_rgba(16,185,129,0.25)] text-center"
              style={{
                ...brandNameStyle,
                WebkitTextStroke: "3px rgba(15, 23, 42, 0.95)",
                color: "#047857",
              }}
            >
              NeuroSole
            </h2>
          </div>
        </div>
      </section>

      <section
        id="advantages"
        ref={advantagesSectionRef}
        className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/90 to-white py-20 text-emerald-900 scroll-mt-36 sm:py-24"
        aria-labelledby="advantages-heading"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-1/4 top-[-12%] h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl" aria-hidden />
          <div className="absolute -right-1/5 bottom-[-16%] h-80 w-80 rounded-full bg-sky-200/28 blur-3xl" aria-hidden />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,118,110,0.16)_0%,rgba(255,255,255,0)_70%)]" aria-hidden />
        </div>
        <div
          className="advantage-backdrop pointer-events-none absolute hidden md:block"
          style={{
            top: 'calc(56% + 1.5cm)',
            left: '50%',
            width: 'min(84vw, 980px)',
            height: 'min(82vh, 660px)',
            borderRadius: '2.8rem',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            background: 'linear-gradient(120deg, rgba(226,232,240,0.24), rgba(203,213,225,0.18))',
            boxShadow: '0 60px 120px rgba(15, 23, 42, 0.17)',
            opacity: isAdvantagesVisible ? 1 : 0,
            transform: `translate(-50%, -50%) scale(${isAdvantagesVisible ? 1 : 0.82})`,
            transition: 'transform 640ms cubic-bezier(0.18, 0.9, 0.2, 1.05), opacity 480ms ease',
            transitionDelay: isAdvantagesVisible ? '30ms' : '0ms',
          }}
          aria-hidden
        />
        <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 md:px-10">
          <div
            className="max-w-2xl space-y-4"
            style={{
              opacity: isAdvantagesVisible ? 1 : 0,
              transform: `translateY(${isAdvantagesVisible ? '0px' : '24px'})`,
              transition: 'opacity 420ms ease, transform 420ms ease',
            }}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-emerald-500">
              Advantages
            </p>
            <h2
              id="advantages-heading"
              className="text-3xl font-semibold text-emerald-900 md:text-4xl"
            >
              NeuroSole powers comfort, insight, and sustainability in a single adaptive loop.
            </h2>
            <p className="text-base text-emerald-900/70 md:text-lg">
              Four pillars keep every wearer supported while your operations stay nimble, intelligent, and planet-friendly.
            </p>
          </div>

        <div className="advantage-stack relative w-full px-3 sm:px-6 lg:px-8" style={{ marginTop: '0' }}>
            {advantages.map((advantage, index) => {
              const delay = 220 + index * 160;
              const isActive = isAdvantagesVisible;
              return (
                <article
                  key={advantage.title}
                  className="advantage-panel group"
                  data-active={isActive}
                  tabIndex={0}
                  style={{
                    '--adv-delay': isActive ? `${delay}ms` : '0ms',
                    background: advantage.background,
                    color: advantage.textColor,
                    minHeight: advantage.minHeight,
                    zIndex: advantage.zIndex,
                  }}
                >
                  <div className="flex items-start justify-end">
                    <span
                      className="rounded-full border border-emerald-200/70 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em]"
                      style={{ color: advantage.bodyColor }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold sm:text-2xl">
                      {advantage.title}
                    </h3>
                    <p className="text-sm sm:text-base" style={{ color: advantage.bodyColor }}>
                      {advantage.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <NeuroSoleProblemSection />

    </div>
  );
}
