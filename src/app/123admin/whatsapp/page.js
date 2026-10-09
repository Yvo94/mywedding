"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const TEMPLATES = {
  invitation: `Bonjour {prenom} 👋

Nous sommes heureux de vous inviter au mariage d’Axel et Améline 💍

Nous serions ravis de vous compter parmi nous pour célébrer cette belle journée.

À très bientôt ! ❤️`,

  rappel: `Bonjour {prenom} 👋

Le grand jour d’Axel et Améline approche ! 💍

Nous souhaitons savoir si vous pourrez être des nôtres. Merci de confirmer votre présence sur notre site.

À très bientôt ❤️`,

  confirmation: `Bonjour {prenom} ❤️

Merci d’avoir confirmé votre présence au mariage d’Axel et Améline.

Nous sommes heureux de partager ce moment spécial avec vous ! 💍`,
};

export default function WhatsAppPage() {
  const [guests, setGuests] = useState([]);
  const [selected, setSelected] = useState([]);
  const [filter, setFilter] = useState("tous");
  const [template, setTemplate] = useState("invitation");
  const [message, setMessage] = useState(TEMPLATES.invitation);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sent, setSent] = useState([]);

  useEffect(() => {
    async function loadGuests() {
      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setGuests(data || []);
      }

      setLoading(false);
    }

    loadGuests();
  }, []);

  // Adapter cette fonction aux valeurs exactes de ton champ RSVP.
  function getStatus(guest) {
    const rsvp = Array.isArray(guest.rsvps)
      ? guest.rsvps[0]
      : guest.rsvps;

    if (!rsvp?.attendance) return "attente";

    const value = String(rsvp.attendance).toLowerCase();

    if (["yes", "present", "confirmed", "présent", "oui"].includes(value)) {
      return "confirmes";
    }

    if (["no", "absent", "non"].includes(value)) {
      return "absents";
    }

    return "attente";
  }

  function getName(guest) {
    return (
      guest.name ||
      guest.full_name ||
      guest.first_name ||
      "cher invité"
    );
  }

  function personalize(guest) {
    return message.replace(
      /\{prenom\}/gi,
      getName(guest).split(" ")[0]
    );
  }

  const filteredGuests = useMemo(() => {
    return guests.filter((guest) => {
      const status = getStatus(guest);
      const name = getName(guest).toLowerCase();
      const phone = String(guest.whatsapp || "");

      const matchesFilter =
        filter === "tous" || status === filter;

      const matchesSearch =
        name.includes(search.toLowerCase()) ||
        phone.includes(search);

      return matchesFilter && matchesSearch;
    });
  }, [guests, filter, search]);

  function toggleGuest(id) {
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  }

  function selectVisible() {
    const ids = filteredGuests.map((guest) => guest.id);

    setSelected((previous) => {
      const allSelected = ids.every((id) =>
        previous.includes(id)
      );

      return allSelected
        ? previous.filter((id) => !ids.includes(id))
        : [...new Set([...previous, ...ids])];
    });
  }

  function openWhatsApp(guest) {
    const phone = String(guest.whatsapp || "").replace(
      /[\s()+.-]/g,
      ""
    );

    if (!phone) {
      alert("Aucun numéro WhatsApp pour cet invité.");
      return;
    }

    // Utiliser le format international, par exemple 2250700000000.
    if (!/^\d{8,15}$/.test(phone)) {
      alert("Vérifie le format international du numéro WhatsApp.");
      return;
    }

    const url =
      `https://wa.me/${phone}?text=` +
      encodeURIComponent(personalize(guest));

    window.open(url, "_blank", "noopener,noreferrer");

    setSent((previous) =>
      previous.includes(guest.id)
        ? previous
        : [...previous, guest.id]
    );
  }

  function openSelected() {
    const recipients = guests.filter((guest) =>
      selected.includes(guest.id)
    );

    if (!recipients.length) {
      alert("Sélectionne au moins un invité.");
      return;
    }

    if (recipients.length > 1) {
      alert(
        "WhatsApp s'ouvre pour un seul invité à la fois. " +
        "Tu vas pouvoir envoyer les messages successivement."
      );
    }

    const first = recipients[0];
    openWhatsApp(first);
  }

  if (loading) {
    return <div className="p-8">Chargement des invités...</div>;
  }

  return (
    <main className="min-h-screen bg-[#FAF7F4] p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <p className="text-sm text-[#A66C51]">
            MARIAGE AXEL & AMÉLINE
          </p>
          <h1 className="text-3xl font-bold text-[#332824]">
            Notifications WhatsApp
          </h1>
          <p className="mt-2 text-gray-600">
            Contacte les invités directement depuis ton espace admin.
          </p>
        </header>

        {error && (
          <p className="rounded-xl bg-red-100 p-4 text-red-700">
            Erreur Supabase : {error}
          </p>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Stat label="Total invités" value={guests.length} />
          <Stat
            label="Invités sélectionnés"
            value={selected.length}
          />
          <Stat label="WhatsApp ouverts" value={sent.length} />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">
              1. Choisir les invités
            </h2>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un nom ou un numéro..."
              className="mb-4 w-full rounded-xl border p-3"
            />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="mb-4 w-full rounded-xl border p-3"
            >
              <option value="tous">Tous les invités</option>
              <option value="attente">En attente</option>
              <option value="confirmes">Présence confirmée</option>
              <option value="absents">Absents</option>
            </select>

            <button
              onClick={selectVisible}
              className="mb-3 rounded-lg border px-4 py-2"
            >
              Sélectionner / désélectionner la liste
            </button>

            <div className="max-h-[440px] space-y-2 overflow-y-auto">
              {filteredGuests.map((guest) => (
                <label
                  key={guest.id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border p-3 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(guest.id)}
                    onChange={() => toggleGuest(guest.id)}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {getName(guest)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {guest.whatsapp || "Numéro manquant"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      openWhatsApp(guest);
                    }}
                    className="rounded-lg bg-green-600 px-3 py-2 text-sm text-white"
                  >
                    Envoyer
                  </button>
                </label>
              ))}

              {filteredGuests.length === 0 && (
                <p className="p-4 text-gray-500">
                  Aucun invité trouvé.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">
              2. Préparer le message
            </h2>

            <label className="mb-2 block text-sm font-medium">
              Modèle
            </label>

            <select
              value={template}
              onChange={(e) => {
                setTemplate(e.target.value);
                setMessage(TEMPLATES[e.target.value]);
              }}
              className="mb-4 w-full rounded-xl border p-3"
            >
              <option value="invitation">Invitation</option>
              <option value="rappel">Rappel RSVP</option>
              <option value="confirmation">Confirmation</option>
            </select>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={12}
              className="w-full rounded-xl border p-4"
              placeholder="Écris ton message..."
            />

            <p className="mt-2 text-sm text-gray-500">
              Utilise {"{prenom}"} pour personnaliser le message.
            </p>

            <div className="mt-4 rounded-xl bg-[#F8F0EA] p-4">
              <p className="mb-2 font-semibold">
                Aperçu du message
              </p>
              <p className="whitespace-pre-wrap text-sm">
                {personalize(
                  guests.find((guest) =>
                    selected.includes(guest.id)
                  ) || guests[0] || { name: "Invité" }
                )}
              </p>
            </div>

            <button
              onClick={openSelected}
              disabled={selected.length === 0}
              className="mt-5 w-full rounded-xl bg-green-600 px-5 py-4 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Ouvrir WhatsApp ({selected.length})
            </button>

            <p className="mt-3 text-xs text-gray-500">
              Pour chaque invité, vérifie le message dans WhatsApp
              puis appuie sur Envoyer. L'ouverture de WhatsApp ne
              confirme pas que le message a été envoyé.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-[#332824]">
        {value}
      </p>
    </div>
  );
}