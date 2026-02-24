# AstroView — System Architecture

Version: 1.0  
Architecture Type: Hybrid Frontend-Driven + Lightweight Backend  

---

# 🌌 ARCHITECTURE OVERVIEW

AstroView follows an aggregation architecture where frontend and backend collect, process, and simplify space and weather data into actionable insights.

Core layers:

Frontend Layer
Aggregation Layer
Processing Layer
External Data Layer

---

# ⚙ ARCHITECTURE DIAGRAM

User
↓
Frontend (React)
↓
Backend Aggregator (Node.js)
↓
External APIs
↓
Processing Engine
↓
Frontend Display

---

# 🧱 CORE COMPONENTS

## Frontend Layer

Technology:

React
Mapbox / Globe.gl
Unicorn Studio (visual layer)

Responsibilities:

Get user location
Request backend data
Display visualizations
Display alerts

---

## Backend Layer

Technology:

Node.js
Express.js

Responsibilities:

Aggregate external APIs
Process raw data
Calculate visibility score
Generate alerts
Simplify technical data

---

# 🌐 EXTERNAL DATA SOURCES

NASA APIs

Provides:

Astronomy Picture
Mars Rover Images
Asteroid Data

Open Notify API

Provides:

ISS location

Weather API

Provides:

Cloud coverage
Visibility
Weather data

Mapbox API

Provides:

Map visualization

---

# 🧠 PROCESSING ENGINE

Backend performs:

Visibility calculation
Event filtering
Impact detection
Data simplification

Example:

Raw:

cloud coverage: 78%

Processed:

visibility: Poor

---

# 🔄 DATA FLOW

Step 1:
User opens app.

Step 2:
Frontend gets user location.

Step 3:
Frontend requests backend.

Step 4:
Backend calls external APIs.

Step 5:
Backend processes data.

Step 6:
Backend returns clean response.

Step 7:
Frontend displays results.

---

# 🔔 ALERT SYSTEM ARCHITECTURE

Alert Engine runs periodically.

Checks:

ISS passes
Sky visibility
Weather conditions

If conditions favorable:

Alert generated.

Alert sent to frontend.

---

# 🗄 DATABASE ARCHITECTURE

Minimal database.

Stores:

User location
Alert preferences

No heavy storage required.

---

# 🧱 BACKEND MODULE STRUCTURE

routes/

dashboardRoutes.js  
eventsRoutes.js  
missionsRoutes.js  
impactRoutes.js  

services/

nasaService.js  
weatherService.js  
issService.js  

utils/

visibilityCalculator.js  
impactEngine.js  
simplifier.js  

models/

userModel.js  

server.js

---

# 🧠 SCALABILITY DESIGN

System designed to scale by:

Adding caching layer
Adding notification queue
Adding user profiles

---

# ARCHITECTURE SUMMARY

AstroView uses a lightweight aggregation architecture to transform fragmented space data into actionable insights.
