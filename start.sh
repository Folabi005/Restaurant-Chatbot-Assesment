#!/usr/bin/env bash

# Quick Start Script for Restaurant ChatBot

echo "🚀 Restaurant ChatBot - Quick Start"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env with your Paystack credentials"
    echo "   Get them from: https://dashboard.paystack.com/settings/developers"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start development:"
echo ""
echo "  Terminal 1 (Frontend):"
echo "  $ npm run dev"
echo ""
echo "  Terminal 2 (Backend):"
echo "  $ npm run dev:server"
echo ""
echo "Then open: http://localhost:5173"
echo ""
