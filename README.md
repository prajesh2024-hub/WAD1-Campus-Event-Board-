# SMU Campus Event Board

A web application for discovering and managing campus events at Singapore Management University.

---

## Prerequisites

Make sure you have the following installed before running the application:

- [Node.js](https://nodejs.org/) (v18 or above)
- npm (comes with Node.js)

---

## Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Open the `config.env` file in the root folder and fill in the following values:

```
DB=your_mongodb_atlas_connection_string
SECRET=your_session_secret
```

- `DB` — your MongoDB Atlas connection string (e.g. `mongodb+srv://username:password@cluster.mongodb.net/dbname`)
- `SECRET` — any random string used to secure sessions (e.g. `mysecretkey123`)

---

## How to Run

```bash
node server.js
```

The application will be available at:

```
http://localhost:8000/index.html
```

---

## Test Accounts

### Admin Account
- **Username:** `[ADD ADMIN USERNAME]`
- **Password:** `[ADD ADMIN PASSWORD]`

### Regular User Account
- **Username:** `[ADD USER USERNAME]`
- **Password:** `[ADD USER PASSWORD]`

---

## Features

- Browse and filter all campus events
- Create and manage your own events
- RSVP to events or join a waitlist
- Wishlist events you are interested in
- Leave reviews on past events
- Admin can delete any event

---

## AI Usage Disclaimer

Parts of this project were developed with the assistance of Claude (AI by Anthropic). Used AI to help debug, simplify code, and help assist with logic. 