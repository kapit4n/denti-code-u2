# denti-code-u2

Next.js frontend for Denti-Code. Run the full stack from this repo with `./start-denti-stack.sh` (expects sibling folders under the same parent: `denti-code-api-gateway`, `denti-code-clinic-provider-api`, `denti-code-appointments`, `denti-code-auth-srv`, `denti-code-patients-api`).

## First-time setup (database migrations and seed)

Each backend keeps its own SQLite database. After cloning or pulling migrations, run:

1. **`./start-denti-stack.sh migrate`** — runs `npx prisma migrate deploy` in this order: auth → patients → **clinic-provider** (doctors, procedure types, treatment facilities) → appointments.
2. **`./start-denti-stack.sh seed`** — runs `npx prisma db seed` in the same order so demo users, clinic data, patients, and sample appointments stay consistent.

Then start the stack:

- **`./start-denti-stack.sh dev`** — development (includes **clinic-provider** on its configured port, usually 3002).
- **`./start-denti-stack.sh start`** — build + production-style start for each service.

Logs for clinic-provider: `.logs/clinic-provider.log` at the monorepo parent (next to the service folders).

## Message broker (RabbitMQ + publish API)

Some services integrate through **RabbitMQ** and the **`denti-code-broker-srv`** HTTP adapter:

| Piece | Role |
|--------|------|
| **RabbitMQ** (Docker container `denti-rabbitmq`) | AMQP on `localhost:5672`; management UI `http://localhost:15672` (user/password `guest` / `guest`). |
| **`denti-code-broker-srv`** | Flask app on **port 5000**: `POST /api/publish` with JSON `{ "routing_key", "body" }` → publishes to exchange `denti_code_events`. |
| **Auth** (`denti-code-auth-srv`) | On user registration, if `BROKER_PUBLISH_URL` is set (e.g. `http://localhost:5000/api/publish`), posts the `user.registered` event. |
| **Patients API** | `consumer.js` subscribes to `user.registered` and can create a patient row (needs RabbitMQ up). |

`./start-denti-stack.sh dev` (and `start`) starts RabbitMQ via Docker when available, then the broker HTTP service, then runs patients with **API + consumer** in dev (`npm run dev`) or **API + separate `consumer.js`** in `start`.

- **No Docker / no RabbitMQ:** run with `SKIP_BROKER=1 ./start-denti-stack.sh dev` so only the patients REST API starts (same as the old `dev:server`-only behavior).
- **Broker Python deps:** in `denti-code-broker-srv`, use a venv and `pip install -r requirements.txt`, or the script uses `venv`/`.venv` if present; otherwise `python3` on your PATH must have `flask` and `pika` installed.

## Testing users

These accounts are created by the auth service seed (`denti-code-auth-srv`: `npx prisma db seed`). **Every seeded user shares the same password.**

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@denti-code.com` | `Password123!` |
| **Doctor** | `susan.storm@denti-code.com` | `Password123!` |
| **Doctor** | `peter.parker@denti-code.com` | `Password123!` |
| **Patient** | `patient1@example.com` | `Password123!` |
| **Patient** | `patient2@example.com` | `Password123!` |
| **Patient** | `patient3@example.com` | `Password123!` |
| **Patient** | `patient4@example.com` | `Password123!` |
| **Patient** | `patient5@example.com` | `Password123!` |

Use **http://localhost:3000** when the API gateway is proxying the UI (recommended). Sign in at `/login`.
