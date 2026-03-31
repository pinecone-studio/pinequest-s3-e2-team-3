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
        return;
      }
      // Save user info to localStorage
      localStorage.setItem("user", JSON.stringify(result.user));
      router.push("/exam");
    } catch {
      setError("Нэвтрэх үед алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.root}>
      {/* Glass card */}
      <div
        ref={cardRef}
        className={`${styles.card} ${mounted ? styles.cardVisible : ""}`}
      >
        {/* Logo area */}
        <div className={styles.logoArea}>
          <div className={styles.logoMark}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3L4 7.5V12c0 4.418 3.582 8 8 8s8-3.582 8-8V7.5L12 3z"
                fill="white"
                opacity="0.9"
              />
              <path
                d="M12 6l-5 2.8V12c0 2.76 2.24 5 5 5s5-2.24 5-5V8.8L12 6z"
                fill="#3b2fa0"
              />
              <circle cx="12" cy="12" r="2" fill="white" />
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
          © 2025 LMS 3.0 · Бүх эрх хуулиар хамгаалагдсан
        </p>
      </div>
    </div>
  );
}
