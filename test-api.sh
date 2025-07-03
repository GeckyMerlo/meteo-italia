#!/bin/bash

# Script per testare l'API meteo

echo "🧪 Test API Meteo Italia"
echo "========================"

# Test con curl (se disponibile)
if command -v curl &> /dev/null; then
    echo "📡 Testing API endpoint..."
    echo ""
    echo "GET /api/meteo?city=Roma&day=oggi"
    curl -s "http://localhost:3000/api/meteo?city=Roma&day=oggi" | jq '.' || echo "Install jq for better JSON formatting"
    echo ""
    echo "GET /api/meteo?city=Milano&day=domani"
    curl -s "http://localhost:3000/api/meteo?city=Milano&day=domani" | jq '.' || echo "Install jq for better JSON formatting"
else
    echo "❌ curl not found. Please install curl to test the API."
fi

echo ""
echo "✅ API tests completed!"
echo "🌐 Visit http://localhost:3000 to see the app"
