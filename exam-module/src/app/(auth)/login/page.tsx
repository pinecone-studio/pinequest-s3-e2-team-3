"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import styles from "./Login.module.css";

export default function Login() {
  const [teacherCode, setTeacherCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* Subtle card tilt on mouse move */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const { left, top, width, height } = card.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    card.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current)
      cardRef.current.style.transform =
        "perspective(900px) rotateY(0deg) rotateX(0deg)";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!teacherCode.trim() || !password.trim()) {
      setError("Бүх талбарыг бөглөнө үү.");
      return;
    }
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      const testUser = {
        code: "teacher123",
        password: "password123",
      };
      if (
        teacherCode.trim() !== testUser.code ||
        password !== testUser.password
      ) {
        setError(`Нэвтрэх нэр эсвэл нууц үг буруу. (Тест: ${testUser.code})`);
        return;
      }
      router.push("/exam");
    } catch {
      setError("Нэвтрэх үед алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.root}>
      {/* Animated background orbs */}
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.orb3} />

      {/* Grid overlay */}
      <div className={styles.grid} />

      {/* Floating particles */}
      {mounted && (
        <div className={styles.particles}>
          {Array.from({ length: 18 }).map((_, i) => (
            <span
              key={i}
              className={styles.particle}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${6 + Math.random() * 6}s`,
                width: `${2 + Math.random() * 3}px`,
                height: `${2 + Math.random() * 3}px`,
              }}
            />
          ))}
        </div>
      )}

      {/* Glass card */}
      <div
        ref={cardRef}
        className={`${styles.card} ${mounted ? styles.cardVisible : ""}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Top shine line */}
        <div className={styles.shineLine} />

        {/* Logo area */}
        <div className={styles.logoArea}>
          <div className={styles.logoMark}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <polygon
                points="18,2 34,10 34,26 18,34 2,26 2,10"
                fill="none"
                stroke="#FFC000"
                strokeWidth="1.5"
              />
              <polygon
                points="18,8 28,13 28,23 18,28 8,23 8,13"
                fill="none"
                stroke="#FFC000"
                strokeWidth="0.8"
                opacity="0.5"
              />
              <circle cx="18" cy="18" r="4" fill="#FFC000" />
            </svg>
          </div>
          <div>
            <h1 className={styles.title}>SURAGCHIIN</h1>
            <p className={styles.subtitle}>WEB PORTAL</p>
          </div>
        </div>

        {/* Decorative divider */}
        <div className={styles.dividerRow}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerDot} />
          <span className={styles.dividerLine} />
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className={styles.form}>
          {/* Code input */}
          <div className={styles.fieldWrap}>
            <label className={styles.label}>Багшийн код</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>
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
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                  <line x1="12" y1="12" x2="12" y2="16" />
                  <line x1="10" y1="14" x2="14" y2="14" />
                </svg>
              </span>
              <Input
                type="text"
                placeholder="teacher123"
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
              <span className={styles.inputIcon}>
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
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
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
            <span className={styles.submitBtnBg} />
            {loading ? (
              <>
                <Loader2 className={styles.spinner} />
                Түр хүлээнэ үү...
              </>
            ) : (
              <>
                Нэвтрэх
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className={styles.footer}>
          © 2025 Suragchiin Web Portal · Бүх эрх хуулиар хамгаалагдсан
        </p>
      </div>
    </div>
  );
}
