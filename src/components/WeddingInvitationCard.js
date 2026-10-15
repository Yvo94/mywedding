
"use client";

import { QRCodeSVG } from "qrcode.react";
import { useRef, useState } from "react";
import { toPng } from "html-to-image";



export default function WeddingInvitationCard({
  guest,
  numberOfGuests = 0,
}) {
  const exportRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  if (!guest) return null;

  const siteUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://mywedding-woad.vercel.app";

  const qrUrl = `${siteUrl}/check-in/${guest.invitation_code}`;
  const totalPeople = 1 + Number(numberOfGuests || 0);

  async function downloadCard() {
    if (!exportRef.current || downloading) return;

    try {
      setDownloading(true);

      const dataUrl = await toPng(exportRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "#FFFDFC",
      });

      const link = document.createElement("a");
      link.download = `Invitation-Axel-Ameline-${guest.invitation_code}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Erreur téléchargement carte :", error);
      alert("Impossible de télécharger la carte. Veuillez réessayer.");
    } finally {
      setDownloading(false);
    }
  }

  // Même contenu pour les deux rendus.
  function InvitationDesign({ compact = false }) {
    return (
      <div
        className={`overflow-hidden bg-[#FFFDFC] text-center ${
          compact ? "w-full rounded-2xl" : "w-[600px] rounded-[2rem]"
        }`}
      >
        <div
          className={`bg-[#C66A4A] text-white ${
            compact ? "px-3 py-4" : "px-10 py-12"
          }`}
        >
          <p
            className={`uppercase tracking-[0.3em] text-[#F8E9E2] ${
              compact ? "text-[8px]" : "text-xs"
            }`}
          >
            Invitation personnelle
          </p>

          <h2
            className={`font-serif ${
              compact ? "mt-2 text-xl" : "mt-6 text-5xl"
            }`}
          >
            Axel <span className="text-[#F8E9E2]">&</span> Améline
          </h2>

          <p
            className={`uppercase tracking-[0.2em] text-[#F8E9E2] ${
              compact ? "mt-2 text-[8px]" : "mt-5 text-sm"
            }`}
          >
            Notre grand jour
          </p>

          <p className={compact ? "mt-1 text-sm" : "mt-3 text-2xl"}>
            14 novembre 2026
          </p>
        </div>

        <div className={compact ? "px-3 py-4" : "px-10 py-10"}>
          <p
            className={`text-[#928982] ${
              compact ? "text-[9px]" : "text-sm"
            }`}
          >
            Nous avons le plaisir de vous compter parmi nous
          </p>

          <h3
            className={`break-words font-serif text-[#332824] ${
              compact ? "mt-2 text-xl" : "mt-5 text-4xl"
            }`}
          >
            {guest.name}
          </h3>

          <p
            className={`text-[#75665F] ${
              compact ? "mt-1 text-xs" : "mt-3 text-base"
            }`}
          >
            {totalPeople} {totalPeople > 1 ? "personnes" : "personne"}
          </p>

          <div
            className={`mx-auto flex w-fit rounded-xl border border-[#E8DAD2] bg-white ${
              compact ? "mt-3 p-2" : "mt-8 p-5"
            }`}
          >
            <QRCodeSVG
              value={qrUrl}
              size={compact ? 100 : 240}
              level="H"
              bgColor="#FFFFFF"
              fgColor="#332824"
            />
          </div>

          <p
            className={`text-[#928982] ${
              compact ? "mt-2 text-[9px]" : "mt-4 text-sm"
            }`}
          >
            Présentez ce QR Code à l'accueil
          </p>

          <div
            className={`rounded-xl bg-[#F8E9E2] ${
              compact ? "mt-3 px-2 py-2" : "mt-6 px-6 py-5"
            }`}
          >
            <p className={compact ? "text-[8px]" : "text-xs"}>
              CODE INVITATION
            </p>
            <p
              className={`break-all font-mono font-semibold tracking-widest text-[#9E4F38] ${
                compact ? "mt-1 text-sm" : "mt-3 text-2xl"
              }`}
            >
              {guest.invitation_code}
            </p>
          </div>

          <p
            className={`font-serif italic text-[#C66A4A] ${
              compact ? "mt-3 text-sm" : "mt-7 text-xl"
            }`}
          >
            Avec tout notre amour
          </p>
          <p className={compact ? "mt-1 text-[9px]" : "mt-2 text-sm"}>
            Axel & Améline
          </p>
        </div>

        <div className={compact ? "h-1.5 bg-[#C66A4A]" : "h-3 bg-[#C66A4A]"} />
      </div>
    );
  }

  return (
    <div className="mt-4">
      {/* RENDU ÉCRAN : compact */}
      <div className="mx-auto w-full max-w-[300px]">
        <InvitationDesign compact />
      </div>

      {/* RENDU EXPORT : grand, caché visuellement mais présent dans le DOM */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-[-10000px] top-0"
      >
        <div ref={exportRef}>
          <InvitationDesign />
        </div>
      </div>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={downloadCard}
          disabled={downloading}
          className="rounded-full bg-[#C66A4A] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#9E4F38] disabled:opacity-60"
        >
          {downloading ? "Préparation..." : "⬇ Télécharger mon invitation"}
        </button>
        <p className="mt-2 text-xs text-[#928982]">
          Enregistrez votre invitation sur votre téléphone.
        </p>
      </div>
    </div>
  );
}
