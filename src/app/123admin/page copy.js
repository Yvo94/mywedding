"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase"

/*
const guests = [
  {
    id: 1,
    name: "Jean Kouassi",
    relation: "Ami(e)",
    side: "Axel",
    guests: 2,
    status: "Présent",
    whatsapp: "+225 07 00 00 00 01",
  },
  {
    id: 2,
    name: "Marie Yao",
    relation: "Parent",
    side: "Améline",
    guests: 3,
    status: "Présente",
    whatsapp: "+225 07 00 00 00 02",
  },
  {
    id: 3,
    name: "Paul Koffi",
    relation: "Collègue",
    side: "Axel",
    guests: 1,
    status: "En attente",
    whatsapp: "+225 07 00 00 00 03",
  },
  {
    id: 4,
    name: "Sophie N'Guessan",
    relation: "Communauté religieuse",
    side: "Améline",
    guests: 2,
    status: "Présente",
    whatsapp: "+225 07 00 00 00 04",
  },
  {
    id: 5,
    name: "David Kouamé",
    relation: "Ami(e)",
    side: "Axel & Améline",
    guests: 1,
    status: "Absent",
    whatsapp: "+225 07 00 00 00 05",
  },
];


const messages = [
  {
    name: "Jean Kouassi",
    message:
      "Nous sommes très heureux de partager ce grand moment avec vous. Toutes nos félicitations !",
    date: "05 Oct. 2026",
  },
  {
    name: "Marie Yao",
    message:
      "Que votre union soit remplie de bonheur, de paix et de beaucoup d'amour.",
    date: "04 Oct. 2026",
  },
  {
    name: "Sophie N'Guessan",
    message:
      "Nous vous souhaitons une merveilleuse vie à deux. Félicitations aux futurs mariés !",
    date: "03 Oct. 2026",
  },
];
*/


const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: "▦" },
  { id: "guests", label: "Invités", icon: "♙" },
  { id: "messages", label: "Messages", icon: "✉" },
  { id: "event", label: "Événement", icon: "♡" },
  { id: "settings", label: "Paramètres", icon: "⚙" },
];

