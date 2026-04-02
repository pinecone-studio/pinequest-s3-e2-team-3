"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLoginMutation } from "@/gql/graphql";
import styles from "./Login.module.css";

export default function Login() {
  const [teacherCode, setTeacherCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loginState, setLoginState] = useState<"idle" | "loading" | "success">(
    "idle",
  );
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [loginMutation] = useLoginMutation();

  useEffect(() => {
    setMounted(true);
  }, []);

  /* Subtle card tilt on mouse move — kept for future use */
  // const handleMouseMove = ...
  // const handleMouseLeave = ...

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!teacherCode.trim() || !password.trim()) {
      setError("Бүх талбарыг бөглөнө үү.");
      return;
    }
    setLoading(true);
    setLoginState("loading");
    try {
      const { data } = await loginMutation({
        variables: {
          username: teacherCode.trim(),
          password: password,
        },
      });
      const result = data?.login;
      if (!result?.success || !result.user) {
        setError(result?.message ?? "Нэвтрэх нэр эсвэл нууц үг буруу.");
        setLoginState("idle");
        return;
      }
      // Save user info to localStorage
      localStorage.setItem("user", JSON.stringify(result.user));
      setLoginState("success");
      // Navigate after showing success screen briefly
      setTimeout(() => {
        router.push("/exam");
      }, 1800);
    } catch {
      setError("Нэвтрэх үед алдаа гарлаа. Дахин оролдоно уу.");
      setLoginState("idle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.root}>
      {/* ── Loading overlay ── */}
      {loginState === "loading" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-3xl shadow-2xl w-85 h-55 flex flex-col items-center justify-center gap-5 relative">
            <button
              onClick={() => setLoginState("idle")}
              className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-xl leading-none"
            >
              ×
            </button>
            {/* Spinning starburst badge */}
            <svg
              className="animate-spin"
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="none"
              style={{ animationDuration: "1.2s" }}
            >
              <path
                d="M32 4
                  L36.5 14.5 L47 10 L44 21 L55 24 L47 31.5
                  L52 42 L41 41 L38 52 L32 44
                  L26 52 L23 41 L12 42 L17 31.5
                  L9 24 L20 21 L17 10 L27.5 14.5 Z"
                fill="#6B4EBA"
              />
            </svg>
          </div>
        </div>
      )}

      {/* ── Success overlay ── */}
      {loginState === "success" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl px-12 py-10 flex flex-col items-center gap-3 relative">
            <button
              onClick={() => setLoginState("idle")}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              ×
            </button>
            {/* Ghost mascot illustration */}
            <div className="relative mb-1">
              <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
                {/* cloud left */}
                <ellipse
                  cx="18"
                  cy="62"
                  rx="10"
                  ry="6"
                  fill="#e8d5f5"
                  opacity="0.7"
                />
                {/* cloud right */}
                <ellipse
                  cx="72"
                  cy="68"
                  rx="12"
                  ry="7"
                  fill="#e8d5f5"
                  opacity="0.7"
                />
                {/* star */}
                <polygon
                  points="22,18 23.5,22 27.5,22 24.5,24.5 25.8,28.5 22,26 18.2,28.5 19.5,24.5 16.5,22 20.5,22"
                  fill="#f5c842"
                  opacity="0.9"
                />
                {/* green ball */}
                <circle cx="68" cy="42" r="7" fill="#5cc97a" />
                {/* ghost body */}
                <ellipse cx="45" cy="48" rx="18" ry="20" fill="#7c5cbf" />
                <rect x="27" y="48" width="36" height="18" fill="#7c5cbf" />
                {/* ghost bottom wavy */}
                <path
                  d="M27 66 Q31.5 72 36 66 Q40.5 72 45 66 Q49.5 72 54 66 Q58.5 72 63 66 L63 70 Q58.5 76 54 70 Q49.5 76 45 70 Q40.5 76 36 70 Q31.5 76 27 70 Z"
                  fill="#7c5cbf"
                />
                {/* eyes */}
                <circle cx="39" cy="46" r="3.5" fill="white" />
                <circle cx="51" cy="46" r="3.5" fill="white" />
                <circle cx="40" cy="47" r="1.5" fill="#3b2060" />
                <circle cx="52" cy="47" r="1.5" fill="#3b2060" />
              </svg>
            </div>
            <p className="text-[15px] font-semibold text-gray-800">
              Амжилттай хадгалагдлаа
            </p>
          </div>
        </div>
      )}

      {/* Glass card */}
      <div
        ref={cardRef}
        className={`${styles.card} ${mounted ? styles.cardVisible : ""}`}
      >
        {/* Logo area */}
        <div className={styles.logoArea}>
          <div className={styles.logoMark}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L2 8l10 5 10-5-10-5z" fill="white" />
              <path
                d="M2 8v6c0 0 3.5 3 10 3s10-3 10-3V8"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <line
                x1="22"
                y1="8"
                x2="22"
                y2="14"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h1 className={styles.title}>LMS 3.0</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className={styles.form}>
          {/* Code input */}
          <div className={styles.fieldWrap}>
            <label className={styles.label}>Багшийн код</label>
            <div className={styles.inputWrap}>
              <Input
                type="text"
                placeholder="B231940067"
                value={teacherCode}
                onChange={(e) => setTeacherCode(e.target.value)}
                disabled={loading}
                className={styles.input}
              />
            </div>
          </div>

          {/* Password input */}
          <div className={styles.fieldWrap}>
            <label className={styles.label}>Нууц үг</label>
            <div className={styles.inputWrap}>
              <Input
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className={styles.input}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className={styles.eyeBtn}
                tabIndex={-1}
              >
                {showPass ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className={styles.errorBox}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? (
              <>
                <Loader2 className={styles.spinner} />
                Түр хүлээнэ үү...
              </>
            ) : (
              "Нэвтрэх"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className={styles.footer}>
          © 2025 LMS 3.0 · Бух эрх хуулиар хамгаалагдсан
        </p>
      </div>
    </div>
  );
}
