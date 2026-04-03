# SMU Campus Event Board

A full-stack web application for discovering and managing campus events at any university, built with Express.js, MongoDB, and EJS templates using MVC architecture.

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
- Leave a star rating (1-5) and written review for a past event you attended. One review per user per event.
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

## Tech Stack

- **Backend**: Express.js with MVC architecture
- **Database**: MongoDB with Mongoose ODM
- **Templates**: EJS
- **Authentication**: bcrypt + express-session
- **Environment**: Node.js

---

## Project Structure

```
WAD1-Campus-Event-Board-/
├── controllers/                # MVC Controllers
│   ├── event-Controller.js
│   ├── users-controller.js
│   ├── rsvp-controller.js
│   ├── review-controller.js
│   └── wishlist-controller.js
├── middleware/                  # Utility functions
│   └── authMiddleware.js
├── model/                      # MongoDB Models
│   ├── events-model.js
│   ├── user-model.js
│   └── wishlist-model.js
├── public/                     # Static assets
│   └── css/
│       ├── style.css
│       └── img/
│           └── logo.png
├── routes/                     # Express Routes
│   ├── auth-routes.js
│   ├── event-routes.js
│   ├── review-routes.js
│   └── rsvp-routes.js
├── views/                      # EJS Templates
│   ├── partials/
│   │   ├── header.ejs
│   │   ├── navbar.ejs
│   │   └── footer.ejs
│   ├── index.ejs
│   ├── register.ejs
│   ├── login.ejs
│   ├── password-auth.ejs
│   ├── update-password.ejs
│   ├── profile.ejs
│   ├── admin-profile.ejs
│   ├── edit-info.ejs
│   ├── delete-acc.ejs
│   ├── delete-acc-admin.ejs
│   ├── admin-user-delete.ejs
│   ├── create-event.ejs
│   ├── all-events.ejs
│   ├── event-details.ejs
│   ├── my-events.ejs
│   ├── edit-event.ejs
│   ├── delete-event.ejs
│   ├── my-participants.ejs
│   ├── my-rsvps.ejs
│   ├── waitlist-prompt.ejs
│   ├── review-prompt.ejs
│   ├── reviews.ejs
│   ├── my-reviews.ejs
│   ├── my-wishlist.ejs
│   └── error.ejs
├── server.js                   # Main application file
├── package.json
├── config.env                  # Environment variables
└── README.md
```

---

## Prerequisites

Make sure you have the following installed before running the application:

