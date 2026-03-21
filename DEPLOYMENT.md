# 🚀 Deployment Guide

## Quick Deploy with Vercel (Recommended)

### Prerequisites
- GitHub repository with your code
- Vercel account (free)
- MongoDB Atlas account (free)

### Step 1: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" → "Continue with GitHub"
3. Click "New Project"
4. Select your `CartRabbit-whatsapp-clone` repository
5. Configure settings:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `frontend/dist`

### Step 2: Add Environment Variables
In Vercel dashboard → Settings → Environment Variables:
```
MONGODB_URI=mongodb+srv://your-connection-string
NODE_ENV=production
```

### Step 3: Deploy
Click "Deploy" - Vercel will automatically:
- Build frontend and backend
- Deploy to global CDN
- Provide you with a live URL

## Alternative: Render + Vercel

### Backend on Render
1. Go to [render.com](https://render.com)
2. Connect GitHub repository
3. Create "Web Service"
4. Settings:
   - **Name**: whatsapp-clone-api
   - **Runtime**: Node
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Environment Variables**:
     ```
     MONGODB_URI=your_mongodb_connection_string
     NODE_ENV=production
     ```

### Frontend on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import repository
3. Settings:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Environment Variables**:
     ```
     VITE_API_URL=https://your-backend-url.onrender.com
     VITE_SOCKET_URL=https://your-backend-url.onrender.com
     ```

## Post-Deployment Checklist

✅ Test authentication (login/register)
✅ Test real-time messaging
✅ Verify database connectivity
✅ Check mobile responsiveness
✅ Test user search functionality

## Environment Variables

### Required for Production
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `NODE_ENV` - Set to "production"

### Optional Frontend Variables
- `VITE_API_URL` - Backend API URL (auto-detected in same deployment)
- `VITE_SOCKET_URL` - Socket.IO URL (auto-detected in same deployment)

## Troubleshooting

### Common Issues
1. **MongoDB Connection**: Ensure IP is whitelisted in MongoDB Atlas
2. **CORS Errors**: Check CLIENT_ORIGIN matches frontend URL
3. **Socket.IO Issues**: Verify WebSocket support on hosting platform
4. **Build Failures**: Check all dependencies are installed

### Support
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Render: [render.com/docs](https://render.com/docs)
- MongoDB Atlas: [docs.mongodb.com/atlas](https://docs.mongodb.com/atlas)
