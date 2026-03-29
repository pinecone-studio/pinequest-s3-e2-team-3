// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";

// /**
//  * Redirects to /login if no user is stored in localStorage.
//  * Renders children only after confirming a user exists.
//  */
// export function AuthGuard({ children }: { children: React.ReactNode }) {
//   const router = useRouter();
//   const [authed, setAuthed] = useState<boolean | null>(null);

//   useEffect(() => {
//     const raw = localStorage.getItem("user");
//     if (!raw) {
//       router.replace("/login");
//     } else {
//       setAuthed(true);
//     }
//   }, [router]);

//   // While checking, show nothing (avoid flash of unauthenticated content)
//   if (authed === null) return null;

//   return <>{children}</>;
// }
