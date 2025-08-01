# AWS Amplify Setup Guide

## Environment Variables Configuration

This application requires API keys that must be configured as environment variables in AWS Amplify.

### Required Environment Variables

1. **GOOGLE_MAPS_API_KEY** - For Google Maps functionality
2. **CLAUDE_API_KEY** - For AI assistant features (if applicable)

### Setup Steps

1. **In AWS Amplify Console:**
   - Go to your app
   - Click on "Environment variables" in the left sidebar
   - Click "Manage variables"
   - Add the following variables:
     - Key: `GOOGLE_MAPS_API_KEY`
     - Value: Your Google Maps API key

2. **Update Your Code:**
   - Replace `YOUR_API_KEY_HERE` in index.html with your actual API key
   - OR implement a secure method to inject the key during build time

### Security Notes

- Never commit API keys directly in your code
- Use environment variables for all sensitive data
- Restrict API keys to specific domains in Google Cloud Console
- Monitor usage regularly

### For Local Development

Create a `.env` file (never commit this):
```
GOOGLE_MAPS_API_KEY=your_key_here
```

### Build-Time Injection (Recommended)

Consider updating your build process to inject the API key:

```javascript
// In your build script
const apiKey = process.env.GOOGLE_MAPS_API_KEY;
// Replace placeholder in HTML during build
```