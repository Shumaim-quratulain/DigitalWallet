# 💳 Digital Wallet

An end-to-end **Digital Wallet** application. This system allows users to securely sign up, authenticate, send/receive money, and visualize transaction history. It also includes an advanced **Fraud Detection System** to identify suspicious transactions based on historical patterns.

---

## 📚 Table of Contents

- [🔧 System Architecture](#-system-architecture)
- [🚀 Features](#-features)
- [📂 Project Structure](#-project-structure)
- [🔐 Authentication & Security](#-authentication--security)
- [🐳 Docker Setup](#-docker-setup)
- [🛠️ Getting Started](#-getting-started)
- [📦 Tech Stack](#-tech-stack)
- [🖼️ Application Screenshots](#️-application-screenshots)
- [📊 Fraud Detection System](#-fraud-detection-system)
- [📎 Useful Links](#-useful-links)

---

## 🔧 System Architecture

Before development, we invested several weeks designing a robust architecture covering:

- ✅ Functional & Non-Functional Requirements
- 🧬 High-Level Design (HLD)
- 🛠️ Low-Level Design (LLD)
- 🔄 Sequence Diagrams & Flow Diagrams

---

## 🚀 Features

### ✅ Backend (Spring Boot + RabbitMQ)

- JWT-based secure login/signup
- Asynchronous transaction processing via RabbitMQ
- Endpoints for user data, transactions, and token validation
- API weight limiting and pagination support

### 🎨 Frontend (Vite + React + TypeScript)

- Fully responsive & modern UI using TailwindCSS and ShadCN
- Signup/Login, Dashboard, Transaction History
- Money Transfer (Send/Receive) with real-time feedback
- Reusable components and modular code structure

### 🔍 Fraud Detection

- Machine Learning model that predicts fraud based on transaction patterns
- REST API for integrating predictions into transaction flow
- Built with Python + Flask and explained with Google Gemini

---

## 📂 Project Structure

```bash
Shumaim-Digital-Wallet/
│
├── wallet-backend/
├── wallet-frontend/
├── wallet-ml-api/
├── wallet-ml-training/
```

---

## 🔐 Authentication & Security

- Implemented full token-based security (JWT + Refresh Tokens)
- Secure password storage using hashing
- API protection via route-level guards
- Session timeout and token expiry handling

---

## 🐳 Docker Setup

To ensure a consistent and collaborative development environment for all team members, we used **Docker Compose** to bundle our backend environment into a single unit.

### 🧱 Docker Images Used:

- `wallet-backend-backend:latest` — Spring Boot backend
- `mysql:8` — Database container
- `rabbitmq:3-management` — Queue for async transactions

### 🧩 Docker Compose Container:

All the above services are composed into one container named: `wallet-backend`

### ▶️ Run Docker Compose

```bash
docker compose up -d
```

- This command will build the services and run them on the specified ports if not already available.
- Ensures backend + MySQL + RabbitMQ services are networked and running.

> **📌 Prerequisite**: Docker must be installed and running on your system.

---

## 🛠️ Getting Started

Here’s how to set up each part of the application.

### ✅ Backend Setup (Spring Boot + Docker)

> 📌 Prerequisites: Docker must be installed

1. Go to the backend folder:

   ```bash
   cd wallet-backend
   ```

2. Run Docker Compose:

   ```bash
   docker compose up -d
   ```

This command builds the `wallet-backend` container and spins up all services (`Spring Boot`, `MySQL`, `RabbitMQ`) in one go.

---

### ✅ Frontend Setup (React + Vite + TypeScript)

> 📌 Prerequisite: Node.js (v18+) installed

1. Go to the frontend folder:

   ```bash
   cd wallet-frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

---

### ✅ ML Model Setup

The fraud detection model is containerized and built with Flask.
Please refer to the dedicated [README](../wallet-ml-api/README.md) for setup and usage instructions.

---

## 📦 Tech Stack

| Layer         | Technology Used                        |
| ------------- | -------------------------------------- |
| Backend       | Spring Boot, MySQL, RabbitMQ, Java     |
| Frontend      | React, TypeScript, Vite, TailwindCSS   |
| ML Model      | Python, Flask, Scikit-learn, Pandas    |
| Auth/Security | JWT, Refresh Tokens, BCrypt            |
| DevOps        | Docker, Docker Compose, GitHub Actions |

---

## 🖼️ Application Screenshots

| 🧩 **Feature**                                    | 📸 **Screenshot**                                                                    |
| ------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 🏠 **Home Screen**                                | ![Home](public/screenshots/home-screen.png)                                          |
| 📝 **Signup**                                     | ![Signup](public/screenshots/signup.png)                                             |
| 🔐 **Login**                                      | ![Login](public/screenshots/login.png)                                               |
| 📊 **Dashboard**                                  | ![Dashboard](public/screenshots/dashboard.png)                                       |
| 💸 **Send Money**                                 | ![Send Money](public/screenshots/send-money.png)                                     |
| 📈 **Recent Transactions**                        | ![Transactions](public/screenshots/transactions.png)                                 |
| 📋 **All Transactions**                           | ![All Txns](public/screenshots/all-transactions.png)                                 |
| 📉 **ML Model – Fraud Transaction Detected**      | ![ML Fraud](public/screenshots/ml-model-fraud.png)                                   |
| 📈 **ML Model – Legitimate Transaction Detected** | ![ML Legit](public/screenshots/ml-model-legitimate.png)                              |
| 🤖 **AI Model – Fraud Transaction Detected**      | ![AI Fraud](public/screenshots/ai-model-fraud.png)                                   |
| 🧾 **AI Model – Legitimate Transaction Detected** | ![AI Legit](public/screenshots/ai-model-legitimate.png)                              |

---

## 📊 Fraud Detection System

We developed a machine learning model capable of detecting fraudulent transactions using patterns in past data.

### ✅ Features:

- Binary classification (Fraud vs Legitimate)
- RESTful API in Flask
- Google Gemini AI integration to explain predictions
- Real-time integration with backend for fraud alerts

📘 **[Fraud Detection README](../wallet-ml-api/README.md)**

---

## 📎 Useful Links

- 🔗 Backend: [wallet-backend](../wallet-backend)
- 🔗 Frontend: [wallet-frontend](../wallet-frontend)
- 🔗 ML Fraud Detection API: [wallet-ml-api](../wallet-ml-api)
- 🔗 Model training notebooks: [wallet-ml-training](../wallet-ml-training)

---
