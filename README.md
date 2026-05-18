# StyleSync – Virtual Wardrobe

## Overview

StyleSync is a modern full stack virtual wardrobe web application that helps users digitally organize clothing collections, upload wardrobe images, receive smart outfit recommendations, and save favourite outfits.

The project is developed using React.js, Node.js, Express.js, MongoDB Atlas, and Cloudinary.

---

# Features

* User Registration and Login
* JWT Authentication
* Password Encryption using bcrypt
* Digital Wardrobe Management
* Clothing Image Upload using Cloudinary
* Smart Outfit Recommendation System
* Favourite Outfit Saving
* Responsive Modern UI
* MongoDB Database Integration
* Protected Backend Routes
* Search and Filtering Functionality

---

# Tech Stack

## Frontend

* React.js
* CSS3
* Axios
* React Router DOM

## Backend

* Node.js
* Express.js
* JWT Authentication
* bcrypt.js
* Multer
* Cloudinary

## Database

* MongoDB Atlas
* Mongoose ODM

## Deployment

* Vercel (Frontend)
* Render (Backend)

---

# Project Structure

```text
stylesync/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── .env
│
├── server/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── README.md
```

---

# Frontend Pages

## Login Page

Allows existing users to securely login using email and password.

## Register Page

Allows new users to create an account.

## Dashboard Page

Displays the main application dashboard and navigation features.

## Wardrobe Page

Allows users to upload, manage, search, and filter clothing items.

## Recommendation Page

Generates outfit suggestions based on occasion and weather conditions.

## Saved Outfits Page

Displays users’ favourite saved outfits.

---

# Backend Modules

## Authentication Module

Handles user registration, login, JWT generation, and protected routes.

## Wardrobe Module

Manages wardrobe item uploads, retrieval, deletion, filtering, and favourites.

## Recommendation Engine

Implements outfit recommendation logic based on wardrobe data.

## Cloudinary Upload Module

Handles cloud-based image upload and storage.

---

# Database Collections

## User Collection

Stores user information and authentication data.

### Fields

* name
* email
* password
* stylePreferences
* favoriteColors

---

## ClothingItem Collection

Stores wardrobe item details.

### Fields

* user
* name
* category
* color
* occasion
* style
* imageUrl
* isFavorite

---

## SavedOutfit Collection

Stores favourite outfit combinations.

### Fields

* user
* items
* occasion
* score
* notes

---

# Installation Guide

## Clone Repository

```bash
git clone https://github.com/Harshithamanjunatha/stylesync.git
```

---

# Frontend Setup

```bash
cd client
npm install
npm start
```

Frontend runs on:

```text
http://localhost:3000
```

---

# Backend Setup

```bash
cd server
npm install
npm start
```

Backend runs on:

```text
http://localhost:5000
```

---

# Environment Variables

## Backend .env

```env
MONGODB_URI=your_mongodb_atlas_url
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

# API Endpoints

## Authentication APIs

| Method | Endpoint           | Description       |
| ------ | ------------------ | ----------------- |
| POST   | /api/auth/register | Register new user |
| POST   | /api/auth/login    | User login        |
| GET    | /api/auth/me       | Get logged user   |

---

## Wardrobe APIs

| Method | Endpoint                   | Description          |
| ------ | -------------------------- | -------------------- |
| GET    | /api/wardrobe              | Get wardrobe items   |
| POST   | /api/wardrobe              | Add wardrobe item    |
| DELETE | /api/wardrobe/:id          | Delete wardrobe item |
| PATCH  | /api/wardrobe/:id/favorite | Toggle favourite     |

---

## Outfit APIs

| Method | Endpoint               | Description               |
| ------ | ---------------------- | ------------------------- |
| GET    | /api/outfits/recommend | Get outfit recommendation |
| GET    | /api/outfits/saved     | Get saved outfits         |
| POST   | /api/outfits/save      | Save outfit               |

---

# Authentication & Security

* JWT Authentication
* Password hashing using bcrypt salt 12
* Protected backend routes
* Environment variable protection
* Secure Cloudinary uploads

---

# Deployment

## Frontend Deployment

Frontend deployed using Vercel.

## Backend Deployment

Backend deployed using Render.

## Database Hosting

MongoDB Atlas used for cloud database hosting.

## Image Hosting

Cloudinary used for cloud image storage.

---

# Output Features

* Secure User Authentication
* Wardrobe Management
* Image Upload
* Outfit Recommendation
* Favourite Outfit Saving
* Responsive User Interface
* Cloud Database Integration

---

# Future Enhancements

* AI-based outfit recommendation
* Weather API integration
* Fashion trend analysis
* Mobile application support
* Dark mode UI
* Drag-and-drop wardrobe organization

---

# Author

Harshitha Manjunath

---

# License

This project is developed for academic and educational purposes.

