# 🥬 Freshora

**Freshora** is a professional multi-vendor e-commerce marketplace for fresh fruits and vegetables, built with the **MERN stack** (MongoDB, Express.js, React.js, Node.js). It connects local fruit and vegetable sellers with online customers through a unified platform featuring buyer, seller, and admin dashboards.

---

## ✨ Features

### 🎨 Design Theme
- **Dark Green** `#1B5E20`
- **Fresh Green** `#4CAF50`
- **White** `#FFFFFF`
- **Light Cream** `#FFF8E7`

### 👤 Authentication & Roles
- Unified login/registration with **Buyer / Seller** role tabs
- Separate **admin login** (no public admin registration)
- JWT-based authentication with role-based access control
- bcrypt password hashing

### 🛍️ Buyer Experience
- Browse products by category, search, filter, and sort
- Product detail pages with freshness info, organic badges, and seller info
- Multi-seller shopping cart
- Checkout with multiple payment methods (COD functional; online gateways enabled only with real credentials)
- Buyer dashboard: profile, orders, payments, wishlist, addresses, notifications, change password

### 🏪 Seller Experience
- Register a store (pending approval by admin)
- Add / edit / delete own products with Cloudinary image uploads
- Seller dashboard: products, orders, sales, earnings, store profile, settings, notifications, change password

### 🛠️ Admin Experience
- Full marketplace control: buyers, sellers, seller requests, products, categories, orders, payments, delivery charges, reviews, contact messages, notifications
- Website settings: branding, logo, favicon, homepage banners, hero content, footer, About Us, Contact Us, Privacy Policy, Terms & Conditions

### 🔔 Notifications
- In-app notification system for order status, payments, seller approvals, and contact messages

---

## 🧱 Tech Stack

| Layer      | Technology                                   |
|------------|----------------------------------------------|
| Frontend   | React 18, React Router v6, Vite, Axios       |
| Backend    | Node.js, Express.js                          |
| Database   | MongoDB + Mongoose                           |
| Auth       | JWT, bcryptjs                                |
| Uploads    | Cloudinary + multer-storage-cloudinary       |
| Email      | Nodemailer (configured for password reset)   |

---

## 📁 Project Structure

```
freshora/
├── backend/
│   ├── config/          # DB, Cloudinary, seed
│   ├── controllers/     # Route handlers
│   ├── middleware/      # auth, error, upload
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/  # Header, Footer, ProductCard, StatCard, etc.
    │   ├── context/     # Auth, Cart, Settings, Toast
    │   ├── layouts/     # PublicLayout, DashboardLayout
    │   ├── pages/       # Public, buyer, seller, admin pages
    │   ├── services/    # Axios API services
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env.example
    ├── package.json
    └── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or later)
- **MongoDB** (local or MongoDB Atlas)
- **Cloudinary** account (for image uploads)

### 1. Clone & Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment Variables

**Backend** — copy `backend/.env.example` to `backend/.env` and fill in your values:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/freshora
JWT_SECRET=your_super_secret_jwt_key_change_me
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

ADMIN_EMAIL=admin@freshora.com
ADMIN_PASSWORD=Admin@123
ADMIN_NAME=Freshora Admin

CLIENT_URL=http://localhost:5173
```

**Frontend** — copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run the Application

```bash
# Terminal 1 — Backend (http://localhost:5000)
cd backend
npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend
npm run dev
```

> The backend automatically seeds the **admin user**, **5 default categories**, and **website settings** on first start.

---

## 🔑 Default Admin Login

| Field    | Value              |
|----------|--------------------|
| Email    | `admin@freshora.com` |
| Password | `Admin@123`        |

> Change these in `backend/.env` before going to production.

---

## 🧪 Scripts

### Backend
| Command          | Description                    |
|------------------|--------------------------------|
| `npm run dev`    | Start with nodemon (hot reload) |
| `npm start`      | Start in production            |
| `npm run seed`   | Run the seed script manually   |

### Frontend
| Command          | Description                    |
|------------------|--------------------------------|
| `npm run dev`    | Start Vite dev server          |
| `npm run build`  | Build for production           |
| `npm run preview`| Preview the production build   |

---

## 🔐 Security

- Passwords hashed with **bcryptjs**
- JWT tokens with configurable expiry
- Role-based middleware (`protect`, `authorize`)
- Ownership checks on seller product/order operations
- Admin-only routes for marketplace management
- Cloudinary credentials kept server-side only

---

## 📦 Payment Methods

- **Cash on Delivery** — fully functional
- **Credit / Debit Card** — requires real gateway credentials
- **Online Payment Gateway** — requires real gateway credentials
- **Digital Wallet** — requires real gateway credentials

Online payment methods are rendered as "Coming soon" until real credentials are configured.

---

## 🌐 Single-Link Deployment (Frontend + Backend on one URL)

The backend can serve the built React app, so the whole site runs on **one link**
(e.g. `https://freshora.onrender.com`) — the API lives under `/api` on the same origin.

### How it works
- `frontend/src/services/api.js` uses the relative base URL `/api` when `VITE_API_URL` is not set.
- [`backend/server.js`](backend/server.js) serves `frontend/dist` (if present) and falls back to
  `index.html` for any non-`/api`, non-`/uploads` GET request (SPA routing).
- CORS is only needed for split deployments; same-origin requests are always allowed.

### Build & run locally (one link)
```bash
# from the project root
npm run install:all   # installs backend + frontend deps
npm run build         # builds frontend into frontend/dist
npm start             # starts backend on http://localhost:5000 (serves the app too)
```
Open **http://localhost:5000** — frontend and API are on the same link.

> For development with hot reload, keep using `npm run dev` in `backend/` and `frontend/`
> (frontend at `http://localhost:5173`, proxying `/api` to the backend).

### Deploy on Vercel (single project, single domain)
The repo is pre-configured for Vercel:
- `api/index.js` is the serverless function (root `api/` convention) that exports the Express app.
- `vercel.json` builds the frontend to `frontend/dist`, routes `/api/*` to the function, and rewrites all other paths to `index.html` (SPA refresh-safe).
- The frontend calls the relative `/api` path, so no API URL needs to be baked into the build.

1. Push the repo to GitHub (or import the folder directly).
2. **Add New → Project**, import the repo.
3. Settings:
   - **Root Directory:** *(leave empty — repo root)*
   - **Framework Preset:** `Other`
   - **Build Command:** `npm run build --prefix frontend` *(auto-filled from `vercel.json`)*
   - **Output Directory:** `frontend/dist` *(auto-filled from `vercel.json`)*
   - **Install Command:** `npm install && npm install --prefix frontend` *(auto-filled from `vercel.json`)*
4. **Environment variables** (Project Settings → Environment Variables, for Production + Preview):
   - `NODE_ENV=production`
   - `MONGODB_URI` (MongoDB Atlas connection string)
   - `JWT_SECRET`, `JWT_EXPIRES_IN`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `CLOUDINARY_UPLOAD_PRESET` — optional
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`
   - `CLIENT_URL` — optional; only needed for split deployments
   - Do **not** set `PORT` (Vercel manages it)
5. Deploy. Your single link will be `https://<your-project>.vercel.app` (or your custom domain).

> On MongoDB Atlas, add `0.0.0.0/0` to **Network Access** so Vercel's serverless functions can connect.
> Verify the deployment with `GET /api/health` — it returns 200 without touching the database.

---

## 📄 License

MIT