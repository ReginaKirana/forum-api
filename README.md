# Forum API Starter Project 🚀

Welcome to the **Forum API Starter Project** repository! This project is a RESTful API implementation for a discussion forum application, built using **Clean Architecture** and **Test-Driven Development (TDD)**. This project was developed as a final submission for the **Menjadi Back-End Developer Expert** course on [Dicoding](https://www.dicoding.com/).

---

## 🌟 Key Features
- **Authentication & Authorization:** User registration, login, and JWT token management.
- **Thread & Comment Management:**
  - Users can create new threads (discussion topics).
  - Users can add comments to a thread.
  - Users can add replies to a comment.
- **Like/Unlike Feature:** Users can like or unlike a comment.
- **Rate Limiting:** Implemented IP-based request limiting to prevent brute-force or spam attacks.
- **CI/CD Pipeline:** Automated testing and deployment using GitHub Actions.
- **Nginx Reverse Proxy:** Configured with Nginx for performance and security (HTTPS).

## 🔗 Live API URL
The API is currently deployed and can be accessed at:
**`https://139.180.215.230.sslip.io`**

*(Note: You can use this Base URL in your Postman environment to test the live endpoints.)*

## 🛠️ Technologies Used
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL, `pg`, `node-pg-migrate`
- **Security:** `bcrypt`, `jsonwebtoken`, `express-rate-limit`
- **Testing:** Vitest, Supertest (Coverage > 80%)
- **Linter:** ESLint (with Dicoding Academy standard config)
- **Deployment:** Nginx, PM2 (recommended for production)

---

## ⚙️ Prerequisites

Before running this project locally, ensure you have installed:
1. **Node.js** (version 18.x or latest)
2. **PostgreSQL** (version 14.x or latest)
3. **Git**

## 🚀 Running the Project Locally

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/forum-api-starter-project.git
cd forum-api-starter-project
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables Configuration
Create two files, `.env` and `.test.env`, in the root directory. You can copy the template below and adjust it with your PostgreSQL database credentials:

**`.env`** (For the main server)
```env
# HTTP SERVER
HOST=localhost
PORT=5000

# POSTGRES
PGUSER=postgres
PGHOST=localhost
PGPASSWORD=your_db_password
PGDATABASE=forumapi
PGPORT=5432

# JWT TOKEN
ACCESS_TOKEN_KEY=super_secret_access_token_key
REFRESH_TOKEN_KEY=super_secret_refresh_token_key
ACCESS_TOKEN_AGE=1800
```

**`.test.env`** (For testing purposes)
```env
# POSTGRES TEST
PGUSER=postgres
PGHOST=localhost
PGPASSWORD=your_db_password
PGDATABASE=forumapi_test
PGPORT=5432

# JWT TOKEN
ACCESS_TOKEN_KEY=test_access_key
REFRESH_TOKEN_KEY=test_refresh_key
ACCESS_TOKEN_AGE=1800
```
> **Note:** Make sure you have created the `forumapi` and `forumapi_test` databases in your PostgreSQL server.

### 4. Run Database Migrations
Run the migrations to create the required tables in the database:
```bash
# Main database migration
npm run migrate

# Testing database migration
npm run migrate:test
```

### 5. Start the Application
For development environment (with auto-restart on file changes):
```bash
npm run start:dev
```
For production:
```bash
npm run start
```

The server will be running at `http://localhost:5000`.

---

## 🧪 Testing

This project uses **Vitest** for unit and integration testing.
- **Run all tests:**
  ```bash
  npm run test
  ```
- **Run tests in watch mode:**
  ```bash
  npm run test:watch
  ```
- **Check test coverage:**
  ```bash
  npm run test:coverage
  ```

---

## 📖 API Documentation (Postman)

This project includes a Postman collection to easily test every API endpoint.
1. Open the **Postman** application.
2. Import the API collection file: `Forum API V2 Test.postman_collection.json` (located in the root folder).
3. Import the environment file: `Forum API V2 Test.postman_environment.json`.
4. Select the "Forum API V2 Test" environment in the top right corner of Postman.
5. If you want to test the live server, update the `url` variable in the Postman Environment to `https://139.180.215.230.sslip.io`.
6. You are ready to send requests to the API!

---

## 📁 Project Structure

This project is built using **Clean Architecture**:
```text
forum-api-starter-project/
├── .github/workflows/       # GitHub Actions CI/CD configuration
├── migrations/              # Database migration scripts (node-pg-migrate)
├── src/
│   ├── Applications/        # Application Use Cases
│   ├── Commons/             # Utilities, exceptions, and plugins
│   ├── Domains/             # Business entities and repository interfaces
│   ├── Infrastructures/     # Framework, database, and web server implementations
│   ├── Interfaces/          # Handlers (Controllers) and routes for HTTP API
│   └── app.js               # Application entry point
├── tests/                   # Setup and helpers for testing purposes
├── nginx.conf               # Nginx configuration for reverse proxy and rate limiting
└── package.json
```

---

## 🌐 Nginx Configuration (Deployment)
If you wish to deploy this application using Nginx as a reverse proxy (highly recommended to enable Rate Limiting), you can use the provided `nginx.conf` file as a reference.

---

Built with ❤️ for learning Back-End Web Development. If you have any questions or encounter any issues, feel free to open an _Issue_ in this repository!
