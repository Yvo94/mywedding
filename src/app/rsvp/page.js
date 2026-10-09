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
    guests: "1",
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

const handleSubmit = async (e) => {
  e.preventDefault();

  setSubmitting(true);

  try {
    // =====================================================
    // 1. CHERCHER L'INVITÉ
    // =====================================================

    const { data: existingGuest, error: guestSearchError } =
      await supabase
        .from("guests")
        .select("*")
        .eq("name", formData.name.trim())
        .eq("side", formData.side)
        .maybeSingle();

    if (guestSearchError) {
      throw guestSearchError;
    }

    let guest = existingGuest;

    // =====================================================
    // 2. CRÉER L'INVITÉ SI NÉCESSAIRE
    // =====================================================

    if (!guest) {
      let invitationCode = generateInvitationCode();

      // Vérifier que le code n'existe pas
      let codeExists = true;

      while (codeExists) {
        const { data } = await supabase
          .from("guests")
          .select("id")
          .eq("invitation_code", invitationCode)
          .maybeSingle();

        codeExists = !!data;

        if (codeExists) {
          invitationCode = generateInvitationCode();
        }
      }

      const { data: newGuest, error: createGuestError } =
        await supabase
          .from("guests")
          .insert({
            name: formData.name.trim(),
            relation: formData.relation,
            side: formData.side,
            whatsapp: formData.whatsapp,
            invitation_code: invitationCode,
          })
          .select()
          .single();

      if (createGuestError) {
        throw createGuestError;
      }

      guest = newGuest;
    }

    // =====================================================
    // 3. ENREGISTRER / MODIFIER LE RSVP
    // =====================================================

    const rsvpData = {
      guest_id: guest.id,
      attendance: formData.attendance,
      number_of_guests: Number(formData.guests),
      //message: formData.message,
    };

    const { error: rsvpError } = await supabase
        .from("rsvps")
        .upsert(rsvpData, {
          onConflict: "guest_id",
        });

      if (rsvpError) {
        throw rsvpError;
      }

      if (formData.message.trim() !== "") {
        const { error: messageError } = await supabase
          .from("guestbook_messages")
          .insert({
            guest_id: guest.id,
            message: formData.message.trim(),
            is_published: false,
          });

        if (messageError) {
          throw messageError;
        }
      }

    // =====================================================
    // 4. CRÉER L'ENTRÉE CHECK-IN
    // =====================================================

    await supabase
      .from("check_ins")
      .upsert(
        {
          guest_id: guest.id,
          checked_in: false,
        },
        {
          onConflict: "guest_id",
        }
      );

    // =====================================================
    // 5. STOCKER L'INVITATION
    // =====================================================

    setGuestData(guest);

    // =====================================================
    // 6. AFFICHER LA CARTE
    // =====================================================

    setSubmitted(true);

  } catch (error) {
    console.error("Erreur RSVP :", error);

    alert(
      "Une erreur est survenue lors de l'enregistrement."
    );
  } finally {
    setSubmitting(false);
  }
};

  return (
    <main className="min-h-screen bg-[#FAF7F3] text-[#332824]">
      {/* =====================================================
          HEADER
      ====================================================== */}
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

      
      {/* =====================================================
          HERO + FORMULAIRE RSVP
      ====================================================== */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-5 px-4 py-6 md:grid-cols-2 md:gap-6 md:px-6 md:py-8">
        
        {/* HERO À GAUCHE */}
        <section className="relative flex min-h-[360px] h-full flex-col items-center justify-center overflow-hidden rounded-[2rem] bg-[#332824] px-5 py-6 text-center text-white shadow-xl md:min-h-0">

          <div className="absolute left-6 top-8 h-20 w-20 rounded-full border border-[#D99072]/30" />
          <div className="absolute bottom-8 right-6 h-28 w-28 rounded-full border border-[#D99072]/20" />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(198,106,74,0.20),_transparent_60%)]" />

          <div className="relative z-10">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[#F1C5B4]">
              Axel & Améline
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

            <p className="mt-10 font-serif text-lg gras text-white/70">
              « L’amour est patient, l’amour est serviable… il espère tout, il endure tout. »
            </p>
            <p className="mt-10 font-serif text-lg italic text-[#D99172]">
              1 Corinthiens 13, 4-7
            </p>
          </div>
        </section>

        {/* FORMULAIRE À DROITE */}
        <section className="rounded-2xl border border-[#E8D8CE] bg-white p-5 shadow-md md:p-6">

          {!submitted ? (
            <>
              {/* INTRODUCTION COMPACTE */}
              <div className="mb-6 text-center">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#C66A4A]">
                  Votre présence
                </p>

                <h2 className="mt-2 font-serif text-3xl md:text-4xl">
                  Confirmez votre présence
                </h2>

                <div className="mx-auto mt-4 h-px w-12 bg-[#D99072]" />

                <p className="mt-3 text-sm leading-6 text-[#75665F]">
                  Merci de nous indiquer si vous serez parmi nous le
                  14 novembre 2026.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* NOM + WHATSAPP */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
                      Nom et prénoms *
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Ex. Yves Roland YAO"
                      className="w-full rounded-xl border border-[#DED3CC] bg-[#FDFCFB] px-3 py-2.5 text-sm outline-none transition focus:border-[#C66A4A] focus:ring-1 focus:ring-[#C66A4A]"
                    />
                  </div>

                  <div>
                    <label htmlFor="whatsapp" className="mb-1.5 block text-sm font-medium">
                      Numéro WhatsApp
                    </label>

                    <input
                      id="whatsapp"
                      name="whatsapp"
                      type="tel"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      placeholder="05 44 36 03 78"
                      className="w-full rounded-xl border border-[#DED3CC] bg-[#FDFCFB] px-3 py-2.5 text-sm outline-none transition focus:border-[#C66A4A] focus:ring-1 focus:ring-[#C66A4A]"
                    />
                  </div>
                </div>

                {/* LIEN + CÔTÉ */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="relation" className="mb-1.5 block text-sm font-medium">
                      Lien avec les mariés *
                    </label>

                    <select
                      id="relation"
                      name="relation"
                      required
                      value={formData.relation}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-[#DED3CC] bg-[#FDFCFB] px-3 py-2.5 text-sm outline-none focus:border-[#C66A4A]"
                    >
                      <option value="">Sélectionnez</option>
                      <option value="parent">Parent</option>
                      <option value="ami">Ami(e)</option>
                      <option value="collegue">Collègue</option>
                      <option value="communaute_religieuse">Communauté religieuse</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="side" className="mb-1.5 block text-sm font-medium">
                      Côté *
                    </label>

                    <select
                      id="side"
                      name="side"
                      required
                      value={formData.side}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-[#DED3CC] bg-[#FDFCFB] px-3 py-2.5 text-sm outline-none focus:border-[#C66A4A]"
                    >
                      <option value="">Sélectionnez</option>
                      <option value="Axel">Axel</option>
                      <option value="Améline">Améline</option>
                      <option value="Axel & Améline">Axel & Améline</option>
                    </select>
                  </div>
                </div>

                {/* PRÉSENCE */}
                <div>
                  <p className="mb-2 text-sm font-medium">
                    Serez-vous présent(e) ? *
                  </p>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <label
                      className={`flex cursor-pointer items-center rounded-xl border p-3 text-sm transition ${
                        formData.attendance === "Présent"
                          ? "border-[#C66A4A] bg-[#F8E9E2]"
                          : "border-[#DED3CC] bg-[#FDFCFB] hover:border-[#D99072]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="attendance"
                        value="Présent"
                        checked={formData.attendance === "Présent"}
                        onChange={handleChange}
                        required
                        className="mr-2 accent-[#C66A4A]"
                      />
                      Oui, je serai présent(e)
                    </label>

                    <label
                      className={`flex cursor-pointer items-center rounded-xl border p-3 text-sm transition ${
                        formData.attendance === "Absent"
                          ? "border-[#C66A4A] bg-[#F8E9E2]"
                          : "border-[#DED3CC] bg-[#FDFCFB] hover:border-[#D99072]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="attendance"
                        value="Absent"
                        checked={formData.attendance === "Absent"}
                        onChange={handleChange}
                        required
                        className="mr-2 accent-[#C66A4A]"
                      />
                      Je ne pourrai pas venir
                    </label>
                  </div>
                </div>

                {/* ACCOMPAGNANTS */}
                {formData.attendance === "Présent" && (
                  <div>
                    <label htmlFor="guests" className="mb-1.5 block text-sm font-medium">
                      Nombre d'accompagnants
                    </label>

                    <select
                      id="guests"
                      name="guests"
                      value={formData.guests}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-[#DED3CC] bg-[#FDFCFB] px-3 py-2.5 text-sm outline-none focus:border-[#C66A4A]"
                    >
                      <option value="0">Je viens seul(e)</option>
                      <option value="1">1 accompagnant</option>
                      <option value="2">2 accompagnants</option>
                    </select>
                  </div>
                )}

                {/* MESSAGE */}
                <div>
                  <label htmlFor="message" className="mb-1.5 block text-sm font-medium">
                    Un petit mot pour les mariés
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    rows={2}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Écrivez-nous un petit mot..."
                    className="w-full resize-y rounded-xl border border-[#DED3CC] bg-[#FDFCFB] px-3 py-2.5 text-sm outline-none transition focus:border-[#C66A4A] focus:ring-1 focus:ring-[#C66A4A]"
                  />
                </div>

                {/* BOUTON */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-full bg-[#C66A4A] px-5 py-3 text-sm font-medium tracking-wide text-white shadow-lg shadow-[#C66A4A]/15 transition hover:bg-[#9E4F38] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Enregistrement..." : "Confirmer ma réponse"}
                </button>

                <p className="text-center text-xs leading-5 text-[#928982]">
                  Vos informations seront utilisées uniquement dans le cadre de notre mariage.
                </p>
              </form>
            </>
          ) : (
            /* CONFIRMATION DANS LE CADRE DE DROITE */
            <div className="flex h-full flex-col items-center justify-center py-8 text-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F8E9E2] font-serif text-2xl text-[#C66A4A]">
                ♥
              </div>

              <p className="mt-5 text-xs uppercase tracking-[0.3em] text-[#C66A4A]">
                Merci
              </p>

              <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                Votre réponse est enregistrée
              </h2>

              <div className="mx-auto mt-5 h-px w-12 bg-[#D99072]" />

              <p className="mt-5 text-sm leading-6 text-[#75665F]">
                Merci beaucoup{" "}
                <strong className="text-[#9E4F38]">{formData.name}</strong>.
                {" "}Nous vous remercions d'avoir répondu à notre invitation.
              </p>

              {guestData && (
                <div className="mx-auto mt-3 w-full min-w-0 max-w-[320px]">
                  <WeddingInvitationCard
                    guest={guestData}
                    numberOfGuests={Number(formData.guests)}
                  />
                </div>
              )}

              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-6 text-sm font-medium text-[#C66A4A] underline underline-offset-4"
              >
                ✏ Modifier ma réponse
              </button>

              <Link
                href="/"
                className="mt-5 inline-flex rounded-full border border-[#DED3CC] px-6 py-3 text-sm text-[#75665F] transition hover:border-[#C66A4A] hover:text-[#C66A4A]"
              >
                Retour au mariage
              </Link>
            </div>
          )}

        </section>
      </div>

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <footer className="border-t border-[#E8DAD2] bg-[#FAF7F3] px-6 py-6 text-center">
        <p className="font-serif text-2xl">
          Axel <span className="text-[#C66A4A]">&</span> Améline
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

function generateInvitationCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "";

  for (let i = 0; i < 5; i++) {
    code += chars.charAt(
      Math.floor(Math.random() * chars.length)
    );
  }

  return code;
}