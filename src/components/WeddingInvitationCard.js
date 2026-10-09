
"use client";

import { QRCodeSVG } from "qrcode.react";
import { useRef, useState } from "react";
import { toPng } from "html-to-image";

export default function WeddingInvitationCard({
  guest,
  numberOfGuests = 0,
}) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  if (!guest) return null;

  const siteUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://mywedding.vercel.app";

  const qrUrl = `${siteUrl}/check-in/${guest.invitation_code}`;

  const totalPeople = 1 + Number(numberOfGuests || 0);

  const downloadCard = async () => {
    if (!cardRef.current) return;

    try {
      setDownloading(true);

      const element = cardRef.current;

      const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "#FFFDFC",
      });

      const link = document.createElement("a");
      link.download = `Invitation-Axel-Ameline-${guest.invitation_code}.png`;
      link.href = dataUrl;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erreur téléchargement carte :", error);
      alert("Impossible de télécharger la carte.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="w-full min-w-0">

      {/* CARTE D'INVITATION */}
      <div
        ref={cardRef}
        className="mx-auto w-full max-w-[300px] overflow-hidden rounded-2xl bg-[#FFFDFC] shadow-sm"
      >
        {/* EN-TÊTE */}
        <div className="relative bg-[#C66A4A] px-4 py-5 text-center text-white">
          <div className="absolute left-3 top-3 text-lg opacity-40">✦</div>
          <div className="absolute right-3 top-3 text-lg opacity-40">✦</div>

          <p className="text-[9px] uppercase tracking-[0.25em] text-[#F8E9E2]">
            Invitation personnelle
          </p>

          <h2 className="mt-2 font-serif text-2xl">
            Axel <span className="text-[#F8E9E2]">&</span> Améline
          </h2>

          <div className="mx-auto mt-3 h-px w-10 bg-[#F8E9E2]" />

          <p className="mt-3 text-[9px] uppercase tracking-[0.2em] text-[#F8E9E2]">
            Notre grand jour
          </p>

          <p className="mt-1 font-serif text-lg">
            14 novembre 2026
          </p>
        </div>

        {/* INFORMATIONS */}
        <div className="px-4 py-4 text-center">
          <p className="text-[9px] leading-4 text-[#928982]">
            Nous avons le plaisir de vous compter parmi nous
          </p>

          <h3 className="mt-2 break-words font-serif text-xl text-[#332824]">
            {guest.name}
          </h3>

          <div className="mx-auto mt-2 h-px w-8 bg-[#D99072]" />

          <p className="mt-2 text-xs text-[#75665F]">
            {totalPeople === 1
              ? "1 personne"
              : `${totalPeople} personnes`}
          </p>

          {/* QR CODE */}
          <div className="mx-auto mt-4 flex w-fit rounded-xl border border-[#E8DAD2] bg-white p-2">
            <QRCodeSVG
              value={qrUrl}
              size={120}
              level="H"
              bgColor="#FFFFFF"
              fgColor="#332824"
            />
          </div>

          <p className="mt-2 text-[9px] text-[#928982]">
            Présentez ce QR Code à l'accueil
          </p>

          {/* CODE INVITATION */}
          <div className="mt-3 rounded-xl bg-[#F8E9E2] px-3 py-2">
            <p className="text-[8px] uppercase tracking-[0.2em] text-[#928982]">
              Code invitation
            </p>

            <p className="mt-1 font-mono text-base font-semibold tracking-[0.2em] text-[#9E4F38]">
              {guest.invitation_code}
            </p>
          </div>

          <p className="mt-3 font-serif text-sm italic text-[#C66A4A]">
            Avec tout notre amour
          </p>

          <p className="mt-1 text-[9px] text-[#928982]">
            Axel & Améline
          </p>
        </div>

        <div className="h-1.5 bg-[#C66A4A]" />
      </div>

      {/* TÉLÉCHARGEMENT */}
      <div className="mt-3 text-center">
        <button
          type="button"
          onClick={downloadCard}
          disabled={downloading}
          className="inline-flex max-w-full items-center justify-center rounded-full bg-[#C66A4A] px-4 py-2.5 text-xs font-medium text-white transition hover:bg-[#9E4F38] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {downloading
            ? "Préparation..."
            : "⬇ Télécharger mon invitation"}
        </button>

        <p className="mt-2 text-[10px] leading-4 text-[#928982]">
          Enregistrez votre invitation sur votre téléphone.
        </p>
      </div>
    </div>
  );
}
