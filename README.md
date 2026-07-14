# PetancaPro Stats

Aplicación completa para el registro de partidas de petanca y cálculo de performance técnico individual y por equipo.

## Arquitectura
- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Recharts, Lucide React.
- **Backend**: NestJS, Prisma ORM.
- **Base de Datos**: PostgreSQL (configurado en `schema.prisma`).

## Requisitos
- Node.js 18+
- PostgreSQL

## Instalación

### Backend
1. `cd backend`
2. `npm install`
3. Configurar `DATABASE_URL` en un archivo `.env`.
4. `npx prisma migrate dev`
5. `npm run start:dev`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Modelo Metodológico
La aplicación utiliza una escala de evaluación de {-2, -1, 0, +1, +2} para cada lanzamiento (bola).
El cálculo de performance sigue la fórmula:
`Performance % = ((Suma + 2n) / (4n)) * 100`

Donde `n` es la cantidad de lanzamientos y `Suma` es la suma de los scores de efectividad.
Las manos anuladas se excluyen automáticamente del cálculo.

## Módulo del Coach (autenticación + roster)

Área privada para que el entrenador administre a sus jugadores de forma persistente.

- **Backend**: módulo `auth` (JWT) con roles `COACH` / `SUPER_ADMIN` y módulo
  `players` (CRUD del roster, con propiedad por coach). El primer coach que se
  registra queda como `SUPER_ADMIN`; después, solo un super admin puede dar de
  alta a más coaches.
- **Frontend**: `/login` (alta del primer super-admin, login por email/contraseña
  y, opcionalmente, Google) y `/coach` (gestión del roster).
- **Login con Google** (opcional y simple): se activa poniendo `GOOGLE_CLIENT_ID`
  en el backend y `NEXT_PUBLIC_GOOGLE_CLIENT_ID` en el frontend (mismo Client ID
  de tipo *Web* de Google Cloud). Si no se configura, el botón se oculta y sigue
  funcionando el login por email/contraseña.

### Variables de entorno nuevas (backend)

```
JWT_SECRET="un-secreto-largo-y-aleatorio"   # obligatorio en producción
JWT_EXPIRES_IN="30d"                          # opcional
GOOGLE_CLIENT_ID=""                           # opcional (login con Google)
```

### Sincronizar el esquema (Postgres / Railway)

El modelo añade la tabla `Coach` y columnas nuevas en `Player` (todas opcionales,
no destructivas). Tras desplegar, sincroniza el esquema:

```
cd backend && npx prisma db push
```
