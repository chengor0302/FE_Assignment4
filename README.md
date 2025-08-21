# FE Assignment 4 – Rich Notes & Web Security (XSS)

This project extends the previous note-taking application to support **rich text notes** and explores **XSS (Cross-Site Scripting) vulnerabilities** and defenses. The work was done in collaboration with team members, and all commits retain original authorship.

---

## Project Overview

The application now allows users to create notes with **HTML formatting** (e.g., `<b>`, `<i>`, `<img>`), demonstrating how rich content can introduce **XSS vulnerabilities**. Users can toggle a sanitizer to defend against malicious scripts. The project includes an attacker server to demonstrate keylogger attacks and Playwright tests to verify both vulnerable and protected behaviors.

---

## Features

- **Rich Notes:** Users can create notes with HTML formatting (bold, italic, images, etc.).
- **XSS Vulnerability Demonstration:** Shows how unsafe HTML rendering can allow keylogger payloads.
- **Sanitizer & Defense:**  
  - Sanitizer removes dangerous tags/attributes (e.g., `<script>`, `onerror`) while allowing safe formatting.  
  - Frontend toggle allows switching between sanitized and raw HTML rendering.
- **Attacker Server:** Logs keystrokes sent by the keylogger payload.
- **Testing:**  
  - Playwright tests verify rich text rendering, XSS vulnerability with sanitizer OFF, and defense with sanitizer ON.  
  - Covers CRUD operations for notes.
- **Frontend & Backend:** Same functionality as previous assignment, extended for rich notes.

---

## Technologies Used

- **Frontend:** React, TypeScript, Axios, React Router, TailwindCSS  
- **Backend:** Node.js, Express, TypeScript, MongoDB, Mongoose  
- **Security:** XSS demonstration, sanitizer function for safe HTML rendering  
- **Testing:** Playwright (Frontend), Jest (Backend)   

---

## Project Structure Example