- [Node.js](https://nodejs.org/) (v18 or above) — npm comes bundled with it
- [nodemon](https://www.npmjs.com/package/nodemon) — to run the server (`npm install -g nodemon`)
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account — you will need a connection string for the `config.env` file

---

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd WAD1-Campus-Event-Board-
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

   This installs all required packages: Express, EJS, Mongoose, bcrypt, express-session, and dotenv.

3. **Set up MongoDB**

   Open the `config.env` file in the root folder and fill in the following values:

   ```
   DB=your_mongodb_atlas_connection_string
   SECRET=your_session_secret
   ```

   - `DB` — your MongoDB Atlas connection string (e.g. `mongodb+srv://username:password@cluster.mongodb.net/dbname`)
   - `SECRET` — any random string used to secure sessions (e.g. `mysecretkey123`)

4. **Start the application**
   ```bash
   nodemon server.js
   ```

5. **Open your browser**
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

## Usage

### For Customers
1. **Browse Events**: Visit the home page and go to the All Events page to browse all upcoming events
2. **Event Details**: Click on an event to see full details, RSVP, or join the waitlist
3. **Manage RSVPs**: View your upcoming bookings, waitlisted events, and past bookings on the My RSVPs page
4. **Reviews**: Leave star ratings and written reviews for past events you attended
5. **Wishlist**: Save events for later by clicking the star icon on the All Events page

### For Developers
- **Models**: Define data structures in the `model/` directory
- **Controllers**: Handle business logic in the `controllers/` directory
- **Routes**: Define API endpoints in the `routes/` directory
- **Views**: Create EJS templates in the `views/` directory

---

## Routes & Pages

### Authentication Routes (`/`)
| Method | Route | Page / Action |
|--------|-------|---------------|
| GET | `/register` | Registration page (`register.ejs`) |
| POST | `/register` | Submit registration form |
| GET | `/login` | Login page (`login.ejs`) |
| POST | `/login` | Submit login form |
| GET | `/profile` | User profile page (`profile.ejs` or `admin-profile.ejs`) |
| GET | `/edit-info` | Edit account info page (`edit-info.ejs`) |
| POST | `/edit-info` | Submit account info changes |
| GET | `/delete-acc` | Delete own account confirmation page (`delete-acc.ejs`) |
| POST | `/delete-acc` | Delete own account |
| GET | `/delete-user` | Admin search user to delete page (`admin-user-delete.ejs`) |
| POST | `/delete-user` | Admin search for user |
| POST | `/admin-delete-user` | Admin delete a user's account |
| GET | `/reset-password` | Forgot password verification page (`password-auth.ejs`) |
| POST | `/reset-password` | Verify identity for password reset |
| POST | `/update-password` | Submit new password (`update-password.ejs`) |
| GET | `/logout` | Log out and destroy session |

### Event Routes (`/`)
| Method | Route | Page / Action |
|--------|-------|---------------|
| GET | `/` | Homepage (`index.ejs`) |
| GET | `/index` | Homepage (`index.ejs`) |
| GET | `/create-event` | Create event form (`create-event.ejs`) |
| POST | `/create-event` | Submit new event |
| GET | `/all-events` | Browse all events (`all-events.ejs`) |
| POST | `/all-events` | Filter/search events |
| GET | `/my-events` | View your created events (`my-events.ejs`) |
| GET | `/events/:id` | Event details page (`event-details.ejs`) |
| GET | `/events/:id/edit` | Edit event form (`edit-event.ejs`) |
| POST | `/events/:id/edit` | Submit event edits |
| GET | `/events/:id/delete` | Delete event confirmation (`delete-event.ejs`) |
| POST | `/events/:id/delete` | Delete the event |
| GET | `/events/:id/participants` | View event participants (`my-participants.ejs`) |
| POST | `/events/:id/participants/remove` | Remove a participant from event |

### RSVP & Waitlist Routes (`/`)
| Method | Route | Page / Action |
|--------|-------|---------------|
| POST | `/events/:id/rsvp` | Join an event (RSVP) |
| POST | `/events/:id/cancel-rsvp` | Cancel RSVP |
| GET | `/my-rsvps` | View your RSVPs (`my-rsvps.ejs`) |
| POST | `/events/:id/waitlist` | Join the waitlist (`waitlist-prompt.ejs`) |
| POST | `/events/:id/waitlisted` | Confirm waitlist join |
| POST | `/events/:id/leave-waitlist` | Leave the waitlist |

### Wishlist Routes (`/`)
| Method | Route | Page / Action |
|--------|-------|---------------|
| GET | `/my-wishlist` | View your wishlist (`my-wishlist.ejs`) |
| POST | `/events/:eventId/add` | Add event to wishlist |
| POST | `/events/:eventId/remove` | Remove event from wishlist |
| POST | `/my-wishlist/events/:eventId/remove` | Remove event from wishlist (from wishlist page) |

### Review Routes (`/`)
| Method | Route | Page / Action |
|--------|-------|---------------|
| GET | `/events/:id/review` | Review form for an event (`review-prompt.ejs`) |
| POST | `/events/:id/review` | Submit a review |
| GET | `/events/:id/reviews` | View all reviews for an event (`reviews.ejs`) |
| GET | `/my-reviews` | View your reviews (`my-reviews.ejs`) |
| POST | `/events/:id/reviews/:reviewId/update` | Update a review |
| POST | `/events/:id/reviews/:reviewId/delete` | Delete a review |

---

## Database Schema

### User
- username: String (unique)
- email: String (unique)
- phone: String
- password: String (hashed)
- role: String (student / admin)

### Event
- title: String
- description: String
- startDate: Date
- endDate: Date
- time: String
- venue: String
- category: String
- maxAttendees: Number
- duration: Number
- organizer: String
- attendees: [ObjectId → User]
- waitlist: [ObjectId → User]
- createdBy: ObjectId → User
- createdByUsername: String
- createdAt: Date
- reviews: [{ userId, userName, rating, reviewText, createdAt }]

### Wishlist
- userId: ObjectId → User (unique)
- items: [{ event: ObjectId → Event, addedAt: Date }]

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## AI Usage Disclaimer

Parts of this project were developed with the assistance of Claude (AI by Anthropic). Used AI to help debug, simplify code, and help assist with logic.
