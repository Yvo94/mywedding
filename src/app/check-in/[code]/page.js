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
  const [notice, setNotice] = useState(null);

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

      if (error) throw error;

      setGuest(data);
      setRsvp(
        Array.isArray(data.rsvps)
          ? data.rsvps[0] || null
          : data.rsvps || null
      );
      setCheckIn(
        Array.isArray(data.check_ins)
          ? data.check_ins[0] || null
          : data.check_ins || null
      );
    } catch (error) {
      console.error("Erreur chargement invitation :", error);
      setGuest(null);
      setRsvp(null);
      setCheckIn(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!guest || checking) return;

    setChecking(true);
    setNotice(null);

    try {
      // 1. Vérifier directement l'état actuel en base.
      const { data: existing, error: readError } = await supabase
        .from("check_ins")
        .select("id, checked_in, checked_in_at")
        .eq("guest_id", guest.id)
        .maybeSingle();

      if (readError) throw readError;

      // 2. Ne jamais enregistrer une seconde arrivée.
      if (existing?.checked_in) {
        setCheckIn(existing);
        setNotice({
          type: "info",
          text: "Cette arrivée a déjà été enregistrée.",
        });
        return;
      }

      const checkedInAt = new Date().toISOString();
      let savedCheckIn;

      if (existing) {
        // 3. Une ligne existe : mise à jour conditionnelle.
        const { data, error } = await supabase
          .from("check_ins")
          .update({
            checked_in: true,
            checked_in_at: checkedInAt,
          })
          .eq("id", existing.id)
          .eq("checked_in", false)
          .select("id, checked_in, checked_in_at")
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          // Un autre appareil a peut-être validé l'arrivée.
          const { data: current, error: reloadError } =
            await supabase
              .from("check_ins")
              .select("id, checked_in, checked_in_at")
              .eq("guest_id", guest.id)
              .maybeSingle();

          if (reloadError) throw reloadError;

          setCheckIn(current);

          setNotice({
            type: "info",
            text: current?.checked_in
              ? "Cette arrivée a déjà été enregistrée."
              : "La validation n'a pas abouti. Réessaie.",
          });
          return;
        }

        savedCheckIn = data;
      } else {
        // 4. Aucune ligne : création du premier check-in.
        const { data, error } = await supabase
          .from("check_ins")
          .insert({
            guest_id: guest.id,
            checked_in: true,
            checked_in_at: checkedInAt,
          })
          .select("id, checked_in, checked_in_at")
          .single();

        if (error) {
          // Un autre appareil a pu créer la ligne entre-temps.
          if (error.code === "23505") {
            await loadInvitation();

            setNotice({
              type: "info",
              text: "Cette invitation a déjà été traitée. Vérifie son statut.",
            });
            return;
          }

          throw error;
        }

        savedCheckIn = data;
      }

      // 5. Actualiser l'interface après confirmation de Supabase.
      setCheckIn(savedCheckIn);

      setNotice({
        type: "success",
        text: "Arrivée enregistrée avec succès !",
      });
    } catch (error) {
      console.error("Erreur check-in :", error);

      setNotice({
        type: "error",
        text: "Impossible d'enregistrer l'arrivée. Vérifie la connexion et les autorisations Supabase.",
      });
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

  const companions = Number(rsvp?.number_of_guests || 0);

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
              Axel & Ameline
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
                    {totalPeople > 1 ? "personnes" : "personne"}
                  </p>
                </div>

                {checkIn?.checked_in ? (
                  <div className="mt-6 rounded-2xl bg-green-50 p-5">
                    <p className="text-lg font-semibold text-green-700">
                      ✓ Arrivée enregistrée
                    </p>

                    <p className="mt-2 text-xs text-green-600">
                      Cette invitation a déjà été validée.
                    </p>

                    {checkIn.checked_in_at && (
                      <p className="mt-2 text-sm text-green-700">
                        Le{" "}
                        {new Date(
                          checkIn.checked_in_at
                        ).toLocaleString("fr-FR", {
                          dateStyle: "short",
                          timeStyle: "short",
                          timeZone: "Africa/Abidjan",
                        })}
                      </p>
                    )}
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

                {notice && (
                  <div
                    role="status"
                    aria-live="polite"
                    className={`mt-4 rounded-xl p-4 text-sm ${
                      notice.type === "success"
                        ? "bg-green-50 text-green-700"
                        : notice.type === "error"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-800"
                    }`}
                  >
                    {notice.text}
                  </div>
                )}
              </>
            ) : (
              <div className="mt-8 rounded-2xl bg-[#F1E5DE] p-5">
                <p className="font-medium text-[#9E4F38]">
                  RSVP non confirmé
                </p>

                <p className="mt-2 text-sm text-[#75665F]">
                  Cette invitation ne possède pas de confirmation de présence.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
