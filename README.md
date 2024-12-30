# Train Reservation System

## Overview

The Train Reservation System is a web application built using **Express.js** for the backend and **Next.js** for the frontend. It allows users to:

- Register an account
- Log in
- View available seats
- Reserve seats
- Cancel reservations

This application uses **PostgreSQL** as the database and **JWT (JSON Web Tokens)** for user authentication.

## Table of Contents

- [Installation](#installation)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Technologies](#technologies)
- [License](#license)

## Installation

### Clone the repository

First, clone the repository to your local machine:

```bash
git clone https://github.com/yourusername/train-booking-application.git
cd train-booking-application
Install Backend Dependencies
Navigate to the backend directory and install the required dependencies:

bash
Copy code
cd backend
npm install
Install Frontend Dependencies
Next, navigate to the frontend directory and install the required dependencies:

bash
Copy code
cd frontend
npm install
Setup Instructions
Configure Environment Variables
Create a .env file in the root directory of the project and add the following variables:

makefile
Copy code
DATABASE_URL=your_database_url
SECRET=your_secret_key
Replace your_database_url with the URL of your PostgreSQL database (e.g., postgres://username:password@hostname:port/database).
Replace your_secret_key with a secret key used to sign JWT tokens.
Start the Backend Server
Navigate to the backend directory and start the server:

bash
Copy code
npm start
The backend server will be running at http://localhost:5000.

Start the Frontend Server
Navigate to the frontend directory and run the development server:

bash
Copy code
npm run dev
The frontend will be running at http://localhost:3000.

Populate Seats (Optional)
If you'd like to populate the seats, uncomment the populateSeats(); line in index.js (located in the backend folder) and restart the server.

Environment Variables
DATABASE_URL: The URL of your PostgreSQL database (e.g., postgres://username:password@hostname:port/database).
SECRET: A secret key used to sign JWT tokens.
API Documentation
POST /api/signup
Create a new user.

Request Body:

json
Copy code
{
  "username": "string",
  "password": "string"
}
Response:

json
Copy code
{
  "message": "User created successfully",
  "user": {
    "id": "integer",
    "username": "string"
  }
}
POST /api/login
Login and receive a JWT token.

Request Body:

json
Copy code
{
  "username": "string",
  "password": "string"
}
Response:

json
Copy code
{
  "message": "Login successful",
  "token": "string"
}
GET /api/seats
Fetch the list of all seats with their current availability.

Response:

json
Copy code
[
  {
    "id": "integer",
    "row": "integer",
    "seatNumber": "integer",
    "isReserved": "boolean",
    "reservedBy": "integer or null"
  }
]
POST /api/seats/reserve
Reserve seats.

Request Body:

json
Copy code
{
  "userId": "integer",
  "seatCount": "integer"
}
Response:

json
Copy code
{
  "message": "Seats reserved successfully",
  "reservedSeats": ["row1seat1", "row2seat3"]
}
POST /api/seats/cancel
Cancel reserved seats for the user.

Request Body:

json
Copy code
{
  "userId": "integer"
}
Response:

json
Copy code
{
  "message": "Reservation cancelled successfully"
}
POST /api/user-id
Get the user ID by providing the username.

Request Body:

json
Copy code
{
  "username": "string"
}
Response:

json
Copy code
{
  "userId": "integer"
}
Technologies
Backend: Express.js, Sequelize, PostgreSQL
Frontend: Next.js, React
Authentication: JWT (JSON Web Tokens)
Styling: Tailwind CSS (optional)
Environment Management: dotenv