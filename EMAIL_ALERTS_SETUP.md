# 📧 Email Alerts Setup Guide

## Overview

Your satellite monitoring system now has automatic email alert functionality! When an area is detected as HIGH RISK, an email notification is automatically sent to registered email addresses.

## ✅ Features Implemented

1. **Email Alert Registration** 
   - Users can register their email + area to monitor
   - Choose alert thresholds: HIGH, MEDIUM, or ALL risks
   - Verification emails sent on registration

2. **Automatic Alert Emails**
   - HIGH RISK alerts with detailed analysis
   - MEDIUM RISK alerts for monitoring
   - Professional HTML email templates
   - Includes vegetation loss %, confidence score, trend data

3. **Email Management**
   - View all registered alerts
   - Delete alerts anytime
   - Multiple alerts per user

## 🔧 Backend Setup

### Step 1: Install Dependencies

```bash
cd backend
npm install nodemailer
```

### Step 2: Configure Email Service

Create a `.env` file in the backend root directory:

```env
# Email Configuration (Gmail Example)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=your-email@gmail.com

# Frontend URL for email links
FRONTEND_URL=http://localhost:5173

# Or use any SMTP service
# EMAIL_SERVICE=sendgrid
# EMAIL_API_KEY=your-api-key
```

### Gmail App Password Setup

1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click **Security** (left sidebar)
3. Enable **2-Step Verification** (if not enabled)
4. Go to **App passwords**
5. Select **Mail** and **Windows Computer**
6. Copy the generated 16-character password
7. Use this in `EMAIL_PASSWORD` in your `.env` file

**Example:**
```env
EMAIL_USER=myproject@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

### Step 3: Verify Backend Routes

Check that these endpoints exist:

```
POST /api/alerts/register-email      # Register for alerts
POST /api/alerts/send-high-risk      # Trigger HIGH risk email
POST /api/alerts/send-medium-risk    # Trigger MEDIUM risk email
GET  /api/alerts/test-email/:email   # Send test email
```

## 🎨 Frontend Integration

### The Email Alert Button

A floating button appears in the bottom-right corner of the dashboard:

- **Click it** to open the email alert registration modal
- Shows count of active alerts
- Modern emerald green styling

### User Flow

1. User clicks "Email Alerts" button
2. Enters email + area name + risk threshold
3. System sends verification email
4. Alert is registered and appears in the list
5. When area reaches selected risk level → automatic email sent

## 📧 Testing

### Test Email Endpoint

Send a test email to verify your configuration:

```bash
curl http://localhost:5000/api/alerts/test-email/your-email@example.com
```

### Manual Testing

1. Click "Email Alerts" button
2. Enter test email address
3. Enter region name (e.g., "Test Area")
4. Click "Register Alert"
5. Check your email inbox for verification email

## 🚀 Integration with Analysis

When analysis runs and detects HIGH RISK, trigger email:

```javascript
// In your analysis endpoint (example)
if (riskLevel === 'HIGH') {
  // Send email to all registered users for this region
  await api.post('/api/alerts/send-high-risk', {
    email: userEmail,
    region: regionName,
    analysisData: {
      vegetationLoss: result.vegetationLoss,
      confidence: result.confidence,
      trend: result.trend
    }
  });
}
```

## 📋 Email Templates

### HIGH RISK Alert Email
- Red header with alert icon
- Vegetation loss percentage
- Confidence score
- Risk classification
- Trend data
- Link to full analysis

### MEDIUM RISK Alert Email
- Orange header for caution
- Similar data structure
- Friendly monitoring message

### Verification Email
- Confirmation of registration
- Alert settings summary
- What to expect next
- Dashboard link

## 🔐 Security Notes

1. **Never commit credentials** - Use `.env` files only
2. **App Passwords** - Use Gmail app passwords, not your main password
3. **Rate Limiting** - Consider adding email rate limits in production
4. **Verification** - Confirm email ownership before sending alerts

## 🐛 Troubleshooting

### "Failed to send email" error

**Check 1: Gmail App Password**
- Is it a 16-character password with spaces?
- Did you enable 2-Step Verification first?

**Check 2: Environment Variables**
```bash
# In backend, verify:
echo $EMAIL_USER
echo $EMAIL_PASSWORD
```

**Check 3: Less Secure Apps** (if not using app password)
- Gmail → Security → Less secure apps → ON

**Check 4: Email Service Status**
```bash
curl http://localhost:5000/api/alerts/test-email/test@example.com
```

### Emails not appearing in inbox

1. Check SPAM/Promotions folder
2. Verify sender email matches `EMAIL_USER`
3. Check email logs: `console.log()` statements in emailService.js
4. Verify SMTP credentials are correct

## 📊 Database Storage (Optional)

To persist alerts in MongoDB, update the code:

```javascript
// Create AlertSubscription model
const alertSchema = new Schema({
  email: String,
  region: String,
  threshold: String,
  createdAt: { type: Date, default: Date.now }
});

// Save to DB instead of localStorage
```

## 🎯 Next Steps

1. ✅ Set up `.env` file with email credentials
2. ✅ Test email sending with test endpoint
3. ✅ Click "Email Alerts" button on dashboard
4. ✅ Register a test alert
5. ✅ Verify confirmation email arrives
6. ✅ Integrate email triggers with analysis results

## 📞 API Reference

### POST /api/alerts/register-email

Register user email for alerts

**Request:**
```json
{
  "email": "user@example.com",
  "region": "Odzala-Kokoua, Congo",
  "threshold": "HIGH"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Alert registered successfully!",
  "data": {
    "email": "user@example.com",
    "region": "Odzala-Kokoua, Congo",
    "threshold": "HIGH",
    "createdAt": "2026-02-08T10:30:00Z"
  }
}
```

### POST /api/alerts/send-high-risk

Manually trigger high risk alert email

**Request:**
```json
{
  "email": "user@example.com",
  "region": "Odzala-Kokoua, Congo",
  "analysisData": {
    "vegetationLoss": 52.8,
    "confidence": 89,
    "trend": "increasing"
  }
}
```

---

**Need help?** Check the console logs in both frontend and backend for detailed error messages.
