# 🛍️ ShopKart

A full-stack MERN e-commerce application built across six engineering labs. ShopKart covers the complete shopping journey: **register → browse → save → cart → checkout → pay → order history**.

---

## ✨ Features

| Area | What it does |
|---|---|
| **Authentication** | Register, login, logout, protected profile using JWT stored in an HttpOnly cookie |
| **Product Catalog** | Product CRUD (create/read), search, category filter, product details page |
| **Wishlist** | Save/remove products per user, duplicate prevention, populated product data |
| **Shopping Cart** | Add, update quantity, remove, stock validation, global state, live navbar count |
| **Checkout** | Shipping form with validation, server-side stock + price verification |
| **Payments** | Razorpay **Test Mode** integration with HMAC signature verification |
| **Orders** | Order snapshot (name/price at purchase time), order history, ownership checks |

---

## 🧰 Tech Stack

**Backend**
- Node.js, Express.js
- MongoDB + Mongoose
- bcrypt, jsonwebtoken, cookie-parser
- Razorpay SDK, Node `crypto`

**Frontend**
- React, React Router DOM
- Axios (with `withCredentials: true`)
- Context API **or** Redux Toolkit (cart state)
- CSS / Tailwind CSS

> No Passport.js, Firebase, Clerk, or Auth0 — authentication is implemented from scratch.

---

## 📁 Project Structure

```text
ShopKart/
├── shopkart-backend/
│   ├── config/
│   │   └── razorpay.js
│   ├── controllers/
│   │   ├── customer.controller.js
│   │   ├── product.controller.js
│   │   ├── wishlist.controller.js
│   │   ├── cart.controller.js
│   │   └── order.controller.js
│   ├── models/
│   │   ├── customer.model.js
│   │   ├── product.model.js
│   │   └── order.model.js
│   ├── routes/
│   │   ├── customer.routes.js
│   │   ├── product.routes.js
│   │   ├── wishlist.routes.js
│   │   ├── cart.routes.js
│   │   └── order.routes.js
│   ├── middlewares/
│   │   └── auth.middleware.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── index.js
│   └── .env
│
└── shopkart-frontend/
    └── src/
        ├── context/
        │   └── CartContext.jsx             # Global cart state
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Home.jsx
        │   ├── Products.jsx
        │   ├── ProductDetails.jsx
        │   ├── Wishlist.jsx
        │   ├── Cart.jsx
        │   ├── Checkout.jsx
        │   ├── OrderSuccess.jsx
        │   ├── Orders.jsx
        │   └── OrderDetails.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── ProductCard.jsx
        │   ├── SearchBar.jsx
        │   ├── WishlistCard.jsx
        │   ├── CartItem.jsx
        │   ├── CheckoutForm.jsx
        │   ├── OrderSummary.jsx
        │   └── OrderCard.jsx
        ├── services/
        │   ├── api.js
        │   └── razorpay.js
        ├── utils/
        │   └── format.js
        ├── App.jsx
        └── main.jsx
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local instance or MongoDB Atlas)
- A Razorpay account in **Test Mode**

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd ShopKart
```

### 2. Backend setup

```bash
cd shopkart-backend
npm install
```

Create `shopkart-backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/shopkart
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxx
RAZORPAY_KEY_SECRET=your_test_secret
```

Start the server:

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd shopkart-frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` and the API at `http://localhost:5000`.

> ⚠️ Add `.env` to `.gitignore`. **Never commit `RAZORPAY_KEY_SECRET` or `JWT_SECRET`.**

---

## 🔌 API Reference

### Customers / Auth

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| POST | `/customers/register` | ❌ | Create an account (password stored as bcrypt hash) |
| POST | `/customers/login` | ❌ | Login; sets HttpOnly JWT cookie |
| GET | `/customers/me` | ✅ | Get the current customer |
| POST | `/customers/logout` | ✅ | Clear the auth cookie |
| PATCH | `/customers/change-password` | ✅ | *(Bonus)* Change password |

**Register body**
```json
{
  "fullName": "John Doe",
  "email": "john@gmail.com",
  "password": "john123",
  "phone": "9876543210"
}
```

**Status codes:** `400` missing field / short password · `409` duplicate email · `401` invalid credentials or missing/invalid token.

### Products

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| POST | `/products` | ❌ | Create a product |
| GET | `/products` | ❌ | List products |
| GET | `/products/:id` | ❌ | Get one product |

**Query parameters for `GET /products`**

```text
/products?search=keyboard
/products?category=Electronics
/products?search=keyboard&category=Electronics
/products?sort=price_asc      # bonus
/products?sort=price_desc     # bonus
```

**Status codes:** `201` created · `400` invalid input/ID · `404` not found.

### Wishlist

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| POST | `/wishlist/:productId` | ✅ | Add product |
| GET | `/wishlist` | ✅ | Get current user's wishlist (populated) |
| DELETE | `/wishlist/:productId` | ✅ | Remove product |

**Status codes:** `400` invalid ID · `401` unauthenticated · `404` product not found / not in wishlist · `409` already in wishlist.

### Cart

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| POST | `/cart/:productId` | ✅ | Add product (or increment quantity by 1) |
| GET | `/cart` | ✅ | Get cart with populated products |
| PATCH | `/cart/:productId` | ✅ | Update quantity (`{ "quantity": 3 }`) |
| DELETE | `/cart/:productId` | ✅ | Remove product |

