# 🏡 Wanderlust

An Airbnb-style full-stack web app where users can discover stays, list their own properties, upload photos, see locations on a map and leave star-rated reviews.

**Live demo:** `https://wanderlust-i3r9.onrender.com/listings`

<!-- Add a screenshot or GIF here: ![Wanderlust home page](docs/home.png) -->

---

## Table of contents

- [🏡 Wanderlust](#-wanderlust)
  - [Table of contents](#table-of-contents)
  - [Features](#features)
  - [Tech stack](#tech-stack)
  - [Getting started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Environment variables](#environment-variables)
  - [Scripts](#scripts)
  - [Seeding and maintenance scripts](#seeding-and-maintenance-scripts)
  - [Project structure](#project-structure)
  - [Routes](#routes)
  - [Data models](#data-models)
  - [Validation and security](#validation-and-security)
  - [Deployment on Render](#deployment-on-render)
  - [Troubleshooting](#troubleshooting)
  - [Roadmap](#roadmap)
  - [License](#license)

---

## Features

**Listings**

- Browse all listings with price, image and title
- Create, edit and delete listings (owners only)
- Image upload to Cloudinary (JPG, PNG or WEBP, max 5 MB) with automatic cleanup of replaced or deleted images
- Filter by category (Trending, Rooms, Iconic Cities, Mountains, Castles, Amazing Pools, Camping, Farms, Arctic)
- Search by title, location, country or category

**Maps**

- Location text is geocoded with the Mapbox Geocoding API when a listing is created or its location changes
- Interactive Mapbox map with a marker on each listing's page

**Reviews**

- Star ratings (1 to 5) and comments using Starability
- Only the review author can delete a review
- Deleting a listing also deletes its reviews

**Authentication and authorization**

- Sign up, log in and log out with Passport (local strategy)
- Redirects back to the page you were trying to visit after logging in
- Ownership checks on editing and deleting listings and reviews
- Sessions stored in MongoDB (`connect-mongo`) so logins survive server restarts

**User experience**

- Flash messages for success and error feedback
- Client-side form validation (Bootstrap) plus server-side validation (Joi)
- Friendly error pages, including 404 for unknown pages and invalid IDs
- Responsive layout built with Bootstrap 5

---

## Tech stack

| Area               | Technology                                                |
| ------------------ | --------------------------------------------------------- |
| Runtime and server | Node.js 20+, Express 5                                    |
| Database           | MongoDB with Mongoose 9 (MongoDB Atlas in production)     |
| Templating         | EJS with ejs-mate layouts                                 |
| Authentication     | Passport, passport-local, passport-local-mongoose         |
| Sessions           | express-session with connect-mongo                        |
| Validation         | Joi (server side), Bootstrap validation (client side)     |
| File uploads       | Multer with multer-storage-cloudinary, Cloudinary         |
| Maps               | Mapbox GL JS and the Mapbox Geocoding SDK                 |
| Front end          | Bootstrap 5, Font Awesome, Starability, Plus Jakarta Sans |

---

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or newer
- A MongoDB database, either local (`mongodb://127.0.0.1:27017/wanderlust`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- A free [Cloudinary](https://cloudinary.com/) account (for image uploads)
- A free [Mapbox](https://www.mapbox.com/) account (for the map and geocoding)

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd <your-repo-folder>

# 2. Install dependencies
npm install

# 3. Create your environment file and fill in the values
cp .env.example .env

# 4. Start the development server
npm run dev
```

Open `http://localhost:3000/listings` in your browser.

---

## Environment variables

Create a `.env` file in the project root (see `.env.example`). Never commit this file.

| Variable                | Description                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| `MONGO_URI`             | MongoDB connection string. Used for both app data and sessions.                            |
| `PORT`                  | Port the server listens on (for example `3000`).                                           |
| `SESSION_SECRET`        | Long random string used to sign and encrypt sessions.                                      |
| `CLOUDINARY_CLOUD_NAME` | From your Cloudinary dashboard.                                                            |
| `CLOUDINARY_API_KEY`    | From your Cloudinary dashboard.                                                            |
| `CLOUDINARY_API_SECRET` | From your Cloudinary dashboard.                                                            |
| `MAPBOX_PUBLIC_TOKEN`   | Mapbox public access token (starts with `pk.`).                                            |
| `NODE_ENV`              | Set to `production` on your host. Enables secure cookies and hides internal error details. |

The app refuses to start if `PORT`, `MONGO_URI` or `SESSION_SECRET` is missing.

> Tip: generate a strong session secret with
> `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

---

## Scripts

| Command        | What it does                                                                      |
| -------------- | --------------------------------------------------------------------------------- |
| `npm start`    | Runs the app with Node (use this in production).                                  |
| `npm run dev`  | Runs the app with auto-restart on file changes (`node --watch`).                  |
| `npm run seed` | Seeds the database with sample listings. **Deletes all existing listings first.** |

---

## Seeding and maintenance scripts

All scripts are run from the project root, because `dotenv` reads `.env` from the current folder.

| Script                     | Purpose                                                                                                                                                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node init/index.js`       | Wipes all listings and inserts the sample data from `init/data.js`. Before running it, set `OWNER_ID` in `init/index.js` to the `_id` of a real user (sign up first, then copy the id from the `users` collection). |
| `node init/fixGeometry.js` | One-off migration. Gives listings with missing coordinates a default location so they can be saved and reviewed. Safe to run more than once.                                                                        |
| `node init/fixCategory.js` | One-off migration. Gives listings with no category the default category (`Trending`). Safe to run more than once.                                                                                                   |

---

## Project structure

```
.
├── app.js                  # App setup: middleware, sessions, passport, routes, error handler
├── cloudConfig.js          # Cloudinary + multer storage, deleteImage helper
├── middleware.js           # isLoggedIn, ownership checks, Joi validation middleware
├── schema.js               # Joi schemas for listings and reviews
├── controllers/            # Route handlers (listing, review, user)
├── models/                 # Mongoose models (Listing, Review, User)
├── routes/                 # Express routers (listing, review, user)
├── utils/                  # categories, ExpressError, wrapAsync
├── views/
│   ├── layouts/            # boilerplate.ejs
│   ├── includes/           # navbar, footer, flash messages
│   ├── listings/           # index, show, new, edit
│   ├── users/              # login, signup
│   └── error.ejs
├── public/
│   ├── css/                # style.css, rating.css (Starability)
│   └── js/                 # script.js (form validation), map.js (Mapbox)
├── init/                   # Seed data and one-off migration scripts
├── .env.example
└── package.json
```

---

## Routes

| Method    | Path                              | Description                                   | Access        |
| --------- | --------------------------------- | --------------------------------------------- | ------------- |
| GET       | `/listings`                       | All listings. Supports `?category=` and `?q=` | Public        |
| GET       | `/listings/new`                   | New listing form                              | Logged in     |
| POST      | `/listings`                       | Create a listing                              | Logged in     |
| GET       | `/listings/:id`                   | Listing details, map and reviews              | Public        |
| GET       | `/listings/:id/edit`              | Edit form                                     | Owner         |
| PUT       | `/listings/:id`                   | Update a listing                              | Owner         |
| DELETE    | `/listings/:id`                   | Delete a listing and its reviews              | Owner         |
| POST      | `/listings/:id/reviews`           | Add a review                                  | Logged in     |
| DELETE    | `/listings/:id/reviews/:reviewId` | Delete a review                               | Review author |
| GET, POST | `/signup`                         | Register                                      | Public        |
| GET, POST | `/login`                          | Log in                                        | Public        |
| POST      | `/logout`                         | Log out                                       | Logged in     |

---

## Data models

**Listing**: `title`, `description`, `category`, `image { url, filename }`, `price`, `location`, `country`, `geometry { type: "Point", coordinates: [lng, lat] }`, `owner` (User), `reviews` (array of Review)

**Review**: `comment`, `rating` (1 to 5), `createdAt`, `author` (User)

**User**: `email` (unique), plus `username`, hashed password and salt managed by `passport-local-mongoose`

---

## Validation and security

- **Two layers of validation:** Bootstrap validation in the browser and Joi on the server, so invalid data is rejected even if the browser check is bypassed.
- **Password hashing:** passwords are salted and hashed by `passport-local-mongoose`. A minimum length of 8 characters is enforced on signup.
- **Sessions:** stored in MongoDB, `httpOnly`, `sameSite=lax`, and `secure` in production.
- **Authorization:** ownership is checked on the server for every edit and delete route, not just hidden in the UI.
- **Safe searching:** search text is regex-escaped before it reaches MongoDB, and EJS escapes everything it prints.
- **Upload limits:** only JPG, PNG and WEBP files up to 5 MB are accepted, and uploads are cleaned up from Cloudinary when a request fails or an image is replaced.
- **Logout is a POST request**, so another site can't log a user out with a plain link.
- **Error handling:** invalid IDs return a 404, and internal error messages are hidden in production.

---

## Deployment on Render

1. Push your code to GitHub. Make sure `.env` is in `.gitignore`.
2. Create a free cluster on **MongoDB Atlas**, create a database user, and in _Network Access_ allow connections from Render (for a student project, `0.0.0.0/0` is the simplest option).
3. On Render, create a new **Web Service** and connect your GitHub repository.
4. Use these settings:
   - **Build command:** `npm install`
   - **Start command:** `npm start`
5. Under _Environment_, add every variable from the [table above](#environment-variables). Set `MONGO_URI` to your Atlas connection string and `NODE_ENV` to `production`.
6. Deploy. If Auto-Deploy is off, push your changes to GitHub, then open the service and choose **Manual Deploy → Deploy latest commit**. To deploy automatically on every push, set **Auto-Deploy** to _On Commit_ in the service's Settings.

On Render's free plan the service goes to sleep when idle, so the first request after a while can take around a minute.

---

## Troubleshooting

| Problem                                             | Likely cause and fix                                                                                      |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `Missing required environment variables` on startup | `PORT`, `MONGO_URI` or `SESSION_SECRET` isn't set. Check your `.env` or your host's environment settings. |
| Can't connect to the database on Render             | Atlas is blocking the connection. Check _Network Access_ and the username and password in `MONGO_URI`.    |
| Map doesn't show                                    | `MAPBOX_PUBLIC_TOKEN` is missing or wrong, or the `#map` element has no height.                           |
| Image upload fails                                  | Check the Cloudinary variables. Only JPG, PNG and WEBP files up to 5 MB are accepted.                     |
| Logged out after every deploy                       | Make sure sessions use `connect-mongo` and `SESSION_SECRET` hasn't changed.                               |
| Can't stay logged in on the deployed site           | Production cookies are `secure`, so the site must be served over HTTPS. Render does this by default.      |
| Old listings don't appear under any category        | Run `node init/fixCategory.js` once.                                                                      |
| Reviews fail on old listings                        | Run `node init/fixGeometry.js` once.                                                                      |

---

## Roadmap

- Pagination on the listings page
- Multiple images per listing with a gallery
- Bookings with a date picker and availability
- Wishlist (save favourite listings)
- Price filter and sorting
- Privacy and Terms pages
- Rate limiting and security headers (`express-rate-limit`, `helmet`)
- Automated tests

---

## License

Released under the [MIT License](LICENSE). Replace this section if you choose a different license.
