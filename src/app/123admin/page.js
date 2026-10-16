"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: "▦" },
  { id: "guests", label: "Invités", icon: "♙" },
  { id: "whatsapp", label: "Notifications WhatsApp", icon: "☏" },
  { id: "messages", label: "Messages", icon: "✉" },
  { id: "event", label: "Événement", icon: "♡" },
  { id: "settings", label: "Paramètres", icon: "⚙" },
];

const isPresent = (status) =>
  ["Présent", "Présente"].includes((status || "").trim());

export default function AdminPage() {
  const [guests, setGuests] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tous");
  const [filterSide, setFilterSide] = useState("Tous");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [whatsappSelected, setWhatsappSelected] = useState([]);
  const [whatsappSearch, setWhatsappSearch] = useState("");
  const [whatsappFilter, setWhatsappFilter] = useState("Tous");
  const [whatsappOpened, setWhatsappOpened] = useState([]);

  const [whatsappMessage, setWhatsappMessage] = useState(
    `Bonjour {prenom} 👋

Nous sommes heureux de vous inviter au mariage d’Axel et Ameline 💍

Nous serions ravis de vous compter parmi nous pour célébrer cette belle journée.

À très bientôt ! ❤️`
  );

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);

    try {
      const { data: guestsData, error: guestsError } = await supabase
        .from("guests")
        .select(`
          *,
          rsvps (
            attendance,
            number_of_guests,
            message,
            created_at
          )
        `)
        .order("created_at", { ascending: false });

      if (guestsError) {
        console.error("Erreur chargement invités :", guestsError);
        setGuests([]);
      } else {
        setGuests(guestsData ?? []);
        console.log(
          "Invités reçus de Supabase :",
          guestsData?.length ?? 0
        );
      }

      const { data: messagesData, error: messagesError } =
        await supabase
          .from("guestbook_messages")
          .select(`
            *,
            guests (
              id,
              name,
              whatsapp
            )
          `)
          .order("created_at", { ascending: false });

      if (messagesError) {
        console.error("Erreur chargement messages :", messagesError);
        setMessages([]);
      } else {
        setMessages(messagesData ?? []);
      }
    } catch (error) {
      console.error("Erreur chargement dashboard :", error);
      setGuests([]);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }

  // Récupérer le RSVP associé à un invité
  const getRsvp = (guest) => {
    if (Array.isArray(guest.rsvps)) {
      return guest.rsvps[0] || null;
    }

    return guest.rsvps || null;
  };

  // Statut réel venant de la table rsvps
  const getAttendance = (guest) => {
    return getRsvp(guest)?.attendance?.trim() || "En attente";
  };

  // Nombre d'accompagnants déclaré dans le RSVP
  const getCompanions = (guest) => {
    const rsvp = getRsvp(guest);

    if (!rsvp || !isPresent(rsvp.attendance)) {
      return 0;
    }

    return Math.max(0, Number(rsvp.number_of_guests) || 0);
  };

  // Statistiques générales
  const totalGuests = guests.length;

  const confirmedGuests = guests.filter((guest) =>
    isPresent(getAttendance(guest))
  ).length;

  const absentGuests = guests.filter(
    (guest) => getAttendance(guest) === "Absent"
  ).length;

  const pendingGuests = guests.filter(
    (guest) => getAttendance(guest) === "En attente"
  ).length;

  // Total des accompagnants des invités ayant confirmé leur présence
  const totalCompanions = guests.reduce(
    (total, guest) => total + getCompanions(guest),
    0
  );

  // Total attendu = invités confirmés + accompagnants confirmés
  const totalPeopleExpected = confirmedGuests + totalCompanions;

  const confirmedPercentage =
    totalGuests > 0
      ? Math.round((confirmedGuests / totalGuests) * 100)
      : 0;

  const absentPercentage =
    totalGuests > 0
      ? Math.round((absentGuests / totalGuests) * 100)
      : 0;

  const pendingPercentage =
    totalGuests > 0
      ? Math.round((pendingGuests / totalGuests) * 100)
      : 0;

  const confirmationRate = confirmedPercentage;

  const axelGuests = guests.filter(
    (guest) => guest.side === "Axel"
  ).length;

  const amelineGuests = guests.filter(
    (guest) => guest.side === "Améline"
  ).length;

  const bothGuests = guests.filter(
    (guest) => guest.side === "Axel & Améline"
  ).length;

  const stats = [
    {
      label: "Invités",
      value: totalGuests,
      description: "Total des invités enregistrés",
      icon: "♙",
    },
    {
      label: "Présents",
      value: confirmedGuests,
      description: "Invités ayant confirmé",
      icon: "✓",
    },
    {
      label: "Total personnes attendues",
      value: totalPeopleExpected,
      description: `${confirmedGuests} invités + ${totalCompanions} accompagnants`,
      icon: "👥",
    },
    {
      label: "Absents",
      value: absentGuests,
      description: "Ne seront pas présents",
      icon: "×",
    },
    {
      label: "En attente",
      value: pendingGuests,
      description: "Sans réponse",
      icon: "◷",
    },
  ];

  // Filtrer les invités dans la page Invités
  const filteredGuests = useMemo(() => {
    return guests.filter((guest) => {
      const name = guest.name || "";
      const whatsapp = guest.whatsapp || "";
      const side = guest.side || "";
      const status = getAttendance(guest);
      const searchValue = search.toLowerCase();

      const matchesSearch =
        name.toLowerCase().includes(searchValue) ||
        whatsapp.toLowerCase().includes(searchValue);

      const matchesStatus =
        filterStatus === "Tous" || status === filterStatus;

      const matchesSide =
        filterSide === "Tous" || side === filterSide;

      return matchesSearch && matchesStatus && matchesSide;
    });
  }, [guests, search, filterStatus, filterSide]);

  // Publication des messages
  const handlePublishMessage = async (messageId, published) => {
    try {
      const { error } = await supabase
        .from("guestbook_messages")
        .update({ is_published: published })
        .eq("id", messageId);

      if (error) throw error;

      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === messageId
            ? { ...message, is_published: published }
            : message
        )
      );
    } catch (error) {
      console.error("Erreur publication message :", error);
      alert("Impossible de modifier le statut du message.");
    }
  };

  // Filtrage des destinataires WhatsApp
  const whatsappFilteredGuests = guests.filter((guest) => {
    const name = (guest.name || "").toLowerCase();
    const phone = guest.whatsapp || "";
    const status = getAttendance(guest);

    const matchesSearch =
      name.includes(whatsappSearch.toLowerCase()) ||
      phone.includes(whatsappSearch);

    const matchesStatus =
      whatsappFilter === "Tous" ||
      (whatsappFilter === "Présents" && isPresent(status)) ||
      (whatsappFilter === "Absents" && status === "Absent") ||
      (whatsappFilter === "En attente" && status === "En attente");

    return matchesSearch && matchesStatus;
  });

  const toggleWhatsAppGuest = (guestId) => {
    setWhatsappSelected((current) =>
      current.includes(guestId)
        ? current.filter((id) => id !== guestId)
        : [...current, guestId]
    );
  };

  const toggleAllWhatsAppGuests = () => {
    const visibleIds = whatsappFilteredGuests.map((guest) => guest.id);

    const allSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) => whatsappSelected.includes(id));

    setWhatsappSelected((current) =>
      allSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : [...new Set([...current, ...visibleIds])]
    );
  };

  const openWhatsAppMessage = (guest) => {
    const phone = String(guest.whatsapp || "").replace(/\D/g, "");

    if (!phone || phone.length < 8 || phone.length > 15) {
      alert(
        `Le numéro WhatsApp de ${guest.name || "cet invité"} est absent ou invalide.`
      );
      return;
    }

    const firstName = (guest.name || "cher invité")
      .trim()
      .split(/\s+/)[0];

    const message = whatsappMessage.replace(
      /\{prenom\}/gi,
      firstName
    );

    // Si les numéros sont déjà enregistrés au format international,
    // adapte cette ligne pour éviter d'ajouter le préfixe une seconde fois.
    const internationalPhone = phone.startsWith("225")
      ? phone
      : `225${phone}`;

    const url = `https://wa.me/${internationalPhone}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank", "noopener,noreferrer");

    setWhatsappOpened((current) =>
      current.includes(guest.id)
        ? current
        : [...current, guest.id]
    );
  };

  const openNextWhatsApp = () => {
    const nextGuest = guests.find(
      (guest) =>
        whatsappSelected.includes(guest.id) &&
        !whatsappOpened.includes(guest.id)
    );

    if (!nextGuest) {
      alert(
        "Tous les invités sélectionnés ont déjà été ouverts dans WhatsApp."
      );
      return;
    }

    openWhatsAppMessage(nextGuest);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F3]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#F1E5DE] border-t-[#C66A4A]" />
          <p className="mt-4 text-sm text-[#75665F]">
            Chargement du dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F3] text-[#332824]">
      {/* En-tête mobile */}
      <header className="fixed left-0 right-0 top-0 z-50 flex h-[72px] items-center justify-between border-b border-[#E8DAD2] bg-white px-5 lg:hidden">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C66A4A] text-sm font-semibold text-white">
            A&A
          </div>
          <div>
            <p className="font-serif text-lg text-[#332824]">
              Axel & Ameline
            </p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#75665F]">
              Administration
            </p>
          </div>
        </Link>

        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E8DAD2] text-xl text-[#9E4F38]"
          aria-label="Ouvrir le menu"
        >
          {mobileMenu ? "×" : "☰"}
        </button>
      </header>

      {/* Menu mobile */}
      {mobileMenu && (
        <div className="fixed inset-x-0 top-[72px] z-40 border-b border-[#E8DAD2] bg-white p-4 shadow-lg lg:hidden">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMenu(item.id);
                  setMobileMenu(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                  activeMenu === item.id
                    ? "bg-[#F8E9E2] font-semibold text-[#9E4F38]"
                    : "text-[#75665F] hover:bg-[#FAF7F3]"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Barre latérale */}
      <aside className="fixed bottom-0 left-0 top-0 hidden w-[250px] flex-col bg-[#C66A4A] text-white lg:flex">
        <div className="border-b border-white/20 px-7 py-7">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#C66A4A]">
              A&A
            </div>
            <div>
              <p className="font-serif text-xl">Axel & Ameline</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-white/70">
                Administration
              </p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6">
          <p className="mb-3 px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
            Gestion
          </p>
          <div className="space-y-1.5">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                  activeMenu === item.id
                    ? "bg-white text-[#9E4F38] shadow-sm"
                    : "text-white/85 hover:bg-white/10"
                }`}
              >
                <span className="flex w-6 justify-center text-lg">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="border-t border-white/20 p-5">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <span>←</span>
            Voir le site
          </Link>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="pt-[72px] lg:ml-[250px] lg:pt-0">
        <header className="hidden h-[82px] items-center justify-between border-b border-[#E8DAD2] bg-white px-8 lg:flex">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#75665F]">
              Administration
            </p>
            <h1 className="mt-1 font-serif text-2xl text-[#332824]">
              {activeMenu === "dashboard" && "Tableau de bord"}
              {activeMenu === "guests" && "Gestion des invités"}
              {activeMenu === "whatsapp" && "Notifications WhatsApp"}
              {activeMenu === "messages" && "Messages"}
              {activeMenu === "event" && "Événement"}
              {activeMenu === "settings" && "Paramètres"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="rounded-full border border-[#E8DAD2] px-5 py-2.5 text-sm text-[#75665F] transition hover:border-[#C66A4A] hover:text-[#C66A4A]"
            >
              Voir le site
            </Link>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F8E9E2] font-semibold text-[#9E4F38]">
              A
            </div>
          </div>
        </header>

        <div className="px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
          {/* DASHBOARD */}
          {activeMenu === "dashboard" && (
            <div className="space-y-8">
              <section>
                <p className="text-sm text-[#75665F]">
                  Vue d'ensemble de votre mariage
                </p>
                <h2 className="mt-1 font-serif text-3xl text-[#332824]">
                  Bonjour Axel & Ameline ♡
                </h2>
              </section>

              {/* Statistiques : cinq cartes */}
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-[#E8DAD2] bg-white p-5 shadow-[0_8px_30px_rgba(51,40,36,0.04)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm text-[#75665F]">
                          {stat.label}
                        </p>
                        <p className="mt-2 font-serif text-4xl text-[#332824]">
                          {stat.value}
                        </p>
                      </div>
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F8E9E2] text-xl text-[#C66A4A]">
                        {stat.icon}
                      </div>
                    </div>
                    <p className="mt-4 text-xs text-[#928982]">
                      {stat.description}
                    </p>
                  </div>
                ))}
              </section>

              {/* Confirmation et répartition */}
              <section className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-2xl border border-[#E8DAD2] bg-white p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-xl text-[#332824]">
                        Confirmation des invités
                      </h3>
                      <p className="mt-1 text-sm text-[#75665F]">
                        État des réponses
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-2xl text-[#C66A4A]">
                        {confirmedGuests} / {totalGuests}
                      </p>
                      <p className="text-xs text-[#928982]">
                        réponses positives
                      </p>
                    </div>
                  </div>

                  <div className="mt-7 h-3 overflow-hidden rounded-full bg-[#F1E5DE]">
                    <div
                      className="h-full rounded-full bg-[#C66A4A] transition-all duration-500"
                      style={{ width: `${confirmationRate}%` }}
                    />
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-xl bg-[#F8E9E2] p-3">
                      <p className="text-xl font-semibold text-[#9E4F38]">
                        {confirmedPercentage}%
                      </p>
                      <p className="mt-1 text-xs text-[#75665F]">
                        Présents
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#FAF7F3] p-3">
                      <p className="text-xl font-semibold text-[#75665F]">
                        {absentPercentage}%
                      </p>
                      <p className="mt-1 text-xs text-[#75665F]">
                        Absents
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#FAF7F3] p-3">
                      <p className="text-xl font-semibold text-[#75665F]">
                        {pendingPercentage}%
                      </p>
                      <p className="mt-1 text-xs text-[#75665F]">
                        En attente
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#E8DAD2] bg-white p-6">
                  <h3 className="font-serif text-xl text-[#332824]">
                    Répartition des invités
                  </h3>
                  <p className="mt-1 text-sm text-[#75665F]">
                    Selon le côté des mariés
                  </p>
                  <div className="mt-7 space-y-5">
                    <DistributionBar
                      label="Axel"
                      value={axelGuests}
                      total={totalGuests}
                    />
                    <DistributionBar
                      label="Améline"
                      value={amelineGuests}
                      total={totalGuests}
                    />
                    <DistributionBar
                      label="Axel & Améline"
                      value={bothGuests}
                      total={totalGuests}
                    />
                  </div>
                </div>
              </section>

              {/* Derniers invités */}
              <section className="rounded-2xl border border-[#E8DAD2] bg-white">
                <div className="flex flex-col gap-3 border-b border-[#E8DAD2] p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-serif text-xl text-[#332824]">
                      Derniers invités
                    </h3>
                    <p className="mt-1 text-sm text-[#75665F]">
                      Les dernières confirmations reçues
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveMenu("guests")}
                    className="text-sm font-medium text-[#C66A4A] hover:text-[#9E4F38]"
                  >
                    Voir tous les invités →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="border-b border-[#E8DAD2] bg-[#FAF7F3] text-left text-xs uppercase tracking-wider text-[#75665F]">
                        <th className="px-6 py-4 font-medium">Invité</th>
                        <th className="px-6 py-4 font-medium">Lien</th>
                        <th className="px-6 py-4 font-medium">Côté</th>
                        <th className="px-6 py-4 font-medium">Accompagnants</th>
                        <th className="px-6 py-4 font-medium">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {guests.map((guest) => (
                        <tr
                          key={guest.id}
                          className="border-b border-[#F1E5DE] last:border-0"
                        >
                          <td className="px-6 py-4">
                            <p className="font-medium text-[#332824]">
                              {guest.name}
                            </p>
                            <p className="mt-1 text-xs text-[#928982]">
                              {guest.whatsapp}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#75665F]">
                            {guest.relation}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#75665F]">
                            {guest.side}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#75665F]">
                            {getCompanions(guest)}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={getAttendance(guest)} />
                          </td>
                        </tr>
                      ))}
                      {guests.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-10 text-center text-sm text-[#928982]"
                          >
                            Aucun invité enregistré.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* INVITÉS */}
          {activeMenu === "guests" && (
            <div className="space-y-6">
              <section className="rounded-2xl border border-[#E8DAD2] bg-white p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <h2 className="font-serif text-2xl text-[#332824]">
                      Liste des invités
                    </h2>
                    <p className="mt-1 text-sm text-[#75665F]">
                      Gérez les invités et leurs confirmations RSVP.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      alert("La fonction d'ajout d'invité reste à développer.")
                    }
                    className="rounded-xl bg-[#C66A4A] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#9E4F38]"
                  >
                    + Ajouter un invité
                  </button>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  <input
                    type="text"
                    placeholder="Rechercher un invité..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="rounded-xl border border-[#E8DAD2] bg-[#FAF7F3] px-4 py-3 text-sm outline-none placeholder:text-[#B2A8A1] focus:border-[#C66A4A] focus:ring-2 focus:ring-[#C66A4A]/10"
                  />

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="rounded-xl border border-[#E8DAD2] bg-[#FAF7F3] px-4 py-3 text-sm text-[#332824] outline-none focus:border-[#C66A4A]"
                  >
                    <option value="Tous">Tous les statuts</option>
                    <option value="Présent">Présent</option>
                    <option value="Présente">Présente</option>
                    <option value="Absent">Absent</option>
                    <option value="En attente">En attente</option>
                  </select>

                  <select
                    value={filterSide}
                    onChange={(e) => setFilterSide(e.target.value)}
                    className="rounded-xl border border-[#E8DAD2] bg-[#FAF7F3] px-4 py-3 text-sm text-[#332824] outline-none focus:border-[#C66A4A]"
                  >
                    <option value="Tous">Tous les côtés</option>
                    <option value="Axel">Axel</option>
                    <option value="Améline">Améline</option>
                    <option value="Axel & Améline">Axel & Améline</option>
                  </select>
                </div>
              </section>

              <section className="overflow-hidden rounded-2xl border border-[#E8DAD2] bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead>
                      <tr className="border-b border-[#E8DAD2] bg-[#FAF7F3] text-left text-xs uppercase tracking-wider text-[#75665F]">
                        <th className="px-6 py-4 font-medium">Invité</th>
                        <th className="px-6 py-4 font-medium">Lien</th>
                        <th className="px-6 py-4 font-medium">Côté</th>
                        <th className="px-6 py-4 font-medium">Accompagnants</th>
                        <th className="px-6 py-4 font-medium">Statut</th>
                        <th className="px-6 py-4 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGuests.map((guest) => (
                        <tr
                          key={guest.id}
                          className="border-b border-[#F1E5DE] last:border-0 hover:bg-[#FFFCFA]"
                        >
                          <td className="px-6 py-5">
                            <p className="font-medium text-[#332824]">
                              {guest.name}
                            </p>
                            <p className="mt-1 text-xs text-[#928982]">
                              {guest.whatsapp}
                            </p>
                          </td>
                          <td className="px-6 py-5 text-sm text-[#75665F]">
                            {guest.relation}
                          </td>
                          <td className="px-6 py-5 text-sm text-[#75665F]">
                            {guest.side}
                          </td>
                          <td className="px-6 py-5 text-sm text-[#75665F]">
                            {getCompanions(guest)}
                          </td>
                          <td className="px-6 py-5">
                            <StatusBadge status={getAttendance(guest)} />
                          </td>
                          <td className="px-6 py-5">
                            <button
                              type="button"
                              onClick={() =>
                                alert(
                                  `Invité : ${guest.name}\nStatut : ${getAttendance(guest)}\nAccompagnants : ${getCompanions(guest)}`
                                )
                              }
                              className="text-sm font-medium text-[#C66A4A] hover:text-[#9E4F38]"
                            >
                              Détails
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredGuests.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-12 text-center text-sm text-[#928982]"
                          >
                            Aucun invité trouvé.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* WHATSAPP */}
          {activeMenu === "whatsapp" && (
            <div className="space-y-6">
              <section>
                <h2 className="font-serif text-3xl text-[#332824]">
                  Notifications WhatsApp
                </h2>
                <p className="mt-2 text-sm text-[#75665F]">
                  Préparez et envoyez manuellement vos messages aux invités.
                </p>
              </section>

              <section className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Total invités", value: guests.length },
                  {
                    label: "Sélectionnés",
                    value: whatsappSelected.length,
                  },
                  {
                    label: "Conversations ouvertes",
                    value: whatsappOpened.length,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-[#E8DAD2] bg-white p-5"
                  >
                    <p className="text-sm text-[#75665F]">{item.label}</p>
                    <p className="mt-2 font-serif text-3xl text-[#332824]">
                      {item.value}
                    </p>
                  </div>
                ))}
              </section>

              <section className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-2xl border border-[#E8DAD2] bg-white p-6">
                  <h3 className="font-serif text-xl text-[#332824]">
                    1. Choisir les destinataires
                  </h3>

                  <input
                    type="text"
                    value={whatsappSearch}
                    onChange={(e) => setWhatsappSearch(e.target.value)}
                    placeholder="Rechercher un invité ou un numéro..."
                    className="mt-5 w-full rounded-xl border border-[#E8DAD2] bg-[#FAF7F3] px-4 py-3 text-sm outline-none focus:border-[#C66A4A]"
                  />

                  <select
                    value={whatsappFilter}
                    onChange={(e) => setWhatsappFilter(e.target.value)}
                    className="mt-3 w-full rounded-xl border border-[#E8DAD2] bg-white px-4 py-3 text-sm"
                  >
                    <option value="Tous">Tous les invités</option>
                    <option value="Présents">Présence confirmée</option>
                    <option value="Absents">Absents</option>
                    <option value="En attente">En attente de réponse</option>
                  </select>

                  <button
                    type="button"
                    onClick={toggleAllWhatsAppGuests}
                    className="mt-4 rounded-xl border border-[#E8DAD2] px-4 py-2 text-sm text-[#9E4F38] hover:bg-[#FAF7F3]"
                  >
                    Sélectionner / désélectionner la liste
                  </button>

                  <div className="mt-4 max-h-[480px] space-y-2 overflow-y-auto">
                    {whatsappFilteredGuests.map((guest) => {
                      const status = getAttendance(guest);
                      const selected = whatsappSelected.includes(guest.id);

                      return (
                        <label
                          key={guest.id}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${
                            selected
                              ? "border-[#C66A4A] bg-[#FFF8F4]"
                              : "border-[#E8DAD2]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleWhatsAppGuest(guest.id)}
                            className="h-4 w-4 accent-[#C66A4A]"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-[#332824]">
                              {guest.name}
                            </p>
                            <p className="mt-1 text-xs text-[#75665F]">
                              {guest.whatsapp || "Numéro manquant"}
                            </p>
                            <p className="mt-1 text-xs text-[#9E4F38]">
                              {status}
                            </p>
                          </div>
                          {whatsappOpened.includes(guest.id) && (
                            <span className="text-xs text-green-700">
                              Ouvert
                            </span>
                          )}
                        </label>
                      );
                    })}

                    {whatsappFilteredGuests.length === 0 && (
                      <p className="py-8 text-center text-sm text-[#928982]">
                        Aucun invité trouvé.
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#E8DAD2] bg-white p-6">
                  <h3 className="font-serif text-xl text-[#332824]">
                    2. Préparer le message
                  </h3>
                  <p className="mt-2 text-sm text-[#75665F]">
                    Utilisez {"{prenom}"} pour personnaliser le message
                    automatiquement.
                  </p>

                  <textarea
                    value={whatsappMessage}
                    onChange={(e) => setWhatsappMessage(e.target.value)}
                    rows={12}
                    className="mt-5 w-full rounded-xl border border-[#E8DAD2] bg-[#FAF7F3] p-4 text-sm leading-6 outline-none focus:border-[#C66A4A]"
                    placeholder="Saisissez votre message..."
                  />

                  <div className="mt-4 rounded-xl bg-[#F8E9E2] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#9E4F38]">
                      Aperçu
                    </p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#332824]">
                      {whatsappMessage.replace(
                        /\{prenom\}/gi,
                        (
                          guests.find((guest) =>
                            whatsappSelected.includes(guest.id)
                          )?.name || "cher invité"
                        )
                          .trim()
                          .split(/\s+/)[0]
                      )}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={openNextWhatsApp}
                    disabled={
                      !whatsappSelected.some(
                        (id) => !whatsappOpened.includes(id)
                      )
                    }
                    className="mt-5 w-full rounded-xl bg-[#218C51] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#176D3D] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Ouvrir le prochain message WhatsApp
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setWhatsappSelected([]);
                      setWhatsappOpened([]);
                    }}
                    className="mt-3 w-full rounded-xl border border-[#E8DAD2] px-5 py-3 text-sm text-[#75665F] hover:bg-[#FAF7F3]"
                  >
                    Réinitialiser la sélection
                  </button>

                  <p className="mt-4 text-xs leading-5 text-[#928982]">
                    Chaque clic ouvre une conversation WhatsApp avec un
                    message prérempli. L'envoi reste manuel. Le statut
                    « Ouvert » ne signifie pas que le message a été envoyé.
                  </p>
                </div>
              </section>
            </div>
          )}

          {/* MESSAGES */}
          {activeMenu === "messages" && (
            <div className="space-y-6">
              <section>
                <h2 className="font-serif text-3xl text-[#332824]">
                  Messages des invités
                </h2>
                <p className="mt-2 text-sm text-[#75665F]">
                  Retrouvez les petits mots laissés par vos invités et
                  choisissez ceux qui seront affichés sur le site.
                </p>
              </section>

              <div className="grid gap-4 sm:grid-cols-3">
                <MessageStat
                  label="Total"
                  value={messages.length}
                  description={`message${messages.length > 1 ? "s" : ""}`}
                />
                <MessageStat
                  label="En attente"
                  value={messages.filter((m) => !m.is_published).length}
                  description="à valider"
                  accent
                />
                <MessageStat
                  label="Publiés"
                  value={messages.filter((m) => m.is_published).length}
                  description="visibles sur le site"
                  success
                />
              </div>

              {messages.length === 0 ? (
                <div className="rounded-2xl border border-[#E8DAD2] bg-white p-10 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F8E9E2] text-2xl text-[#C66A4A]">
                    💌
                  </div>
                  <h3 className="mt-5 font-serif text-xl text-[#332824]">
                    Aucun message
                  </h3>
                  <p className="mt-2 text-sm text-[#75665F]">
                    Les messages laissés par vos invités apparaîtront ici.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {messages.map((message) => {
                    const guestName =
                      message.guests?.name?.trim() || "Un invité";

                    return (
                      <article
                        key={message.id}
                        className="rounded-2xl border border-[#E8DAD2] bg-white p-6 shadow-sm transition hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F8E9E2] font-semibold text-[#9E4F38]">
                              {guestName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-medium text-[#332824]">
                                {guestName}
                              </h3>
                              <p className="mt-0.5 text-xs text-[#928982]">
                                Message pour les mariés
                              </p>
                            </div>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium ${
                              message.is_published
                                ? "bg-green-50 text-green-700"
                                : "bg-[#F8E9E2] text-[#9E4F38]"
                            }`}
                          >
                            {message.is_published
                              ? "✓ Publié"
                              : "En attente"}
                          </span>
                        </div>

                        <div className="mt-5 rounded-xl bg-[#FAF7F3] p-5">
                          <p className="text-sm leading-7 text-[#75665F]">
                            « {message.message || "Aucun message"} »
                          </p>
                        </div>

                        <p className="mt-4 text-xs text-[#928982]">
                          {message.created_at
                            ? new Date(message.created_at).toLocaleDateString(
                                "fr-FR",
                                {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                }
                              )
                            : ""}
                        </p>

                        <div className="mt-5">
                          <button
                            type="button"
                            onClick={() =>
                              handlePublishMessage(
                                message.id,
                                !message.is_published
                              )
                            }
                            className={`w-full rounded-full px-5 py-3 text-xs font-medium transition ${
                              message.is_published
                                ? "border border-[#DED3CC] bg-white text-[#75665F] hover:border-[#C66A4A] hover:text-[#C66A4A]"
                                : "bg-[#C66A4A] text-white hover:bg-[#9E4F38]"
                            }`}
                          >
                            {message.is_published
                              ? "Masquer le message"
                              : "✓ Publier le message"}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ÉVÉNEMENT */}
          {activeMenu === "event" && (
            <div className="space-y-6">
              <section>
                <h2 className="font-serif text-3xl text-[#332824]">
                  Informations du mariage
                </h2>
                <p className="mt-2 text-sm text-[#75665F]">
                  Les informations principales de votre grand jour.
                </p>
              </section>

              <div className="grid gap-6 md:grid-cols-2">
                <InfoCard
                  title="Mariés"
                  value="Axel & Améline"
                  description="Les futurs mariés"
                />
                <InfoCard
                  title="Date"
                  value="14 Novembre 2026"
                  description="Date du mariage"
                />
                <InfoCard
                  title="Cérémonie"
                  value="Mairie du Plateau"
                  description="Horaire : À définir"
                />
                <InfoCard
                  title="Réception"
                  value="À définir"
                  description="Lieu et horaire à confirmer"
                />
              </div>

              <div className="rounded-2xl bg-[#C66A4A] p-8 text-white">
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                  Notre citation
                </p>
                <p className="mt-4 font-serif text-3xl">
                  “L'amour est plus grand que tout”
                </p>
              </div>
            </div>
          )}

          {/* PARAMÈTRES */}
          {activeMenu === "settings" && (
            <div className="max-w-3xl space-y-6">
              <section>
                <h2 className="font-serif text-3xl text-[#332824]">
                  Paramètres
                </h2>
                <p className="mt-2 text-sm text-[#75665F]">
                  Configurez les informations de votre invitation.
                </p>
              </section>

              <section className="rounded-2xl border border-[#E8DAD2] bg-white p-6">
                <h3 className="font-serif text-xl text-[#332824]">
                  Informations générales
                </h3>
                <div className="mt-6 space-y-5">
                  <SettingRow label="Nom du marié" value="Axel" />
                  <SettingRow label="Nom de la mariée" value="Améline" />
                  <SettingRow
                    label="Date du mariage"
                    value="14 Novembre 2026"
                  />
                  <SettingRow
                    label="Couleur principale"
                    value="Terracotta"
                  />
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/* COMPOSANTS */

function StatusBadge({ status }) {
  const styles = {
    Présent: "bg-[#E9F5ED] text-[#3F7A51]",
    Présente: "bg-[#E9F5ED] text-[#3F7A51]",
    Absent: "bg-[#F4E7E4] text-[#9E4F38]",
    "En attente": "bg-[#F8E9E2] text-[#9E4F38]",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-medium ${
        styles[status] || "bg-[#FAF7F3] text-[#75665F]"
      }`}
    >
      {status}
    </span>
  );
}

function DistributionBar({ label, value, total }) {
  const percentage =
    total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-[#332824]">
          {label}
        </span>
        <span className="text-xs text-[#75665F]">
          {value} invités
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#F1E5DE]">
        <div
          className="h-full rounded-full bg-[#C66A4A]"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function InfoCard({ title, value, description }) {
  return (
    <div className="rounded-2xl border border-[#E8DAD2] bg-white p-6">
      <p className="text-xs uppercase tracking-[0.15em] text-[#75665F]">
        {title}
      </p>
      <p className="mt-3 font-serif text-2xl text-[#332824]">{value}</p>
      <p className="mt-2 text-sm text-[#928982]">{description}</p>
    </div>
  );
}

function SettingRow({ label, value }) {
  return (
    <div className="flex flex-col gap-2 border-b border-[#F1E5DE] pb-5 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-[#75665F]">{label}</span>
      <span className="font-medium text-[#332824]">{value}</span>
    </div>
  );
}

function MessageStat({ label, value, description, accent, success }) {
  const valueClass = success
    ? "text-green-700"
    : accent
      ? "text-[#C66A4A]"
      : "text-[#332824]";

  return (
    <div className="rounded-2xl border border-[#E8DAD2] bg-white p-5">
      <p className="text-xs uppercase tracking-[0.15em] text-[#928982]">
        {label}
      </p>
      <p className={`mt-2 font-serif text-3xl ${valueClass}`}>{value}</p>
      <p className="mt-1 text-xs text-[#75665F]">{description}</p>
    </div>
  );
}