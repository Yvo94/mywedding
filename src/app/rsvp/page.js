
"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import WeddingInvitationCard from "@/components/WeddingInvitationCard";

export default function RSVPPage() {
  const [formData, setFormData] = useState({
    name: "",
    relation: "",
    side: "",
    whatsapp: "",
    guests: "0",
    attendance: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [guestData, setGuestData] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
  function normalizePhone(phone) {
    let digits = phone.replace(/\D/g, "");

    // Retirer l'indicatif ivoirien pour uniformiser
    if (digits.startsWith("225") && digits.length === 13) {
      digits = digits.slice(3);
    }

    return digits;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const normalizedPhone = normalizePhone(formData.whatsapp);

    if (submitting) return;

    setSubmitting(true);

    try {
      // ================================================
      // 1. ENREGISTRER L'INVITÉ, LE RSVP ET LE CHECK-IN
      //    DANS UNE SEULE TRANSACTION POSTGRESQL
      // ================================================

      const { data, error } = await supabase.rpc(
        "submit_wedding_rsvp",
        {
          p_name: formData.name.trim(),
          p_relation: formData.relation,
          p_side: formData.side,
          p_whatsapp: normalizedPhone, //formData.whatsapp.trim(),
          p_attendance: formData.attendance,
          p_number_of_guests:
            formData.attendance === "Présent"
              ? Number(formData.guests)
              : 0,
        }
      );

      if (error) {
        console.error("Erreur RPC RSVP :", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });

        throw error;
      }

      if (!data?.guest || !data?.rsvp) {
        throw new Error(
          "La réponse du serveur est incomplète."
        );
      }

      const guest = data.guest;

      // ================================================
      // 2. ENREGISTRER LE MESSAGE DU LIVRE D'OR
      //    SÉPARÉMENT DU RSVP
      // ================================================

      let messageSaved = true;

      if (formData.message.trim() !== "") {
        const { error: messageError } = await supabase
          .from("guestbook_messages")
          .insert({
            guest_id: guest.id,
            message: formData.message.trim(),
            is_published: false,
          });

        if (messageError) {
          messageSaved = false;

          console.error(
            "Le RSVP est enregistré, mais le message du livre d'or a échoué :",
            {
              message: messageError.message,
              code: messageError.code,
              details: messageError.details,
              hint: messageError.hint,
            }
          );
        }
      }

      // ================================================
      // 3. AFFICHER LA CARTE D'INVITATION
      // ================================================

      setGuestData(guest);
      setSubmitted(true);

      if (!messageSaved) {
        alert(
          "Votre réponse est enregistrée, mais votre petit mot n'a pas pu être sauvegardé. Vous pourrez le transmettre aux mariés séparément."
        );
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement RSVP :", {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
      });

      if (error?.code === "23505") {
        alert(
          "Ce numéro WhatsApp est déjà associé à une inscription. Un seul enregistrement par numéro est autorisé."
        );
      } else {
        alert(
          error?.message
            ? `Impossible d'enregistrer votre réponse : ${error.message}`
            : "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FAF7F3] text-[#332824]">
      {/* HEADER */}
      <header className="relative z-20 bg-[#332824]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <Link
            href="/"
            className="font-serif text-xl tracking-[0.2em] text-white"
          >
            A & A
          </Link>

          <Link
            href="/"
            className="text-xs text-white/80 transition hover:text-[#F1C5B4] sm:text-sm"
          >
            ← Retour au mariage
          </Link>
        </div>
      </header>

      {/* HERO + FORMULAIRE RSVP */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-5 px-4 py-6 md:grid-cols-2 md:gap-6 md:px-6 md:py-8">

        {/* HERO À GAUCHE */}
        <section className="relative flex min-h-[360px] h-full flex-col items-center justify-center overflow-hidden rounded-[2rem] bg-[#332824] px-5 py-6 text-center text-white shadow-xl md:min-h-0">
          <div className="absolute left-6 top-8 h-20 w-20 rounded-full border border-[#D99072]/30" />

          <div className="absolute bottom-8 right-6 h-28 w-28 rounded-full border border-[#D99072]/20" />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(198,106,74,0.20),_transparent_60%)]" />

          <div className="relative z-10">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[#F1C5B4]">
              Axel & Ameline
            </p>

            <h1 className="font-serif text-5xl md:text-7xl">
              RSVP
            </h1>

            <div className="mx-auto mt-5 h-px w-14 bg-[#C66A4A]" />

            <p className="mx-auto mt-5 max-w-sm text-sm leading-6 text-white/75">
              Nous serions très heureux de partager cette journée
              exceptionnelle avec vous.
            </p>

            <p className="mt-5 text-xs uppercase tracking-[0.25em] text-[#D99072]">
              14 Novembre 2026
            </p>

            <p className="mt-10 font-serif text-lg text-white/70">
              « L’amour est patient, l’amour est serviable…
              il espère tout, il endure tout. »
            </p>

            <p className="mt-10 font-serif text-lg italic text-[#D99172]">
              1 Corinthiens 13, 4-7
            </p>
          </div>
        </section>

        {/* FORMULAIRE À DROITE */}
        <section className="rounded-2xl border border-[#E8D8CE] bg-white p-5 shadow-md md:p-6">
          
          <div className="mb-6 rounded-xl border border-[#E8D8CE] bg-[#FAF7F3] p-4 text-center">
            <p className="font-medium text-[#332824]">
              Vous avez déjà votre code d’invitation ?
            </p>

            <p className="mt-1 text-sm text-[#75665F]">
              Retrouvez votre carte et téléchargez-la à nouveau.
            </p>

            <Link
              href="/moninvitation"
              className="mt-3 inline-flex items-center justify-center rounded-full bg-[#332824] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#9E4F38]"
            >
              Réimprimer mon invitation
            </Link>
          </div>

          {/* INTRODUCTION */}
              <div className="mb-6 text-center">

                <h2 className="mt-2 font-serif text-3xl md:text-4xl">
                  FIN DES CONFIRMATIONS DE PRESENCE
                </h2>

                <div className="mx-auto mt-4 h-px w-12 bg-[#D99072]" />

                <p className="mt-3 text-sm leading-6 text-[#75665F]">
                  Merci et à bientôt !!!
                </p>
              </div>
          
          
        </section>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-[#E8DAD2] bg-[#FAF7F3] px-6 py-6 text-center">
        <p className="font-serif text-2xl">
          Axel <span className="text-[#C66A4A]">&</span> Ameline
        </p>

        <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-[#9E4F38]">
          14 Novembre 2026
        </p>

        <p className="mt-3 text-xs text-[#928982]">
          L'amour est plus grand que tout
        </p>
      </footer>
    </main>
  );
}
