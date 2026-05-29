# SlotMD — How to Launch Your Website

This guide gets your website live on the internet. It takes about 1 hour and costs $0.

You'll create accounts on 4 free services, collect some keys from each one, and paste them into a single file. That's the whole setup.

---

## What you'll need before starting

- A computer with internet access
- An email address
- The `slotmd` folder (you already have this)

You do NOT need to know how to code. Just follow each step exactly.

---

## The 4 services you'll sign up for

| Service | What it does | Cost |
|---|---|---|
| **Supabase** | Stores your data (users, bookings, clinics) | Free |
| **Stripe** | Processes the $19.99 patient payment | Free to start |
| **Resend** | Sends notification emails | Free (3,000/month) |
| **Vercel** | Puts your website on the internet | Free |

---

## PART 1 — Set up Supabase (your database)

Supabase stores everything: user accounts, clinic listings, bookings, notifications.

1. Go to **supabase.com** and click **Start your project** → sign up for a free account
2. Click **New project** → give it a name (e.g. "slotmd") → choose a region close to you → click **Create new project** (takes about 1 minute to load)
3. Once it's ready, click **SQL Editor** in the left sidebar
4. Open the file `supabase/schema.sql` from your slotmd folder in any text editor (Notepad works), select all the text, and copy it
5. Paste it into the SQL Editor box on the Supabase website, then click **Run**
   - You should see "Success. No rows returned" — that means it worked
6. Now go to **Settings** (gear icon, bottom left) → **API**
7. You'll see three values. Copy each one and save it somewhere (a notes app is fine):
   - **Project URL** — looks like `https://abcxyz.supabase.co`
   - **anon public** key — a long string starting with `eyJ...`
   - **service_role** key — another long string (keep this one private)

---

## PART 2 — Set up Stripe (payments)

Stripe handles the $19.99 booking fee patients pay.

1. Go to **stripe.com** → click **Start now** → create a free account
2. Once logged in, click **Developers** in the top right corner → then **API keys**
3. You'll see two keys. Copy both and save them:
   - **Publishable key** — starts with `pk_live_` (or `pk_test_` for testing)
   - **Secret key** — starts with `sk_live_` (click "Reveal" to see it)
4. Now set up the webhook (this tells your site when a payment succeeds):
   - In the left sidebar, go to **Developers** → **Webhooks** → **Add endpoint**
   - In the "Endpoint URL" box, type: `https://YOUR-VERCEL-URL.vercel.app/api/stripe/webhook`
     _(You'll fill in the actual URL after you deploy in Part 4 — come back and do this step then)_
   - Under "Select events", find and check **checkout.session.completed**
   - Click **Add endpoint**, then click on the endpoint you just created
   - Click **Reveal** next to "Signing secret" and copy that value too

---

## PART 3 — Set up Resend (emails)

Resend sends emails to patients and clinics when something happens (like a booking confirmation).

1. Go to **resend.com** → click **Get started** → create a free account
2. Once logged in, click **API Keys** in the left sidebar → **Create API Key**
3. Give it a name (e.g. "slotmd"), click **Add** → copy the key that appears (it starts with `re_`)
4. For the "from" email address:
   - If you have your own domain (e.g. yourdomain.com): click **Domains** → **Add Domain** and follow the instructions to verify it. Then use `notifications@yourdomain.com`
   - If you don't have a domain yet: use `onboarding@resend.dev` for now — it works for testing

---

## PART 4 — Create your settings file

This is where you put all the keys you collected into one place.

1. Open the `slotmd` folder on your computer
2. Find the file called `.env.example` — make a copy of it and rename the copy to `.env.local`
3. Open `.env.local` in any text editor (Notepad, TextEdit, etc.)
4. Fill in each line with the values you copied earlier:

```
NEXT_PUBLIC_SUPABASE_URL=        ← paste your Supabase Project URL here
NEXT_PUBLIC_SUPABASE_ANON_KEY=   ← paste your Supabase anon public key here
SUPABASE_SERVICE_ROLE_KEY=       ← paste your Supabase service_role key here

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=  ← paste your Stripe Publishable key here
STRIPE_SECRET_KEY=                   ← paste your Stripe Secret key here
STRIPE_WEBHOOK_SECRET=               ← paste your Stripe webhook signing secret here

RESEND_API_KEY=          ← paste your Resend API key here
RESEND_FROM_EMAIL=       ← type the "from" email address (e.g. notifications@yourdomain.com)

NEXT_PUBLIC_APP_URL=     ← leave blank for now, fill in after Step 5
```

5. Save the file

---

## PART 5 — Put the website on the internet (Vercel)

1. Go to **github.com** → create a free account if you don't have one → click **New repository** → name it "slotmd" → click **Create repository**
2. On the next screen, GitHub will show you some commands. You'll run these in Terminal (Mac) or Command Prompt (Windows):
   ```
   cd path/to/your/slotmd/folder
   git init
   git add .
   git commit -m "initial"
   git remote add origin https://github.com/YOUR-USERNAME/slotmd.git
   git push -u origin main
   ```
3. Go to **vercel.com** → click **Sign up** → sign up with your GitHub account
4. Click **Add New Project** → find your "slotmd" repo → click **Import**
5. Before clicking Deploy, click **Environment Variables** and add every line from your `.env.local` file (name on the left, value on the right)
6. Click **Deploy** — Vercel builds and publishes your site automatically (takes 1–2 minutes)
7. Once done, Vercel gives you a URL like `https://slotmd.vercel.app` — **that's your live website!**
8. Copy that URL and go back to:
   - Your `.env.local` file → fill in `NEXT_PUBLIC_APP_URL=https://slotmd.vercel.app`
   - Vercel → your project → Settings → Environment Variables → update `NEXT_PUBLIC_APP_URL` with the same URL
   - Stripe webhook → update the endpoint URL with your real Vercel URL

---

## PART 6 — Add your first clinic

1. Go to your live website → click **Get Started** → select **I Represent a Clinic** → fill in the form
2. After registering, you'll be taken to the clinic dashboard
3. Click **Edit Profile** to add your clinic name, address, doctors, and specialties
4. Your clinic will now appear in the patient-facing directory

---

## Your website pages

Once live, here's where everything lives:

| Page | URL |
|---|---|
| Patient homepage | `yourdomain.com` |
| Clinic directory | `yourdomain.com/directory` |
| Book a slot | `yourdomain.com/book` |
| Patient dashboard | `yourdomain.com/dashboard` |
| For clinics (marketing) | `yourdomain.com/for-clinics` |
| Clinic login + dashboard | `yourdomain.com/clinic/dashboard` |

---

## Stuck on something?

The most common issue is a missing or wrong key in `.env.local`. Double-check that every value is filled in with no extra spaces. If the site loads but payments don't work, the Stripe webhook URL is the most likely culprit — make sure it matches your Vercel URL exactly.
