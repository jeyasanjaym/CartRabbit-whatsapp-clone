# WhatsApp Web Clone (Full-Stack MERN)

A modern, real-time WhatsApp Web clone built with the MERN stack. This project demonstrates full-stack development skills with a focus on real-time communication, authentication, and modern UI/UX design.

## 🚀 Live Demo

[View Live Demo](https://github.com/jeyasanjaym/CartRabbit-whatsapp-clone)

## ✨ Features

### 🔐 Authentication System
- **Unified Login/Register**: Single endpoint for both login and registration
- **Auto-registration**: New users are automatically registered
- **Secure Authentication**: Password hashing with bcryptjs
- **Session Management**: Persistent login state

### 💬 Real-Time Chat
- **Instant Messaging**: Real-time message delivery with Socket.IO
- **User Management**: Username-based user identification
- **Online Status**: See who's online and available to chat
- **Typing Indicators**: Know when someone is typing

### 🎨 Modern UI/UX
- **WhatsApp-like Interface**: Familiar and intuitive design
- **Responsive Design**: Works on desktop and mobile
- **Dark Theme**: Modern dark color scheme
- **Smooth Animations**: polished user experience

### 📱 Core Features
- **Two-Panel Layout**: Chat list and conversation view
- **Message History**: Persistent message storage
- **User Search**: Find and connect with other users
- **Message Status**: Visual distinction between sent/received messages

## 🛠 Technology Stack

### Frontend
- **React.js** - Modern UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **TailwindCSS** - Utility-first CSS framework
- **Socket.IO Client** - Real-time communication

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Socket.IO** - Real-time bidirectional communication
- **MongoDB Atlas** - Cloud database
- **Mongoose** - MongoDB object modeling
- **bcryptjs** - Password hashing

## 📁 Project Structure

```
whatsapp-clone/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.js          # User schema
│   │   │   └── Message.js       # Message schema
│   │   ├── routes/
│   │   │   ├── auth.js          # Authentication routes
│   │   │   ├── users.js         # User management
│   │   │   └── messages.js      # Message handling
│   │   ├── app.js               # Express app setup
│   │   └── index.js             # Server entry point
│   ├── .env.example             # Environment variables template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SidebarNew.jsx   # User list sidebar
│   │   │   ├── ChatWindowNew.jsx # Chat interface
│   │   │   └── MessageBubbleNew.jsx # Message component
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Authentication context
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx    # Login/Register page
│   │   │   └── ChatDashboardPage.jsx # Main chat interface
│   │   ├── api/
│   │   │   └── client.js        # API client setup
│   │   ├── lib/
│   │   │   ├── socket.js        # Socket.IO configuration
│   │   │   └── time.js          # Time utilities
│   │   ├── App.jsx              # Main App component
│   │   └── main.jsx             # App entry point
│   ├── .env.example             # Frontend environment variables
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB Atlas** account (free tier)

### 1. Clone the Repository

```bash
git clone https://github.com/jeyasanjaym/CartRabbit-whatsapp-clone.git
cd CartRabbit-whatsapp-clone
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file from `.env.example`:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
CLIENT_ORIGIN=http://localhost:5173
```

Start the backend server:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Start the frontend development server:

```bash
npm run dev
```

### 4. Access the Application

Open your browser and navigate to `http://localhost:5173`

## 📖 Usage

1. **Create Account**: Enter any username and password
2. **Start Chatting**: Select a user from the sidebar and begin messaging
3. **Real-time Communication**: Messages appear instantly for both users
4. **Persistent History**: All messages are saved and reload on login

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/login` - Unified login/register endpoint

### Users
- `GET /api/users?currentUsername=username` - Get all users (excluding current)
- `GET /api/users/:username` - Get user by username

### Messages
- `POST /api/messages` - Send a message
- `GET /api/messages?userA=username1&userB=username2` - Get conversation

## 🗄 Database Schema

### Users Collection
```javascript
{
  username: String (unique, required),
  password: String (hashed, required),
  createdAt: Date,
  updatedAt: Date
}
```

### Messages Collection
```javascript
{
  sender: String (required, ref: 'User'),
  receiver: String (required, ref: 'User'),
  text: String (required, maxlength: 4000),
  timestamp: Date (default: Date.now)
}
```

## 🔧 Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB Atlas connection string
- `CLIENT_ORIGIN` - Frontend URL for CORS (default: http://localhost:5173)

### Frontend (.env) - Optional
- `VITE_API_URL` - Backend API URL (auto-configured for development)
- `VITE_SOCKET_URL` - Socket.IO URL (auto-configured for development)

## 🎯 Key Features Demonstrated

- **Full-Stack Development**: Complete MERN stack implementation
- **Real-Time Communication**: Socket.IO for instant messaging
- **Authentication & Security**: bcryptjs password hashing, session management
- **Database Design**: MongoDB schema design and relationships
- **RESTful APIs**: Clean API design with proper error handling
- **Modern UI/UX**: TailwindCSS styling, responsive design
- **Component Architecture**: Reusable React components
- **State Management**: React Context for global state
- **Environment Configuration**: Proper environment variable management
- **Error Handling**: Comprehensive error handling and validation

## 🚀 Deployment

### Quick Deploy with Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jeyasanjaym/CartRabbit-whatsapp-clone)

1. **Click the Deploy button above**
2. **Connect your GitHub account**
3. **Add environment variables**:
   - `MONGODB_URI` - Your MongoDB Atlas connection string
4. **Deploy** - Your app will be live in minutes!

### Manual Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions including:
- Vercel deployment (free)
- Render + Vercel setup
- Environment variables configuration
- Troubleshooting guide

### Live Demo

🔗 **[View Live Application](https://your-app-url.vercel.app)** *(Replace with your deployed URL)*

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by WhatsApp Web interface
- Built with modern web technologies
- Demonstrates full-stack development proficiency

---

**This project showcases proficiency in modern web development, real-time communication, and clean code architecture.** 🚀
