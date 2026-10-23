# Vehicle Service Record Management System (VSRMS)

A web application designed to track, manage, and predict automotive maintenance, service histories, expense distributions, and compliance document renewals for personal and fleet vehicles.

- 🌐 **Live Production URL:** [https://vehicle-service-management-pink.vercel.app](https://vehicle-service-management-pink.vercel.app)
- 📦 **GitHub Repository:** [https://github.com/sathwikale2412/vehicle-service-management](https://github.com/sathwikale2412/vehicle-service-management)

Built from the ground up based on the architectural wireframes in `New Doc 10-23-2026 02.46.pdf`, featuring an integrated **AI Vehicle Diagnostic Assistant Column**, **Live Real-Time Date & Time Clock**, and **Row Level Security (RLS)** cloud synchronization.

---

## 🚀 Key Features & Modules

1. **Fleet Dashboard with Real-Time Live Clock**
   - Live digital clock tracking real-time date, hour, minute, and second in IST.
   - 4 Top-level KPI summary cards: Total Vehicles, Upcoming Services, Total Expenses (₹), and Active Reminders.
   - Scheduled services countdown timeline (e.g. Oil change due in 5 days, General service in 21 days).

2. **🤖 AI Vehicle Assistant & Diagnostics (Dedicated Column)**
   - Predictive engine monitoring odometer intervals, oil life degradation, tyre rotation cycles, and diesel particulate filter (DPF) soot prevention.
   - Interactive conversational assistant answering troubleshooting queries, maintenance cost benchmarks, and compliance rules in Indian Rupees (₹).
   - Powered by a dual-engine architecture: Python Flask AI Gateway with local expert automotive rule engine + LLM fallback.

3. **🚗 Vehicle Management ("My Vehicles" & "Vehicle Details")**
   - Full fleet registry supporting Diesel, Petrol, Electric, and Hybrid vehicles.
   - Comprehensive detail sheet tracking model year, registration date, insurance validity, PUC certificates, and current odometer readings.
   - Quick actions to log service, add expense, upload documents, and schedule reminders.

4. **🔧 Service Record Management**
   - Digital log of periodic maintenance, brake pad replacements, wheel alignments, and fluid flushes.
   - Running total maintenance expenditure calculation.

5. **💰 Expense Tracker**
   - Visual category distribution breakdown (Service, Fuel, Repair, Insurance, Others).
   - Monthly and annual expenditure totals with instant itemized transaction logs.

6. **⏰ Service & Renewal Reminders**
   - Automated alerts for Insurance Renewal, Pollution Certificate (PUC), and General Service.
   - Real-time countdown badges highlighting urgent items (< 30 days).

7. **📊 Reports & Analytics**
   - Average cost per kilometer analysis.
   - Fleet mechanical health index.
   - One-click CSV audit export.

8. **👤 User Profile & Settings**
   - Pre-configured user profile for **Ale Sathwik Netha** (`sathwikale@gmail.com`).

---

## 🛠️ Architecture & Tech Stack

- **Frontend:** React 19, Vite, Lucide Icons, Custom Modern CSS Design System
- **Backend API Gateway:** Python (Flask), RESTful endpoints for `/api/health`, `/api/ai/insights`, `/api/ai/assistant`
- **Database & Authentication:** Supabase (PostgreSQL with Row Level Security, tables prefixed with `vsrms_`)
- **Deployment Platform:** Vercel Multi-Service configuration (`vercel.json`) with strict Content-Security-Policy headers

---

## 🗄️ Database Schema & Security (Supabase)

All tables feature dedicated `vsrms_` prefix to operate in shared Supabase databases without schema collision:
- `vsrms_logins`: User authentication and sign-in audit logs.
- `vsrms_profiles`: User profile data with `auth.uid() = user_id` row-level ownership.
- `vsrms_vehicles`: Fleet vehicle master table with owner policies.
- `vsrms_service_records`: Digital service logs with cascade deletes.
- `vsrms_expenses`: Financial ledger records categorized by expense type.
- `vsrms_reminders`: Due-date tracking for compliance and maintenance.

---

## 🧪 Testing

### Backend API Test Suite
```bash
cd api
python test_gateway.py
```
Validates:
- `[PASS] GET /api/health` returns status healthy.
- `[PASS] POST /api/ai/insights` returns diagnostic scores and recommendations.
- `[PASS] POST /api/ai/assistant` returns expert guidance.

### Frontend Production Build
```bash
npm run build
```
Produces optimized static distribution in `dist/`.
