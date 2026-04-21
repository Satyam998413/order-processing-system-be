# Order Processing System - Backend

A scalable Node.js + Express backend for processing and storing large order datasets using **application-level sharding** with PostgreSQL.

---

## 🧠 Overview

This project demonstrates a **high-performance order ingestion pipeline** that:

* Accepts CSV/Excel order files
* Uploads files to cloud storage
* Processes data using streaming (memory efficient)
* Validates and filters records
* Stores data in a **sharded PostgreSQL architecture**
* Provides REST APIs with authentication and documentation
* Includes a basic frontend for file upload

---

## 🏗️ Tech Stack

### 🔹 Backend

* Node.js + Express.js
* PostgreSQL (Sharded Architecture)
* JWT Authentication
* Multer (File Upload)
* Zod (Validation)
* Winston (Logging)
* Swagger (API Documentation)

### 🔹 Frontend

* React.js
* Redux Toolkit
* Tailwind CSS
* Flowbite UI

---

## ⚙️ Features

* ✅ Upload large files (~10k records)
* ✅ Stream-based file processing (no memory overload)
* ✅ Application-level sharding
* ✅ Batch database inserts
* ✅ JWT-based authentication
* ✅ Structured logging
* ✅ API documentation with Swagger
* ✅ Clean modular architecture (MVC + Services)

---

## 🏗️ System Architecture

### 🔁 Flow

1. User uploads file from frontend
2. Backend authenticates request
3. File is uploaded to cloud storage
4. File is processed using streaming
5. Each record is validated
6. Shard is determined
7. Records are grouped into batches
8. Data is inserted into respective shard
9. Logs are generated
10. Response returned

---

## 🗄️ Database Design

### 📌 Sharding Strategy

* Type: Application-level sharding
* Shard Key: `customer_id`

### 🧮 Routing Logic

```
hash(customer_id) % 3
```

### 🗃️ Databases (Shards)

* orders_db_1
* orders_db_2
* orders_db_3

---

## 📊 Table Schema

```
orders
├── order_id (UUID, PK)
├── customer_id (VARCHAR)
├── order_date (TIMESTAMP)
├── order_amount (DECIMAL)
├── status (VARCHAR)
```

---

## 📁 Project Structure

### 🔹 Backend

```
order-processing-system-be/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── models/
│   ├── middlewares/
│   ├── validators/
│   ├── utils/
│   ├── docs/
│   ├── app.js
│   └── server.js
├── .env.dev
├── .env.prod
├── .env.local
```

---

### 🔹 Frontend

```
order-processing-system-fe/
├── src/
│   ├── app/
│   ├── components/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── store/
│   ├── utils/
│   ├── assets/
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
```

---

## 🔐 Environment Configuration

Create environment files:

### `.env.dev`

```
PORT=5000
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
JWT_SECRET=your_secret
```

### `.env.prod`

```
# production values
```

### `.env.local`

```
# local overrides
```

---

## 🛠️ Setup Instructions

### 1️⃣ Clone Repository

```
git clone https://github.com/your-username/sharded-order-service.git
cd sharded-order-service
```

---

### 2️⃣ Backend Setup

```
cd backend
npm install
```

---

### 3️⃣ PostgreSQL Setup

Create 3 databases:

```
orders_db_1
orders_db_2
orders_db_3
```

Create `orders` table in each database.

---

### 4️⃣ Run Backend

```
npm run dev
```

---

### 5️⃣ Frontend Setup

```
cd frontend
npm install
npm run dev
```

---

## 📘 API Documentation

Swagger available at:

```
http://localhost:5000/api-docs
```

---

## 🌐 API Endpoints

### 📌 Upload Orders

```
POST /api/upload-orders
```

* Auth: Required (JWT)
* Body: multipart/form-data (file)

---

### 🎁 Optional

```
GET /api/orders/:orderId
GET /api/orders?customerId=
```

---

## 📤 File Processing Strategy

* Streaming-based parsing
* Row-by-row validation
* Skip invalid records
* Batch processing (~500 records)
* Insert per shard

---

## ⚡ Performance Optimizations

* Batch inserts (avoid single inserts)
* Streaming file handling
* Parallel shard processing (optional)
* Indexed database queries

---

## 📜 Logging

Using Winston:

* Request logs
* File upload logs
* Error logs
* Processing logs

---

## 🔐 Authentication

* JWT-based authentication
* Token required for protected routes
* Middleware-based validation

---

## ⚠️ Error Handling

Handles:

* File upload errors
* Parsing errors
* Validation errors
* Database errors

---

## 🚀 Future Improvements

* Background job queue (BullMQ)
* Retry & idempotency handling
* Docker containerization
* Unit & integration testing
* Redis caching
* Multi-server shard deployment

---

## 🎯 Key Highlights

* Scalable architecture
* Clean separation of concerns
* Real-world sharding implementation
* Production-ready design patterns
* Full-stack integration

---

## 👨‍💻 Author

**Satyam Baranwal**

---

## ⭐ If you like this project

Give it a ⭐ on GitHub and feel free to contribute!

---
