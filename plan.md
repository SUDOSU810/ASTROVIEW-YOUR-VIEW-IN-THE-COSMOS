# AstroView — Development Plan

Version: 1.0  
Timeline: Hackathon-Optimized  

---

# 🌌 CORE IDEA

AstroView converts complex space and satellite data into localized, simplified, and actionable insights.

It answers:

What is happening above me?
When will ISS pass?
Is sky clear for viewing?
How space impacts Earth?

---

# 🎯 PROJECT OBJECTIVES

Centralize space data
Provide localized alerts
Simplify technical information
Improve space awareness
Create immersive experience

---

# 📄 PAGE DEVELOPMENT PLAN

Page 1: Dashboard

Features:

NASA APOD
ISS status
Visibility score

---

Page 2: Sky Events

Features:

ISS passes
Planet visibility
Viewing quality

---

Page 3: Live Map

Features:

ISS tracking
Satellite overlay

---

Page 4: Missions

Features:

Mars rover images
Asteroid alerts

---

Page 5: Impact

Features:

Weather alerts
Heatwave detection

---

Page 6: Alerts

Features:

Event notifications
User preferences

---

# ⚙ FUNCTIONALITIES PLAN

Visibility Score Engine

Alert Engine

Event Filtering Engine

Data Simplifier Engine

---

# 🔔 NOTIFICATION LOGIC

Frontend checks events periodically.

If favorable:

Alert shown.

Optional backend cron job improves reliability.

---

# 🧠 BACKEND DEVELOPMENT PLAN

Phase 1:

API aggregation

Phase 2:

Processing engine

Phase 3:

Alert engine

---

# 🗄 DATABASE PLAN

Minimal storage:

User location
Alert preferences

---

# 🏗 FOLDER STRUCTURE PLAN

frontend/

components/
pages/
services/

backend/

routes/
services/
utils/

---

# 🏆 DEMO PLAN

Demo flow:

Open dashboard
Show visibility score
Show ISS alert
Show live map
Show impact page

Explain simplification engine.

---

# 🚀 DEVELOPMENT TIMELINE

Day 1:

Frontend base

Day 2:

API integration

Day 3:

Visualization

Day 4:

Alerts and polish

---

# ✅ CURRENT PROGRESS

Landing Page — DONE

• 5-section layout (Intro + Hero + Features + How It Works + CTA)
• Unicorn Studio WebGL backgrounds on intro + hero sections
• Features grid (4 cards), How It Works steps (4 steps)
• Footer with API credits and navigation links
• Files: src/pages/LandingPage.tsx, src/pages/LandingPage.css

Dashboard — DONE

• NASA APOD integration (real API fetch)
• ISS countdown, moon phase, meteor activity, visibility score cards
• Smart summary box with auto-generated insight
• Files: src/pages/Dashboard.tsx, src/pages/Dashboard.css

Sky Events — DONE

• Tab-based event filtering (Today/Week/Month)
• Event cards with visibility badges and descriptions
• Moon/Planet info panels, viewing quality meter
• Files: src/pages/SkyEvents.tsx, src/pages/SkyEvents.css

Space Impact — DONE

• Weather impact, disaster awareness, solar activity sections
• Kp Index scale visualization
• Status badges (Low/Moderate/High) with impact meters
• Files: src/pages/SpaceImpact.tsx, src/pages/SpaceImpact.css

Live Tracker — DONE

• Full-screen Leaflet map with dark tiles
• Real ISS position from Open Notify API (auto-refresh 5s)
• Trail path polyline, info panel overlay
• Files: src/pages/LiveTracker.tsx, src/pages/LiveTracker.css

Routing & Layout — DONE

• React Router with BrowserRouter
• Shared Layout (Navbar + Footer) for inner pages
• Standalone layout for landing page
• Files: src/App.tsx, src/main.tsx, src/components/

Next Steps:

• Backend API setup (Node.js + Express)
• Replace mock data with real API integrations
• Add user location detection

---

# FINAL GOAL

Deliver an intelligent, immersive, and educational space awareness platform.
