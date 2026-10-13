# DualCom Internship Project

A multi-store online clothing marketplace, built during my internship at **DualCom Consulting**.

Think of it as a delivery app, but for clothes: several independent shops list their products in one place, shoppers fill a single cart from any of them, pick a delivery location on a map, and each shop receives and handles its own part of the order.

Built with the **MERN stack** (MongoDB, Express, React, Node.js), fully in **TypeScript**.

---

## Features

### Shoppers
- Register and log in with a phone number or email
- Browse stores and products, filter and search
- Choose a size, add to cart, and buy from several stores in one checkout
- Save delivery addresses by using GPS, searching by name, or dropping a pin on a map
- Pay cash on delivery (card payment screen in progress)
- Track order status: pending, accepted, rejected with a reason, delivered
- Manage profile, email and password

### Store owners
- Create and manage their own stores, with a logo
- Add products with a photo, category, price, and **stock per size**
- See incoming orders for their stores only, with the customer's address and an "Open in Google Maps" link
- Accept, reject (with a reason) or mark orders as delivered

### Admins
- Create and remove store owner accounts (store owners cannot sign up themselves)
- View all customers and store owners

---

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React 19, Vite, React Router 7, TanStack Query, Material UI |
| Backend | Node.js, Express 5 |
| Database | MongoDB with Mongoose |
| Validation | Zod (the same schemas generate the TypeScript types) |
| Auth | JWT (7 day tokens carrying the user id and role), bcrypt password hashing |
| Maps | Leaflet with OpenStreetMap tiles, Nominatim for address search |
| Images | Backblaze B2 through its S3-compatible API, multer for uploads |

---

## How the backend is organised

Every request passes through five layers, each with one job:

```
route  ->  middleware  ->  controller  ->  service  ->  model
```

- **Routes** (`routes/`) decide which guard and which controller handle each path.
- **Middleware** (`middleware/`) verifies the JWT and the user's role, then attaches the user id to the request. The id is always read from the signed token, never from the request body.
- **Controllers** (`controller/`) validate the body with Zod and choose the HTTP status code.
- **Services** (`services/`) hold the business rules and all database work, including ownership checks (a store owner can only edit their own stores and products).
- **Models** (`models/`) define the five MongoDB collections: User, Store, Product, Order, Address.

---

## Design decisions worth a look

**Stock that cannot go below zero.** When a store owner accepts an order, stock is deducted with a single conditional database update that only succeeds if enough of that size is still available. If two orders compete for the last item, the database refuses the second one. If any item in an order fails, the items already deducted are put back before an error is returned.

**One cart, many stores.** A checkout with items from three stores creates three separate orders, so each store only sees and handles its own items.

**Orders are snapshots.** An order copies the product name, price and delivery address at the moment it is placed, so later price changes or deleted addresses cannot rewrite history.

**Roles cannot be self-assigned.** The registration schema has no `role` field, so anything extra sent by the client is stripped and every new account is a customer. Store owners are created by an admin.

**Images live outside the database.** Uploaded photos are checked (type and 5 MB limit), renamed to a random UUID, and stored in Backblaze B2. MongoDB only stores the resulting link. The storage keys never leave the server.

---

## Running it locally

**Requirements:** Node.js 22.18 or newer (the backend runs TypeScript directly), and a MongoDB database (local or Atlas). Image upload also needs a Backblaze B2 bucket set to public.

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env      # then fill in your values
npm run dev               # runs on http://localhost:3000

# 2. Frontend (in a second terminal)
cd frontend
npm install
npm run dev               # runs on http://localhost:5173
```

**Creating the first admin:** register a normal account through the website, then in MongoDB change that user's `role` field from `customer` to `admin`. From the admin page you can then create store owners.

---

## Known limitations

This is an internship project, not a production deployment. Things I would do next:

- Real card payments through a payment provider
- Order cancellation by the shopper, and notifications when an order's status changes
- Pagination and server-side search for large catalogues
- Refresh tokens so a session can be revoked, and rate limiting on login
- Moving the API address (`http://localhost:3000`) into an environment variable
- Deleting old images from storage when a product's photo is replaced

---

## Author

**Mojtaba Nasereddine**, intern at DualCom Consulting
