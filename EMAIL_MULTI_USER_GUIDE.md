# 📧 Multi-Email Alert System - Quick Guide

## Overview
The email service now fully supports sending alerts to **multiple email recipients** independently. Each email is sent individually with proper error handling.

## New Features

### 1. **Individual Email Registration**
Register alerts for different email addresses:
- **Endpoint**: `POST /api/email-alerts/register-email`
- **Body**:
```json
{
  "email": "user1@gmail.com",
  "region": "Amazon Forest",
  "threshold": 15
}
```
- **Response**: Registration succeeds whether or not email is sent
- **Status**: ✅ Each email is independent

### 2. **Bulk High Risk Alerts**
Send HIGH RISK alerts to multiple recipients:
- **Endpoint**: `POST /api/email-alerts/send-bulk-high-risk`
- **Body**:
```json
{
  "emails": [
    "user1@gmail.com",
    "user2@yahoo.com",
    "manager@company.com"
  ],
  "region": "Amazon Forest",
  "analysisData": {
    "vegetationLoss": 45.2,
    "confidence": 0.92
  }
}
```
- **Response**: Shows how many emails succeeded, failed, or were skipped
- **Status**: ✅ Handles individual failures without blocking others

### 3. **Bulk Medium Risk Alerts**
Send MEDIUM RISK alerts to multiple recipients:
- **Endpoint**: `POST /api/email-alerts/send-bulk-medium-risk`
- **Body**: Same format as high-risk alerts
- **Status**: ✅ Identical multi-email support

### 4. **Test Email Service**
Test if email is working for a specific address:
- **Endpoint**: `GET /api/email-alerts/test-email/:email`
- **Example**: `http://localhost:5000/api/email-alerts/test-email/user@gmail.com`
- **Response**: Shows configuration status and success/failure details
- **Status**: ✅ Enhanced diagnostics

## Architecture Changes

### Email Service (`emailService.js`)
**New Function**: `sendBulkAlerts(emails, region, analysisData, alertType)`
- Accepts array of email addresses
- Sends to each recipient individually
- Catches errors per recipient (one failure doesn't block others)
- Returns summary with success/failed/skipped counts

```javascript
const results = await sendBulkAlerts(
  ["email1@example.com", "email2@example.com"],
  "Forest Region",
  analysisData,
  "HIGH"
);

// Results structure:
// {
//   success: [{ email, messageId, timestamp }, ...],
//   failed: [{ email, error, timestamp }, ...],
//   skipped: ["email@example.com", ...]
// }
```

### Email Routes (`emailAlerts.js`)
**New Endpoints**:
- `POST /api/email-alerts/send-bulk-high-risk` - Multi-recipient high risk alerts
- `POST /api/email-alerts/send-bulk-medium-risk` - Multi-recipient medium risk alerts

**Improved Existing Endpoints**:
- `POST /api/email-alerts/register-email` - Per-user registration (independent)
- `GET /api/email-alerts/test-email/:email` - Enhanced diagnostics

## Key Improvements

| Feature | Before | After |
|---------|--------|-------|
| **Multiple Emails** | Only 1 recipient per alert | ✅ Unlimited recipients |
| **Duplicate Routes** | Had conflicting /test-email handlers | ✅ Single, clean handler |
| **Email Failures** | Could block entire operation | ✅ Individual error handling |
| **Error Tracking** | Limited diagnostics | ✅ Per-email error details |
| **Bulk Operations** | Not supported | ✅ Dedicated bulk endpoints |
| **Logging** | Basic | ✅ Detailed summary reporting |

## Usage Examples

### Example 1: Register Multiple Users
```bash
# User 1
curl -X POST http://localhost:5000/api/email-alerts/register-email \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","region":"Amazon","threshold":15}'

# User 2
curl -X POST http://localhost:5000/api/email-alerts/register-email \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@example.com","region":"Amazon","threshold":15}'

# User 3 (different region)
curl -X POST http://localhost:5000/api/email-alerts/register-email \
  -H "Content-Type: application/json" \
  -d '{"email":"charlie@example.com","region":"Congo","threshold":20}'
```

### Example 2: Send Alert to All Users
```bash
curl -X POST http://localhost:5000/api/email-alerts/send-bulk-high-risk \
  -H "Content-Type: application/json" \
  -d '{
    "emails": ["alice@example.com", "bob@example.com"],
    "region": "Amazon",
    "analysisData": {
      "vegetationLoss": 45.2,
      "confidence": 0.92
    }
  }'
```

### Example 3: Test Email Configuration
```bash
# Test if email works
curl http://localhost:5000/api/email-alerts/test-email/test@example.com

# Response shows:
# - Email configuration status
# - Success/failure details
# - Troubleshooting hints if needed
```

## Error Handling

The system now handles errors gracefully:

1. **Registration Email Fails**: Alert still registered ✅
   - User sees: "Alert registered (Email notification unavailable)"
   - System logs the error for debugging

2. **One Bulk Email Fails**: Others still sent ✅
   - Response shows: "Sent: 2, Failed: 1"
   - Details include which email failed and why

3. **Configuration Missing**: Graceful degradation ✅
   - Alerts still work locally
   - Test endpoint shows clear configuration hints
   - System doesn't crash

## Configuration

Ensure these are set in `.env`:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**Getting Gmail App Password**:
1. Go to https://myaccount.google.com/apppasswords
2. Select: App = Mail, Device = Windows Computer
3. Copy the 16-character password
4. Paste in `.env` as EMAIL_PASSWORD

## Testing Checklist

- [ ] Register email1: `http://localhost:5000/api/email-alerts/register-email`
- [ ] Register email2: `http://localhost:5000/api/email-alerts/register-email`
- [ ] Test email1: `http://localhost:5000/api/email-alerts/test-email/email1@example.com`
- [ ] Test email2: `http://localhost:5000/api/email-alerts/test-email/email2@example.com`
- [ ] Send bulk HIGH alert: `POST /api/email-alerts/send-bulk-high-risk`
- [ ] Send bulk MEDIUM alert: `POST /api/email-alerts/send-bulk-medium-risk`
- [ ] Check backend logs for delivery status
- [ ] Verify both emails received alerts independently

## Troubleshooting

### "Email service disabled" message
- Check `.env` has EMAIL_USER and EMAIL_PASSWORD
- Restart backend after updating .env
- Use test endpoint to verify configuration

### "Invalid login" error
- Gmail password must be App Password, not your regular password
- Get it from: https://myaccount.google.com/apppasswords
- Make sure 2-Factor Authentication is enabled on your Google Account

### Some emails fail, others succeed
- This is expected! Check the response details
- Individual failures don't block the entire operation
- Backend logs show detailed error for each failed email

### Gmail SMTP connection timeout
- Check internet connection
- Verify Gmail SMTP is accessible (try telnet smtp.gmail.com 587)
- Check firewall/antivirus isn't blocking Gmail SMTP

## Performance Considerations

- **Bulk sending**: Sends emails sequentially (not parallel)
- **Timeout**: Each email has ~5 second timeout
- **Rate limiting**: Gmail may rate-limit if sending many in bulk
- **Recommendation**: For large lists, consider spacing out sends

## Future Enhancements

- [ ] Parallel email sending for better performance
- [ ] Database persistence of registered emails
- [ ] Scheduled digest emails (hourly/daily summaries)
- [ ] Email preferences (alert level thresholds per user)
- [ ] Unsubscribe/manage subscriptions endpoint
- [ ] Email delivery webhooks for real-time status

