#!/bin/bash

# Procktails E-Commerce Platform Setup Script

echo "🚀 Setting up Procktails E-Commerce Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is required but not installed. Please install PostgreSQL 14+ first."
    exit 1
fi

# Create logs directory
mkdir -p backend/logs

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install && cd ..

# Set up environment files
if [ ! -f .env ]; then
    echo "📝 Creating frontend .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your configuration"
fi

if [ ! -f backend/.env ]; then
    echo "📝 Creating backend .env file..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please edit backend/.env with your Shopify and database credentials"
fi

# Database setup
echo "🗄️  Setting up database..."
echo "Please enter your PostgreSQL details or press Enter to use defaults:"
read -p "Host (localhost): " db_host
read -p "Port (5432): " db_port
read -p "Database name (procktails): " db_name
read -p "User (postgres): " db_user

db_host=${db_host:-localhost}
db_port=${db_port:-5432}
db_name=${db_name:-procktails}
db_user=${db_user:-postgres}

# Create database if it doesn't exist
echo "Creating database..."
createdb -h $db_host -p $db_port -U $db_user $db_name 2>/dev/null || echo "Database already exists or requires password"

# Set up schema
echo "Setting up database schema..."
PGPASSWORD=$db_user psql -h $db_host -p $db_port -U $db_user -d $db_name -f backend/src/config/schema.sql

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env and backend/.env with your configuration"
echo "2. Configure your Shopify store and get API credentials"
echo "3. Start the development servers:"
echo "   - Backend: cd backend && npm run dev"
echo "   - Frontend: npm run dev"
echo ""
echo "🎉 Happy coding!"