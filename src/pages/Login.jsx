import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { auth } from "../config/firebase";
import { useAuth } from "../auth/AuthProvider";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const redirectTarget = useMemo(() => {
    const state = location.state || {};
    return {
      from: state.from || "/panel",
      fromState: state.fromState || null,
    };
  }, [location.state]);

  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const goNext = () => {
    navigate(redirectTarget.from, { replace: true, state: redirectTarget.fromState });
  };

  useEffect(() => {
    if (user) {
      // Zaten giriş yaptıysa direkt hedefe gönder.
      goNext();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (user) return null;

  const handleGoogle = async () => {
    setBusy(true);
    setError("");
    setInfo("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      goNext();
    } catch (e) {
      setError(e?.message || "Google ile giriş başarısız.");
    } finally {
      setBusy(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setInfo("");

    try {
      if (!email || !password) {
        setError("E-posta ve şifre zorunlu.");
        return;
      }

      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      goNext();
    } catch (e2) {
      setError(e2?.message || "Giriş yapılamadı.");
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    setBusy(true);
    setError("");
    setInfo("");
    try {
      if (!email) {
        setError("Şifre sıfırlamak için e-posta girin.");
        return;
      }
      await sendPasswordResetEmail(auth, email);
      setInfo("Şifre sıfırlama e-postası gönderildi.");
    } catch (e) {
      setError(e?.message || "Şifre sıfırlama başarısız.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-emerald-50/40">
      <Navigation />

      <section className="max-w-lg mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 md:p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Giriş / Kayıt</h1>
          <p className="text-sm text-gray-600 mt-2">
            Rezervasyona devam etmek ve kapora ödemek için giriş yapmanız gerekir.
          </p>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div>
          )}
          {info && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{info}</div>
          )}

          <div className="mt-5 grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={handleGoogle}
              disabled={busy}
              className="w-full px-5 py-3 rounded-2xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-60"
            >
              Google ile devam et
            </button>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-500">veya</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <form onSubmit={handleEmailAuth} className="mt-6 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">E-posta</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                placeholder="endonezyakasifi@gmail.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Şifre</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full px-5 py-3 rounded-2xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
            >
              {mode === "signup" ? "Kayıt ol" : "Giriş yap"}
            </button>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setMode((m) => (m === "login" ? "signup" : "login"))}
                className="text-xs font-semibold text-sky-700 hover:underline"
              >
                {mode === "login" ? "Hesabın yok mu? Kayıt ol" : "Hesabın var mı? Giriş yap"}
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={busy}
                className="text-xs font-semibold text-slate-600 hover:underline disabled:opacity-60"
              >
                Şifremi unuttum
              </button>
            </div>
          </form>

          <p className="mt-6 text-xs text-slate-500">
            Giriş yaparak, ilgili yasal metinleri inceleyip kabul edeceğinizi onaylamış olursunuz.
            <span className="ml-1">
              <a href="/docs/paket-tur-sozlesmesi.html" target="_blank" rel="noopener noreferrer" className="text-sky-700 hover:underline">
                Sözleşme
              </a>
              <span className="mx-1">·</span>
              <a href="/docs/iptal-iade-politikasi.html" target="_blank" rel="noopener noreferrer" className="text-sky-700 hover:underline">
                İptal/İade
              </a>
              <span className="mx-1">·</span>
              <Link to="/privacy" className="text-sky-700 hover:underline">
                Gizlilik
              </Link>
            </span>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
