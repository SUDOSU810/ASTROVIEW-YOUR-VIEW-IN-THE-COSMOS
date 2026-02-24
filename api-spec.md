# AstroView — API Specification

Version: 1.0  

---

# 🌌 EXTERNAL APIs USED

---

## NASA APOD API

Endpoint:
https://api.nasa.gov/planetary/apod

Purpose:
Retrieve astronomy image of the day.

Response:

title  
explanation  
image url  

---

## Open Notify ISS API

Endpoint:
http://api.open-notify.org/iss-now.json

Purpose:
Retrieve live ISS position.

Response:

latitude  
longitude  

---

## Weather API

Endpoint:
Weather astronomy endpoint

Purpose:

Cloud coverage  
Visibility  
Moon phase  

---

## NASA Mars Rover API

Endpoint:
https://api.nasa.gov/mars-photos/api/v1/rovers/photos

Purpose:

Retrieve Mars rover images.

---

# 🧠 INTERNAL BACKEND APIs

---

## GET /api/dashboard

Returns:

visibility score  
iss location  
events  
astronomy image  

---

## GET /api/events

Returns:

upcoming celestial events  

---

## GET /api/map

Returns:

satellite positions  

---

## GET /api/missions

Returns:

mission data  

---

## GET /api/impact

Returns:

impact analysis  

---

# RESPONSE FORMAT

Standard JSON format:

{
  success: true,
  data: {}
}

---

# ERROR FORMAT

{
  success: false,
  error: "message"
}
