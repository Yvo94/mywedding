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
      <header className="absolute left-0 right-0 top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <Link
            href="/"
            className="font-serif text-xl tracking-[0.25em] text-white"
          >
            A & A
          </Link>

          <Link
            href="/"
            className="text-sm text-white/85 transition hover:text-white"
          >
            ← Retour au mariage
          </Link>
        </div>
      </header>

      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative flex min-h-[460px] items-center justify-center overflow-hidden bg-[#332824]">
        {/* Décoration */}
        <div className="absolute left-10 top-28 h-24 w-24 rounded-full border border-[#D99072]/30" />

        <div className="absolute bottom-16 right-10 h-32 w-32 rounded-full border border-[#D99072]/20" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(198,106,74,0.20),_transparent_60%)]" />

        <div className="relative z-10 px-6 pt-16 text-center text-white">
          <p className="mb-5 text-xs uppercase tracking-[0.45em] text-[#F1C5B4]">
            Axel & Améline
          </p>

          <h1 className="font-serif text-6xl md:text-8xl">
            RSVP
          </h1>

          <div className="mx-auto mt-7 h-px w-16 bg-[#C66A4A]" />

          <p className="mx-auto mt-6 max-w-lg text-sm leading-7 text-white/70 md:text-base">
            Nous serions très heureux de partager cette journée
            exceptionnelle avec vous.
          </p>

          <p className="mt-6 text-xs uppercase tracking-[0.3em] text-[#D99072]">
            14 Novembre 2026
          </p>
        </div>
      </section>

      {/* =====================================================
          FORMULAIRE
      ====================================================== */}
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-2xl">
          {!submitted ? (
            <>
              {/* INTRO */}
              <div className="mb-12 text-center">
                <p className="text-xs uppercase tracking-[0.35em] text-[#C66A4A]">
                  Votre présence
                </p>

                <h2 className="mt-4 font-serif text-4xl md:text-5xl">
                  Confirmez votre présence
                </h2>

                <div className="mx-auto mt-6 h-px w-12 bg-[#D99072]" />

                <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-[#75665F]">
                  Merci de nous indiquer si vous pourrez être présents
                  à notre mariage du 14 novembre 2026.
                </p>
              </div>

              {/* FORM */}
              <form
                onSubmit={handleSubmit}
                className="rounded-[2rem] border border-[#E8DAD2] bg-white p-7 shadow-sm md:p-10"
              >
                {/* NOM + WHATSAPP */}
              <div className="mb-6 grid gap-5 md:grid-cols-2">
                {/* NOM */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium"
                  >
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
                    className="w-full rounded-xl border border-[#DED3CC] bg-[#FDFCFB] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#B2A8A1] focus:border-[#C66A4A] focus:ring-1 focus:ring-[#C66A4A]"
                  />
                </div>

                {/* WHATSAPP */}
                <div>
                  <label
                    htmlFor="whatsapp"
                    className="mb-2 block text-sm font-medium"
                  >
                    Numéro WhatsApp
                  </label>

                  <input
                    id="whatsapp"
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    placeholder="05 44 36 03 78"
                    className="w-full rounded-xl border border-[#DED3CC] bg-[#FDFCFB] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#B2A8A1] focus:border-[#C66A4A] focus:ring-1 focus:ring-[#C66A4A]"
                  />
                </div>
              </div>


              {/* LIEN + CÔTÉ */}
              <div className="mb-6 grid gap-5 md:grid-cols-2">
                {/* LIEN */}
                <div>
                  <label
                    htmlFor="relation"
                    className="mb-2 block text-sm font-medium"
                  >
                    Lien avec les mariés *
                  </label>

                  <select
                    id="relation"
                    name="relation"
                    required
                    value={formData.relation}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#DED3CC] bg-[#FDFCFB] px-4 py-3.5 text-sm outline-none transition focus:border-[#C66A4A] focus:ring-1 focus:ring-[#C66A4A]"
                  >
                    <option value="">
                      Sélectionnez une option
                    </option>

                    <option value="parent">
                      Parent
                    </option>

                    <option value="ami">
                      Ami(e)
                    </option>

                    <option value="collegue">
                      Collègue
                    </option>

                    <option value="communaute_religieuse">
                      Communauté religieuse
                    </option>
                  </select>
                </div>

                {/* CÔTÉ */}
                <div>
                  <label
                    htmlFor="side"
                    className="mb-2 block text-sm font-medium"
                  >
                    Côté *
                  </label>

                  <select
                    id="side"
                    name="side"
                    required
                    value={formData.side}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#DED3CC] bg-[#FDFCFB] px-4 py-3.5 text-sm outline-none transition focus:border-[#C66A4A] focus:ring-1 focus:ring-[#C66A4A]"
                  >
                    <option value="">
                      Sélectionnez un côté
                    </option>

                    <option value="Axel">
                      Axel
                    </option>

                    <option value="Améline">
                      Améline
                    </option>

                    <option value="Axel & Améline">
                      Axel & Améline
                    </option>
                  </select>
                </div>
              </div>


              {/* PRÉSENCE */}
              <div className="mb-6">
                <label className="mb-3 block text-sm font-medium">
                  Serez-vous présent(e) ? *
                </label>

                <div className="grid gap-3 sm:grid-cols-2">

                  {/* OUI */}
                  <label
                    className={`cursor-pointer rounded-xl border p-4 transition ${
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
                      className="mr-3 accent-[#C66A4A]"
                    />

                    <span className="text-sm">
                      Oui, je serai présent(e)
                    </span>
                  </label>

                  {/* NON */}
                  <label
                    className={`cursor-pointer rounded-xl border p-4 transition ${
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
                      className="mr-3 accent-[#C66A4A]"
                    />

                    <span className="text-sm">
                      Désolé, je ne pourrai pas venir
                    </span>
                  </label>

                </div>
              </div>


              {/* NOMBRE DE PERSONNES ACCOMPAGNANTES */}
              {formData.attendance === "Présent" && (
                <div className="mb-6">
                  <label
                    htmlFor="guests"
                    className="mb-2 block text-sm font-medium"
                  >
                    Nombre de personnes accompagnantes
                  </label>

                  <select
                    id="guests"
                    name="guests"
                    value={formData.guests}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#DED3CC] bg-[#FDFCFB] px-4 py-3.5 text-sm outline-none transition focus:border-[#C66A4A] focus:ring-1 focus:ring-[#C66A4A]"
                  >
                    <option value="0">
                      Je viens seul(e)
                    </option>

                    <option value="1">
                      1 accompagnant
                    </option>

                    <option value="2">
                      2 accompagnants
                    </option>
                  </select>
                </div>
              )}

              {/* MESSAGE */}
              <div className="mb-8">
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-medium"
                >
                  Un petit mot pour les mariés
                </label>

                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Écrivez-nous un petit mot..."
                  className="w-full resize-none rounded-xl border border-[#DED3CC] bg-[#FDFCFB] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#B2A8A1] focus:border-[#C66A4A] focus:ring-1 focus:ring-[#C66A4A]"
                />
              </div>

                {/* BOUTON */}
                <button
                  type="submit"
                  className="w-full rounded-full bg-[#C66A4A] px-6 py-4 text-sm font-medium tracking-wide text-white shadow-lg shadow-[#C66A4A]/15 transition hover:bg-[#9E4F38]"
                >
                  Confirmer ma réponse
                </button>

                <p className="mt-5 text-center text-xs leading-5 text-[#928982]">
                  Vos informations seront utilisées uniquement dans
                  le cadre de notre mariage.
                </p>
              </form>
            </>
          ) : (
            /* =================================================
               CONFIRMATION
            ================================================== */
           
           <div className="rounded-[2rem] border border-[#E8DAD2] bg-white px-6 py-12 text-center shadow-sm md:px-12">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F8E9E2] font-serif text-2xl text-[#C66A4A]">
              ♥
            </div>

            <p className="mt-7 text-xs uppercase tracking-[0.35em] text-[#C66A4A]">
              Merci
            </p>

            <h2 className="mt-4 font-serif text-4xl md:text-5xl">
              Votre présence est confirmée
            </h2>

            <div className="mx-auto mt-6 h-px w-12 bg-[#D99072]" />

            <p className="mx-auto mt-6 max-w-md text-sm leading-7 text-[#75665F]">
              Merci beaucoup{" "}
              <strong className="text-[#9E4F38]">
                {formData.name}
              </strong>
              . Nous sommes heureux de vous compter
              parmi nous pour cette belle journée.
            </p>

            {/* CARTE */}
            {guestData && (
              <WeddingInvitationCard
                guest={guestData}
                numberOfGuests={Number(formData.guests)}
              />
            )}

            {/* MODIFICATION */}
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
              }}
              className="mt-8 text-sm font-medium text-[#C66A4A] underline underline-offset-4"
            >
              ✏ Modifier ma réponse
            </button>

            <div>
              <Link
                href="/"
                className="mt-6 inline-flex rounded-full border border-[#DED3CC] px-7 py-3.5 text-sm text-[#75665F] transition hover:border-[#C66A4A] hover:text-[#C66A4A]"
              >
                Retour au mariage
              </Link>
            </div>

          </div>
          )}
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <footer className="border-t border-[#E8DAD2] bg-[#FAF7F3] px-6 py-12 text-center">
        <p className="font-serif text-3xl">
          Axel <span className="text-[#C66A4A]">&</span> Améline
        </p>

        <p className="mt-3 text-xs uppercase tracking-[0.3em] text-[#9E4F38]">
          14 Novembre 2026
        </p>

        <div className="mx-auto mt-6 h-px w-10 bg-[#D99072]" />

        <p className="mt-5 text-xs text-[#928982]">
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