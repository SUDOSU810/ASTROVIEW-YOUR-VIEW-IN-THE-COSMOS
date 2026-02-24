# AstroView — Design Specification
Version: 1.0  
Type: Award-Level Interactive Web Application  
Target: Hackathon Prototype + Production-Scalable Architecture  

---

# 🌌 DESIGN PHILOSOPHY

AstroView is designed as an immersive, futuristic, and educational space intelligence platform that transforms complex astronomical data into localized, actionable, and easy-to-understand insights.

The design must achieve three goals simultaneously:

1. Visual immersion (Awwwards-level UI)
2. Cognitive clarity (simplified explanations)
3. Real-time intelligence (live satellite and sky awareness)

The interface must make users feel connected to space while remaining accessible to non-technical users.

---

# 🎨 VISUAL DESIGN SYSTEM

## Theme

Primary: Dark Space Theme  
Secondary: Neon Futuristic Accents  

Background Gradient:
#070B1A → #000000

Primary Accent:
#00F5FF (Neon Cyan)

Secondary Accent:
#7B61FF (Cosmic Purple)

Highlight:
#FFB800 (Solar Orange)

Text:

Primary:
#FFFFFF

Secondary:
#A0A7C0

Alert Colors:

Critical: #FF4C4C
Warning: #FFB800
Info: #00F5FF

---

# ✨ VISUAL STYLE

Inspired by:

• NASA Eyes Visualization  
• Stellarium Web  
• Stripe.com  
• Linear.app  
• Awwwards award-winning websites  

Use:

• Glassmorphism cards
• Glow effects
• Smooth transitions
• Subtle particle backgrounds
• Parallax motion
• Soft shadows

Avoid clutter.

---

# 📱 PAGE STRUCTURE OVERVIEW

## Landing Page (Entry Point — IMPLEMENTED)

Two full-viewport sections:

Section 1 — Intro (First Half):
• Unicorn Studio WebGL scene as FULL background (project: QLxWLckQtb0kO31H6Glw, SDK v2.0.5)
• Semi-transparent radial gradient overlay for readability
• Full-screen centered "AstroView" text display
• Large gradient typography (Astro = white→gray, View = cyan→purple)
• Tagline text below
• Scroll-down hint with floating animation

Section 2 — Hero (Second Half):
• Unicorn Studio WebGL scene as FULL background (project: j6kWIL1oriRYcUqHDvpo, SDK v2.0.5)
• Semi-transparent dark gradient overlay for readability
• Overlaid content:
  - Navigation bar (brand + links)
  - Badge + heading + description
  - 3 glassmorphism feature cards (Sky Visibility, ISS Tracker, Smart Alerts)
  - CTA buttons (Launch Dashboard, Learn More)
  - Footer with API attribution

---

Total Pages: 6 Core Pages

1. Dashboard
2. Sky Events
3. Live Map
4. Space Missions
5. Space Impact
6. Alerts & Settings

---

# 🏠 DASHBOARD PAGE DESIGN

Purpose:
Central intelligence hub.

Layout:

Top Section:

• User location display
• Current sky visibility score
• Quick summary banner

Main Grid:

Card 1:
Astronomy Picture of the Day

Card 2:
Next ISS Pass Countdown

Card 3:
Sky Visibility Score

Card 4:
Today's Key Event

Card 5:
Quick Mission Highlight

Bottom Section:

Mini interactive Earth visualization preview.

---

# 🌠 SKY EVENTS PAGE DESIGN

Purpose:
Localized event discovery.

Layout:

Header:

Location selector
Date selector

Event Cards Grid:

Each card contains:

Event name
Visibility rating
Time
Viewing quality indicator
Alert toggle button

Visual indicator colors:

Excellent — Green glow
Good — Blue glow
Moderate — Yellow glow
Poor — Red glow

---

# 🗺 LIVE MAP PAGE DESIGN

Purpose:
Visual real-time tracking.

Layout:

Full-screen Mapbox or Globe visualization.

Overlay elements:

ISS position marker
Satellite path overlay
User location marker

Side Panel:

Satellite details
Next pass time
Velocity
Altitude

---

# 🚀 SPACE MISSIONS PAGE DESIGN

Purpose:
Education and engagement.

Layout:

Mission cards grid.

Each card contains:

Mission image
Mission name
Description
Impact explanation

Example:

Mars Rover

"This mission helps scientists understand Mars climate."

---

# 🌍 SPACE IMPACT PAGE DESIGN

Purpose:
Connect space data to real-world impact.

Sections:

Weather Monitoring

Heatwave detection

Storm tracking

Agriculture insights

Alert banners show detected conditions.

---

# 🔔 ALERT SYSTEM PAGE DESIGN

Purpose:
Alert control center.

Layout:

Alert cards list.

Each card contains:

Alert title
Time remaining countdown
Location relevance
Enable / Disable toggle

Alert types:

ISS pass alert
Meteor shower alert
Weather visibility alert

---

# 🎯 USER EXPERIENCE PRINCIPLES

System must feel:

Responsive  
Fast  
Clear  
Educational  

Avoid overwhelming users with technical data.

All technical values must be simplified.

Example:

Raw data:
"Cloud coverage: 74%"

Displayed as:
"Viewing conditions: Poor"

---

# 🌌 ANIMATION DESIGN

Allowed animations:

Satellite orbit motion
Glow pulsing alerts
Hover glow effects
Earth rotation

Avoid excessive motion.

---

# 📐 RESPONSIVE DESIGN

Desktop:
Primary experience.

Mobile:
Reduced animation
Simplified layout
Disable heavy particles

---

# 🎨 DESIGN SUMMARY

AstroView combines:

Scientific intelligence  
Modern immersive design  
Real-time interactivity  

to create an educational and actionable space intelligence experience.
