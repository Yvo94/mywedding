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

  const qrUrl =
    `${siteUrl}/check-in/${guest.invitation_code}`;

  const downloadCard = async () => {
    if (!cardRef.current) return;

    try {
        setDownloading(true);

        const element = cardRef.current;

        // Dimensions réelles de la carte
        const width = element.scrollWidth*1.2;
        const height = element.scrollHeight;

        const dataUrl = await toPng(element, {
        cacheBust: true,

        // Force html-to-image à prendre toute la carte
        width: width,
        height: height,

        canvasWidth: width * 2,
        canvasHeight: height * 2,

        pixelRatio: 2,

        style: {
            width: `${width}px`,
            height: `${height}px`,
            maxWidth: "none",
            maxHeight: "none",
            overflow: "visible",
        },
        });

        const link = document.createElement("a");

        link.download =
        `Invitation-Axel-Ameline-${guest.invitation_code}.png`;

        link.href = dataUrl;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

    } catch (error) {
        console.error(
        "Erreur téléchargement carte :",
        error
        );

        alert(
        "Impossible de télécharger la carte."
        );

    } finally {
        setDownloading(false);
    }
    };

  const totalPeople =
    1 + Number(numberOfGuests || 0);

  return (
    <div className="mt-10">

      {/* =====================================================
          CARTE
      ====================================================== */}

      <div
        ref={cardRef}
        className="mx-auto w-full max-w-md overflow-hidden rounded-[2rem] bg-[#FFFDFC]"
        style={{
            width: "420px",
            minHeight: "820px",
            boxSizing: "border-box",
        }}
        >

        {/* HEADER */}
        <div className="relative bg-[#C66A4A] px-8 py-10 text-center text-white">

          <div className="absolute left-5 top-5 text-2xl opacity-40">
            ✦
          </div>

          <div className="absolute right-5 top-5 text-2xl opacity-40">
            ✦
          </div>

          <p className="text-[10px] uppercase tracking-[0.4em] text-[#F8E9E2]">
            Invitation personnelle
          </p>

          <h2 className="mt-5 font-serif text-4xl">
            Axel
            <span className="mx-2 text-[#F8E9E2]">&</span>
            Améline
          </h2>

          <div className="mx-auto mt-5 h-px w-12 bg-[#F8E9E2]" />

          <p className="mt-5 text-xs uppercase tracking-[0.3em] text-[#F8E9E2]">
            Notre grand jour
          </p>

          <p className="mt-3 font-serif text-2xl">
            14 novembre 2026
          </p>

        </div>

        {/* CONTENU */}
        <div className="px-7 py-8 text-center">

          <p className="text-xs uppercase tracking-[0.3em] text-[#928982]">
            Nous avons le plaisir de vous compter parmi nous
          </p>

          <h3 className="mt-4 font-serif text-3xl text-[#332824]">
            {guest.name}
          </h3>

          <div className="mx-auto mt-4 h-px w-10 bg-[#D99072]" />

          <p className="mt-4 text-sm text-[#75665F]">
            {totalPeople === 1
              ? "1 personne"
              : `${totalPeople} personnes`}
          </p>

          {/* QR CODE */}
          <div className="mx-auto mt-8 flex w-fit rounded-2xl border border-[#E8DAD2] bg-white p-4 shadow-sm">
            <QRCodeSVG
              value={qrUrl}
              size={190}
              level="H"
              bgColor="#FFFFFF"
              fgColor="#332824"
            />
          </div>

          <p className="mt-5 text-xs text-[#928982]">
            Présentez ce QR Code à l'accueil
          </p>

          {/* CODE */}
          <div className="mt-6 rounded-2xl bg-[#F8E9E2] px-5 py-4">

            <p className="text-[10px] uppercase tracking-[0.3em] text-[#928982]">
              Code invitation
            </p>

            <p className="mt-2 font-mono text-xl font-semibold tracking-[0.25em] text-[#9E4F38]">
              {guest.invitation_code}
            </p>

          </div>

          <p className="mt-7 font-serif text-lg italic text-[#C66A4A]">
            Avec tout notre amour
          </p>

          <p className="mt-2 text-xs text-[#928982]">
            Axel & Améline
          </p>

        </div>

        {/* FOOTER */}
        <div className="h-2 bg-[#C66A4A]" />

      </div>

      {/* =====================================================
          BOUTON DOWNLOAD
      ====================================================== */}

      <div className="mt-6 text-center">

        <button
          type="button"
          onClick={downloadCard}
          disabled={downloading}
          className="inline-flex items-center justify-center rounded-full bg-[#C66A4A] px-7 py-3.5 text-sm font-medium text-white shadow-lg shadow-[#C66A4A]/20 transition hover:bg-[#9E4F38] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {downloading
            ? "Préparation..."
            : "⬇ Télécharger ma carte"}
        </button>

        <p className="mt-3 text-xs text-[#928982]">
          Enregistrez votre invitation sur votre téléphone.
        </p>

      </div>

    </div>
  );
}