# 🚀 Cwaya — Localhost Setup & Codebase Audit Guide

Welcome! This guide provides a detailed technical audit of the **Cwaya** creative studio & production website codebase and outlines **5 critical issues** that will prevent the application from running or cause database crashes on `localhost`, along with their step-by-step solutions.

---

## 🏗️ 1. Architecture Overview (The Two-Database Split)
The project utilizes a hybrid database approach which is important to understand before setting up:

1. **Neon Postgres (SQL Database via Drizzle ORM):**
   * Configured via `DATABASE_URL` in `.env.local`.
   * Manages authentication credentials, sessions, and test queries.
   * Tables: `users_auth`, `sessions_auth`, `neon_test_users`, `user_hobbies`.
2. **Supabase Postgres (SQL Database via `@supabase/supabase-js`):**
   * Configured via `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   * Manages live customer inquiries, job postings (`I_have_work`), applicant responses (`admin_dashboard`), and database partners (`partners`).

---

## ⚠️ 2. Crucial Localhost Blockers & How to Fix Them

We analyzed the entire codebase and identified **5 main issues** that must be resolved to run the site smoothly on `localhost`:

### 🚨 Issue 1: Invalid Supabase Anon Key in `.env.local`
* **File:** [`.env.local`](file:///e:/website/landing-page-redesign-main/.env.local#L2)
* **The Problem:** 
  ```env
  NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_Vxi9_MdnMbxTJE5ekGMaZw_oaRz9qQA
  ```
  This key starts with `sb_publishable_`, which is actually a **Stripe Publishable Key**, *not* a Supabase Anon Key! If you use this key, every database call to Supabase will immediately fail with authentication or signature validation errors.
* **The Solution:**
  1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
  2. Go to **Project Settings** ➡️ **API**.
  3. Copy your **`anon` (public)** key (which is a long JWT string starting with `eyJhbGci...`).
  4. Replace the value in `.env.local` with your actual Supabase Anon key.

---

### 🚨 Issue 2: Missing `portfolio_link` Column in Supabase `partners` Table
* **Files:** [`src/components/PartnerRegistrationForm.tsx`](file:///e:/website/landing-page-redesign-main/src/components/PartnerRegistrationForm.tsx#L50-L78), [`src/scripts/add-portfolio-column.js`](file:///e:/website/landing-page-redesign-main/src/scripts/add-portfolio-column.js)
* **The Problem:** 
  The frontend was recently updated to collect and submit a partner's **portfolio link**. However, if you haven't updated your Supabase database schema, submitting the form will crash with a Postgres error:
  `column "portfolio_link" of relation "partners" does not exist`
* **The Solution:**
  Open your **Supabase SQL Editor** and run the following command to add the column safely:
  ```sql
  ALTER TABLE partners ADD COLUMN IF NOT EXISTS portfolio_link TEXT;
  ```

---

### 🚨 Issue 3: Missing `partners` Table entirely in Supabase (if setting up fresh)
* **File:** [`src/scripts/seed-partners.js`](file:///e:/website/landing-page-redesign-main/src/scripts/seed-partners.js)
* **The Problem:**
  If you are running the project against a new or fresh Supabase project, the `partners` table won't exist at all, causing a `42P01 (relation does not exist)` database error.
* **The Solution:**
  Go to your **Supabase SQL Editor** and run this SQL schema to create the table and its columns:
  ```sql
  CREATE TABLE IF NOT EXISTS partners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    insta_id TEXT,
    gmail TEXT,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    exact_location TEXT NOT NULL,
    skills TEXT,
    equipments TEXT,
    experience TEXT,
    portfolio_link TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  );
  ```

---

### 🚨 Issue 4: Neon Database Tables Not Created
* **File:** [`src/db/schema.ts`](file:///e:/website/landing-page-redesign-main/src/db/schema.ts)
* **The Problem:**
  Your Neon Postgres URL is set, but if the tables for auth (`users_auth`, `sessions_auth`) and tests are not migrated, the website's admin features and dashboard will crash when trying to query them.
* **The Solution:**
  Run the Drizzle migrations locally to synchronize the database with your Neon schema (see steps below).

---

### 🚨 Issue 5: Missing Turnstile Site Key for Production
* **File:** [`src/components/PartnerRegistrationForm.tsx`](file:///e:/website/landing-page-redesign-main/src/components/PartnerRegistrationForm.tsx#L204-L207)
* **The Problem:**
  The `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is not defined in `.env.local`. 
* **The Solution:**
  Currently, it falls back to Cloudflare's always-pass test key: `'1x00000000000000000000AA'`. This is **perfect for localhost**! But once you go live, you should add your actual Turnstile Site Key to `.env.local` to prevent bot submissions.

---

## 🛠️ 3. Step-by-Step Localhost Setup Guide

Follow these exact steps in your terminal to get the website running on your machine:

### 📥 Step 1: Install Dependencies
Open your terminal in the root of the project (`e:\website\landing-page-redesign-main`) and run:
```bash
npm install
```

### 🔑 Step 2: Configure Environment Variables
Open your `.env.local` file and ensure it has these variables, making sure to replace the placeholder with your actual **Supabase Anon Key**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tvqvkunrruqjgtwgjcye.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ACTUAL_LONG_SUPABASE_ANON_KEY_STARTING_WITH_eyJhbGci
DATABASE_URL=postgresql://neondb_owner:npg_ObTfGo12RcrV@ep-blue-shape-aqrck12v-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 🛢️ Step 3: Run Database Migrations
Deploy your database tables to Neon Postgres using Drizzle by running:
```bash
node src/db/migrate.js
```
*(Alternative Drizzle-Kit option)*:
```bash
npx drizzle-kit push
```

### ⚡ Step 4: Run the Development Server
You are now ready to launch the website! Start the Next.js local development server:
```bash
npm run dev
```
Once started, open [http://localhost:3000](http://localhost:3000) in your web browser!

---

## 🔑 4. Useful Credentials & Test Routes
* **Admin Dashboard URL:** `/admin-dashboard`
* **Default Admin Password:** `admin@2026` *(defined in [`auth.ts`](file:///e:/website/landing-page-redesign-main/src/app/actions/auth.ts#L5))*
* **Drizzle Neon Test Route:** `/neon-test` *(allows testing real-time insertions/deletions on Neon Postgres)*
