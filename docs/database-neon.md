# Neon Postgres + Prisma

La app sigue sirviendo restaurantes desde `data/restaurants` si no hay base o si la consulta falla. Con `DATABASE_URL` apuntando a Neon, los registros con `status = "published"` se fusionan por `slug` y **tienen prioridad** sobre el mismo slug en archivos.

## Variables de entorno

| Variable | Uso |
|----------|-----|
| `DATABASE_URL` | Cadena de conexión PostgreSQL de Neon (pooler recomendado en serverless). Prisma la lee desde `prisma/schema.prisma`. |

En Vercel: Project → Settings → Environment Variables → añade `DATABASE_URL` para Production (y Preview si quieres DB compartida o de staging).

En local, crea `.env` en la raíz del repo (no lo subas a git):

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
```

Neon suele ofrecer dos URLs; para Next.js en Vercel conviene la URL con **pooling** (p. ej. `-pooler` en el host) cuando la documentación de Neon lo indique.

## Comandos Prisma útiles

```bash
# Regenerar el cliente (también se ejecuta en `npm install` vía postinstall)
npm run db:generate

# Aplicar el esquema sin historial de migraciones (rápido en prototipo)
npm run db:push

# Crear y aplicar migraciones en desarrollo (requiere DATABASE_URL)
npm run db:migrate

# Consola para inspeccionar datos
npm run db:studio
```

## Migraciones

1. Configura `DATABASE_URL` hacia tu base Neon (puede ser una rama de desarrollo).
2. Tras cambiar `prisma/schema.prisma`, ejecuta:

   ```bash
   npx prisma migrate dev --name describe_tu_cambio
   ```

   Esto crea la carpeta `prisma/migrations/` y aplica los cambios a esa base.

3. En CI/producción (Vercel build o despliegue), aplica migraciones ya versionadas con:

   ```bash
   npx prisma migrate deploy
   ```

   Añade este paso al pipeline si quieres que cada deploy deje el esquema al día (o ejecuta `migrate deploy` manualmente tras el primer despliegue).

Si aún no usas migraciones versionadas, `prisma db push` alinea el esquema con Neon; es suficiente para pruebas, pero para producción a largo plazo es mejor `migrate dev` / `migrate deploy`.

## Código relacionado

- `prisma/schema.prisma` — modelos `Restaurant`, `RestaurantUpdateRequest`, `ClaimRequest`.
- `lib/prisma.ts` — instancia singleton de `PrismaClient`.
- `lib/restaurants-data.ts` — lectura híbrida DB + archivos.
