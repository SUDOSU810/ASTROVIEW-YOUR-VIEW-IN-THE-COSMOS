# AstroView — Backend Architecture

Version: 1.0  
Framework: Node.js + Express  

---

# 🌌 BACKEND PURPOSE

Backend acts as aggregation and processing layer.

Responsibilities:

API aggregation
Data processing
Alert generation
Data simplification

---

# 🧱 CORE MODULES

Routes:

dashboardRoutes
eventsRoutes
missionsRoutes
impactRoutes

Services:

nasaService
weatherService
issService

Utils:

visibilityCalculator
impactEngine
simplifier

Models:

userModel

---

# 🔄 REQUEST FLOW

Frontend request
↓
Route handler
↓
Service layer
↓
External API
↓
Processing layer
↓
Response returned

---

# 🧠 VISIBILITY ENGINE

Input:

cloud coverage  
moon illumination  

Output:

visibility score

---

# 🔔 ALERT ENGINE

Checks periodically:

ISS passes
Sky visibility

Generates alerts.

---

# 🗄 DATABASE USAGE

Minimal storage.

Stores:

User location
Preferences

---

# 🧠 SCALABILITY

Backend supports future:

User authentication
Push notifications
Caching layer
