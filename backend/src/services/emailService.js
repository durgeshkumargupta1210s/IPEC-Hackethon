const nodemailer = require('nodemailer');

// Email configuration - using Gmail or any SMTP service
const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD;

// Check if email credentials are configured
const emailConfigured = emailUser && emailPassword;

if (!emailConfigured) {
  console.log('📧 Email alerts DISABLED - no credentials configured');
  console.log('   (Users can still register alerts locally)');
}

// Only create transporter if credentials are provided
let transporter = null;

if (emailConfigured) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });

  // Test the email configuration on startup
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Email service verification failed:', error.message);
    } else {
      console.log('✅ Email service ready! Connected as:', emailUser);
    }
  });
}

/**
 * Send HIGH RISK alert email
 */
async function sendHighRiskAlert(email, region, analysisData) {
  try {
    const scanDate = new Date().toLocaleString();
    const riskScore = (analysisData?.vegetationLoss || 0).toFixed(1);
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f7fa; margin: 0; padding: 20px; }
            .container { max-width: 650px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
            .header-subtitle { font-size: 14px; opacity: 0.95; margin-top: 8px; }
            .content { padding: 30px; line-height: 1.6; color: #333; }
            .greeting { font-size: 16px; margin-bottom: 20px; }
            .section-title { color: #1f2937; font-size: 16px; font-weight: 600; margin-top: 25px; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #dc2626; }
            .details-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px 20px; margin: 15px 0; border-radius: 4px; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px; }
            .detail-label { font-weight: 600; color: #374151; }
            .detail-value { color: #dc2626; font-weight: 500; }
            .analysis-text { margin: 15px 0; text-align: justify; color: #555; }
            .action-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px 20px; margin: 20px 0; border-radius: 4px; }
            .cta-button { display: inline-block; background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: 600; margin-top: 10px; font-size: 14px; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
            .divider { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }
            em { color: #059669; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 HIGH RISK ALERT</h1>
              <p class="header-subtitle">Critical vegetation change detected</p>
            </div>
            
            <div class="content">
              <p class="greeting">Dear User,</p>
              
              <p>We hope this message finds you well.</p>
              
              <p>ForestGuard's satellite monitoring system has detected a <strong>vegetation health change</strong> in one of your monitored forest regions. Please review the details below:</p>

              <hr class="divider">

              <h2 style="color: #1f2937; font-size: 16px; margin-top: 0;">🌍 Monitoring Details</h2>
              
              <div class="details-box">
                <div class="detail-row">
                  <span class="detail-label">Region Name:</span>
                  <span class="detail-value">${region}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Scan Date & Time:</span>
                  <span class="detail-value">${scanDate}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Risk Level:</span>
                  <span class="detail-value">🔴 HIGH</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Vegetation Loss Index:</span>
                  <span class="detail-value">${riskScore}%</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Confidence Score:</span>
                  <span class="detail-value">${(analysisData?.confidence || 85).toFixed(0)}%</span>
                </div>
              </div>

              <hr class="divider">

              <h2 style="color: #1f2937; font-size: 16px;">🌿 Vegetation Analysis Summary</h2>
              
              <p class="analysis-text">Our analysis based on satellite imagery and NDVI (Normalized Difference Vegetation Index) indicates signs of <strong>vegetation degradation</strong> within the monitored area. The detected change suggests potential forest stress or vegetation loss that may require attention.</p>
              
              <p class="analysis-text"><em>Early monitoring allows faster intervention and helps prevent irreversible environmental damage.</em></p>

              <hr class="divider">

              <h2 style="color: #1f2937; font-size: 16px;">⚠️ Recommended Action</h2>
              
              <p>We strongly encourage reviewing this region at the earliest opportunity. Timely response can significantly reduce environmental impact and help preserve biodiversity.</p>
              
              <div class="action-box">
                <strong>Every early action contributes to preventing deforestation and protecting our forests for future generations.</strong>
              </div>

              <p style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="cta-button">📊 View Detailed Analysis</a>
              </p>

              <p style="margin-top: 20px; color: #6b7280; font-size: 13px;">
                If you require historical comparison data or advanced analytics, please access your ForestGuard dashboard.
              </p>
            </div>

            <div class="footer">
              <p style="margin: 0; padding-bottom: 10px;"><strong>ForestGuard Monitoring System</strong></p>
              <p style="margin: 0; padding-bottom: 10px;">📡 Real-Time Forest Intelligence</p>
              <p style="margin: 0; padding-bottom: 10px;">Contact: ${emailUser || 'support@forestguard.com'}</p>
              <p style="margin: 10px 0 0 0; font-size: 11px; color: #9ca3af;"><em>This is an automated alert generated by ForestGuard's satellite monitoring system.</em></p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: emailUser || 'ForestGuard <alerts@forestguard.com>',
      to: email,
      subject: `🚨 HIGH RISK ALERT: ${region} - Immediate Attention Required`,
      html: htmlContent,
    };

    // Check if email is configured before sending
    if (!emailConfigured || !transporter) {
      console.log('⚠️  Email not configured - skipping email send');
      return { skipped: true, message: 'Email service disabled' };
    }

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ High risk alert sent to ${email}:`, result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Failed to send high risk alert:', error.message);
    throw error;
  }
}

/**
 * Send medium risk alert email
 */
async function sendMediumRiskAlert(email, region, analysisData) {
  try {
    const scanDate = new Date().toLocaleString();
    const riskScore = (analysisData?.vegetationLoss || 0).toFixed(1);
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f7fa; margin: 0; padding: 20px; }
            .container { max-width: 650px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
            .header-subtitle { font-size: 14px; opacity: 0.95; margin-top: 8px; }
            .content { padding: 30px; line-height: 1.6; color: #333; }
            .greeting { font-size: 16px; margin-bottom: 20px; }
            .section-title { color: #1f2937; font-size: 16px; font-weight: 600; margin-top: 25px; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #f59e0b; }
            .details-box { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px 20px; margin: 15px 0; border-radius: 4px; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px; }
            .detail-label { font-weight: 600; color: #374151; }
            .detail-value { color: #d97706; font-weight: 500; }
            .analysis-text { margin: 15px 0; text-align: justify; color: #555; }
            .action-box { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px 20px; margin: 20px 0; border-radius: 4px; }
            .cta-button { display: inline-block; background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: 600; margin-top: 10px; font-size: 14px; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
            .divider { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }
            em { color: #059669; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ MEDIUM RISK ALERT</h1>
              <p class="header-subtitle">Vegetation monitoring notice</p>
            </div>
            
            <div class="content">
              <p class="greeting">Dear User,</p>
              
              <p>We hope this message finds you well.</p>
              
              <p>ForestGuard's satellite monitoring system has detected a <strong>vegetation health change</strong> in one of your monitored forest regions. Please review the details below:</p>

              <hr class="divider">

              <h2 style="color: #1f2937; font-size: 16px; margin-top: 0;">🌍 Monitoring Details</h2>
              
              <div class="details-box">
                <div class="detail-row">
                  <span class="detail-label">Region Name:</span>
                  <span class="detail-value">${region}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Scan Date & Time:</span>
                  <span class="detail-value">${scanDate}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Risk Level:</span>
                  <span class="detail-value">🟠 MEDIUM</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Vegetation Loss Index:</span>
                  <span class="detail-value">${riskScore}%</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Confidence Score:</span>
                  <span class="detail-value">${(analysisData?.confidence || 85).toFixed(0)}%</span>
                </div>
              </div>

              <hr class="divider">

              <h2 style="color: #1f2937; font-size: 16px;">🌿 Vegetation Analysis Summary</h2>
              
              <p class="analysis-text">Our analysis based on satellite imagery and NDVI (Normalized Difference Vegetation Index) indicates signs of <strong>vegetation degradation</strong> within the monitored area. The detected change suggests potential forest stress or vegetation loss that may require attention.</p>
              
              <p class="analysis-text"><em>Early monitoring allows faster intervention and helps prevent irreversible environmental damage.</em></p>

              <hr class="divider">

              <h2 style="color: #1f2937; font-size: 16px;">⚠️ Recommended Action</h2>
              
              <p>We encourage reviewing this region periodically. Continuous monitoring enables timely intervention and helps preserve biodiversity.</p>
              
              <div class="action-box">
                <strong>Every early action contributes to preventing deforestation and protecting our forests for future generations.</strong>
              </div>

              <p style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="cta-button">📊 View Detailed Analysis</a>
              </p>

              <p style="margin-top: 20px; color: #6b7280; font-size: 13px;">
                If you require historical comparison data or advanced analytics, please access your ForestGuard dashboard.
              </p>
            </div>

            <div class="footer">
              <p style="margin: 0; padding-bottom: 10px;"><strong>ForestGuard Monitoring System</strong></p>
              <p style="margin: 0; padding-bottom: 10px;">📡 Real-Time Forest Intelligence</p>
              <p style="margin: 0; padding-bottom: 10px;">Contact: ${emailUser || 'support@forestguard.com'}</p>
              <p style="margin: 10px 0 0 0; font-size: 11px; color: #9ca3af;"><em>This is an automated alert generated by ForestGuard's satellite monitoring system.</em></p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: emailUser || 'ForestGuard <alerts@forestguard.com>',
      to: email,
      subject: `⚠️ MEDIUM RISK ALERT: ${region} - Review Recommended`,
      html: htmlContent,
    };

    if (!emailConfigured || !transporter) {
      console.log('⚠️  Email not configured - skipping email send');
      return { skipped: true, message: 'Email service disabled' };
    }

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Medium risk alert sent to ${email}:`, result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Failed to send medium risk alert:', error.message);
    throw error;
  }
}

/**
 * Send verification email when registering for alerts
 */
async function sendVerificationEmail(email, region, threshold) {
  try {
    const registrationDate = new Date().toLocaleString();
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f7fa; margin: 0; padding: 20px; }
            .container { max-width: 650px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
            .header-subtitle { font-size: 14px; opacity: 0.95; margin-top: 8px; }
            .content { padding: 30px; line-height: 1.6; color: #333; }
            .greeting { font-size: 16px; margin-bottom: 20px; }
            .section-title { color: #1f2937; font-size: 16px; font-weight: 600; margin-top: 25px; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #059669; }
            .details-box { background: #f0fdf4; border-left: 4px solid #059669; padding: 15px 20px; margin: 15px 0; border-radius: 4px; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px; }
            .detail-label { font-weight: 600; color: #374151; }
            .detail-value { color: #059669; font-weight: 500; }
            .info-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px 20px; margin: 15px 0; border-radius: 4px; }
            .info-box strong { color: #1e40af; }
            .cta-button { display: inline-block; background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: 600; margin-top: 10px; font-size: 14px; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
            .divider { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }
            ul { margin: 15px 0; padding-left: 20px; }
            li { margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Alert Registration Confirmed</h1>
              <p class="header-subtitle">Welcome to ForestGuard Alerts</p>
            </div>
            
            <div class="content">
              <p class="greeting">Dear User,</p>
              
              <p>Thank you for registering with ForestGuard's satellite monitoring system. Your forest alert registration is now active.</p>

              <hr class="divider">

              <h2 style="color: #1f2937; font-size: 16px; margin-top: 0;">✅ Registration Details</h2>
              
              <div class="details-box">
                <div class="detail-row">
                  <span class="detail-label">📍 Monitored Region:</span>
                  <span class="detail-value">${region}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">📧 Email Address:</span>
                  <span class="detail-value">${email}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">⚠️ Alert Threshold:</span>
                  <span class="detail-value">${threshold || 'HIGH'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">📅 Registration Date:</span>
                  <span class="detail-value">${registrationDate}</span>
                </div>
              </div>

              <hr class="divider">

              <h2 style="color: #1f2937; font-size: 16px;">What Happens Next?</h2>
              
              <ul style="line-height: 1.8; color: #555;">
                <li><strong>✓ Continuous Monitoring:</strong> We'll monitor ${region} 24/7 using satellite imagery and advanced ML analysis</li>
                <li><strong>✓ Automated Alerts:</strong> You'll receive an email when vegetation health changes to your selected threshold</li>
                <li><strong>✓ Detailed Analysis:</strong> Each alert includes vegetation loss metrics, confidence scores, and satellite data</li>
                <li><strong>✓ Historical Tracking:</strong> Access your full monitoring history anytime from your dashboard</li>
                <li><strong>✓ Alert Management:</strong> You can update, pause, or remove this alert anytime</li>
              </ul>

              <div class="info-box">
                <strong>💡 Pro Tip:</strong> Log in to your ForestGuard dashboard to view real-time analysis, compare historical trends, and manage multiple area alerts simultaneously.
              </div>

              <hr class="divider">

              <h2 style="color: #1f2937; font-size: 16px;">Need Help?</h2>
              
              <p>If you have any questions or need to modify your alert settings, please visit your dashboard or contact our support team.</p>

              <p style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="cta-button">📊 Access Your Dashboard</a>
              </p>
            </div>

            <div class="footer">
              <p style="margin: 0; padding-bottom: 10px;"><strong>ForestGuard Monitoring System</strong></p>
              <p style="margin: 0; padding-bottom: 10px;">📡 Real-Time Forest Intelligence | Protecting Our Planet</p>
              <p style="margin: 0; padding-bottom: 10px;">Contact: ${emailUser || 'support@forestguard.com'}</p>
              <p style="margin: 10px 0 0 0; font-size: 11px; color: #9ca3af;"><em>This is an automated confirmation from ForestGuard's satellite monitoring system.</em></p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: emailUser || 'ForestGuard <alerts@forestguard.com>',
      to: email,
      subject: `✅ Alert Registration Confirmed - ${region} Monitoring Active`,
      html: htmlContent,
    };

    if (!emailConfigured || !transporter) {
      console.log('⚠️  Email not configured - skipping email send');
      return { skipped: true, message: 'Email service disabled' };
    }

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}:`, result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Failed to send verification email:', error.message);
    throw error;
  }
}

module.exports = {
  sendHighRiskAlert,
  sendMediumRiskAlert,
  sendVerificationEmail,
  transporter,
};
