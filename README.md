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
