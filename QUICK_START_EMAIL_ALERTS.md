# 🚀 Quick Start: Email Alert Button

## What You Asked For
You wanted to create a button that **sends email alerts** separate from the registration alert message.

## What You Got
✅ **"📧 Send Email Alert" button** in the AlertsPanel component

## 3 Steps to Use It

### Step 1: Open AlertsPanel
- Navigate to the Alerts section in your dashboard

### Step 2: Click "📧 Send Email Alert" Button
- You'll see a blue button next to the "Create New Alert" button
- Click it to open the email form

### Step 3: Fill & Send
```
Email Address: recipient@example.com
Region: Your Region Name
Risk Level: HIGH 🔴 or MEDIUM 🟡
↓
Click: "📤 Send Email Alert"
```

## That's It! ✨

You'll get a success message, and the email will be sent.

---

## Where to Find Each Feature

### 📧 Send Email Alert (NEW)
- **Button**: Blue "📧 Send Email Alert" button
- **Purpose**: Send immediate manual alert email
- **When to use**: Testing, urgent notifications, stakeholder updates
- **Email is sent**: Immediately when you click send

### ➕ Create New Alert (EXISTING)
- **Button**: Green "+ Create New Alert" button  
- **Purpose**: Set up continuous monitoring
- **When to use**: Automatic monitoring of regions
- **Alerts are sent**: Every 6 hours if threshold exceeded

---

## Technical Details

**Frontend**: `frontend/src/components/AlertsPanel.jsx`
- Added state for email form
- Added `handleSendEmailAlert()` function
- Added email form UI

**Backend**: Already has these endpoints ready:
- `POST /api/email-alerts/send-high-risk`
- `POST /api/email-alerts/send-medium-risk`

**Email Setup**: Configure `.env`:
```
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

See `EMAIL_ALERT_GUIDE.md` for detailed Gmail setup instructions.

---

## Common Questions

**Q: Why two different buttons?**
A: 
- "Send Email Alert" = Manual, immediate, for testing
- "Create Alert" = Automatic, continuous, for monitoring

**Q: Which one should I use?**
A:
- Use **"Send Email Alert"** if you want to send RIGHT NOW
- Use **"Create Alert"** if you want automatic monitoring

**Q: Will the email be registered in database?**
A:
- "Send Email Alert" = NO, one-time only
- "Create Alert" = YES, saved for continuous monitoring

**Q: What if email doesn't send?**
A: Check `.env` has EMAIL_USER and EMAIL_PASSWORD configured. See `EMAIL_ALERT_GUIDE.md` for troubleshooting.

---

## Files Modified
- ✅ `frontend/src/components/AlertsPanel.jsx`

## Files Created
- 📄 `EMAIL_ALERT_GUIDE.md` - Detailed usage guide
- 📄 `EMAIL_ALERT_IMPLEMENTATION.md` - Implementation details
- 📄 `QUICK_START.md` - This file!
