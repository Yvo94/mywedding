
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import WeddingInvitationCard from "@/components/WeddingInvitationCard";

export default function TicketPage() {
  const params = useParams();
  const router = useRouter();

  const token = params?.token;

  const [guest, setGuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) return;

    let active = true;

    async function loadTicket() {
      try {
        setLoading(true);
        setErrorMessage("");

        const { data, error } = await supabase.rpc(
          "get_public_wedding_ticket",
          {
            p_token: token,
          }
        );

        if (error) throw error;

        if (!data) {
          throw new Error("Cette invitation est introuvable ou invalide.");
        }

        if (active) {
          setGuest(data);
        }
      } catch (error) {
        console.error("Erreur chargement invitation :", error);

        if (active) {
          setErrorMessage(
            error?.message ||
              "Impossible de récupérer votre invitation."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTicket();

    return () => {
      active = false;
    };
  }, [token]);

  const rsvp = Array.isArray(guest?.rsvps)
    ? guest.rsvps[0]
    : guest?.rsvps ?? guest?.rsvp;

  const attendance = String(guest?.attendance || "")
    .trim()
    .toLowerCase();

  const companionCount =
    attendance === "présent" || attendance === "présente"
      ? Number(guest?.number_of_guests || 0)
      : 0;

  const totalGuests = 1 + companionCount;

  return (
    <main className="min-h-screen bg-[#FAF7F3] px-4 py-8 text-[#332824]">
      <header className="mx-auto mb-8 max-w-xl text-center">
        <p className="font-serif text-2xl tracking-widest">
          Axel <span className="text-[#C66A4A]">&</span> Améline
        </p>

        <p className="mt-2 text-xs uppercase tracking-[0.25em] text-[#9E4F38]">
          14 novembre 2026
        </p>
      </header>

      {loading ? (
        <div className="mx-auto max-w-md rounded-2xl border border-[#E8D8CE] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#E8D8CE] border-t-[#C66A4A]" />

          <p className="mt-4 text-sm text-[#75665F]">
            Chargement de votre invitation...
          </p>
        </div>
      ) : errorMessage ? (
        <div className="mx-auto max-w-md rounded-2xl border border-[#E8D8CE] bg-white p-8 text-center shadow-sm">
          <p className="text-3xl text-[#C66A4A]">♡</p>

          <h1 className="mt-4 font-serif text-2xl">
            Invitation indisponible
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#75665F]">
            {errorMessage}
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-[#C66A4A] px-6 py-3 text-sm text-white transition hover:bg-[#9E4F38]"
          >
            Retour au mariage
          </Link>
        </div>
      ) : guest ? (
        <section className="mx-auto max-w-md">
          <div className="mb-5 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-[#C66A4A]">
              Votre espace personnel
            </p>

            <h1 className="mt-2 font-serif text-3xl">
              Votre invitation
            </h1>

            <p className="mt-2 text-sm text-[#75665F]">
              Retrouvez votre carte et votre table.
            </p>
          </div>
          <WeddingInvitationCard
            guest={guest}
            numberOfGuests={totalGuests}
            tableName={guest.table_name}
          />

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-sm text-[#9E4F38] underline underline-offset-4"
            >
              Retour au site du mariage
            </Link>
          </div>
        </section>
      ) : null}

      <footer className="mt-12 text-center">
        <p className="font-serif text-lg">
          Avec tout notre amour
        </p>

        <p className="mt-2 text-xs text-[#928982]">
          Axel & Améline — 2026
        </p>
      </footer>
    </main>
  );
}
