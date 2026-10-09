"use client";

import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

const WEDDING_DATE = new Date("2026-11-14T15:00:00+00:00").getTime();

export default function HomePage() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    document.title = "Axel & Améline | Notre mariage";
    
    function updateCountdown() {
      const now = new Date().getTime();
      const distance = WEDDING_DATE - now;

      if (distance <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (distance / (1000 * 60 * 60)) % 24
        ),
        minutes: Math.floor(
          (distance / (1000 * 60)) % 60
        ),
        seconds: Math.floor(
          (distance / 1000) % 60
        ),
      });
    }

    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  // Récupération des messages publiés
  useEffect(() => {
    async function loadMessages() {
      const { data, error } = await supabase
        .from("guestbook_messages")
        .select(`
          id,
          message,
          created_at,
          guests (
            name
          )
        `)
        .eq("is_published", true)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Erreur lors du chargement des messages :",
          error
        );

        setLoadingMessages(false);
        return;
      }

      setMessages(data || []);
      setLoadingMessages(false);
    }

    loadMessages();
  }, []);

  return (
    <main className="bg-[#FAF7F3] text-[#332824]">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <header className="fixed left-0 right-0 top-0 z-50">
        <div className="mx-auto max-w-7xl px-5 py-5 md:px-8">
          <div className="flex items-center justify-between rounded-full border border-white/20 bg-[#332824]/40 px-5 py-3 backdrop-blur-md">
            {/* LOGO */}
            <NavLink
              href="/"
              className="font-serif text-lg tracking-[0.25em] text-white"
            >
              Axel & Améline
            </NavLink>

            {/* DESKTOP NAV */}
            <nav className="hidden items-center gap-8 md:flex">
              <NavLink href="#histoire">
                Notre histoire
              </NavLink>

              <NavLink href="#grand-jour">
                Le grand jour
              </NavLink>

              <NavLink href="#menu">
                Menu
              </NavLink>

              <NavLink href="#galerie">
                Galerie
              </NavLink>

              <NavLink href="#message">
                Livre d'Or
              </NavLink>

              <Link
                href="/rsvp"
                className="rounded-full bg-[#C66A4A] px-5 py-2.5 text-xs font-medium tracking-wide text-white transition hover:bg-[#9E4F38]"
              >
                RSVP
              </Link>
            </nav>

            {/* MOBILE BUTTON */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white md:hidden"
              aria-label="Menu"
            >
              {menuOpen ? "×" : "☰"}
            </button>
          </div>

          {/* MOBILE MENU */}
          {menuOpen && (
            <div className="mt-2 rounded-2xl border border-white/20 bg-[#332824]/95 p-5 backdrop-blur-md md:hidden">
              <nav className="flex flex-col gap-4">
                <MobileNavLink
                  href="#histoire"
                  onClick={() => setMenuOpen(false)}
                >
                  Notre histoire
                </MobileNavLink>

                <MobileNavLink
                  href="#grand-jour"
                  onClick={() => setMenuOpen(false)}
                >
                  Le grand jour
                </MobileNavLink>

                <MobileNavLink
                  href="#menu"
                  onClick={() => setMenuOpen(false)}
                >
                  Le menu
                </MobileNavLink>

                <MobileNavLink
                  href="#galerie"
                  onClick={() => setMenuOpen(false)}
                >
                  Galerie
                </MobileNavLink>

                <MobileNavLink
                  href="#message"
                  onClick={() => setMenuOpen(false)}
                >
                  Le livre d'Or
                </MobileNavLink>

                <Link
                  href="/rsvp"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-full bg-[#C66A4A] px-5 py-3 text-center text-sm text-white"
                >
                  Confirmer ma présence
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#332824]">
        {/* IMAGE */}
        <div className="absolute inset-0">
          <Image
            src="/images/axel-ameline.png"
            alt="Axel et Améline"
            fill
            priority
            className="object-cover"
          />

          <div className="absolute inset-0 bg-[#332824]/55" />

          <div className="absolute inset-0 bg-gradient-to-b from-[#332824]/30 via-[#332824]/35 to-[#332824]/80" />
        </div>

        {/* DECORATION */}
        <div className="absolute left-8 top-32 h-20 w-20 rounded-full border border-[#D99072]/40 md:left-16" />

        <div className="absolute bottom-24 right-8 h-28 w-28 rounded-full border border-[#D99072]/30 md:right-16" />

        {/* CONTENT */}
        <div className="relative z-10 px-6 pt-20 text-center text-white">
          <p className="mb-6 text-xs uppercase tracking-[0.5em] text-[#F1C5B4]">
            Nous nous marions
          </p>

          <h1 className="font-serif text-6xl leading-none md:text-8xl lg:text-9xl">
            Axel
          </h1>

          <div className="my-4 flex items-center justify-center gap-4 md:my-5">
            <span className="h-px w-10 bg-[#D99072]" />

            <span className="font-serif text-3xl text-[#D99072]">
              &
            </span>

            <span className="h-px w-10 bg-[#D99072]" />
          </div>

          <h1 className="font-serif text-6xl leading-none md:text-8xl lg:text-9xl">
            Améline
          </h1>

          <p className="mt-8 text-sm uppercase tracking-[0.35em] text-white/85">
            14 Novembre 2026
          </p>

          <p className="mt-3 text-sm text-white/70">
            Mairie du Plateau
          </p>

          <div className="mx-auto mt-7 h-px w-16 bg-[#C66A4A]" />

          <p className="mx-auto mt-6 max-w-md font-serif text-lg italic text-white/85 md:text-xl">
            « L'amour est plus grand que tout »
          </p>

          <Link
            href="/rsvp"
            className="mt-9 inline-flex rounded-full bg-[#C66A4A] px-7 py-3.5 text-sm font-medium text-white shadow-lg shadow-black/10 transition hover:bg-[#9E4F38]"
          >
            Confirmer ma présence
          </Link>

          {/* COUNTDOWN */}
          <div className="mx-auto mt-14 grid max-w-md grid-cols-4 gap-3">
            <CountdownItem
              value={timeLeft.days}
              label="Jours"
            />

            <CountdownItem
              value={timeLeft.hours}
              label="Heures"
            />

            <CountdownItem
              value={timeLeft.minutes}
              label="Minutes"
            />

            <CountdownItem
              value={timeLeft.seconds}
              label="Secondes"
            />
          </div>
        </div>

        {/* SCROLL */}
        <a
          href="#intro"
          className="absolute bottom-7 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.3em] text-white/60 transition hover:text-white"
        >
          Découvrir
        </a>
      </section>

      {/* =====================================================
          INTRO
      ====================================================== */}
      <section
        id="intro"
        className="px-6 py-24 md:py-32"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-[#C66A4A]">
            Une nouvelle aventure
          </p>

          <h2 className="mt-5 font-serif text-4xl leading-tight md:text-6xl">
            Deux histoires,
            <br />
            un même chemin.
          </h2>

          <div className="mx-auto mt-7 h-px w-16 bg-[#D99072]" />

          <p className="mx-auto mt-7 max-w-2xl text-sm leading-8 text-[#75665F] md:text-base">
            Après avoir partagé tant de moments, de sourires et de rêves,
            nous avons choisi d'écrire ensemble le plus beau des chapitres.
            Nous serions heureux de vous avoir à nos côtés pour célébrer
            notre union.
          </p>
        </div>
      </section>

      {/* =====================================================
          HISTOIRE
      ====================================================== */}
      <section
        id="histoire"
        className="overflow-hidden bg-[#F1E5DE] px-6 py-20 md:py-28"
      >
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2 md:gap-20">
          {/* IMAGE */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
            <Image
              src="/images/story.png"
              alt="Axel et Améline"
              fill
              className="object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#332824]/20 to-transparent" />
          </div>

          {/* TEXT */}
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[#9E4F38]">
              Notre histoire.
            </p>

            <h2 className="mt-5 font-serif text-4xl md:text-6xl">
              Une histoire
              <br />
              qui continue...
            </h2>

            <div className="mt-7 h-px w-16 bg-[#C66A4A]" />

            <p className="mt-7 text-sm leading-8 text-[#75665F]">
              Certaines rencontres changent une vie. La nôtre a commencé
              par une rencontre et s'est transformée au fil du temps en
              une histoire remplie de complicité, de confiance et d'amour.
            </p>

            <p className="mt-5 text-sm leading-8 text-[#75665F]">
              Aujourd'hui, nous avons choisi de nous dire « oui » et de
              commencer ensemble une nouvelle aventure.
            </p>

            <p className="mt-8 font-serif text-xl italic text-[#9E4F38]">
              Axel & Améline
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          LE GRAND JOUR
      ====================================================== */}
      <section
        id="grand-jour"
        className="px-6 py-24 md:py-32"
      >
        <div className="mx-auto max-w-6xl">

          {/* INTRO */}
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-[#C66A4A]">
              Le grand jour
            </p>

            <h2 className="mt-5 font-serif text-4xl md:text-6xl">
              Rendez-vous le 14 novembre 2026
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#75665F]">
              Nous avons hâte de vivre cette journée entourés des personnes
              qui comptent pour nous.
            </p>
          </div>

          {/* PROGRAMME */}
          <div className="mt-14 grid gap-6 md:grid-cols-3">

            <EventCard
              number="01"
              title="Mariage civil"
              time="12h00"
              location="Mairie du Plateau"
            />

            <EventCard
              number="02"
              title="Bénédiction nuptiale"
              time="14h00"
              location={
                <>
                  Paroisse Saint Matthieu Cité Verte
                </>
              }
            />

            <EventCard
              number="03"
              title="Réception"
              time="16h00"
              location="Espace Événementiel HORIZON"
            />

          </div>
        </div>
      </section>

        {/* =====================================================
          LE MENU
      ====================================================== */}
      <section
        id="menu"
        className="bg-[#F1E5DE] px-6 py-24 sm:px-10 lg:px-20"
      >
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C66A4A]">
              Pour vous régaler
            </p>

            <h2 className="mt-3 font-serif text-4xl text-[#332824] sm:text-5xl">
              Le menu du jour J
            </h2>

            <div className="mx-auto mt-5 h-px w-16 bg-[#C66A4A]" />

            <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-[#75665F]">
              Parce que cette journée se célèbre aussi autour d'une belle table,
              nous avons imaginé un menu à partager avec vous.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            <MenuCard
              icon="🥂"
              title="Cocktail"
              items={[
                "Assortiment de bouchées",
                "Cocktails & boissons fraîches",
                "Jus de fruits naturels",
              ]}
            />

            <MenuCard
              icon="🍽️"
              title="Entrée"
              items={[
                "À définir",
                "À définir",
              ]}
            />

            <MenuCard
              icon="🍲"
              title="Plat principal"
              items={[
                "À définir",
                "Garnitures & accompagnements",
              ]}
            />

            <MenuCard
              icon="🍰"
              title="Dessert"
              items={[
                "Pièce montée",
                "Desserts gourmands",
                "Fruits frais",
              ]}
            />
          </div>

          <p className="mt-10 text-center font-serif text-lg italic text-[#9E4F38]">
            Un repas partagé, des souvenirs pour toujours.
          </p>
        </div>
      </section>

      {/* =====================================================
          CITATION
      ====================================================== */}
      {/*
      <section className="bg-[#C66A4A] px-6 py-24 text-center text-white md:py-32">
        <div className="mx-auto max-w-3xl">
          <span className="font-serif text-5xl text-[#F3CDBE]">
            “
          </span>

          <p className="mt-2 font-serif text-3xl leading-relaxed md:text-5xl">
            L'amour est plus grand que tout
          </p>

          <div className="mx-auto mt-8 h-px w-12 bg-white/50" />

          <p className="mt-5 text-xs uppercase tracking-[0.35em] text-white/70">
            Axel & Améline
          </p>
        </div>
      </section>
      */
      }
      {/* =====================================================
      {/* =====================================================
          CITATIONS BIBLIQUES
      ====================================================== */}
      <section className="bg-[#C66A4A] px-6 py-24 sm:px-10 lg:px-20">
        <div className="mx-auto max-w-6xl">

          {/* Titre */}
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#F8E9E2]">
              La parole qui nous unit
            </p>

            <h2 className="mt-3 font-serif text-4xl text-white sm:text-5xl">
              Quelques mots pour notre union
            </h2>

            <div className="mx-auto mt-5 h-px w-16 bg-[#F8E9E2]" />
          </div>

          {/* Citations Axel & Améline */}
          <div className="mt-14 grid gap-8 md:grid-cols-2">

            {/* Citation Axel */}
            <div className="relative rounded-3xl bg-[#FFFDFC] px-7 py-9 text-center shadow-lg">
              <div className="absolute left-1/2 top-0 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#F8E9E2] text-xl text-[#C66A4A]">
                “
              </div>

              <p className="font-serif text-xl leading-8 text-[#4A3B35]">
                « Maris, aimez vos femmes comme le Christ a aimé l’Église. »
              </p>

              <div className="mx-auto mt-6 h-px w-10 bg-[#C66A4A]" />

              <p className="mt-4 text-sm font-medium uppercase tracking-[0.2em] text-[#C66A4A]">
                Axel
              </p>

              <p className="mt-1 text-xs text-[#928982]">
                Éphésiens 5, 25
              </p>
            </div>

            {/* Citation Améline */}
            <div className="relative rounded-3xl bg-[#FFFDFC] px-7 py-9 text-center shadow-lg">
              <div className="absolute left-1/2 top-0 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#F8E9E2] text-xl text-[#C66A4A]">
                “
              </div>

              <p className="font-serif text-xl leading-8 text-[#4A3B35]">
                « Je suis à mon bien-aimé, et mon bien-aimé est à moi. »
              </p>

              <div className="mx-auto mt-6 h-px w-10 bg-[#C66A4A]" />

              <p className="mt-4 text-sm font-medium uppercase tracking-[0.2em] text-[#C66A4A]">
                Améline
              </p>

              <p className="mt-1 text-xs text-[#928982]">
                Cantique des Cantiques 6, 3
              </p>
            </div>

          </div>

          {/* Citation principale actuelle */}
          <div className="mx-auto mt-16 max-w-3xl text-center">

            <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-2xl text-white">
              ♡
            </div>

            <blockquote className="font-serif text-2xl leading-10 text-white sm:text-3xl">
              « L’amour est patient, l’amour est serviable…
               il espère tout, il endure tout. »
            </blockquote>

            <div className="mx-auto mt-6 h-px w-12 bg-[#F8E9E2]" />

            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#F8E9E2]">
              1 Corinthiens 13, 4-7
            </p>

          </div>

        </div>
      </section>

      {/* =====================================================
          GALERIE
      ====================================================== */}
      <section
        id="galerie"
        className="bg-[#FAF7F3] px-6 py-24 md:py-32"
      >
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-[#C66A4A]">
              Quelques souvenirs
            </p>

            <h2 className="mt-5 font-serif text-4xl md:text-6xl">
              Notre galerie
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
            <GalleryImage
              src="/images/gallery-1.jpg"
              alt="Axel et Améline"
              className="aspect-[3/4]"
            />

            <GalleryImage
              src="/images/gallery-2.jpg"
              alt="Axel et Améline"
              className="aspect-[3/4]"
            />

            <GalleryImage
              src="/images/gallery-3.jpg"
              alt="Axel et Améline"
              className="aspect-[3/4]"
            />

            <GalleryImage
              src="/images/gallery-4.jpg"
              alt="Axel et Améline"
              className="aspect-[3/4]"
            />

            <GalleryImage
              src="/images/gallery-5.jpg"
              alt="Axel et Améline"
              className="aspect-[3/4]"
            />

            <GalleryImage
              src="/images/gallery-6.jpg"
              alt="Axel et Améline"
              className="aspect-[3/4]"
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          RSVP CTA
      ====================================================== */}
      <section className="bg-[#332824] px-6 py-24 text-center text-white md:py-32">
        <div className="mx-auto max-w-2xl">
          <p className="text-xs uppercase tracking-[0.4em] text-[#D99072]">
            Nous espérons vous compter parmi nous
          </p>

          <h2 className="mt-5 font-serif text-4xl md:text-6xl">
            Serez-vous des nôtres ?
          </h2>

          <p className="mx-auto mt-6 max-w-lg text-sm leading-7 text-white/65">
            Votre présence rendra cette journée encore plus spéciale.
            Merci de confirmer votre présence.
          </p>

          <Link
            href="/rsvp"
            className="mt-9 inline-flex rounded-full bg-[#C66A4A] px-8 py-4 text-sm font-medium transition hover:bg-[#9E4F38]"
          >
            Confirmer ma présence
          </Link>
        </div>
      </section>

      
      {/* =====================================================
          LIVRE D'OR
      ====================================================== */}

      <section
        id="messages"
        className="bg-[#F1E5DE] px-6 py-24 sm:px-10 lg:px-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C66A4A]">
              Vos mots nous touchent
            </p>

            <h2 className="mt-3 font-serif text-4xl text-[#332824] sm:text-5xl">
              Vos mots doux
            </h2>

            <div className="mx-auto mt-5 h-px w-16 bg-[#C66A4A]" />

            <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-[#75665F]">
              Découvrez les petits mots laissés par notre famille et nos amis
              pour accompagner ce merveilleux moment.
            </p>
          </div>
          
          {/* Messages venant de Supabase */}
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {loadingMessages ? (
              <div className="col-span-full py-10 text-center">
                <p className="text-sm text-[#75665F]">
                  Chargement des messages...
                </p>
              </div>
            ) : messages.length === 0 ? (
              <div className="col-span-full py-10 text-center">
                <p className="font-serif text-xl text-[#332824]">
                  Soyez les premiers à laisser un petit mot 💕
                </p>

                <p className="mt-2 text-sm text-[#75665F]">
                  Vos messages apparaîtront ici après validation.
                </p>
              </div>
            ) : (
              messages.map((item) => (
                <GuestMessage
                  key={item.id}
                  name={item.guests?.name || "Un invité"}
                  message={item.message}
                  onClick={() => setSelectedMessage(item)}
                />
              ))
            )}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/rsvp"
              className="inline-flex rounded-full bg-[#C66A4A] px-7 py-3.5 text-sm font-medium text-white transition hover:bg-[#9E4F38]"
            >
              Laisser un message
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          MODALE MESSAGE INVITÉ
      ===================================================== */}
      {selectedMessage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm"
          onClick={() => setSelectedMessage(null)}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-[#FFFDFC] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Barre terracotta */}
            <div className="h-2 shrink-0 bg-[#C66A4A]" />

            {/* Bouton fermer */}
            <button
              type="button"
              onClick={() => setSelectedMessage(null)}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#F8E9E2] text-xl text-[#75665F] transition hover:bg-[#EED8CE]"
              aria-label="Fermer"
            >
              ×
            </button>

            {/* CONTENU SCROLLABLE */}
            <div className="overflow-y-auto px-6 py-8 sm:px-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F8E9E2]">
                <span className="text-2xl text-[#C66A4A]">♡</span>
              </div>

              <div className="mt-5 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C66A4A]">
                  Livre d'or
                </p>

                <h2 className="mt-2 font-serif text-2xl text-[#332824]">
                  Un petit mot pour Axel & Améline
                </h2>
              </div>

              {/* Message */}
              <div className="mt-7 rounded-2xl bg-[#F1E5DE] px-6 py-7">
                <p className="whitespace-pre-line break-words font-serif text-lg leading-8 text-[#4A3B35]">
                  « {selectedMessage.message} »
                </p>
              </div>

              {/* Auteur */}
              <div className="mt-6 text-center">
                <p className="font-medium text-[#332824]">
                  {selectedMessage.guests?.name || "Un invité"}
                </p>

                <p className="mt-1 text-xs text-[#928982]">
                  Avec tout notre amour ♡
                </p>
              </div>

              {/* Bouton */}
              <div className="mt-7 pb-2 text-center">
                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="rounded-full bg-[#C66A4A] px-7 py-3 text-sm font-medium text-white transition hover:bg-[#9E4F38]"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <footer className="bg-[#FAF7F3] px-6 py-12 text-center">
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

/* =========================================================
   COMPONENTS
========================================================= */

function NavLink({ href, children }) {
  return (
    <a
      href={href}
      className="text-xs text-white/80 transition hover:text-white"
    >
      {children}
    </a>
  );
}

function MobileNavLink({ href, children, onClick }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="text-sm text-white/80 transition hover:text-white"
    >
      {children}
    </a>
  );
}

function CountdownItem({ value, label }) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/10 px-2 py-3 backdrop-blur-sm">
      <p className="font-serif text-2xl md:text-3xl">
        {String(value).padStart(2, "0")}
      </p>

      <p className="mt-1 text-[9px] uppercase tracking-[0.15em] text-white/55">
        {label}
      </p>
    </div>
  );
}

function EventCard({
  number,
  title,
  time,
  location,
}) {
  return (
    <div className="group rounded-2xl border border-[#E8DAD2] bg-white p-7 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#C66A4A]/10 md:p-9">
      <div className="flex items-start justify-between">
        <span className="font-serif text-3xl text-[#D99072]">
          {number}
        </span>

        <span className="text-[#C66A4A]">♡</span>
      </div>

      <h3 className="mt-10 font-serif text-3xl">
        {title}
      </h3>

      <div className="mt-6 space-y-3 text-sm text-[#75665F]">
        <p>
          <span className="mr-2 text-[#C66A4A]">◷</span>
          {time}
        </p>

        <p>
          <span className="mr-2 text-[#C66A4A]">⌖</span>
          {location}
        </p>
      </div>
    </div>
  );
}

function GalleryImage({ src, alt, className }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-[#E8DAD2] ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition duration-700 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-[#9E4F38]/0 transition group-hover:bg-[#9E4F38]/10" />
    </div>
  );
}

function MenuCard({ icon, title, items }) {
  return (
    <div className="group rounded-3xl border border-[#E8DAD2] bg-white p-7 text-center shadow-[0_10px_40px_rgba(51,40,36,0.04)] transition hover:-translate-y-1 hover:shadow-[0_15px_45px_rgba(51,40,36,0.08)]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F8E9E2] text-2xl">
        {icon}
      </div>

      <h3 className="mt-5 font-serif text-2xl text-[#332824]">
        {title}
      </h3>

      <div className="mx-auto my-4 h-px w-10 bg-[#D99072]" />

      <div className="space-y-2">
        {items.map((item, index) => (
          <p
            key={index}
            className="text-sm leading-6 text-[#75665F]"
          >
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function GuestMessage({ name, message, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left"
    >
      <div className="h-full rounded-2xl border border-[#E8DAD2] bg-[#FFFDFC] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        {/* Avatar */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F8E9E2] font-serif text-lg text-[#C66A4A]">
            {(name || "?").charAt(0).toUpperCase()}
          </div>

          <div>
            <p className="font-medium text-[#332824]">
              {name || "Un invité"}
            </p>

            <p className="text-xs text-[#928982]">
              Un mot pour les mariés
            </p>
          </div>
        </div>

        {/* Aperçu du message */}
        <p className="mt-5 line-clamp-3 text-sm leading-7 text-[#75665F]">
          “{message}”
        </p>

        {/* Lire */}
        <div className="mt-5 flex items-center text-xs font-semibold text-[#C66A4A]">
          <span>Lire le message</span>

          <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </div>
      </div>
    </button>
  );
}