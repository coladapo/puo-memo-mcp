#!/bin/bash
echo "🔑 Updating Gemini API key..."
echo "When prompted, select your service (puo-memo)"
echo ""
echo "⚠️  SECURITY WARNING: Never commit API keys to version control!"
echo ""

# Check if GEMINI_API_KEY environment variable is set
if [ -z "$GEMINI_API_KEY" ]; then
    echo "❌ Error: GEMINI_API_KEY environment variable not set"
    echo ""
    echo "Usage:"
    echo "  export GEMINI_API_KEY='your-actual-key-here'"
    echo "  ./update_gemini_key.sh"
    exit 1
fi

# This will prompt for service selection
railway variables --set "GEMINI_API_KEY=$GEMINI_API_KEY"

echo ""
echo "✅ Key updated! Redeploy to apply:"
echo "railway up"