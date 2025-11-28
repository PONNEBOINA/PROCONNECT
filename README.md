# Project Connect

A social platform for students to share and discover projects.

## Technologies Used

### Frontend
- React 18 with TypeScript
- Vite
- Tailwind CSS
- shadcn-ui components
- React Router
- Axios for API calls

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- bcryptjs for password hashing

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (Atlas or local installation)

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
# Edit backend/.env and add your MongoDB connection string
# MONGODB_URI=your_mongodb_connection_string_here

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:5000`

See `backend/README.md` for detailed backend documentation.

### 2. Frontend Setup

```bash
# Navigate to project root (if in backend folder)
cd ..

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:8080`

### 3. MongoDB Setup

You need a MongoDB database. Choose one option:

**Option A: MongoDB Atlas (Cloud - Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account and cluster
3. Click "Connect" -> "Connect your application"
4. Copy the connection string
5. Add it to `backend/.env` as `MONGODB_URI`

**Option B: Local MongoDB**
1. Install MongoDB locally
2. Use connection string: `mongodb://localhost:27017/project-connect`

## Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

### Backend (backend/.env)
```env
PORT=5000
MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING_HERE
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
```

## Features

- User registration and authentication
- User profiles with sections
- Project creation and sharing
- Public and friends-only project visibility
- Friend requests and connections
- Real-time notifications
- Discover students by section
- Project feed

## Project Structure

```
project-connect/
├── backend/              # Node.js/Express backend
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   └── server.js        # Entry point
├── src/                 # React frontend
│   ├── components/      # UI components
│   ├── contexts/        # React contexts
│   ├── services/        # API services
│   └── pages/           # Page components
└── public/              # Static assets
```

## Running in Production

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
npm run build
npm run preview
```

## Notes

- All dummy data has been removed
- The app now uses real data from MongoDB
- Users must register to see content
- No pre-populated users or projects
