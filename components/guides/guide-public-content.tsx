import Image from "next/image";
import Link from "next/link";
import { getRestaurantBySlug } from "@/lib/restaurants";
import type { ResolvedGuidePage } from "@/lib/guides-data";
import { INSTAGRAM_HANDLE, INSTAGRAM_PROFILE_URL } from "@/lib/site-brand";

export async function GuidePublicContent({
  guide,
  otherGuides,
}: {
  guide: ResolvedGuidePage;
  otherGuides: { slug: string; title: string }[];
}) {
  const rows = await Promise.all(
    guide.entries.map(async (entry) => ({
      entry,
      restaurant: await getRestaurantBySlug(entry.restaurantSlug),
    })),
  );

  const visibleRows = rows.filter((r) => r.restaurant != null);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-12 px-4 py-10 sm:px-6">
      <header className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Guía editorial</p>
        <h1 className="text-3xl font-bold leading-tight text-zinc-900 sm:text-4xl">{guide.title}</h1>
        {guide.subtitle ? (
          <p className="max-w-2xl text-lg font-medium text-zinc-700">{guide.subtitle}</p>
        ) : null}
        {guide.intro ? (
          <p className="max-w-2xl text-lg leading-relaxed text-zinc-600">{guide.intro}</p>
        ) : null}
      </header>

      {visibleRows.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-10 text-center">
          <h2 className="text-lg font-semibold text-zinc-900">Estamos armando esta guía</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Aún no hay restaurantes enlazados en esta selección. Vuelve pronto o explora el listado general.
          </p>
          <Link
            href="/restaurantes"
            className="mt-4 inline-block text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Ver restaurantes
          </Link>
        </section>
      ) : (
        <ol className="space-y-8">
          {visibleRows.map(({ entry, restaurant }, index) => {
            if (!restaurant) return null;
            const { identity, media } = restaurant;
            const profileHref = `/restaurantes/${identity.slug}`;
            const cardTitle = entry.headline?.trim() || entry.label?.trim() || identity.name;
            const badgeLine = [entry.emoji, entry.label].filter(Boolean).join(" ");

            return (
              <li key={`${entry.restaurantSlug}-${entry.rank}`}>
                <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                  <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_minmax(0,280px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
                    <div className="space-y-4 p-6 sm:p-8">
                      <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
                          {index + 1}
                        </span>
                        {badgeLine ? (
                          <span className="font-medium text-zinc-700">{badgeLine}</span>
                        ) : null}
                      </div>
                      <h2 className="text-2xl font-semibold text-zinc-900">{cardTitle}</h2>
                      {entry.note ? (
                        <p className="max-w-xl whitespace-pre-wrap leading-7 text-zinc-600">{entry.note}</p>
                      ) : null}
                      <Link
                        href={profileHref}
                        className="inline-flex w-fit items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                      >
                        Ver restaurante
                      </Link>
                    </div>
                    <Link href={profileHref} className="relative block min-h-[220px] md:min-h-full">
                      <Image
                        src={media.hero}
                        alt={cardTitle}
                        fill
                        className="object-cover transition duration-500 hover:opacity-95"
                        sizes="(max-width: 768px) 100vw, 340px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/50 to-transparent md:bg-gradient-to-l" />
                    </Link>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      )}

      {otherGuides.length > 0 ? (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900">Otras guías que te pueden interesar</h2>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            {otherGuides.map((g) => (
              <Link
                key={g.slug}
                href={`/guias/${encodeURIComponent(g.slug)}`}
                className="font-semibold text-emerald-700 hover:text-emerald-800"
              >
                {g.title}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <footer className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-sm text-zinc-600">
        <p>
          Esta guía es una selección editorial: son lugares y platos que ya están en el sitio, pero la carta puede
          cambiar con el día o la temporada. Antes de salir, confirma por teléfono o WhatsApp. ¿Nos falta algo? Escríbenos
          en Instagram{" "}
          <a
            href={INSTAGRAM_PROFILE_URL}
            className="font-semibold text-emerald-700 hover:text-emerald-800"
            target="_blank"
            rel="noopener noreferrer"
          >
            @{INSTAGRAM_HANDLE}
          </a>
          .
        </p>
        <p className="mt-3">
          <Link href="/restaurantes" className="font-semibold text-emerald-700 hover:text-emerald-800">
            Ver todos los restaurantes
          </Link>
        </p>
      </footer>
    </main>
  );
}
