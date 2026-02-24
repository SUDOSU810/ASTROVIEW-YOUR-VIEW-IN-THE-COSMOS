# AstroView — Requirements Specification

Version: 1.0  
Project Type: Space Intelligence Platform  
Target Users: Students, educators, space enthusiasts, general public  

---

# 🌌 PROJECT OVERVIEW

AstroView is a space-awareness platform that aggregates satellite, astronomical, and weather data and converts it into localized, simplified, and actionable insights.

The system bridges the gap between fragmented space data and user understanding by presenting information in an intuitive, visual, and educational format.

---

# 🎯 FUNCTIONAL REQUIREMENTS

## FR1 — User Location Detection

The system shall detect the user’s geographic location using browser geolocation.

Input:
Latitude, Longitude

Output:
Localized sky events and satellite data

---

## FR2 — Dashboard Information Display

The system shall display:

• Astronomy Picture of the Day  
• ISS current location  
• Sky visibility score  
• Upcoming celestial events  

---

## FR3 — Sky Events Retrieval

The system shall retrieve and display:

• ISS passes  
• Moon phase  
• Sunrise and sunset  
• Planet visibility  

Filtered by:

• Location  
• Time  
• Weather conditions  

---

## FR4 — Live Satellite Tracking

The system shall display real-time satellite positions on an interactive map or globe.

---

## FR5 — Visibility Score Calculation

The system shall calculate sky visibility using:

Visibility Score =
100 − cloud coverage − (moon illumination / 2)

Output categories:

Excellent  
Good  
Moderate  
Poor  

---

## FR6 — Alert Generation

The system shall generate alerts for:

• ISS passes  
• Favorable sky conditions  
• Major celestial events  

---

## FR7 — Educational Content Display

The system shall display:

• Mars rover images  
• Asteroid information  
• Satellite missions  

Simplified for non-expert users.

---

## FR8 — Impact Analysis

The system shall analyze satellite and weather data to detect:

• Heatwaves  
• Storm conditions  
• Weather anomalies  

---

# ⚙ NON-FUNCTIONAL REQUIREMENTS

Performance:

Dashboard load time < 3 seconds

Scalability:

Support concurrent users

Usability:

Beginner-friendly interface

Reliability:

Graceful API failure handling

Compatibility:

Desktop and mobile browsers

---

# 🔒 SECURITY REQUIREMENTS

Protect API keys
Secure user location data
Use HTTPS connections

---

# 📊 DATA REQUIREMENTS

External Data Sources:

NASA APIs  
Weather API  
Open Notify API  
Mapbox API  

Minimal internal storage required.

---

# 🧠 SYSTEM CONSTRAINTS

Dependent on external APIs
Internet connection required

---

# SUCCESS CRITERIA

System successfully displays localized space insights and alerts.
