import type { ReactNode } from "react";

type ActiveExamFullPageProps = {
  children: ReactNode;
  showSpinner?: boolean;
  footerText?: string;
};

export function ActiveExamFullPage({
  children,
  showSpinner,
  footerText,
}: ActiveExamFullPageProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-center text-white">
      {showSpinner ? (
        <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
      {footerText ? (
        <p className="mt-4 text-sm text-slate-400">{footerText}</p>
      ) : null}
    </div>
  );
}
