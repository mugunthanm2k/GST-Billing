# 🧾 GST Billing Pro

A full-stack GST billing system with **CGST / SGST / IGST** support, PDF export, and print functionality.

---

## 🛠 Tech Stack

| Layer     | Technology                                   |
|-----------|----------------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS, Redux Toolkit  |
| Backend   | Spring Boot 3.2, Spring Security, JPA        |
| Auth      | JWT (HS256)                                  |
| Database  | MySQL 8                                      |
| PDF       | iText PDF 5                                  |
| Charts    | Recharts                                     |

---

## 📁 Project Structure

```
gst-billing/
├── backend/                         # Spring Boot
│   ├── pom.xml
│   └── src/main/java/com/gstbilling/
│       ├── GstBillingApplication.java
│       ├── config/
│       │   └── SecurityConfig.java
│       ├── controller/
│       │   ├── AuthController.java
│       │   ├── InvoiceController.java
│       │   ├── CustomerController.java
│       │   ├── ProductController.java
│       │   ├── DashboardController.java
│       │   └── CompanyController.java
│       ├── dto/
│       │   ├── AuthRequest.java
│       │   ├── AuthResponse.java
│       │   ├── RegisterRequest.java
│       │   ├── InvoiceRequest.java
│       │   └── DashboardStats.java
│       ├── entity/
│       │   ├── User.java
│       │   ├── Customer.java
│       │   ├── Product.java
│       │   ├── Invoice.java
│       │   ├── InvoiceItem.java
│       │   └── CompanyProfile.java
│       ├── repository/  (5 JPA repos)
│       ├── security/
│       │   ├── JwtUtil.java
│       │   └── JwtAuthFilter.java
│       └── service/
│           ├── InvoiceService.java  (GST calculation engine)
│           ├── PdfService.java      (iText PDF generator)
│           └── NumberToWords.java   (Indian number system)
│
└── frontend/                        # React + Vite
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── api/
        │   └── axios.js             (JWT interceptor)
        ├── store/
        │   ├── store.js
        │   ├── authSlice.js
        │   ├── invoiceSlice.js
        │   ├── customerSlice.js
        │   └── productSlice.js
        ├── components/
        │   └── Layout.jsx           (sidebar + nav)
        └── pages/
            ├── LoginPage.jsx
            ├── Dashboard.jsx        (stats + charts)
            ├── InvoicesPage.jsx     (list + filters)
            ├── CreateInvoicePage.jsx (live GST calc)
            ├── InvoiceDetailPage.jsx (view + PDF + print)
            ├── CustomersPage.jsx
            ├── ProductsPage.jsx
            └── CompanyPage.jsx
```

---

## 🚀 Setup & Run

### Prerequisites
- Java 17+
- Maven 3.8+
- MySQL 8+
- Node.js 18+

---

### Step 1 — MySQL Database

```sql
CREATE DATABASE gst_billing_db;
```

Edit `backend/src/main/resources/application.properties`:
```properties
spring.datasource.username=YOUR_DB_USER
spring.datasource.password=YOUR_DB_PASSWORD
```

---

### Step 2 — Start Backend

```bash
cd gst-billing/backend
mvn spring-boot:run
```

Spring Boot auto-creates all tables on startup via `ddl-auto=update`.

Runs on: **http://localhost:8080**

---

### Step 3 — Seed Data

After Spring Boot starts (tables are created), run:

```bash
mysql -u root -p gst_billing_db < backend/src/main/resources/seed.sql
```

This creates:
- **Admin user**: `admin` / `admin123`
- Sample company profile
- 5 sample customers  
- 8 sample products

---

### Step 4 — Start Frontend

```bash
cd gst-billing/frontend
npm install
npm run dev
```

Runs on: **http://localhost:5173**

---

### Step 5 — First Login

1. Open `http://localhost:5173`
2. Login: **admin** / **admin123**
3. Go to **Company** → fill in your GSTIN and company details
4. Add **Customers** and **Products**
5. Create your first **Invoice** 🎉

---

## ✨ Features

### GST Engine
| Supply Type   | Tax Applied       | Condition                    |
|---------------|-------------------|------------------------------|
| Intra-State   | CGST + SGST        | Seller & buyer in same state |
| Inter-State   | IGST               | Different states             |

**GST Rates supported**: 0%, 5%, 12%, 18%, 28%

### Invoice
- Auto invoice numbering (`INV-2024-0001`)
- Per-line-item discount
- Multi-product line items
- Amount in words (Indian system: Lakh / Crore)
- Status workflow: DRAFT → SENT → PAID / OVERDUE / CANCELLED

### PDF & Print
- Professional iText PDF with GST breakdown
- Download as PDF
- Browser print via PDF viewer

### Dashboard
- KPI cards: revenue, invoices, customers
- Area chart: 6-month revenue trend
- Bar chart: monthly GST collected
- Recent invoices list

---

## 🔌 API Endpoints

| Method | Endpoint                    | Description           |
|--------|-----------------------------|-----------------------|
| POST   | `/api/auth/login`           | Login, returns JWT    |
| POST   | `/api/auth/register`        | Register user         |
| GET    | `/api/invoices`             | List invoices         |
| POST   | `/api/invoices`             | Create invoice        |
| GET    | `/api/invoices/{id}`        | Get invoice           |
| GET    | `/api/invoices/{id}/pdf`    | Download PDF          |
| PATCH  | `/api/invoices/{id}/status` | Update status         |
| DELETE | `/api/invoices/{id}`        | Delete invoice        |
| GET    | `/api/customers`            | List customers        |
| POST   | `/api/customers`            | Create customer       |
| PUT    | `/api/customers/{id}`       | Update customer       |
| DELETE | `/api/customers/{id}`       | Soft-delete customer  |
| GET    | `/api/products`             | List products         |
| POST   | `/api/products`             | Create product        |
| PUT    | `/api/products/{id}`        | Update product        |
| DELETE | `/api/products/{id}`        | Soft-delete product   |
| GET    | `/api/dashboard/stats`      | Dashboard stats       |
| GET    | `/api/company`              | Get company profile   |
| POST   | `/api/company`              | Save company profile  |

All endpoints except `/api/auth/**` require `Authorization: Bearer <token>` header.

---

## 🔑 Default Login

```
Username: admin
Password: admin123
```

---

## 📝 Notes

- JWT expiry: 24 hours
- All amounts in Indian Rupees (₹)
- Soft delete for customers and products (data preserved)
- Invoice numbers auto-increment per company profile counter
- PDF generation uses iText 5 (server-side, no browser dependency)
