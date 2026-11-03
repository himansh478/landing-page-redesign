// Shared class strings for the "editor's desk" system, so forms and buttons
// on every page read the same. Mirrors the inputs in GlobalAuthGate and the
// buttons in HeroSection / CourseBuyBox.

const fieldBase =
  'w-full bg-ivory border border-ink/15 rounded-md px-4 text-ink placeholder:text-ink/45 !text-[0.95rem] focus:outline-none focus-visible:outline-2 focus-visible:outline-editorial focus:border-editorial/50 transition-colors disabled:opacity-60';

export const fieldClass = `${fieldBase} h-12`;
export const textareaClass = `${fieldBase} py-3 resize-none`;
export const selectClass = `${fieldBase} h-12 pr-10 cursor-pointer`;

// Small-caps slate label above a field
export const labelClass = 'slate text-ink/60 flex items-center gap-1.5 mb-2';

// Form section header: a numbered slate with a rule
export const fieldsetLegendClass = 'slate text-editorial flex items-center gap-2 pb-3 mb-5 border-b border-ink/15 w-full';

export const btnBase =
  'group inline-flex items-center justify-center gap-2.5 h-14 px-7 rounded-md font-semibold transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed';

export const btnPrimary = `${btnBase} bg-editorial text-ivory hover:bg-ink`;
export const btnCoral = `${btnBase} bg-coral text-ink hover:bg-ink hover:text-ivory`;
export const btnGhost = `${btnBase} border border-ink/25 text-ink hover:border-ink hover:bg-ink/5`;
// For dark (.on-ink) sections
export const btnCoralOnInk = `${btnBase} bg-coral text-ink hover:bg-ivory`;
export const btnGhostOnInk = `${btnBase} border border-ivory/25 text-ivory hover:border-ivory hover:bg-ivory/5`;

// Arrow that nudges right on hover, for use inside the buttons above
export const btnArrow = 'w-5 h-5 transition-transform duration-500 ease-reveal group-hover:translate-x-1';

// Small chip on top of imagery (as on the hero monitor)
export const chipClass =
  'inline-flex items-center gap-1.5 bg-ink/80 text-ivory slate !text-[10px] !tracking-[0.14em] px-2 py-1 rounded-[3px] backdrop-blur-sm';

// Tag on paper
export const tagClass = 'slate !text-[10px] !tracking-[0.12em] px-2 py-1 rounded-[3px] border border-ink/20 text-ink/65';
