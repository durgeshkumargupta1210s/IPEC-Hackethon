const express = require('express');
const router = express.Router();
const { sendHighRiskAlert, sendMediumRiskAlert, sendVerificationEmail } = require('../../services/emailService');

/**
 * POST /api/alerts/register-email
 * Register email for alerts (email sending is optional)
 */
router.post('/register-email', async (req, res, next) => {
  try {
    const { email, region, threshold } = req.body;

    if (!email || !region) {
      return res.status(400).json({
        success: false,
        message: 'Email and region are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    // Register alert and send verification email
    console.log(`✅ Alert registered: ${email} for ${region} (${threshold})`);

    // Send verification email
    let emailSent = false;
    try {
      console.log('📧 Attempting to send verification email...');
      const result = await sendVerificationEmail(email, region, threshold || 'HIGH');
      console.log('✅ Verification email sent successfully:', result.messageId);
      emailSent = true;
    } catch (emailError) {
      console.error('⚠️ Email error:', emailError.message);
      // Don't fail the registration if email fails
    }

    res.json({
      success: true,
      message: emailSent ? '✅ Alert registered successfully! Check your email for confirmation.' : '✅ Alert registered successfully! (Email notification skipped)',
      data: {
        email,
        region,
        threshold: threshold || 'HIGH',
        createdAt: new Date(),
        emailSent,
      },
    });
  } catch (error) {
    console.error('Error registering email alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register alert',
      error: error.message,
    });
  }
});

/**
 * POST /api/alerts/send-high-risk
 * Trigger HIGH RISK alert email
 * Called when analysis detects HIGH risk
 */
router.post('/send-high-risk', async (req, res, next) => {
  try {
    const { email, region, analysisData } = req.body;

    if (!email || !region) {
      return res.status(400).json({
        success: false,
        message: 'Email and region are required',
      });
    }

    // Send the alert email
    await sendHighRiskAlert(email, region, analysisData);

    res.json({
      success: true,
      message: 'High risk alert sent successfully',
      data: {
        email,
        region,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Error sending high risk alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send alert email',
      error: error.message,
    });
  }
});

/**
 * POST /api/alerts/send-medium-risk
 * Trigger MEDIUM RISK alert email
 */
router.post('/send-medium-risk', async (req, res, next) => {
  try {
    const { email, region, analysisData } = req.body;

    if (!email || !region) {
      return res.status(400).json({
        success: false,
        message: 'Email and region are required',
      });
    }

    // Send the alert email
    await sendMediumRiskAlert(email, region, analysisData);

    res.json({
      success: true,
      message: 'Medium risk alert sent successfully',
      data: {
        email,
        region,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Error sending medium risk alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send alert email',
      error: error.message,
    });
  }
});

/**
 * GET /api/alerts/test-email
 * Test endpoint - send test email
 */
router.get('/test-email/:email', async (req, res, next) => {
  try {
    const { email } = req.params;

    await sendVerificationEmail(email, 'Test Area', 'HIGH');

    res.json({
      success: true,
      message: 'Test email sent successfully',
      email,
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message,
    });
  }
});

module.exports = router;