export default function AdminPage() {
  const [guests, setGuests] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tous");
  const [filterSide, setFilterSide] = useState("Tous");
  const [mobileMenu, setMobileMenu] = useState(false);

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
            message
          )
        `)
        .order("created_at", { ascending: false });

      if (guestsError) {
        console.error("Erreur lors du chargement des invités :", guestsError);
      } else {
        setGuests(guestsData || []);
      }

      const { data: messagesData, error: messagesError } = await supabase
        .from("guestbook_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (messagesError) {
        console.error("Erreur lors du chargement des messages :", messagesError);
      } else {
        setMessages(messagesData || []);
      }
    } catch (error) {
      console.error("Erreur dashboard :", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredGuests = useMemo(() => {
  return guests.filter((guest) => {
    const name = guest.name || "";
    const whatsapp = guest.whatsapp || "";
    const side = guest.side || "";
    const status = guest.rsvps?.[0]?.attendance || "En attente";

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

    const totalGuests = guests.length;

  const confirmedGuests = guests.filter(
    (guest) =>
      guest.rsvps?.[0]?.attendance === "Présent" ||
      guest.rsvps?.[0]?.attendance === "Présente"
  ).length;

  const absentGuests = guests.filter(
    (guest) => guest.rsvps?.[0]?.attendance === "Absent"
  ).length;

  const pendingGuests = guests.filter(
    (guest) =>
      !guest.rsvps?.length ||
      guest.rsvps?.[0]?.attendance === "En attente"
  ).length;

  const stats = [
    {
      label: "Invités",
      value: totalGuests,
      description: "Total des invités",
      icon: "♙",
    },
    {
      label: "Présents",
      value: confirmedGuests,
      description: "Confirmations reçues",
      icon: "✓",
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

  return (
    <div className="min-h-screen bg-[#FAF7F3] text-[#332824]">
      {/* =========================
          MOBILE HEADER
      ========================= */}
      <header className="fixed left-0 right-0 top-0 z-50 flex h-[72px] items-center justify-between border-b border-[#E8DAD2] bg-white px-5 lg:hidden">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C66A4A] text-sm font-semibold text-white">
            A&A
          </div>

          <div>
            <p className="font-serif text-lg text-[#332824]">
              Axel & Améline
            </p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#75665F]">
              Administration
            </p>
          </div>
        </Link>

        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E8DAD2] text-xl text-[#9E4F38]"
        >
          {mobileMenu ? "×" : "☰"}
        </button>
      </header>

      {/* =========================
          MOBILE MENU
      ========================= */}
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

      {/* =========================
          SIDEBAR
      ========================= */}
      <aside className="fixed bottom-0 left-0 top-0 hidden w-[250px] flex-col bg-[#C66A4A] text-white lg:flex">
        <div className="border-b border-white/20 px-7 py-7">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#C66A4A]">
              A&A
            </div>

            <div>
              <p className="font-serif text-xl">Axel & Améline</p>
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

      {/* =========================
          MAIN
      ========================= */}
      <main className="pt-[72px] lg:ml-[250px] lg:pt-0">
        {/* HEADER */}
        <header className="hidden h-[82px] items-center justify-between border-b border-[#E8DAD2] bg-white px-8 lg:flex">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#75665F]">
              Administration
            </p>

            <h1 className="mt-1 font-serif text-2xl text-[#332824]">
              {activeMenu === "dashboard" && "Tableau de bord"}
              {activeMenu === "guests" && "Gestion des invités"}
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

        {/* CONTENT */}
        <div className="px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
          {/* =========================
              DASHBOARD
          ========================= */}
          {activeMenu === "dashboard" && (
            <div className="space-y-8">
              {/* Welcome */}
              <section>
                <p className="text-sm text-[#75665F]">
                  Vue d'ensemble de votre mariage
                </p>

                <h2 className="mt-1 font-serif text-3xl text-[#332824]">
                  Bonjour Axel & Améline ♡
                </h2>
              </section>

              {/* Stats */}
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-[#E8DAD2] bg-white p-5 shadow-[0_8px_30px_rgba(51,40,36,0.04)]"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-[#75665F]">{stat.label}</p>

                        <p className="mt-2 font-serif text-4xl text-[#332824]">
                          {stat.value}
                        </p>
                      </div>

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F8E9E2] text-xl text-[#C66A4A]">
                        {stat.icon}
                      </div>
                    </div>

                    <p className="mt-4 text-xs text-[#928982]">
                      {stat.description}
                    </p>
                  </div>
                ))}
              </section>

              {/* Attendance overview */}
              <section className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-2xl border border-[#E8DAD2] bg-white p-6">
                  <div className="flex items-center justify-between">
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
                        78 / 120
                      </p>
                      <p className="text-xs text-[#928982]">
                        réponses positives
                      </p>
                    </div>
                  </div>

                  <div className="mt-7 h-3 overflow-hidden rounded-full bg-[#F1E5DE]">
                    <div
                      className="h-full rounded-full bg-[#C66A4A]"
                      style={{ width: "65%" }}
                    />
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-xl bg-[#F8E9E2] p-3">
                      <p className="text-xl font-semibold text-[#9E4F38]">
                        65%
                      </p>
                      <p className="mt-1 text-xs text-[#75665F]">Présents</p>
                    </div>

                    <div className="rounded-xl bg-[#FAF7F3] p-3">
                      <p className="text-xl font-semibold text-[#75665F]">
                        21%
                      </p>
                      <p className="mt-1 text-xs text-[#75665F]">Absents</p>
                    </div>

                    <div className="rounded-xl bg-[#FAF7F3] p-3">
                      <p className="text-xl font-semibold text-[#75665F]">
                        14%
                      </p>
                      <p className="mt-1 text-xs text-[#75665F]">En attente</p>
                    </div>
                  </div>
                </div>

                {/* Side distribution */}
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
                      value={42}
                      total={85}
                    />

                    <DistributionBar
                      label="Améline"
                      value={31}
                      total={85}
                    />

                    <DistributionBar
                      label="Axel & Améline"
                      value={12}
                      total={85}
                    />
                  </div>
                </div>
              </section>

              {/* Recent guests */}
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
                        <th className="px-6 py-4 font-medium">Personnes</th>
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
                            {guest.guests}
                          </td>

                          <td className="px-6 py-4">
                            <StatusBadge status={guest.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* =========================
              GUESTS
          ========================= */}
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

                  <button className="rounded-xl bg-[#C66A4A] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#9E4F38]">
                    + Ajouter un invité
                  </button>
                </div>

                {/* Filters */}
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
                    <option value="Axel & Améline">
                      Axel & Améline
                    </option>
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
                        <th className="px-6 py-4 font-medium">Personnes</th>
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
                            {guest.guests}
                          </td>

                          <td className="px-6 py-5">
                            <StatusBadge status={guest.status} />
                          </td>

                          <td className="px-6 py-5">
                            <button className="text-sm font-medium text-[#C66A4A] hover:text-[#9E4F38]">
                              Détails
                            </button>
                          </td>
                        </tr>
                      ))}

                      {filteredGuests.length === 0 && (
                        <tr>
                          <td
                            colSpan="6"
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

          {/* =========================
              MESSAGES
          ========================= */}
          {activeMenu === "messages" && (
            <div className="space-y-6">
              <section>
                <h2 className="font-serif text-3xl text-[#332824]">
                  Messages des invités
                </h2>

                <p className="mt-2 text-sm text-[#75665F]">
                  Retrouvez ici les petits mots laissés par vos invités.
                </p>
              </section>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {messages.map((message) => (
                  <article
                    key={message.name}
                    className="rounded-2xl border border-[#E8DAD2] bg-white p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F8E9E2] font-semibold text-[#9E4F38]">
                        {message.name.charAt(0)}
                      </div>

                      <span className="text-xs text-[#928982]">
                        {message.date}
                      </span>
                    </div>

                    <h3 className="mt-5 font-medium text-[#332824]">
                      {message.name}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-[#75665F]">
                      “{message.message}”
                    </p>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* =========================
              EVENT
          ========================= */}
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

          {/* =========================
              SETTINGS
          ========================= */}
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
                  <SettingRow
                    label="Nom du marié"
                    value="Axel"
                  />

                  <SettingRow
                    label="Nom de la mariée"
                    value="Améline"
                  />

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

/* =========================
   COMPONENTS
========================= */

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
  const percentage = Math.round((value / total) * 100);

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

      <p className="mt-3 font-serif text-2xl text-[#332824]">
        {value}
      </p>

      <p className="mt-2 text-sm text-[#928982]">
        {description}
      </p>
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