#!/bin/bash

# Production Build Script for Rodar Franchise World
# This script builds the application for production with optimizations

set -e

echo "🚀 Starting production build..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your production environment variables."
    exit 1
fi

# Validate required environment variables
echo "🔍 Validating environment variables..."
source .env

if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: Missing required environment variables!"
    echo "Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file."
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm ci --production=false
fi

# Run linting
echo "🔍 Running linting..."
npm run lint

# Build the application
echo "🏗️ Building application..."
npm run build

# Check build output
if [ ! -d "dist" ]; then
    echo "❌ Build failed! dist directory not found."
    exit 1
fi

# Optimize images (if imagemin is available)
if command -v imagemin &> /dev/null; then
    echo "🖼️ Optimizing images..."
    imagemin dist/**/*.{jpg,jpeg,png,gif,svg} --out-dir=dist
fi

# Generate build report
echo "📊 Generating build report..."
BUILD_SIZE=$(du -sh dist | cut -f1)
BUILD_DATE=$(date -u +"%Y-%m-%d %H:%M:%S UTC")

cat > dist/build-info.txt << EOF
Build Information
=================
Build Date: $BUILD_DATE
Build Size: $BUILD_SIZE
Environment: Production
Version: ${VITE_APP_VERSION:-1.0.0}
Supabase URL: $VITE_SUPABASE_URL
EOF

echo "✅ Production build completed successfully!"
echo "📁 Build output: dist/"
echo "📏 Build size: $BUILD_SIZE"
echo "🕐 Build time: $BUILD_DATE"

# Optional: Deploy to hosting service
if [ "$1" = "--deploy" ]; then
    echo "🚀 Deploying to production..."
    # Add your deployment commands here
    # Example: aws s3 sync dist/ s3://your-bucket --delete
    echo "✅ Deployment completed!"
fi

echo "🎉 All done! Your application is ready for production."
