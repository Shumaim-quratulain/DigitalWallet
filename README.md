# 💳 Digital Wallet

A full-stack digital wallet: users sign up, log in, check their balance and send money
to each other. Transfers are processed asynchronously through RabbitMQ, and an optional
machine-learning service scores a transaction for fraud risk.

```
Shumaim-Digital-Wallet/
├── wallet-backend/      Spring Boot 3.4.4 · Java 21 · MySQL · RabbitMQ · JWT
├── wallet-frontend/     React 19 · TypeScript · Vite · Tailwind v4
├── wallet-ml-api/       Flask fraud-detection API (optional)
└── wallet-ml-training/  Jupyter notebooks used to train the fraud model
```

---

## 📚 Contents

- [Prerequisites](#-prerequisites)
- [First-time setup](#-first-time-setup)
- [Running locally](#-running-locally)
- [API overview](#-api-overview)
- [How a transfer works](#-how-a-transfer-works)
- [Docker](#-docker)
- [Screenshots](#-screenshots)
- [Troubleshooting](#-troubleshooting)

---

## 🔧 Prerequisites

| Tool | Version | Check |
|---|---|---|
| JDK | **21 (Temurin)** | `/usr/libexec/java_home -v 21` |
| MySQL | 8+ | `brew services list` |
| RabbitMQ | 3+ | `brew services list` |
| Node.js | 20+ | `node -v` |
| Python | 3.11+ (optional) | `python3 -V` |

> ⚠️ **JDK note.** Gradle 8.13 / Spring Boot 3.4.4 do not support JDK 24 and will fail
> with `Unsupported class file major version 68`. The default `java` on this machine is
> 24, so always start the backend with `./run.sh`, which pins `JAVA_HOME` to Temurin 21.

---

## 🗄️ First-time setup

```bash
# 1. Create the database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS shumaim_wallet;"

# 2. Start the services
brew services start mysql
brew services start rabbitmq

# 3. Frontend dependencies
cd wallet-frontend && npm install
```

Secrets are not committed. Copy
`wallet-backend/app/src/main/resources/application-local.properties.example` to
`application-local.properties` (git-ignored) in the same folder and set your MySQL
password, RabbitMQ password (default `guest`) and `jwt.secret`. Alternatively export
`DB_PASSWORD`, `RABBITMQ_PASSWORD` and `JWT_SECRET` as environment variables.

You do **not** need to import any SQL. On first startup Hibernate creates the tables
(`users`, `roles`, `roles_seq`, `transactions`, `users_roles`) and `App.initRoles()`
seeds the `USER` and `ADMIN` roles.

---

## ▶️ Running locally

Two terminals:

```bash
# Terminal 1 — backend → http://localhost:8080
cd wallet-backend
./run.sh

# Terminal 2 — frontend → http://localhost:5173   ← open this
cd wallet-frontend
npm run dev
```

Then open **http://localhost:5173**, click *Get Started*, create an account and log in.

Every new account starts with a balance of **₹5000**, so you can register two accounts
and send money between them straight away.

### Optional: fraud-detection API

The *Fraud Detection* page calls a separate Flask service on port **5010**
(port 5000 is reserved by macOS AirPlay Receiver).

```bash
cd wallet-ml-api
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python run.py
```

The **ML Model** tab works offline. The **AI Model (Gemini)** tab additionally needs a
`GOOGLE_GEMINI_API_KEY4` entry in `wallet-ml-api/.env`.

---

## 🔌 API overview

All routes are prefixed with `/v1`. Everything except `/v1/auth/**` requires an
`Authorization: Bearer <jwt>` header.

| Method | Route | Purpose |
|---|---|---|
| POST | `/v1/auth/signup` | Register (username, email, password, phone) |
| POST | `/v1/auth/login` | Log in, returns a JWT |
| POST | `/v1/auth/validateToken` | Validate a stored token on page load |
| POST | `/v1/user/getUserDetails` | Profile + balance for a username |
| GET | `/v1/user/search?query=` | Find a recipient by username or email |
| PUT | `/v1/user/email` | Change the logged-in user's email |
| GET | `/v1/transaction/request-balance` | Current user's balance |
| POST | `/v1/transaction/send-money` | Transfer `{receiver, amount, description}` |
| GET | `/v1/transaction/getTransactionList?limit=&offset=` | Paginated history |

---

## ⚙️ How a transfer works

```
Frontend ──POST /v1/transaction/send-money──► TransactionController
                                                   │
                                                   ▼
                                    Queue: transaction.queue (RabbitMQ)
                                                   │
                                                   ▼
                                          TransactionConsumer
                                                   │
                                    TransactionService.processTransaction()
                                     • checks sender balance
                                     • debits sender, credits receiver
                                     • saves the transaction row
                                                   │
                                          reply "Transaction processed successfully"
                                                   ▼
                                              HTTP 200 → UI alert
```

If RabbitMQ is unreachable, `queueTransaction()` catches the error and returns `null`,
and the controller processes the transfer synchronously instead — so transfers still
work on a machine without a broker.

---

## 🐳 Docker

```bash
cd wallet-backend
docker compose up -d
```

Brings up the backend (8080), MySQL, RabbitMQ (5672, management UI on 15672) and the
fraud API (5010). Requires Docker Desktop to be running.

---

## 🖼️ Screenshots

Images live in `wallet-backend/public/screenshots/`.

| Feature | File |
|---|---|
| Home screen | `home-screen-oba.png` |
| Signup | `signup.png` |
| Login | `login.png` |
| Dashboard | `dashboard.png` |
| Send money | `send-money.png` |
| Transactions | `transactions.png` |
| All transactions | `all-transactions.png` |
| ML model — fraud | `ml-model-for-fraud-detection-ml-model-fraud.png` |
| ML model — legitimate | `ml-model-for-fraud-detection-ml-model-legitimate.png` |
| AI model — fraud | `ml-model-for-fraud-detection-Al-model-fraud.png` |
| AI model — legitimate | `ml-model-for-fraud-detection-Al-model-legitimate.png` |

---

## 🩺 Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `Unsupported class file major version 68` | Gradle running on JDK 24 → use `./run.sh` |
| `Registration failed: Role not found: USER` | `roles` table empty → restart the backend, `App.initRoles()` seeds it |
| Sign-in spinner forever / 401 | Backend not running, or the Vite proxy target moved off port 8080 |
| `Port 5000 already in use` | macOS AirPlay Receiver — the fraud API uses 5010 instead |
| `Access denied for user 'root'@'localhost'` | Update the datasource credentials in `application.properties` |
| `Connection refused` on port 5672 | RabbitMQ not started (`brew services start rabbitmq`) — transfers fall back to synchronous mode |
