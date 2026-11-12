
"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import WeddingInvitationCard from "@/components/WeddingInvitationCard";

export default function ReimprimerInvitationPage() {
  const [code, setCode] = useState("");
  const [guest, setGuest] = useState(null);
  const [numberOfGuests, setNumberOfGuests] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (loading) return;

    const invitationCode = code.trim().toUpperCase();

    if (!invitationCode) {
      setErrorMessage("Veuillez saisir votre code d’invitation.");
      return;
    }

    setLoading(true);
    setGuest(null);
    setNumberOfGuests(0);
    setErrorMessage("");

    try {
      // 1. Rechercher l'invité à partir de son code
      const { data: guestData, error: guestError } = await supabase
        .from("guests")
        .select("id, name, invitation_code")
        .eq("invitation_code", invitationCode)
        .maybeSingle();

      if (guestError) {
        console.error("Erreur recherche invitation :", guestError);
        throw new Error(
          "Impossible de rechercher votre invitation pour le moment."
        );
      }

      if (!guestData) {
        setErrorMessage(
          "Code d’invitation introuvable. Vérifiez votre code et réessayez."
        );
        return;
      }

      // 2. Récupérer la réponse RSVP de cet invité
      const { data: rsvpData, error: rsvpError } = await supabase
        .from("rsvps")
        .select("attendance, number_of_guests")
        .eq("guest_id", guestData.id)
        .maybeSingle();

      if (rsvpError) {
        console.error("Erreur récupération RSVP :", rsvpError);
        throw new Error(
          "Votre invitation a été trouvée, mais ses informations ne peuvent pas être chargées."
        );
      }

      // 3. Afficher la carte personnalisée
      setGuest(guestData);

      setNumberOfGuests(
        rsvpData?.attendance === "Présent"
          ? Number(rsvpData.number_of_guests || 0)
          : 0
      );
    } catch (error) {
      console.error("Erreur réimpression invitation :", error);
      setErrorMessage(
        error?.message ||
          "Une erreur est survenue. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FFFDFC] px-4 py-10 text-[#332824]">
      <div className="mx-auto max-w-xl">
        {/* En-tête */}
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[#C66A4A]">
            Axel & Améline
          </p>

          <h1 className="mt-4 font-serif text-3xl sm:text-4xl">
            Retrouvez votre invitation
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#75665F]">
            Vous avez perdu votre carte ou souhaitez l’imprimer à nouveau ?
            Saisissez le code d’invitation qui vous a été communiqué.
          </p>
        </div>

        {/* Formulaire de recherche */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-[#E8DAD2] bg-white p-6 shadow-sm sm:p-8"
        >
          <label
            htmlFor="invitationCode"
            className="mb-2 block text-sm font-medium"
          >
            Votre code d’invitation
          </label>

          <input
            id="invitationCode"
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setErrorMessage("");
            }}
            placeholder="Ex. : AB7KQ"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            required
            maxLength={30}
            className="w-full rounded-xl border border-[#E8DAD2] bg-[#FFFDFC] px-4 py-3 text-center font-mono text-lg tracking-[0.2em] outline-none transition focus:border-[#C66A4A] focus:ring-2 focus:ring-[#C66A4A]/20"
          />

          {errorMessage && (
            <p
              role="alert"
              className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-full bg-[#C66A4A] px-5 py-3 font-medium text-white transition hover:bg-[#9E4F38] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Recherche en cours..."
              : "Retrouver mon invitation"}
          </button>
        </form>

        {/* Carte retrouvée */}
        {guest && (
          <section className="mt-8">
            <div className="mb-4 text-center">
              <p className="font-medium text-[#47734D]">
                Votre invitation a été retrouvée !
              </p>
              <p className="mt-1 text-sm text-[#75665F]">
                Vous pouvez maintenant la télécharger et l’imprimer.
              </p>
            </div>

            <WeddingInvitationCard
              guest={guest}
              numberOfGuests={numberOfGuests}
            />
          </section>
        )}

        {/* Retour au site */}
        <div className="mt-10 text-center">
          <Link
            href="/"
            className="text-sm text-[#9E4F38] underline underline-offset-4 hover:text-[#C66A4A]"
          >
            Retour au site du mariage
          </Link>
        </div>
      </div>
    </main>
  );
}
