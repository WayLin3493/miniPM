export function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]">
      <span className="absolute left-8 top-8 h-4 w-4 rotate-12 rounded bg-lemon" />
      <span className="absolute right-10 top-14 h-3 w-8 -rotate-12 rounded-full bg-sky-300" />
      <span className="absolute bottom-12 left-14 h-3 w-3 rounded-full bg-coral" />
      <span className="absolute bottom-20 right-12 h-4 w-4 rotate-45 rounded bg-leaf-300" />
    </div>
  );
}
