<div align="center">

# 🏡 Wanderlust

**A full-stack Airbnb-style marketplace for discovering, listing and reviewing places to stay.**

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?logo=mongodb&logoColor=white)
![EJS](https://img.shields.io/badge/Views-EJS-B4CA65)
![Bootstrap](https://img.shields.io/badge/UI-Bootstrap_5-7952B3?logo=bootstrap&logoColor=white)
![Deployed on Render](https://img.shields.io/badge/Deployed_on-Render-46E3B7?logo=render&logoColor=white)

</div>

---

## Overview

Wanderlust lets users browse stays by category or search, publish their own listings with photos, view each property on an interactive map and share star-rated reviews. It is built as a server-rendered MVC application with session-based authentication, role-aware authorization and layered input validation.

<!-- Add screenshots here, e.g. ![Home](docs/home.png) -->

## Features

**Listings**

- Create, edit and delete listings, restricted to the listing's owner
- Image upload to Cloudinary (JPG, PNG, WEBP, up to 5 MB) with automatic cleanup of replaced or orphaned images
- Category filtering and keyword search across title, location, country and category

**Maps**

- Locations are geocoded with the Mapbox Geocoding API on create and update
- Interactive Mapbox GL map with a marker on every listing page

**Reviews**

- 1 to 5 star ratings with comments
- Only the author can delete a review; deleting a listing cascades to its reviews

**Accounts and security**

- Sign up, log in and log out with Passport (local strategy) and hashed, salted passwords
- Sessions persisted in MongoDB, so logins survive restarts and deployments
- Post-login redirect back to the originally requested page
- Server-side authorization on every protected route
- Client-side (Bootstrap) and server-side (Joi) validation
- Flash messages, custom 404 and error pages, safe handling of invalid IDs

## Tech stack

| Layer             | Technologies                                                                      |
| ----------------- | --------------------------------------------------------------------------------- |
| Server            | Node.js 20+, Express 5                                                            |
| Database          | MongoDB, Mongoose 9, MongoDB Atlas                                                |
| Views             | EJS, ejs-mate, Bootstrap 5, Font Awesome, Starability                             |
| Auth and sessions | Passport, passport-local, passport-local-mongoose, express-session, connect-mongo |
| Validation        | Joi                                                                               |
| Media and maps    | Multer, Cloudinary, Mapbox GL JS, Mapbox Geocoding SDK                            |

## Getting started

**Prerequisites:** Node.js 20+, a MongoDB database (local or Atlas), and free Cloudinary and Mapbox accounts.

### Environment variables

| Variable                | Description                                             |
| ----------------------- | ------------------------------------------------------- |
| `ATLAS_URI`             | MongoDB Atlas connection string (app data and sessions) |
| `PORT`                  | Port the server listens on                              |
| `SESSION_SECRET`        | Secret used to sign and encrypt sessions                |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name                                   |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                                      |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret                                   |
| `MAPBOX_PUBLIC_TOKEN`   | Mapbox public access token                              |
| `NODE_ENV`              | Set to `production` when deployed                       |

### Scripts

| Command        | Description                                                             |
| -------------- | ----------------------------------------------------------------------- |
| `npm start`    | Start the server                                                        |
| `npm run dev`  | Start with auto-restart on file changes                                 |
| `npm run seed` | Reset the database with sample listings (**deletes existing listings**) |

Maintenance scripts in `init/` (run from the project root): `fixGeometry.js` and `fixCategory.js` backfill missing coordinates and categories on older listings and are safe to re-run.

## Project structure

```
├── app.js              Application entry: middleware, sessions, auth, routes, error handling
├── cloudConfig.js      Cloudinary and Multer storage configuration
├── middleware.js       Authentication, authorization and validation middleware
├── schema.js           Joi validation schemas
├── controllers/        Request handlers (listings, reviews, users)
├── models/             Mongoose models (Listing, Review, User)
├── routes/             Express routers
├── utils/              Categories, ExpressError, async wrapper
├── views/              EJS templates (layouts, includes, listings, users)
├── public/             Static assets (CSS, client-side JS)
└── init/               Seed data and maintenance scripts
```

## API overview

| Method | Endpoint                          | Description                         | Access                 |
| ------ | --------------------------------- | ----------------------------------- | ---------------------- |
| GET    | `/listings`                       | List listings (`?category=`, `?q=`) | Public                 |
| POST   | `/listings`                       | Create a listing                    | Authenticated          |
| GET    | `/listings/:id`                   | View a listing, map and reviews     | Public                 |
| PUT    | `/listings/:id`                   | Update a listing                    | Owner                  |
| DELETE | `/listings/:id`                   | Delete a listing and its reviews    | Owner                  |
| POST   | `/listings/:id/reviews`           | Add a review                        | Authenticated          |
| DELETE | `/listings/:id/reviews/:reviewId` | Delete a review                     | Review author          |
| POST   | `/signup`, `/login`, `/logout`    | Account actions                     | Public / Authenticated |

## Data model

```
User     email (unique), username, hashed password
Listing  title, description, category, image{url, filename}, price,
         location, country, geometry{Point}, owner → User, reviews[] → Review
Review   rating (1–5), comment, createdAt, author → User
```

## Deployment

The app is deployed on [Render](https://render.com) with MongoDB Atlas.

- **Build command:** `npm install`
- **Start command:** `npm start`
- **Environment:** all variables above, with `NODE_ENV=production` and `MONGO_URI` pointing to Atlas

Production sessions use secure, `httpOnly`, `sameSite` cookies and require HTTPS, which Render provides by default.

## Roadmap

- Pagination and price filtering or sorting
- Multiple images per listing
- Bookings with availability
- Wishlists
- Rate limiting, security headers and automated tests
