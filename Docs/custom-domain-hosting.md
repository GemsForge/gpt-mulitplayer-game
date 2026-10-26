# Chromalock Custom-Domain Hosting

## Purpose

Chromalock can be hosted on the project owner's existing domain instead of using only a provider-generated URL. The recommended setup uses a dedicated subdomain so the game remains separate from the main portfolio, personal site, or other projects.

Recommended public URL patterns:

```text
chromalock.example.com
play.example.com
```

## Recommended hosting architecture

```text
Player browser
      |
      | HTTPS
      v
chromalock.example.com
      |
      v
Netlify, Vercel, or Cloudflare Pages
      |
      | Supabase client connection
      v
Supabase PostgreSQL + Realtime + Edge Functions
```

The custom domain points to the static React frontend. Supabase remains the backend for room state, realtime events, validated game actions, and persistent progression.

## Setup steps

### 1. Deploy the frontend

Build the React application and deploy the output to one hosting provider:

- Netlify Free
- Vercel Hobby
- Cloudflare Pages Free

The hosting provider supplies a temporary preview URL for testing before the custom domain is attached.

### 2. Add the custom domain

In the hosting provider dashboard:

1. Open the Chromalock project.
2. Select the domain or custom-domain settings.
3. Add the chosen subdomain, such as `chromalock.example.com`.
4. Copy the DNS record requested by the provider.

### 3. Update DNS

At the domain registrar or DNS provider, add the record supplied by the hosting provider. A subdomain commonly uses a CNAME record:

```text
Type:  CNAME
Name:  chromalock
Value: provider-hostname.example
TTL:   Automatic
```

The exact value must come from the selected hosting provider. Do not guess or reuse a record from another project.

### 4. Enable HTTPS

After DNS verification, the hosting provider should issue an HTTPS certificate automatically. Confirm that the game loads at:

```text
https://chromalock.example.com
```

Do not use the custom domain for the challenge until HTTPS is active.

### 5. Allow the domain in Supabase

Add the production URL to the Supabase project configuration:

```text
https://chromalock.example.com
```

The domain must be included in the allowed origins, redirect URLs, and authentication URL settings used by the project. The local development URL should remain available separately:

```text
http://localhost:5173
```

### 6. Configure frontend environment variables

The frontend may expose only public Supabase configuration:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
VITE_APP_URL=https://chromalock.example.com
```

Never expose the Supabase service-role key, database password, signing secret, or other privileged credentials through `VITE_` variables.

## Environment URLs

| Environment | URL | Purpose |
|---|---|---|
| Local | `http://localhost:5173` | Development and automated tests |
| Preview | Provider-generated preview URL | Pull request and review testing |
| Production | `https://chromalock.example.com` | Challenge demo and public game |

## Verification checklist

- Custom subdomain resolves to the deployed frontend.
- HTTPS certificate is active.
- React app loads without mixed-content errors.
- Supabase accepts the production origin.
- A player can create a room from the custom domain.
- A second player can join the room from another browser.
- Realtime updates work across both browsers.
- Keyboard controls work on the deployed URL.
- Refreshing the page does not expose secrets.
- Supabase service-role credentials are not present in built assets.
- The production URL is recorded in the Handshake project submission.

## Cost expectation

The custom domain is optional. Hosting can remain within free tiers, but the domain itself may have an annual registration cost, commonly approximately $10–20 per year depending on the registrar and domain extension. No custom domain is required for local development.

## Ownership and safety

Only attach a domain after confirming that it is the intended project domain. DNS changes affect whoever currently uses that subdomain. Keep the main domain untouched and create a dedicated subdomain for Chromalock.
