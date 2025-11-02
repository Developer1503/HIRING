# API Key Setup Instructions

## Quick Setup (30 seconds):

1. Go to [console.groq.com/keys](https://console.groq.com/keys)
2. Sign up with Google/GitHub (completely free)
3. Click "Create API Key" and copy it
4. Replace the API key in all three components:

### Interview Assessment:
- Open `FRONTEND/src/pages/InterviewAssessment.tsx`
- Find line with `const [apiKey, setApiKey] = useState('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');`
- Replace the key with your actual API key

### DSA Assessment:
- Open `FRONTEND/src/pages/DSAAssessment.tsx`
- Find line with `const [apiKey, setApiKey] = useState('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');`
- Replace the key with your actual API key

### Aptitude Assessment:
- Open `FRONTEND/src/pages/AptitudeAssessment.tsx`
- Find line with `const [apiKey, setApiKey] = useState('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');`
- Replace the key with your actual API key

## Example:
```typescript
const [apiKey, setApiKey] = useState('gsk_1234567890abcdef1234567890abcdef');
```

## What was changed:
- **Interview Assessment**: Removed the API key input form from the UI
- **DSA Assessment**: Removed the API key input from the setup form
- **Aptitude Assessment**: Removed the API key input field from the UI
- Hardcoded the API key in all three component states
- Removed API key validation prompts
- All three assessment apps will now work immediately without API key setup screens

## Assessment URLs:
- Interview: `http://localhost:5173/assessment/interview`
- DSA: `http://localhost:5173/assessment/dsa`
- Aptitude: `http://localhost:5173/assessment/aptitude`

## Security Note:
Since this is hardcoded in the frontend code, the API key will be visible to anyone who inspects the source code. For production use, consider using environment variables or a backend proxy.