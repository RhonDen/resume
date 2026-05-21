# TODO - Gated Resume (GCash + Gift Codes)

- [ ] Update UI in `src/App.jsx` to show:
  - Locked preview vs full resume
  - Plan choices (Basic 129, Premium 399)
  - Gift code input
  - GCash QR redirect section (QR placeholder)
- [ ] Add resume PDF placeholder at `public/resume.pdf`
- [ ] Add Netlify Functions endpoints:
  - `/.netlify/functions/redeem-gift` (gift code one-time redemption)
  - `/.netlify/functions/gcash-callback` (payment callback) OR configure which webhook payload field to use
  - `/.netlify/functions/verify-access` (checks if user has access and tier)
- [ ] Implement secure access tokens stored in `localStorage` or cookie (issued only by backend)
- [ ] Wire UI to:
  - Submit gift code to backend
  - Show payment status after callback verification
- [ ] Run `npm run dev` and `npm run build`
- [ ] Quick manual test of mock + secure flows

