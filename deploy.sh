#!/bin/bash

echo "🚀 WhatsApp Web Clone - Deployment Script"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Project structure validated"

# Check if .env.example exists in backend
if [ ! -f "backend/.env.example" ]; then
    echo "❌ Error: backend/.env.example not found"
    exit 1
fi

echo "✅ Environment template found"

# Create production environment file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend/.env from template..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please update backend/.env with your MongoDB URI before deployment"
fi

echo "✅ Environment files ready"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📝 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit: WhatsApp Web Clone"
    echo "✅ Git repository initialized"
fi

echo ""
echo "🎯 Ready for deployment!"
echo ""
echo "📋 Next Steps:"
echo "1. Push your code to GitHub:"
echo "   git remote add origin https://github.com/jeyasanjaym/CartRabbit-whatsapp-clone.git"
echo "   git push -u origin main"
echo ""
echo "2. Deploy to Vercel:"
echo "   - Go to https://vercel.com"
echo "   - Click 'New Project'"
echo "   - Import your repository"
echo "   - Add MONGODB_URI environment variable"
echo "   - Click Deploy!"
echo ""
echo "3. Or use the one-click deploy button in README.md"
echo ""
echo "📚 See DEPLOYMENT.md for detailed instructions"
echo ""
echo "🎉 Your WhatsApp Web Clone is ready to go live!"
