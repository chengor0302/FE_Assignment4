# FE Assignment 3 – User Management & Authentication

This project is a continuation of previous frontend assignments. It adds user management and authentication functionality to the website. The work was done in collaboration with team members, and all commits retain the original authorship.

---

## Project Overview

The application allows **registered users** to create, edit, and delete notes, while **guests** can only view notes. Key features include:

- User registration and login with JWT authentication
- Edit/Delete buttons visible only for the note’s author
- Notes and users stored in a MongoDB database
- Client-side caching in React to reduce unnecessary API requests
- Role-based access control for note management

---

## Features

- **User Authentication:** Users can register and log in; a token is stored in React state and sent in the Authorization header for API requests.
- **Note CRUD:** Create, read, update, and delete notes; only the author can modify their notes.
- **Caching:** 5 pages of notes are pre-fetched and cached for faster browsing.
- **Routing:**  
  - `/` – Homepage showing notes for all users  
  - `/login` – Login page  
  - `/create-user` – User registration page
- **Frontend Testing:** Playwright tests for all CRUD operations
- **Backend Testing:** Jest tests for CRUD operations and authentication

---

## Technologies Used

- **Frontend:** React, TypeScript, Axios, React Router
- **Backend:** Node.js, Express, TypeScript, MongoDB, Mongoose, bcrypt, JSON Web Token (JWT)  
- **Testing:** Playwright (Frontend), Jest (Backend)  
- **Dev Tools:** ESLint, Nodemon
