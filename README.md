# SpringMart

> Full-stack product catalog built with Spring Boot and React. Features product management, multi-field search, pagination, and direct image streaming.

[![Live Demo](https://img.shields.io/badge/Live_Demo-springmart.netlify.app-00ad9f?style=flat-square)](https://springmart.netlify.app/)

---

### Home
![Home Page](public/home_page.png)

### Products
![Product Catalog](public/product_page.png)

### Add Product
![Add Product](public/add_page.png)

---

## Features

- **Product Management**: Add, edit, and delete items with validation and image preservation.
- **Multi-Field Search**: Fast search across name, description, category, and brand.
- **Image Streaming**: Raw image byte streaming directly from the database.
- **Pagination**: Server-side and client-side page navigation.
- **Auto-Seeding**: Loads sample products automatically on startup.

---

## Tech Stack

- **Backend**: Java 21, Spring Boot 3, Spring Data JPA, H2 Database (file-based persistence), Maven
- **Frontend**: React 19, Sass, React Router
- **Deployment**: Docker, Netlify, Render

---

## Architecture

```text
HTTP Request ──> ProductController ──> ProductService ──> ProductRepository ──> H2 Database
```

- **Controller**: Handles HTTP endpoints, CORS, and multipart requests.
- **Service**: Handles business logic, updates, and image processing.
- **Repository**: Executes custom JPQL search queries.
- **Database**: File-based H2 database storing product details and image bytes.

---

## API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/products` | Paginated product list (`page`, `size`) |
| `GET` | `/api/products/{id}` | Get product details by ID |
| `GET` | `/api/products/search` | Search products by `keyword` |
| `GET` | `/api/products/image/{id}` | Stream raw image bytes |
| `POST` | `/api/products` | Create product (`multipart/form-data`) |
| `PUT` | `/api/products/{id}` | Update product (`multipart/form-data`) |
| `DELETE` | `/api/products/{id}` | Delete product by ID |

---

## Getting Started

### Prerequisites
- Java 21+
- Node.js 20+
- Docker (optional)

### Option 1: Docker (Fastest)

```bash
docker compose up --build
```

### Option 2: Local Setup

**Backend**
```bash
cd springmart-backend
./mvnw spring-boot:run
```
> **Windows:** `.\mvnw.cmd spring-boot:run`  
> API runs at `http://localhost:8080` (H2 Console: `/h2-console`).

**Frontend**
```bash
cd springmart-frontend
npm install
npm start
```
> App runs at `http://localhost:3000`.

---

## Deployment

- **Frontend**: [springmart.netlify.app](https://springmart.netlify.app/)
- **Backend**: [springmart-backend.onrender.com](https://springmart-backend.onrender.com/api/)

---

## Author

**Shreyan Sardar** — [Portfolio](https://shreyansr.vercel.app/) · [GitHub](https://github.com/shreyansr01) · [LinkedIn](https://www.linkedin.com/in/shreyansardar/)
