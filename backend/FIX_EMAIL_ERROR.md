# 🔧 Fix Email Alert Error - 500 Internal Server Error

## Problem
You're getting a **500 error** when trying to register email alerts: `Failed to register alert`

## Root Cause
The backend email service is not configured with your Gmail credentials.

---

## ✅ Solution - Quick Setup (5 minutes)

### Step 1: Create a `.env` file in the backend folder

Go to: `backend/` directory and create a file named `.env`:

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
FRONTEND_URL=http://localhost:5173
```

### Step 2: Get Gmail App Password

**If using Gmail:**

1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Click **Security** in left sidebar
3. Enable **2-Step Verification** (if not already enabled)
4. Go to **App passwords**
5. Select: **Mail** → **Windows Computer** (or your device)
6. Google will show a **16-character password** (with spaces)
7. Copy it exactly (e.g., `abcd efgh ijkl mnop`)

### Step 3: Update your `.env` file

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
FRONTEND_URL=http://localhost:5173
```

### Step 4: Restart Backend Server

```bash
cd backend
npm start
```

You should now see in the console:
```
✅ Email service ready! Connected as: your-email@gmail.com
```

---

## ❓ Testing

### Test with cURL

```bash
# Send a test email to verify it works
curl -X GET http://localhost:5000/api/alerts/test-email/your-test@email.com
```

You should see:
- ✅ Email sent successfully
- Email arrives in your test inbox within 30 seconds

### Test in the App

1. Click **"Email Alerts"** button
2. Fill in form:
   - Email: `your@email.com`
   - Area: `Odzala-Kokoua, Congo`
   - Threshold: `HIGH`
3. Click **"Register Alert"**
4. Check your email for confirmation

---

## 🚨 Troubleshooting

### Error: "Email service not configured"
- **Cause:** `.env` file not created or missing EMAIL_USER/EMAIL_PASSWORD
- **Fix:** Create `.env` file with valid credentials

### Error: "Authentication failed"
- **Cause:** Wrong app password
- **Fix:** 
  1. Double-check you're using **app password**, not your Gmail password
  2. Include the spaces in the password (e.g., `abcd efgh ijkl mnop`)
  3. Regenerate app password and try again

### Email not arriving in inbox
- **Cause:** Sent to SPAM folder
- **Fix:** Check SPAM/Promotions folder
- If missing, check sender email matches EMAIL_USER

### "SMTP Error: Invalid credentials"
- **Cause:** EMAIL_PASSWORD is wrong or 2FA not enabled
- **Fix:**
  1. Verify you enabled 2-Step Verification
  2. Use app-specific password (not your main password)
  3. Regenerate app password

---

## ✨ Once Fixed

After `.env` is configured and backend restarted:

✅ Users can register email alerts  
✅ Verification emails are sent automatically  
✅ HIGH RISK alerts trigger email notifications  
✅ All alerts appear in the dashboard  

---

## 📝 Using Other Email Providers

If you want to use **Outlook, SendGrid, or other services** instead of Gmail:

**For Outlook:**
```
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

**For SendGrid (recommended for production):**
```bash
npm install @sendgrid/mail
```

Then update emailService.js to use SendGrid instead of nodemailer Gmail.

---

**Still having issues?** Check the backend console logs for the exact error message!
