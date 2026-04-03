# SMU Campus Event Board

A web application for discovering and managing campus events at any university.

---

## Prerequisites

Make sure you have the following installed before running the application:

- [Node.js](https://nodejs.org/) (v18 or above) — npm comes bundled with it
- [nodemon](https://www.npmjs.com/package/nodemon) — to run the server (`npm install -g nodemon`)
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account — you will need a connection string for the `config.env` file

---

## Setup Instructions

### 1. Clone the repository and install dependencies

```bash
npm install
```

This installs all required packages: Express, EJS, Mongoose, bcrypt, express-session, and dotenv.

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
nodemon server.js
```

The application will be available at:

```
http://localhost:8000/index
```

---

## Test Accounts

### Admin Account
- **Username:** `admin123`
- **Email:** `admin123@gmail.com`
- **Phone Number:** `123123123`
- **Password:** `123123123`

### Regular User Account
- **Username:** `user1`
- **Email:** `user1@gmail.com`
- **Phone Number:** `123123123`
- **Password:** `123123123`

---

## Features

### Authentication
- Register an account with username, email, phone number, password, and role (student or admin). Duplicate usernames and emails are blocked.
- Login with email and password. Passwords are hashed using bcrypt.
- Logout to destroy the session.
- Forgot password — verify identity with email and phone number, then reset your password.

### User Account
- View your profile page (students and admins have separate profile views).
- Edit your username, email, or phone number.
- Delete your own account — also deletes all events you created.

### Event Management (organizers)
- Create an event with title, description, date range, time, venue, category, max attendees, duration, and organizer name. Duplicate events are blocked.
- View all events you have created in a table.
- Edit any field of an event you own. Validates for no-change submissions and invalid date ranges.
- Delete an event you own via a confirmation page.
- View the full participant list for your event and remove individual attendees.

### Event Discovery
- Browse all upcoming events in a sortable table.
- Filter events by title search, category, and date range.
- View a full event details page showing description, date, time, venue, organizer, current attendees, waitlist, and RSVP options.
- See reviews left on the host's other past events directly on the event details page.

### RSVP & Waitlist
- Join an event (blocked if you are the organizer, already joined, or the event is full).
- Cancel your RSVP. If someone is on the waitlist, they are automatically moved into the attendees list.
- Join the waitlist when an event is full.
- Leave the waitlist at any time.
- View your RSVPs on a personal page with three tabs: upcoming bookings, waitlisted events (with your position number), and past bookings.

### Reviews
- Leave a star rating (1–5) and written review for a past event you attended. One review per user per event.
- View, edit, and delete all reviews you have written on your My Reviews page.
- Organizers can view all reviews submitted for their events.
- Admins can delete any review from the event details page.

### Wishlist
- Save any event by clicking the star icon on the All Events page.
- Remove events from your wishlist from either the All Events page or the My Wishlist page.
- View all saved events on your My Wishlist page, with options to RSVP or join the waitlist directly.

### Admin Controls
- Delete any event from the All Events page.
- Search for any user by username, verify with admin password, and delete their account along with all events they created.

---

## AI Usage Disclaimer

Parts of this project were developed with the assistance of Claude (AI by Anthropic). Used AI to help debug, simplify code, and help assist with logic.