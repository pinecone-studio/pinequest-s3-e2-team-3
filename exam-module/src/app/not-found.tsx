export const runtime = "edge";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-6xl font-bold text-slate-800">404</h1>
      <p className="text-lg text-slate-500">Хуудас олдсонгүй</p>
      <Link
        href="/exam"
        className="mt-4 rounded-lg bg-[#21005D] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#21005D]/90"
      >
        Нүүр хуудас руу буцах
      </Link>
    </div>
  );
}
