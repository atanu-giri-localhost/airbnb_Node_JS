# AirNest – Full Stack Rental Marketplace Project Analysis

## Overview

This project is AirNest – Full Stack Rental Marketplace, a Node.js/Express rental marketplace web application. It lets users sign up as either a guest or host, log in, view homes, add homes to favourites, and manage hosted home listings. Pages are rendered on the server with EJS templates, styled mostly with Tailwind CSS, and data is stored in MongoDB through Mongoose models.

The main entry point is `app.js`.

## Tech Stack

### Runtime and Server

- Node.js
- Express `4.21.0`
- EJS `3.1.10` for server-rendered views
- Express sessions with `express-session`
- MongoDB-backed session storage with `connect-mongodb-session`
- Multer for image uploads

### Database

- MongoDB Atlas connection is configured in `app.js`
- Mongoose is the active database layer

### Authentication and Validation

- `bcryptjs` hashes user passwords before saving
- `express-validator` validates signup fields
- Login state is stored in the session as:
  - `req.session.isLoggedIn`
  - `req.session.user`

### Frontend

- EJS templates in `views/`
- Tailwind CSS input file: `views/input.css`
- Generated Tailwind output file: `public/output.css`
- Static public assets served from `public/`
- Uploaded images served from `uploads/`

## Project Structure

```text
.
├── app.js
├── package.json
├── nodemon.json
├── tailwind.config.js
├── controllers/
│   ├── authController.js
│   ├── errors.js
│   ├── hostController.js
│   └── storeController.js
├── models/
│   ├── home.js
│   └── user.js
├── routes/
│   ├── authRouter.js
│   ├── hostRouter.js
│   └── storeRouter.js
├── utils/
│   └── pathUtil.js
├── views/
│   ├── auth/
│   ├── host/
│   ├── partials/
│   └── store/
├── public/
│   └── output.css
├── uploads/
└── rules/
```

## How The App Starts

`app.js` performs the main bootstrapping:

1. Imports Express, sessions, MongoDB session store, Mongoose, Multer, routers, and helpers.
2. Sets EJS as the view engine.
3. Creates a MongoDB-backed session store using `connect-mongodb-session`.
4. Configures Multer to save uploaded home photos into `uploads/`.
5. Parses URL-encoded form submissions with `express.urlencoded`.
6. Serves static files from:
   - `public/`
   - `uploads/`
7. Starts session middleware.
8. Adds `req.isLoggedIn` from the session for later middleware/controllers.
9. Mounts auth routes, store routes, and protected host routes.
10. Mounts the 404 page handler.
11. Connects to MongoDB with Mongoose.
12. Starts the server on port `3000`.

The server runs at:

```text
http://localhost:3000
```

## Routes

### Auth Routes

Defined in `routes/authRouter.js`.

| Method | Path | Controller | Purpose |
| --- | --- | --- | --- |
| GET | `/login` | `getLogin` | Show login page |
| GET | `/signup` | `getSignup` | Show signup page |
| POST | `/login` | `postLogin` | Validate credentials and create session |
| POST | `/signup` | `postSignup` | Validate signup form, hash password, create user |
| POST | `/logout` | `postLogout` | Destroy session and redirect to login |

### Store Routes

Defined in `routes/storeRouter.js`.

| Method | Path | Controller | Purpose |
| --- | --- | --- | --- |
| GET | `/` | `getIndex` | Show homepage with all homes |
| GET | `/homes` | `getHomes` | Show home listing page |
| GET | `/bookings` | `getBookings` | Show bookings placeholder page |
| GET | `/favourites` | `getFavouriteList` | Show current user's favourite homes |
| GET | `/homes/:homeId` | `getHomeDetail` | Show details for one home |
| GET | `/rules/:homeId` | `getHomeRules` | Download rules PDF for a home |
| POST | `/favourites` | `postAddToFavourite` | Add home to current user's favourites |
| POST | `/favourites/delete/:homeId` | `postRemoveFromFavourite` | Remove home from current user's favourites |

### Host Routes

Defined in `routes/hostRouter.js`.

All `/host` routes are protected by middleware in `app.js`. If the user is not logged in, they are redirected to `/login`.

| Method | Path | Controller | Purpose |
| --- | --- | --- | --- |
| GET | `/host/add-home` | `getAddHome` | Show add-home form |
| POST | `/host/add-home` | `postAddHome` | Create a home listing |
| GET | `/host/host-home-list` | `getHostHomes` | Show host home list |
| GET | `/host/edit-home/:homeId` | `getEditHome` | Show edit form for a home |
| POST | `/host/edit-home` | `postEditHome` | Update an existing home |
| POST | `/host/delete-home/:homeId` | `postDeleteHome` | Delete a home |

## Data Models

### Home

Defined in `models/home.js`.

Fields:

- `houseName` string, required
- `price` string, required
- `location` string, required
- `rating` string, required
- `photo` string
- `description` string

### User

Defined in `models/user.js`.

Fields:

- `firstName` string, required
- `lastName` string
- `email` string, required, unique
- `userName` string, required, unique
- `password` string, required
- `userType` enum: `guest` or `host`
- `favourites` array of `Home` ObjectIds

