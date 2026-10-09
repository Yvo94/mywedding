"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CheckInPage() {
  const params = useParams();

  const code = params?.code;

  const [guest, setGuest] = useState(null);
  const [rsvp, setRsvp] = useState(null);
  const [checkIn, setCheckIn] = useState(null);

  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (code) {
      loadInvitation();
    }
  }, [code]);

  const loadInvitation = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("guests")
        .select(`
          *,
          rsvps (
            attendance,
            number_of_guests,
            message
          ),
          check_ins (
            checked_in,
            checked_in_at
          )
        `)
        .eq("invitation_code", code)
        .single();

      if (error) {
        throw error;
      }

      setGuest(data);
      setRsvp(data.rsvps?.[0] || null);
      setCheckIn(data.check_ins?.[0] || null);

    } catch (error) {
      console.error(error);

      setGuest(null);

    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {

    if (!guest) return;

    try {

      setChecking(true);

      const { data, error } = await supabase
        .from("check_ins")
        .update({
          checked_in: true,
          checked_in_at: new Date().toISOString(),
        })
        .eq("guest_id", guest.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setCheckIn(data);

    } catch (error) {

      console.error(error);

      alert(
        "Impossible d'enregistrer l'arrivée."
      );

    } finally {

      setChecking(false);

    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF7F3]">
        <p className="text-sm text-[#75665F]">
          Vérification de l'invitation...
        </p>
      </main>
    );
  }

  if (!guest) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF7F3] px-6">
        <div className="w-full max-w-md rounded-3xl bg-white p-10 text-center shadow-lg">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-2xl">
            ✕
          </div>

          <h1 className="mt-6 font-serif text-3xl text-[#332824]">
            Invitation invalide
          </h1>

          <p className="mt-4 text-sm leading-7 text-[#75665F]">
            Ce QR Code ne correspond à aucune invitation.
          </p>

        </div>
      </main>
    );
  }

  const companions =
    Number(rsvp?.number_of_guests || 0);

  const totalPeople =
    rsvp?.attendance === "Présent"
      ? companions + 1
      : 0;

  return (
    <main className="min-h-screen bg-[#FAF7F3] px-5 py-10">

      <div className="mx-auto max-w-md">

        <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl">

          <div className="bg-[#C66A4A] px-7 py-10 text-center text-white">

            <p className="text-xs uppercase tracking-[0.35em] text-[#F8E9E2]">
              Axel & Améline
            </p>

            <h1 className="mt-4 font-serif text-4xl">
              Bienvenue
            </h1>

            <p className="mt-3 text-sm text-[#F8E9E2]">
              14 novembre 2026
            </p>

          </div>

          <div className="px-7 py-9 text-center">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#F8E9E2] font-serif text-3xl text-[#C66A4A]">
              {guest.name?.charAt(0)?.toUpperCase() || "?"}
            </div>

            <h2 className="mt-5 font-serif text-3xl text-[#332824]">
              {guest.name}
            </h2>

            <p className="mt-2 text-sm text-[#75665F]">
              Code : {guest.invitation_code}
            </p>

            {rsvp?.attendance === "Présent" ? (

              <>

                <div className="mt-8 rounded-2xl bg-[#F8E9E2] p-5">

                  <p className="text-xs uppercase tracking-[0.2em] text-[#928982]">
                    Invitation confirmée
                  </p>

                  <p className="mt-3 text-3xl font-semibold text-[#9E4F38]">
                    {totalPeople}
                  </p>

                  <p className="text-sm text-[#75665F]">
                    {totalPeople > 1
                      ? "personnes"
                      : "personne"}
                  </p>

                </div>

                {checkIn?.checked_in ? (

                  <div className="mt-6 rounded-2xl bg-green-50 p-5">

                    <p className="text-lg font-semibold text-green-700">
                      ✓ Déjà enregistré
                    </p>

                    <p className="mt-2 text-xs text-green-600">
                      Cette invitation a déjà été utilisée
                      pour l'entrée.
                    </p>

                  </div>

                ) : (

                  <button
                    onClick={handleCheckIn}
                    disabled={checking}
                    className="mt-6 w-full rounded-full bg-[#C66A4A] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#9E4F38] disabled:opacity-50"
                  >
                    {checking
                      ? "Enregistrement..."
                      : "✓ Valider l'arrivée"}
                  </button>

                )}

              </>

            ) : (

              <div className="mt-8 rounded-2xl bg-[#F1E5DE] p-5">

                <p className="font-medium text-[#9E4F38]">
                  RSVP non confirmé
                </p>

                <p className="mt-2 text-sm text-[#75665F]">
                  Cette invitation ne possède pas de
                  confirmation de présence.
                </p>

              </div>

            )}

          </div>

        </div>

      </div>

    </main>
  );
}