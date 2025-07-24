#!/bin/bash
echo "🔑 Updating Gemini API key..."
echo "When prompted, select your service (puo-memo)"
echo ""

# This will prompt for service selection
railway variables --set "GEMINI_API_KEY=AIzaSyCeXDsfhL9TuUmMkl75pUK83VGSwu5FbKs"

echo ""
echo "✅ Key updated! Redeploy to apply:"
echo "railway up"