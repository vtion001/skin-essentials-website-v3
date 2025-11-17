# Meta Developer Environment Variables Check

## Required Environment Variables for Production:

### Facebook Configuration
- `FACEBOOK_APP_ID=764719166731391`
- `FACEBOOK_APP_SECRET=4380d01c39141022d8508d3a68427135`
- `FACEBOOK_WEBHOOK_VERIFY_TOKEN=fb_webhook_2024_a7b3c9d2e8f1g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3`
- `FACEBOOK_REDIRECT_URI=https://www.skinessentialsbyher.com/api/auth/facebook`

### Instagram Configuration
- `INSTAGRAM_APP_ID=1121558939556493`
- `INSTAGRAM_APP_SECRET=8ad72ab86c8d51dc5ae385224c682b35`
- `INSTAGRAM_WEBHOOK_VERIFY_TOKEN=ig_webhook_2024_z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4`
- `INSTAGRAM_REDIRECT_URI=https://www.skinessentialsbyher.com/api/auth/instagram`

### Base URLs
- `NEXT_PUBLIC_BASE_URL=https://www.skinessentialsbyher.com`
- `NODE_ENV=production`

## Vercel Deployment Instructions:

1. **Go to your Vercel Dashboard**: https://vercel.com/dashboard
2. **Find your project**: skin-essentials-website-v3
3. **Go to Settings > Environment Variables**
4. **Add all the variables listed above**
5. **Redeploy your project** to apply the changes

## Alternative: Use Vercel CLI
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variables
vercel env add FACEBOOK_WEBHOOK_VERIFY_TOKEN production
vercel env add INSTAGRAM_WEBHOOK_VERIFY_TOKEN production
# Add all other required variables...

# Deploy with new environment variables
vercel --prod
```

## Test After Deployment:
```bash
# Test webhook verification
curl -X GET "https://www.skinessentialsbyher.com/api/webhooks/facebook?hub.mode=subscribe&hub.challenge=test_challenge&hub.verify_token=fb_webhook_2024_a7b3c9d2e8f1g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3"

# Should return: test_challenge (HTTP 200)
```