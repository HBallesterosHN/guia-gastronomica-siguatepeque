# Neon Postgres + Prisma

La app sigue sirviendo restaurantes desde `data/restaurants` si no hay base o si la consulta falla. Con `DATABASE_URL` apuntando a Neon, los registros con `status = "published"` se fusionan por `slug` y **tienen prioridad** sobre el mismo slug en archivos.

## Variables de entorno

### Base de datos

| Variable | Uso |
|----------|-----|
| `DATABASE_URL` | PostgreSQL (Neon). Usada por Prisma. |

### Auth.js (NextAuth v5)

| Variable | Uso |
|----------|-----|
| `AUTH_SECRET` | Secreto para firmar cookies/JWT. Genera uno largo y aleatorio; no lo compartas ni lo subas a git. |
| `AUTH_GOOGLE_ID` | Client ID de Google OAuth. |
| `AUTH_GOOGLE_SECRET` | Client secret de Google OAuth. |

En Vercel: Settings → Environment Variables. En local: `.env` / `.env.local`.

### Admin (bootstrap)

| Variable | Uso |
|----------|-----|
| `ADMIN_SECRET` | Clave para cookie httpOnly en `/admin` cuando aún no usas cuenta Google con `role = admin` en la tabla `users`. |
| `ADMIN_EMAILS` | Lista separada por comas de correos que pueden entrar a `/admin` (además de `role = admin` y `ADMIN_SECRET`). |

El primer usuario administrador puede crearse en Google y luego en Neon: `UPDATE users SET role = 'admin' WHERE email = 'tu@correo.com';`

### Cloudinary (subidas desde el panel del dueño)

| Variable | Uso |
|----------|-----|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Nombre de nube (público; se usa en el cliente para subir). |
| `CLOUDINARY_API_KEY` | API key (solo servidor). |
| `CLOUDINARY_API_SECRET` | Secreto para firmar uploads (solo servidor). |

Ejemplo local:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
AUTH_SECRET="genera-un-string-largo-aleatorio"
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."
ADMIN_SECRET="clave-temporal-solo-para-bootstrap"
ADMIN_EMAILS="editor1@dominio.com,editor2@dominio.com"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="tu-nube"
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

## Comandos Prisma útiles

```bash
npm run db:generate
npm run db:push
npm run db:migrate
npm run db:studio
```

## Migraciones

Tras cambiar `prisma/schema.prisma`:

```bash
npx prisma migrate dev --name describe_tu_cambio
```

En producción:

```bash
npx prisma migrate deploy
```

> **Titularidad:** un restaurante puede tener **varios** `RestaurantOwnership` activos (dueños, gerentes, editores). El índice único es `(userId, restaurantId)`: el mismo usuario no se duplica en la misma ficha. Los reclamos pendientes están limitados a **uno por usuario y slug** (índice parcial en SQL + validación en app).

> **Importante:** el esquema actual incluye Auth.js (`User`, `Account`, `Session`, `VerificationToken`), ownership (`RestaurantOwnership`), reclamos (`RestaurantClaim`) y solicitudes de cambio (`RestaurantChangeRequest`). Si venías de tablas antiguas (`restaurant_update_requests`, `claim_requests`), planifica migración de datos o arranca una base nueva.

## Rutas relacionadas con datos

- **Público:** `/restaurantes/[slug]/reclamar` — reclamo de perfil (requiere login Google).
- **Dueño:** `/dashboard` — listado de perfiles aprobados; `/dashboard/restaurantes/[slug]` — solicitud de cambios de datos; `/dashboard/restaurantes/[slug]/fotos` — fotos con firma Cloudinary (pendientes de aprobación).
- **Admin:** `/admin` (acceso), `/admin/reclamos`, `/admin/cambios` — aprobación editorial.

## Código relacionado

- `prisma/schema.prisma` — modelos de negocio + Auth.js.
- `lib/prisma.ts` — `PrismaClient` singleton.
- `lib/restaurants-data.ts` — lectura híbrida DB + archivos.
- `auth.ts` / `auth.config.ts` — Auth.js + adaptador Prisma.
- `lib/restaurant-db-bootstrap.ts` — crear fila `Restaurant` en Neon desde la ficha TS.
- `lib/apply-owner-changes.ts` — aplicar JSON de cambios aprobados sobre `Restaurant`.
