# Nowendo Full-Stack Application

A full-stack web application with React frontend, Node.js/Express backend, and PostgreSQL database.

## Project Structure

```
nowendo/
├── frontend/          # React + Vite application
├── backend/           # Node.js + Express API server
├── database/          # Database schemas and migrations
└── README.md
```

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Getting Started

### 1. Install Dependencies

#### Frontend
```bash
cd frontend
npm install
```

#### Backend
```bash
cd backend
npm install
```

### 2. Database Setup

1. Install PostgreSQL
2. Create database:
   ```bash
   createdb nowendo_db
   ```
3. Run migrations:
   ```bash
   cd database
   psql -U postgres -d nowendo_db -f schema.sql
   psql -U postgres -d nowendo_db -f seed.sql
   ```

### 3. Configure Environment

Copy the `.env` file in the backend folder and update with your database credentials.

### 4. Run the Application

#### Development Mode

**Backend** (Terminal 1):
```bash
cd backend
npm run dev
```
Server will run on: http://localhost:5000

**Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
```
Frontend will run on: http://localhost:5173

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

## Tech Stack

### Frontend
- React 19
- Vite
- ESLint

### Backend
- Node.js
- Express
- CORS
- dotenv

### Database
- PostgreSQL

## API Endpoints

- `GET /` - Welcome message
- `GET /api/health` - Health check

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

ISC