## Main User Flows

### Signup

1. User visits `/signup`.
2. `authController.getSignup` renders `views/auth/signUp.ejs`.
3. User submits first name, last name, username, email, password, confirm password, user type, and terms checkbox.
4. `express-validator` checks required fields, email format, password strength, matching passwords, valid user type, and terms acceptance.
5. If validation fails, signup page is rendered again with errors and old input.
6. If validation passes, password is hashed with bcrypt.
7. A new `User` document is saved.
8. User is redirected to `/login`.

### Login

1. User visits `/login`.
2. `authController.getLogin` renders `views/auth/logIn.ejs`.
3. User submits email and password.
4. Controller looks up the user by email.
5. Password is compared with bcrypt.
6. If valid, session values are set:
   - `isLoggedIn: true`
   - `user: safeUser`
7. User is redirected to `/`.

### Guest Home Browsing

1. Guest opens `/` or `/homes`.
2. `Home.find()` loads all homes from MongoDB.
3. EJS renders cards with image, name, location, price, rating, and details link.
4. `/homes/:homeId` loads one home with `Home.findById`.

### Favourites

1. User clicks an add-to-favourites form.
2. The form posts the home id to `/favourites`.
3. `postAddToFavourite` loads the current session user from MongoDB.
4. The home id is pushed into the user's `favourites` array unless it already exists.
5. `/favourites` loads the user and populates `favourites` to show full home details.
6. Removing a favourite filters the home id out of the user's `favourites` array.

### Host Home Management

1. Host logs in and opens `/host/host-home-list`.
2. Host can open `/host/add-home` to add a listing.
3. Home photo uploads are handled by Multer and stored in `uploads/`.
4. A new `Home` document is saved with text fields and the uploaded image path.
5. Host can edit or delete existing homes from the host home list.

### Rules PDF Download

The route `/rules/:homeId` attempts to download:

```text
rules/<homeId>-Rules.pdf
```

This route checks that the user is logged in before downloading. The repository currently includes an example PDF in `rules/`.

## Views

### Auth Views

- `views/auth/logIn.ejs`
- `views/auth/signUp.ejs`

### Store Views

- `views/store/index.ejs`
- `views/store/home-list.ejs`
- `views/store/home-detail.ejs`
- `views/store/favourite-list.ejs`
- `views/store/bookings.ejs`

### Host Views

- `views/host/edit-home.ejs`
- `views/host/host-home-list.ejs`

### Partials

- `views/partials/head.ejs`
- `views/partials/nav.ejs`
- `views/partials/errors.ejs`
- `views/partials/favourite.ejs`

The navigation partial changes what links are visible based on `isLoggedIn` and `user.userType`.

Guest users see:

- Homes list
- Favourites
- Bookings

Host users see:

- Host homes
- Add home

Logged-out users see:

- Login
- Signup

## Styling

Tailwind is configured in `tailwind.config.js` to scan EJS templates:

```js
content: ["./views/**/*.{html,ejs}"]
```

The Tailwind source file is:

```text
views/input.css
```

The generated stylesheet is:

```text
public/output.css
```

Most pages use Tailwind utility classes directly inside EJS templates. The shared head partial loads `/output.css`.

## File Uploads

Multer is configured in `app.js`.

Uploaded files:

- Come from form field name `photo`
- Are saved to `uploads/`
- Are served publicly through `/uploads`
- Are filtered to image MIME types: PNG, JPG, JPEG

Home image URLs are rendered with:

```ejs
<img src="/<%= home.photo %>">
```

Because uploaded paths are stored like `uploads/file-name.jpg`, this resolves to `/uploads/file-name.jpg`.

## Commands

Install dependencies:

```bash
npm install
```

Run the server with Nodemon:

```bash
npx nodemon app.js
```

Build/watch Tailwind CSS:

```bash
npm run tailwind
```

Current `package.json` scripts:

```json
{
  "tailwind": "tailwindcss -i ./views/input.css -o ./public/output.css --watch",
  "start": "nodemon app.js && npm run tailwind"
}
```

Note: the current `start` script runs `npm run tailwind` only after `nodemon app.js` exits because of `&&`. During development, run the server and Tailwind watcher in separate terminals unless the script is changed to run them concurrently.

## Current Implementation Notes

- MongoDB credentials are hard-coded in `app.js`. In a real deployment, these should be moved to environment variables.
- The active MongoDB database name is `airbnb`.
- The app has no automated test suite yet. The current `npm test` script exits with an error placeholder.
- Uploaded files and PDFs are not ignored by `.gitignore`; only `node_modules/` is ignored.

## In Short

The application is an Express MVC-style server-rendered app:

- `app.js` wires middleware, sessions, uploads, routes, MongoDB, and server startup.
- `routes/` maps URLs to controller functions.
- `controllers/` contain request logic and render EJS views.
- `models/` define MongoDB collections through Mongoose.
- `views/` render the HTML pages.
- `public/`, `uploads/`, and `rules/` provide static CSS, images, and downloadable PDFs.
