# Project Connect Backend

Node.js/Express/MongoDB backend for Project Connect application.

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Edit the `.env` file and add your MongoDB connection string:

```env
PORT=5000
MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING_HERE
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
```

**Getting MongoDB Connection String:**

- Option 1: MongoDB Atlas (Cloud)
  - Go to https://www.mongodb.com/cloud/atlas
  - Create a free account and cluster
  - Click "Connect" -> "Connect your application"
  - Copy the connection string
  - Replace `<password>` with your database password
  - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/project-connect?retryWrites=true&w=majority`

- Option 2: Local MongoDB
  - Install MongoDB locally
  - Use: `mongodb://localhost:27017/project-connect`

### 3. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users` - Get all users (requires auth)
- `GET /api/users/:id` - Get user profile (requires auth)
- `PUT /api/users/profile` - Update user profile (requires auth)

### Projects
- `GET /api/projects/feed` - Get feed projects (requires auth)
- `GET /api/projects/user/:userId` - Get user's projects (requires auth)
- `POST /api/projects` - Create project (requires auth)
- `PUT /api/projects/:id` - Update project (requires auth)
- `DELETE /api/projects/:id` - Delete project (requires auth)

### Social
- `POST /api/social/friend-request` - Send friend request (requires auth)
- `GET /api/social/friend-requests` - Get received friend requests (requires auth)
- `GET /api/social/friend-requests/sent` - Get sent friend requests (requires auth)
- `GET /api/social/friend-request/status/:userId` - Check friend status with user (requires auth)
- `DELETE /api/social/friend-request/:id` - Cancel friend request (requires auth)
- `POST /api/social/friend-request/:id/respond` - Accept/reject friend request (requires auth)
- `DELETE /api/social/friend/:friendId` - Unfriend a user (requires auth)
- `GET /api/social/notifications` - Get notifications (requires auth)
- `PUT /api/social/notifications/:id/read` - Mark notification as read (requires auth)
- `PUT /api/social/notifications/read-all` - Mark all notifications as read (requires auth)
- `GET /api/social/friends` - Get friends list (requires auth)

## Database Models

### User
- name, email, password, avatarUrl, bio, section, friends[]

### Project
- owner, title, description, techStack[], githubUrl, projectUrl, imageUrl, visibility

### FriendRequest
- sender, receiver, status

### Notification
- user, type, message, isRead, metadata

## Notes

- All authenticated endpoints require a Bearer token in the Authorization header
- Passwords are hashed using bcryptjs
- JWT tokens expire after 7 days
