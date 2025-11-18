# Facebook Meta Developer Setup

## App Credentials
- Create a Meta App in developers.facebook.com and note `App ID` and `App Secret`.
- Add to environment: `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`.

## Permissions and Scopes
- Required: `public_profile`, `email`, `pages_show_list`, `pages_read_engagement`, `pages_manage_metadata`, `pages_messaging`.
- Optional: `pages_manage_posts`, `business_management`, `pages_read_user_content`.
- Submit for App Review where applicable.

## OAuth and Callback URLs
- OAuth redirect: set to `FACEBOOK_REDIRECT_URI`.
- Use `GET /api/auth/facebook` to start login and `POST /api/auth/facebook/route.ts` callback.
- Configure Webhook callback URL: `/api/webhooks/facebook`.
- Verify token: set `FACEBOOK_WEBHOOK_VERIFY_TOKEN`.

## Webhooks Configuration
- Subscribe the Page to `messages`, `messaging_postbacks`, `message_deliveries`, `message_reads`.
- Ensure signature verification is enabled; the server checks `x-hub-signature-256` against the app secret.

## Security Measures
- Never store user or page access tokens in client storage.
- Server proxies Graph API and sanitizes persisted platform connections.
- Restrict access to admin users via Supabase Auth and middleware.

## Environment Variables
- `FACEBOOK_APP_ID`
- `FACEBOOK_APP_SECRET`
- `FACEBOOK_REDIRECT_URI`
- `FACEBOOK_WEBHOOK_VERIFY_TOKEN`
- `NEXT_PUBLIC_BASE_URL` must match deployed domain.

## Operational Notes
- After connecting a page, call `facebookAPI.subscribeToWebhooks` for the page.
- Monitor Webhook delivery; errors are written to `error_logs`.