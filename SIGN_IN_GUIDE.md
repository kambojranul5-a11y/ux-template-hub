# Sign In Guide - UX Template Hub Analytics Dashboard

## 🔐 How to Sign In

### Step 1: Access the Auth Page
Navigate to the authentication page in your browser:
```
http://localhost:8081/auth
```

### Step 2: Create an Account (First Time)
1. Click on the **"Sign Up"** tab
2. Enter your email address
3. Enter a password (minimum 6 characters)
4. Click **"Sign Up"** button
5. You'll see a success message: "Account created successfully. You can now sign in."

### Step 3: Sign In
1. Switch to the **"Sign In"** tab
2. Enter the email you just registered
3. Enter your password
4. Click **"Sign In"** button
5. You'll be redirected to the home page

### Step 4: Make Yourself an Admin

⚠️ **Important:** By default, new users are NOT admins and cannot access `/analytics`.

To become an admin, you need to add a record to the `user_roles` table in Supabase:

#### Option A: Using Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard
2. Select your project: `htuacbjcsqyzxqnspteo`
3. Go to **Table Editor** → **user_roles**
4. Click **Insert** → **Insert row**
5. Fill in:
   - `user_id`: Your user ID (get from auth.users table or session)
   - `role`: Select **admin**
6. Click **Save**

#### Option B: Using SQL Editor in Supabase
1. Go to https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Run this query (replace YOUR_EMAIL with your actual email):

```sql
-- First, find your user_id
SELECT id, email FROM auth.users WHERE email = 'YOUR_EMAIL';

-- Then insert admin role (replace USER_ID_HERE with the id from above)
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_HERE', 'admin');
```

#### Option C: Quick Method (if you know your user ID)
```sql
-- Replace YOUR_USER_ID with your actual UUID
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_ID', 'admin');
```

### Step 5: Access Analytics Dashboard
1. After adding the admin role, refresh your browser
2. Navigate to: http://localhost:8081/analytics
3. You should now see the full Analytics Dashboard!

---

## 🎯 Quick Test Account Setup

If you want to quickly test, here's a step-by-step example:

### 1. Sign Up
- Email: `admin@example.com`
- Password: `password123`

### 2. Get User ID
After signing up, check the browser console or use Supabase dashboard to find your user ID.

### 3. Add Admin Role in Supabase SQL Editor
```sql
-- Get your user ID
SELECT id FROM auth.users WHERE email = 'admin@example.com';

-- Add admin role (use the ID from above)
INSERT INTO public.user_roles (user_id, role)
VALUES ((SELECT id FROM auth.users WHERE email = 'admin@example.com'), 'admin');
```

### 4. Sign In Again
- Navigate to http://localhost:8081/auth
- Sign in with `admin@example.com` / `password123`
- Go to http://localhost:8081/analytics

---

## 🔍 Troubleshooting

### "Cannot access Analytics - Redirected to Auth"
**Problem:** You're not an admin yet.  
**Solution:** Follow Step 4 above to add admin role in Supabase.

### "Invalid credentials"
**Problem:** Wrong email or password.  
**Solution:** 
- Make sure you signed up first
- Check for typos
- Password must be at least 6 characters

### "Already registered"
**Problem:** Email already exists in the database.  
**Solution:** Use the Sign In tab instead of Sign Up.

### Can't connect to Supabase
**Problem:** Environment variables not loaded or Supabase project issue.  
**Solution:**
- Check that `.env` file exists in project root
- Verify VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set
- Restart dev server: `npm run dev`

---

## 📱 Current Supabase Setup

Your project is connected to:
- **Project ID:** htuacbjcsqyzxqnspteo
- **URL:** https://htuacbjcsqyzxqnspteo.supabase.co
- **Dashboard:** https://supabase.com/dashboard/project/htuacbjcsqyzxqnspteo

---

## 🔑 Authentication Flow

```
1. User visits /auth
   ↓
2. Sign Up with email + password
   ↓
3. Account created in auth.users table
   ↓
4. Admin manually adds role to user_roles table
   ↓
5. User signs in
   ↓
6. useAuth hook checks user_roles table
   ↓
7. If role = 'admin', user can access /analytics
   ↓
8. If not admin, redirect to /auth
```

---

## 🎨 Navigation After Sign In

Once signed in as admin, you can access:

- **Home/Templates** - http://localhost:8081/
- **About** - http://localhost:8081/about
- **Analytics** - http://localhost:8081/analytics (admin only)

The navigation bar will show a **Logout** button when you're signed in.

---

## 💡 Pro Tips

1. **Save Credentials**: Use a password manager for test accounts
2. **Multiple Accounts**: You can create multiple accounts for testing
3. **Sign Out**: Click Logout button in navigation to sign out
4. **Session Persistence**: Session is saved in localStorage, so you stay signed in even after page refresh
5. **Admin Check**: The `useAuth` hook automatically checks if you're an admin on every page load

---

## 🚀 Quick Start Commands

```bash
# Start dev server (if not running)
npm run dev

# Open auth page in browser
# Navigate to: http://localhost:8081/auth

# After signing in and adding admin role:
# Navigate to: http://localhost:8081/analytics
```

---

## 📞 Need Help?

If you're still having issues:
1. Check browser console for errors (F12)
2. Verify Supabase project is active
3. Check that user_roles table exists in Supabase
4. Ensure you've added the admin role correctly
5. Try signing out and back in

---

**Last Updated:** October 20, 2025  
**Server:** http://localhost:8081  
**Auth Route:** /auth  
**Analytics Route:** /analytics (admin only)
