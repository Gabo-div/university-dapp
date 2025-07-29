# Prototipo de sistema universitario basado en la blockchain de Ethereum

La idea de esta demo es descubrir las posibilidades de la blockchain de Ethereum para almacenar información de manera segura, especialmente la información relacionada con la información de la universidad, los usuarios y los registros de asignaturas de los estudiantes.

## Requerimientos

  * **Node.js:** v22.11.0
  * **pnpm:** v10.4.0

## Ejecutar este Proyecto

Clonar repositorio.

```bash
git clone https://github.com/Gabo-div/university-dapp
cd university-dapp
```

Instalar dependencias.

```bash
pnpm i
```

Ejecutar entorno de desarrollo.

```bash
pnpm run dev
```

Al ejecutar el entorno de desarrollo se configurará la base de datos y se desplegará el contrato inteligente en la blockchain local con información de prueba.

## Tecnologias

### Frontend

  * **React:** 
  * **TanStack Router:** 
  * **TanStack Query:** 
  * **Tailwind CSS:** 
  * **Shadcn/ui:**

### Backend

  * **Hono.js:** 
  * **Better Auth:** 
  * **Drizzle ORM:** 

## Variables de entorno

### Backend (`apps/backend/.env`)

```env
DATABASE_URL=
DATABASE_TOKEN=
ETHERSCAN_APIKEY=
NODE_ENV= 
```

### Contracts (`packages/contracts/.env`)

```env
MNEMONIC=
```
