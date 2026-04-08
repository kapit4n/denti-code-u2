# denti-code-u2

Next.js frontend for Denti-Code. Run the full stack from this repo with `./start-denti-stack.sh` (see parent monorepo layout).

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
