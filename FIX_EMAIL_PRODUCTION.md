# 🔧 Fix: Email Registration Only Works Locally

## Problem
**Emails are only being sent locally because environment variables are NOT configured.**

The system defaults to **local-only mode** when `EMAIL_USER` and `EMAIL_PASSWORD` are missing from `.env` file.

---

## Root Cause

Look at [backend/src/services/emailService.js](backend/src/services/emailService.js#L4-L8):

```javascript
const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD;

// Check if email credentials are configured
const emailConfigured = emailUser && emailPassword;
```

And at line 457:
```javascript
if (!emailConfigured || !transporter) {
  console.log('⚠️  Email service not configured - local-only mode');
  return { skipped: true, message: 'Email service disabled', success: false };
}
```

**When these variables are missing → emails skip sending → only local registration.**

---

## Solution: Configure Gmail SMTP

### Step 1: Set Up Gmail App Password

1. **Enable 2-Factor Authentication** on your Gmail account
   - Go to: https://myaccount.google.com
   - Select "Security" in left menu
   - Scroll to "2-Step Verification" → Enable it

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select: **App: Mail** → **Device: Windows Computer**
   - Click **Generate**
   - Copy the 16-character password

### Step 2: Create `.env` File in Backend

Create file: `backend/.env`

```env
# Email Configuration (Gmail SMTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx

# Optional - Frontend URL for email links
FRONTEND_URL=http://localhost:5173
```

**Replace:**
- `your-email@gmail.com` → Your actual Gmail address
- `xxxx xxxx xxxx xxxx` → The 16-character app password (paste exactly as shown, with spaces)

### Step 3: Restart Backend Server

```bash
cd backend
npm start
```

**You should see:**
```
✅ EMAIL SERVICE VERIFIED SUCCESSFULLY!
   Connected as: your-email@gmail.com
   Ready to send emails
```

---

## Test Email Sending

### Option 1: Use Frontend
1. Click **"Email Alerts"** button in dashboard
2. Enter test email and region
3. Click **"Register Alert"**
4. Check email inbox for verification email

### Option 2: Test API Endpoint
```bash
# Windows PowerShell
curl -Uri "http://localhost:5000/api/alerts/test-email/your-test-email@example.com" `
  -Method POST `
  -ContentType "application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Test email sent successfully!"
}
```

---

## ✅ What Now Works

Once configured:

✅ **User Registration** → Verification email sent  
✅ **High Risk Alerts** → Alert email sent automatically  
✅ **Medium Risk Alerts** → Alert email sent automatically  
✅ **Test Emails** → Can test via API endpoint  
✅ **Email Management** → Users can view/delete alerts  

---

## Troubleshooting

### "Invalid login" Error
- ❌ Wrong: Using regular Gmail password
- ✅ Correct: Use 16-character **App Password** (not Gmail password)
- Fix: Regenerate app password from https://myaccount.google.com/apppasswords

### "Connection timeout"
- Check internet connection
- Verify Gmail SMTP is accessible (firewall/VPN issue)
- Try a different port (add to .env):
  ```env
  EMAIL_PORT=587
  ```

### "Email service disabled" Message
- .env file is missing or EMAIL_USER/EMAIL_PASSWORD not set
- Backend wasn't restarted after creating .env
- Verify file is in: `backend/.env` (not in frontend or root)

### Email Received But Links Don't Work
- Add to `.env`:
  ```env
  FRONTEND_URL=http://localhost:5173
  ```
  Or for production:
  ```env
  FRONTEND_URL=https://your-production-domain.com
  ```

---

## For Production Deployment (Vercel/Railway)

### Vercel
1. Go to project dashboard
2. **Settings** → **Environment Variables**
3. Add:
   ```
   EMAIL_USER = your-email@gmail.com
   EMAIL_PASSWORD = xxxx xxxx xxxx xxxx
   FRONTEND_URL = https://your-domain.vercel.app
   ```

### Railway/Other Hosting
1. Set environment variables via platform dashboard
2. Redeploy application
3. Verify by checking logs for "✅ EMAIL SERVICE VERIFIED"

---

## Using Alternative Email Providers

### Outlook
```env
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

### SendGrid (Recommended for Production)
```bash
npm install @sendgrid/mail
```

Update `backend/src/services/emailService.js` to use SendGrid instead of nodemailer.

---

## Checklist

- [ ] Gmail 2-Factor Authentication enabled
- [ ] App Password generated from myaccount.google.com/apppasswords
- [ ] `.env` file created in `backend/` folder
- [ ] `EMAIL_USER` set to your Gmail address
- [ ] `EMAIL_PASSWORD` set to 16-character app password
- [ ] Backend restarted (`npm start`)
- [ ] Console shows "✅ EMAIL SERVICE VERIFIED SUCCESSFULLY!"
- [ ] Test email sent successfully
- [ ] Registration email received in inbox

---

**Once complete, emails will work for both local development AND production!** 🎉
