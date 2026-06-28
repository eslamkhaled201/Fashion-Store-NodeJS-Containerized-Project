# Maison — Fashion Ecommerce Store

Full-stack fashion ecommerce built with React, Node.js, and MySQL.

## Tech Stack

- **Frontend**: React 18, React Router v6, Axios, Stripe.js, React Toastify
- **Backend**: Node.js, Express, MySQL2, JWT Auth, Stripe, Multer
- **Database**: MySQL

## Project Structure

```
fashion-store/
├── backend/
│   ├── config/db.js          # MySQL connection pool
│   ├── controllers/          # Business logic
│   ├── middleware/           # Auth, validation
│   ├── models/               # (extend for ORM if needed)
│   ├── routes/               # Express route handlers
│   ├── utils/
│   │   ├── schema.sql        # Full DB schema
│   │
│   └── server.js
└── frontend/
    ├── public/
    └── src/
        ├── api/              # Axios API clients
        ├── components/       # Reusable components
        ├── context/          # Auth + Cart context
        ├── hooks/            # Custom hooks
        ├── pages/            # Page components
        └── styles/           # Global CSS
```

## Getting Started

### 1. Database Setup

```bash
mysql -u root -p < backend/utils/schema.sql
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your DB credentials and Stripe keys
npm run seed        # Load demo data
npm run dev         # Start on port 5000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start           # Start on port 3000
```

## Features

- **Auth**: JWT register/login, role-based access (customer / admin)
- **Products**: Listing with search, category filter, price filter, sort; variants (size/color); fulltext search
- **Cart**: Persistent per user, quantity management, live total
- **Checkout**: Address form, order creation with stock validation, subtotal/tax/shipping calc
- **Payments**: Stripe PaymentIntents + webhook for confirmed payments
- **Admin Dashboard**: Revenue stats, top products, order management, product CRUD
- **Image Uploads**: Multer-powered local storage (swap for S3 in production)

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fashionstore.com | admin123 |
| Customer | jane@example.com | user1234 |

## API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | — | Register |
| POST | /api/auth/login | — | Login |
| GET | /api/products | — | List products |
| GET | /api/products/:slug | — | Product detail |
| GET | /api/cart | user | Get cart |
| POST | /api/cart | user | Add to cart |
| POST | /api/orders | user | Create order |
| POST | /api/payments/create-intent | user | Stripe intent |
| GET | /api/admin/dashboard | admin | Stats |
| GET | /api/admin/orders | admin | All orders |
| PUT | /api/admin/orders/:id/status | admin | Update status |

## Production Checklist

- [ ] Set strong `JWT_SECRET`
- [ ] Add real Stripe keys
- [ ] Swap local uploads for AWS S3 or Cloudinary
- [ ] Add HTTPS / reverse proxy (nginx)
- [ ] Set `NODE_ENV=production`
- [ ] Add rate limiting (`express-rate-limit`)
- [ ] Set up DB backups
