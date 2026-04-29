export default function SectionDivider() {
  return (
    <div className="relative my-12 flex items-center justify-center" aria-hidden>
      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-purple-core/50 to-transparent" />
      <svg
        viewBox="0 0 64 24"
        className="relative w-16 lightning-bolt text-lightning"
        fill="currentColor"
      >
        <path d="M28 0 L10 14 L24 14 L20 24 L40 8 L26 8 L34 0 Z" />
      </svg>
    </div>
  );
}
