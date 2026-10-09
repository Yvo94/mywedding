"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error(
          "Impossible de récupérer l'utilisateur."
        );
      }

      router.replace("/admin");

    } catch (error) {
      console.error("Erreur connexion admin :", error);

      setError(
        "Adresse e-mail ou mot de passe incorrect."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF7F3] px-6">

      <div className="w-full max-w-md">

        {/* LOGO / TITRE */}
        <div className="mb-8 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F8E9E2] font-serif text-2xl text-[#C66A4A]">
            A
          </div>

          <p className="mt-6 text-xs uppercase tracking-[0.35em] text-[#C66A4A]">
            Axel & Améline
          </p>

          <h1 className="mt-3 font-serif text-4xl text-[#332824]">
            Espace administrateur
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#75665F]">
            Connectez-vous pour accéder à la gestion
            de votre mariage.
          </p>

        </div>

        {/* FORMULAIRE */}
        <form
          onSubmit={handleLogin}
          className="rounded-[2rem] border border-[#E8DAD2] bg-white p-7 shadow-sm md:p-9"
        >

          {/* EMAIL */}
          <div className="mb-5">

            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-[#332824]"
            >
              Adresse e-mail
            </label>

            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="admin@example.com"
              className="w-full rounded-xl border border-[#DED3CC] bg-[#FDFCFB] px-4 py-3.5 text-sm text-[#332824] outline-none transition placeholder:text-[#B2A8A1] focus:border-[#C66A4A] focus:ring-1 focus:ring-[#C66A4A]"
            />

          </div>

          {/* MOT DE PASSE */}
          <div className="mb-6">

            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-[#332824]"
            >
              Mot de passe
            </label>

            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="••••••••"
              className="w-full rounded-xl border border-[#DED3CC] bg-[#FDFCFB] px-4 py-3.5 text-sm text-[#332824] outline-none transition placeholder:text-[#B2A8A1] focus:border-[#C66A4A] focus:ring-1 focus:ring-[#C66A4A]"
            />

          </div>

          {/* ERREUR */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

              <p className="text-sm text-red-700">
                {error}
              </p>

            </div>
          )}

          {/* BOUTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#C66A4A] px-6 py-4 text-sm font-medium text-white shadow-lg shadow-[#C66A4A]/15 transition hover:bg-[#9E4F38] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Connexion..."
              : "Se connecter"}
          </button>

        </form>

        {/* RETOUR */}
        <div className="mt-6 text-center">

          <Link
            href="/"
            className="text-sm text-[#75665F] transition hover:text-[#C66A4A]"
          >
            ← Retour au site du mariage
          </Link>

        </div>

      </div>

    </main>
  );
}