**Rules:** quantity ≥ 1 and ≤ product stock; re-adding the same product increases quantity instead of creating a duplicate row.

### Orders & Payments

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| POST | `/orders/create-payment-order` | ✅ | Validate cart, create pending order + Razorpay order |
| POST | `/orders/verify-payment` | ✅ | Verify signature, mark order PAID/PLACED, clear cart |
| GET | `/orders` | ✅ | Get current user's orders (newest first) |
| GET | `/orders/:id` | ✅ | Get one order (ownership enforced) |

**Create payment order body** (only the address — never totals)
```json
{
  "shippingAddress": {
    "fullName": "Aarav Sharma",
    "phone": "9876543210",
    "addressLine1": "22 MG Road",
    "city": "Bengaluru",
    "state": "Karnataka",
    "pincode": "560001"
  }
}
```

**Verify payment body**
```json
{
  "shopKartOrderId": "67abc123",
  "razorpay_order_id": "order_ABC123",
  "razorpay_payment_id": "pay_XYZ123",
  "razorpay_signature": "signature_here"
}
```

---

## 🗃️ Data Models

**Customer**
```text
fullName, email (unique), password (bcrypt hash), phone, createdAt
wishlist: [ObjectId -> Product]
cart:     [{ product: ObjectId -> Product, quantity }]
```

**Product**
```text
name, description, price (> 0), category, image, stock (>= 0), createdAt
```

**Order**
```text
user -> Customer
items: [{ product, name, price, quantity, image }]   # purchase-time snapshot
shippingAddress: { fullName, phone, addressLine1, city, state, pincode }
totalAmount
paymentStatus: PENDING | PAID | FAILED
status: PENDING_PAYMENT | PLACED | CONFIRMED | SHIPPED | DELIVERED
razorpayOrderId, razorpayPaymentId
timestamps
```

---

## 💳 Payment Flow (Razorpay Test Mode)

```text
React Checkout
   ↓ POST /orders/create-payment-order
Backend validates cart, stock, latest prices; calculates total
   ↓
Creates ShopKart order (PENDING_PAYMENT) + Razorpay order (amount in paise)
   ↓
React opens Razorpay Checkout
   ↓
Razorpay returns payment_id + order_id + signature
   ↓ POST /orders/verify-payment
Backend verifies HMAC SHA256 signature
   ↓
Order → PAID / PLACED, cart cleared
   ↓
Frontend cart state cleared → Order Success page
```

Signature verification:

```js
const body = order.razorpayOrderId + "|" + razorpay_payment_id;
const expected = crypto
  .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
  .update(body)
  .digest("hex");
```

> Use Razorpay **Test Mode** only. No real money is involved.

---

## 🔐 Security Notes

- Passwords are stored only as **bcrypt hashes** and never returned in responses.
- JWT is stored in an **HttpOnly cookie**, so JavaScript cannot read it.
- The frontend uses `withCredentials: true` so cookies are sent with requests.
- User identity always comes from the **auth middleware**, never from `userId` in the request body or URL.
- Order totals and prices are **calculated on the server**; frontend values are ignored.
- Stock is **re-verified** at checkout.
- Orders are marked PAID only after **signature verification**; the cart is cleared only after that.
- `RAZORPAY_KEY_SECRET` stays on the backend only.
- Users can access only their own orders.

---

## 🧪 Testing

Test the backend with **Postman** before wiring up React.

- **Auth:** register, duplicate email (409), login, `/customers/me` with and without cookie, logout
- **Products:** create, list, search/filter, invalid ID (400), missing ID (404)
- **Wishlist:** add, duplicate (409), get, remove, unauthenticated (401)
- **Cart:** add, re-add (quantity 2), update, exceed stock (400), remove
- **Orders:** empty cart (400), insufficient stock (400), fake total ignored, fake signature (400, cart preserved), valid test payment (PAID/PLACED, cart cleared), other user's order (403/404)

---

## 🗺️ Frontend Routes

| Route | Page | Protected |
|---|---|:---:|
| `/register` | Register | ❌ |
| `/login` | Login | ❌ |
| `/home` | Home | ✅ |
| `/products` | Product listing | ✅ |
| `/products/:id` | Product details | ✅ |
| `/wishlist` | Wishlist | ✅ |
| `/cart` | Cart | ✅ |
| `/checkout` | Checkout | ✅ |
| `/order-success/:id` | Order confirmation | ✅ |
| `/orders` | My orders | ✅ |
| `/orders/:id` | Order details | ✅ |

All data-driven pages implement **loading**, **empty**, and **error** states.

---

## 🧭 Lab Roadmap

| Lab | Focus |
|---|---|
| 01 | Backend auth: register, login, JWT, HttpOnly cookie, protected profile, logout |
| 02 | Frontend auth: Register / Login / Home pages, protected routes |
| 03 | Product catalog, search, filtering, product details |
| 04 | Wishlist with MongoDB references and `populate()` |
| 05 | Shopping cart with global state, quantity, stock validation |
| 06 | Checkout, Razorpay payments, order snapshots, order history |

---

## 👤 Author

Your Name — `your.email@example.com`

Built as part of the ShopKart Engineering Lab series.
