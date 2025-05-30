# 🎮 Babel — Web Strategy Game

> A browser game inspired by the classics, with a twist, stay tuned. 

---

## 🧱 Stack Overview

### 🛠️ Backend Architecture

| Component           | Description 
|--------------------|-------------
| **NestJS**          | Scalable and modular framework for each microservice 
| **Prisma**          | Type-safe ORM for PostgreSQL 
| **Kafka (via Redpanda)** | Event-driven communication between services 
| **Docker Compose**  | Container orchestration for local development 
| **PostgreSQL**      | Relational database per service (isolated schemas) 
| **Redis** BullMQ | To handle construction queues 😎

---

## ⚙️ Microservices

| Service             | Responsibility |
|--------------------|----------------|
| `player`           | Player accounts, registration, profile 
| `village`          | Cities, buildings, production queues 
---

## 🧪 Development

### ▶ Start Dev Environment

You can contact me for .env configuration, or just do it yourself
```bash
yarn docker
