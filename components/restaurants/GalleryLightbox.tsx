"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface GalleryLightboxProps {
  images: string[];
  restaurantName: string;
}

export function GalleryLightbox({ images, restaurantName }: GalleryLightboxProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const hasImages = images.length > 0;

  const close = () => setOpenIndex(null);
  const prev = () => {
    if (openIndex === null || images.length < 2) return;
    setOpenIndex((openIndex - 1 + images.length) % images.length);
  };
  const next = () => {
    if (openIndex === null || images.length < 2) return;
    setOpenIndex((openIndex + 1) % images.length);
  };

  useEffect(() => {
    if (openIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") prev();
      if (event.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openIndex, images.length]);

  useEffect(() => {
    if (openIndex === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [openIndex]);

  const onTouchStart = (x: number) => {
    setTouchStartX(x);
    setTouchEndX(x);
  };

  const onTouchMove = (x: number) => {
    setTouchEndX(x);
  };

  const onTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const delta = touchStartX - touchEndX;
    if (Math.abs(delta) > 60) {
      if (delta > 0) next();
      if (delta < 0) prev();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  if (!hasImages) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-zinc-900">Galería</h2>
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-600">
          Este perfil todavía no tiene imágenes adicionales.
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-zinc-900">Galería</h2>
          <p className="text-sm text-zinc-500">{images.length} fotos</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setOpenIndex(index)}
              className="group relative h-56 w-full overflow-hidden rounded-2xl text-left ring-1 ring-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-label={`Abrir foto ${index + 1} de ${images.length}`}
            >
              <Image
                src={image}
                alt={`Foto ${index + 1} de ${restaurantName}`}
                fill
                className="object-cover transition duration-500 group-hover:scale-[1.02]"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            </button>
          ))}
        </div>
      </section>

      {openIndex !== null ? (
        <div
          className="fixed inset-0 z-50 bg-zinc-950/90 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`Galería de ${restaurantName}`}
          onClick={close}
        >
          <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-3">
            <div className="flex items-center justify-between text-sm text-zinc-100">
              <span>
                {openIndex + 1} / {images.length}
              </span>
              <button
                type="button"
                onClick={close}
                className="rounded-lg border border-zinc-400/50 px-3 py-1.5 font-semibold hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                aria-label="Cerrar galería"
              >
                Cerrar
              </button>
            </div>

            <div
              className="relative min-h-0 flex-1 overflow-hidden rounded-2xl"
              onClick={(event) => event.stopPropagation()}
              onTouchStart={(event) => onTouchStart(event.touches[0]?.clientX ?? 0)}
              onTouchMove={(event) => onTouchMove(event.touches[0]?.clientX ?? 0)}
              onTouchEnd={onTouchEnd}
            >
              <Image
                src={images[openIndex]}
                alt={`Foto ${openIndex + 1} de ${restaurantName}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            {images.length > 1 ? (
              <div className="space-y-3" onClick={(event) => event.stopPropagation()}>
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={prev}
                    className="rounded-lg border border-zinc-400/50 px-4 py-2 font-semibold text-zinc-100 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    aria-label="Foto anterior"
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    className="rounded-lg border border-zinc-400/50 px-4 py-2 font-semibold text-zinc-100 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    aria-label="Siguiente foto"
                  >
                    Siguiente
                  </button>
                </div>

                <div className="overflow-x-auto pb-1">
                  <div className="flex min-w-max items-center gap-2">
                    {images.map((thumb, index) => {
                      const isActive = openIndex === index;
                      return (
                        <button
                          key={`${thumb}-thumb`}
                          type="button"
                          onClick={() => setOpenIndex(index)}
                          aria-label={`Ir a foto ${index + 1}`}
                          aria-current={isActive ? "true" : undefined}
                          className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg ring-2 transition ${
                            isActive
                              ? "ring-emerald-400"
                              : "ring-zinc-500/50 hover:ring-zinc-300"
                          } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500`}
                        >
                          <Image
                            src={thumb}
                            alt={`Miniatura ${index + 1} de ${restaurantName}`}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
