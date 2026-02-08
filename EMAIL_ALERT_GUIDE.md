# Email Alert Feature Guide

## Overview
You now have TWO ways to send alerts:

### 1. **Create Automatic Alerts** (Continuous Monitoring)
- Sets up **automatic monitoring** for a region
- System checks every **6 hours** for vegetation changes
- Triggers email when **threshold is exceeded**
- **Location**: "Create New Alert" button in AlertsPanel

**Steps:**
1. Click "**+ Create New Alert**" button
2. Enter Region Name
3. Select Alert Type (Threshold Exceeded, Vegetation Loss, Unusual Change)
4. Set Threshold % (e.g., 15%)
5. Choose Notification Type:
   - **In-App**: Browser notification only
   - **Email**: Send email alerts
   - **SMS**: Send SMS (if configured)
   - **All**: All notification methods
6. Click "✅ Create Alert"

---

### 2. **Send Manual Email Alerts** (Send Now)
- Sends an **immediate email alert** to any address
- Useful for **testing** email configuration
- Useful for **notifying stakeholders** about current risks
- **Location**: "📧 Send Email Alert" button in AlertsPanel

**Steps:**
1. Click "**📧 Send Email Alert**" button
2. Enter **Email Address** (recipient)
3. Enter **Region Name** (what region the alert is for)
4. Select **Risk Level**:
   - 🔴 **HIGH**: Urgent, high vegetation loss detected
   - 🟡 **MEDIUM**: Moderate concern
5. Click "📤 Send Email Alert"

---

## Email Alert Endpoints (Backend)

If you need to send alerts programmatically:

### Send HIGH Risk Alert
```bash
POST /api/email-alerts/send-high-risk
Content-Type: application/json

{
  "email": "user@example.com",
  "region": "Region Name",
  "analysisData": {
    "vegetationLoss": 25.5,
    "confidence": 0.92,
    "riskLevel": "HIGH"
  }
}
```

### Send MEDIUM Risk Alert
```bash
POST /api/email-alerts/send-medium-risk
Content-Type: application/json

{
  "email": "user@example.com",
  "region": "Region Name",
  "analysisData": {
    "vegetationLoss": 15.0,
    "confidence": 0.85,
    "riskLevel": "MEDIUM"
  }
}
```

### Register Email (Creates automatic alert)
```bash
POST /api/alerts/register-email
Content-Type: application/json

{
  "email": "user@example.com",
  "region": "Region Name",
  "threshold": "HIGH"
}
```

---

## Important Notes

⚠️ **Email Configuration Required**
- Email sending requires `.env` variables:
  ```
  EMAIL_USER=your-email@gmail.com
  EMAIL_PASSWORD=your-16-char-app-password
  ```

✅ **Email Setup Instructions**
1. Go to: https://myaccount.google.com/apppasswords
2. Select App: **Mail**
3. Select Device: **Windows Computer**
4. Copy the **16-character password**
5. Add to `.env` file as `EMAIL_PASSWORD`

📧 **Email Content**
- Emails contain:
  - Region name and status
  - Vegetation loss percentage
  - Confidence level
  - Risk assessment
  - Timestamp

---

## Troubleshooting

**Problem**: "Email service disabled - alert registered locally only"
- **Solution**: Configure `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`

**Problem**: "Email sending failed"
- **Solution**: Check Gmail app password is correct (not regular password)
- Make sure 2-Factor Authentication is enabled
- Check EMAIL_USER is correct

**Problem**: Email not received
- **Solution**: Check spam/junk folder
- Verify email address is correct
- Check browser console for error messages

---

## Use Cases

✅ **Use "Create Alert"** when you want:
- Continuous monitoring of a region
- Automatic alerts every 6 hours
- Multiple stakeholders to receive alerts

✅ **Use "Send Email Alert"** when you want:
- Test email configuration
- Send immediate alert to stakeholders
- Notify about current risk status
- Test email functionality before deployment
