import dotenv from "dotenv";

// Next.js usa `.env.local`; `import "dotenv/config"` solo lee `.env` por defecto.
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const k = process.env.GOOGLE_MAPS_API_KEY?.trim();
if (!k) {
  console.error(
    "GOOGLE_MAPS_API_KEY no está definida.\n" +
      "  - Añádela en `.env.local` o `.env` en la raíz del proyecto.\n" +
      "  - Ejemplo: GOOGLE_MAPS_API_KEY=tu_clave_aqui",
  );
  process.exit(1);
}

const masked =
  k.length <= 10 ? `${k.slice(0, 2)}… (${k.length} caracteres)` : `${k.slice(0, 6)}…${k.slice(-4)} (${k.length} caracteres)`;
console.log("GOOGLE_MAPS_API_KEY cargada:", masked);
