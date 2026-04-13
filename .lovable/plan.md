

## Plan: Build Job Application Tracker with Working Email Auth

The project is currently a blank starter — nothing from the plan has been implemented yet. I'll build everything from scratch, with special attention to making email verification links work correctly.

### What will be built

**1. Enable Lovable Cloud + Auth**
- Enable Lovable Cloud (Supabase backend)
- Enable email/password authentication
- Set `emailRedirectTo: window.location.origin` in signup to ensure verification links redirect correctly

**2. Database Setup**
- Create `applications` table: id, user_id, company, role, status (enum: Applied/Interviewing/Offer/Rejected), date_applied, job_link, notes, tags (text[]), image_url, created_at
- RLS policies so users only see their own data
- Create `application-images` storage bucket

**3. Auth Pages**
- Login page (email/password + link to signup)
- Signup page (email/password + link to login)
- Auth callback handling — ensure the `/auth/callback` route processes the email verification token correctly using `supabase.auth.exchangeCodeForSession()`
- Protected route wrapper redirecting unauthenticated users to login

**4. Email Verification Fix**
The verification link issue is typically caused by missing token exchange logic. I'll add a dedicated `/auth/callback` route that:
- Extracts the auth code from the URL
- Calls `exchangeCodeForSession()` to complete verification
- Redirects to the dashboard on success

**5. App Layout & Navigation**
- Responsive header with nav links and logout button
- Mobile hamburger menu

**6. Dashboard Page**
- 3 metric cards (Total, Interviews, Offers)
- Bar chart (Recharts) showing applications by status

**7. Add Application Page**
- Form with all fields (company, role, status, date, link, notes, tags, image upload)
- Image upload to storage bucket
- Validation + success toast + redirect

**8. My Applications Page**
- Card grid with search, status filter, date sort
- Edit/delete functionality via dialog

### Technical Details

- Supabase client configured in `src/integrations/supabase/client.ts`
- Auth context provider wrapping the app
- `onAuthStateChange` listener set up before `getSession()` call
- Email redirect URL set to `window.location.origin` to ensure verification links open the app correctly
- Auth callback route at `/auth/callback` to handle the token exchange

