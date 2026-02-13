# FitTrack

Simple fitness tracker built for Assignment 4 (Sessions & Security). Minimal Express + MongoDB app demonstrating sessions-based authentication, protected write operations, bcrypt password hashing, and a web UI for full CRUD.

Quick start

1. Create a `.env` file in the project root with:

```
MONGO_URI=mongodb://127.0.0.1:27017/fittrack
SESSION_SECRET=your_secret_here
NODE_ENV=development
```

2. Install dependencies:

```powershell
npm install
```

3. Seed the database (creates 20 workouts and an admin user `admin` / `password123`):

```powershell
npm run seed
```

4. Start the server:

```powershell
npm start
```

5. Open `http://localhost:3000` in your browser. Login at `/auth/login`.

Security notes (for defense):
- Sessions: created on server via `express-session`, stored in Mongo using `connect-mongo`. On login the server sets `req.session.userId`. The session id is stored in a cookie (`connect.sid`).
- Cookies: `HttpOnly` is set to prevent JavaScript access. `Secure` is enabled when `NODE_ENV=production` (recommended for real deployment).
- Passwords: hashed with `bcrypt` before storing. Plain-text passwords are not stored.
- Authentication: middleware `middleware/auth.js` protects POST/PUT/DELETE API routes. Unauthenticated requests return `401 Unauthorized`.
- Error handling: API returns generic error messages like `Invalid input` or `Unauthorized` to avoid leaking details.

Files of interest:
- [server.js](server.js) - app entry, sessions config
- [routes/auth.js](routes/auth.js) - login/signup/logout
- [routes/api.js](routes/api.js) - CRUD API for workouts
- [models/Workout.js](models/Workout.js) - domain model (name,type,duration,calories,intensity,date,equipment,notes)
- [seed.js](seed.js) - populates DB with 20 workouts and admin user

Notes for defense:
- Demonstrate UI CRUD at `/` (list), `/create`, and `/edit/:id`.
- Show login and then create/update/delete functions (write ops are blocked when logged out).
- Explain `HttpOnly` and `Secure`, session lifecycle, bcrypt hashing, and difference between authentication (who you are) and authorization (what you can do).
