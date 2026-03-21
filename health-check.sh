#!/bin/bash

echo "🔍 Deployment Health Check for WhatsApp Clone"
echo "=============================================="

# Test backend health
echo "📡 Testing backend health..."
BACKEND_URL="https://cartrabbit-whatsapp-clone.onrender.com"

echo "Testing: $BACKEND_URL/api/health"
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" "$BACKEND_URL/api/health")
HTTP_CODE="${HEALTH_RESPONSE: -3}"
RESPONSE_BODY="${HEALTH_RESPONSE%???}"

echo "HTTP Status: $HTTP_CODE"
echo "Response: $RESPONSE_BODY"

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Backend is healthy!"
else
    echo "❌ Backend is not responding correctly"
    echo "Expected HTTP 200, got $HTTP_CODE"
fi

echo ""
echo "🔧 Common Issues & Solutions:"
echo "1. If 503: Server starting up (wait 1-2 minutes)"
echo "2. If 500: Check environment variables in Render"
echo "3. If timeout: MongoDB connection issue"
echo "4. If 404: Build failed - check deployment logs"

echo ""
echo "📋 Environment Variables Checklist:"
echo "✓ NODE_ENV=production"
echo "✓ PORT=5000" 
echo "✓ MONGODB_URI=mongodb+srv://..."
echo "✓ CLIENT_ORIGIN=http://localhost:5173"

echo ""
echo "🚀 Next Steps:"
echo "1. Check Render logs for detailed errors"
echo "2. Verify MongoDB Atlas IP whitelist"
echo "3. Test frontend deployment after backend works"
