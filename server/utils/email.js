const nodemailer = require("nodemailer");
const fs = require("fs").promises;
const path = require("path");
const nodemailer = require("nodemailer");

// Create transporter
const createTransporter = () => {
  // Check if we have Gmail credentials configured
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === "true" || false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  if (process.env.NODE_ENV === "production") {
    // Production email configuration (e.g., SendGrid, AWS SES, etc.)
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Development fallback - use Ethereal Email for testing
    const user = process.env.ETHEREAL_USER;
    const pass = process.env.ETHEREAL_PASS;

    if (user && pass) {
      return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        auth: { user, pass },
      });
    }

    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "ethereal.user@ethereal.email",
        pass: "ethereal.pass",
      },
    });
  }
};

// Email templates
const templates = {
  "admin-approval-request": {
    subject: "New Organization Admin Request - DoneHub",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">New Organization Admin Request</h2>
        <p>Hello {{adminName}},</p>
        <p>A new organization admin request has been submitted and requires your approval:</p>
        
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Request Details</h3>
          <p><strong>Name:</strong> {{requestorName}}</p>
          <p><strong>Email:</strong> {{requestorEmail}}</p>
          <p><strong>Organization:</strong> {{orgName}}</p>
          <p><strong>Industry:</strong> {{industry}}</p>
        </div>
        
        <p>
          <a href="{{approvalUrl}}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Review Request
          </a>
        </p>
        
        <p>Best regards,<br>DoneHub System</p>
      </div>
    `,
  },

  "org-admin-request-confirmation": {
    subject: "Organization Admin Request Submitted - DoneHub",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">Request Submitted Successfully</h2>
        <p>Hello {{name}},</p>
        <p>Thank you for your interest in DoneHub! Your organization admin request for <strong>{{orgName}}</strong> has been submitted successfully.</p>
        
        <div style="background: #FEF3C7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
          <h3 style="margin-top: 0; color: #92400E;">What happens next?</h3>
          <ul style="color: #92400E;">
            <li>Our system administrator will review your request</li>
            <li>You'll receive an email notification with the decision</li>
            <li>If approved, you'll get login credentials and setup instructions</li>
          </ul>
        </div>
        
        <p>We typically review requests within 1-2 business days.</p>
        
        <p>Best regards,<br>The DoneHub Team</p>
      </div>
    `,
  },

  "org-admin-approved": {
    subject: "Welcome to DoneHub - Your Organization is Approved!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">🎉 Welcome to DoneHub!</h2>
        <p>Hello {{name}},</p>
        <p>Great news! Your organization admin request for <strong>{{orgName}}</strong> has been approved.</p>
        
        <div style="background: #ECFDF5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
          <h3 style="margin-top: 0; color: #065F46;">Your Login Credentials</h3>
          <p style="color: #065F46;"><strong>Email:</strong> {{email}}</p>
          <p style="color: #065F46;"><strong>Temporary Password:</strong> <code style="background: #D1FAE5; padding: 2px 6px; border-radius: 4px;">{{tempPassword}}</code></p>
        </div>
        
        <div style="background: #FEF3C7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #92400E;"><strong>Important:</strong> Please change your password after your first login for security.</p>
        </div>
        
        <p>{{welcomeMessage}}</p>
        
        <p>
          <a href="{{loginUrl}}" style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Login to DoneHub
          </a>
        </p>
        
        <p>If you have any questions, feel free to reach out to our support team.</p>
        
        <p>Best regards,<br>{{approverName}}<br>DoneHub Team</p>
      </div>
    `,
  },

  "org-admin-rejected": {
    subject: "Organization Admin Request Update - DoneHub",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #EF4444;">Request Update</h2>
        <p>Hello {{name}},</p>
        <p>Thank you for your interest in DoneHub. After careful review, we're unable to approve your organization admin request for <strong>{{orgName}}</strong> at this time.</p>
        
        <div style="background: #FEF2F2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444;">
          <h3 style="margin-top: 0; color: #991B1B;">Reason</h3>
          <p style="color: #991B1B;">{{reason}}</p>
        </div>
        
        <p>If you have any questions or would like to discuss this decision, please don't hesitate to contact us at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a>.</p>
        
        <p>Best regards,<br>The DoneHub Team</p>
      </div>
    `,
  },

  "org-admin-request-more-info": {
    subject: "Action needed: Additional info for your DoneHub request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #F59E0B;">Additional Information Requested</h2>
        <p>Hello {{name}},</p>
        <p>We’re reviewing your organization admin request for <strong>{{orgName}}</strong> and need a bit more information to proceed.</p>
        <div style="background: #FEF3C7; padding: 16px; border-radius: 8px; margin: 16px 0; color: #92400E; white-space: pre-line;">
          {{questions}}
        </div>
        <p>Please reply to this email with the requested details. For any issue, contact us at <a href="mailto:{{replyTo}}">{{replyTo}}</a>.</p>
        <p>Best regards,<br>The DoneHub Team</p>
      </div>
    `,
  },

  "member-invitation": {
    subject: "You're invited to join {{orgName}} on DoneHub",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">You're Invited!</h2>
        <p>Hello,</p>
        <p><strong>{{inviterName}}</strong> has invited you to join <strong>{{orgName}}</strong> on DoneHub.</p>
        
        {{#if personalMessage}}
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0; font-style: italic;">
          "{{personalMessage}}"
        </div>
        {{/if}}
        
        <p>DoneHub is a modern team management platform that helps organizations streamline their workflows and collaborate effectively.</p>
        
        <p>
          <a href="{{inviteUrl}}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Accept Invitation
          </a>
        </p>
        
        <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #92400E; font-size: 14px;"><strong>Note:</strong> This invitation expires in {{expirationDays}} days.</p>
        </div>
        
        <p style="font-size: 14px; color: #6B7280;">If you're not expecting this invitation, you can safely ignore this email.</p>
        
        <p>Best regards,<br>The DoneHub Team</p>
      </div>
    `,
  },

  "member-welcome": {
    subject: "Welcome to {{orgName}} - DoneHub",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">🎉 Welcome to {{orgName}}!</h2>
        <p>Hello {{name}},</p>
        <p>Welcome to <strong>{{orgName}}</strong> on DoneHub! Your account has been successfully created.</p>
        
        <div style="background: #ECFDF5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #065F46;">Getting Started</h3>
          <ul style="color: #065F46;">
            <li>Complete your profile setup</li>
            <li>Explore your team's projects and tasks</li>
            <li>Connect with your colleagues</li>
            <li>Set up your notification preferences</li>
          </ul>
        </div>
        
        <p>You were invited by <strong>{{inviterName}}</strong>. If you have any questions about getting started, don't hesitate to reach out to them or your team.</p>
        
        <p>
          <a href="{{loginUrl}}" style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Access Your Dashboard
          </a>
        </p>
        
        <p>We're excited to have you on board!</p>
        
        <p>Best regards,<br>The DoneHub Team</p>
      </div>
    `,
  },

  "password-reset": {
    subject: "Password Reset Request - DoneHub",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">Password Reset Request</h2>
        <p>Hello {{name}},</p>
        <p>We received a request to reset your password for your DoneHub account.</p>
        
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>If you requested this password reset:</strong></p>
          <p style="margin: 10px 0 0 0;">Click the button below to reset your password. This link will expire in {{expirationMinutes}} minutes.</p>
        </div>
        
        <p>
          <a href="{{resetUrl}}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </p>
        
        <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #92400E; font-size: 14px;"><strong>If you didn't request this:</strong></p>
          <p style="margin: 5px 0 0 0; color: #92400E; font-size: 14px;">You can safely ignore this email. Your password will not be changed.</p>
        </div>
        
        <p>Best regards,<br>The DoneHub Team</p>
      </div>
    `,
  },

  "password-reset-success": {
    subject: "Password Reset Successful - DoneHub",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">Password Reset Successful</h2>
        <p>Hello {{name}},</p>
        <p>Your password has been successfully reset for your DoneHub account.</p>
        
        <div style="background: #ECFDF5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
          <p style="margin: 0; color: #065F46;"><strong>Security Notice:</strong></p>
          <p style="margin: 10px 0 0 0; color: #065F46;">If you didn't make this change, please contact our support team immediately.</p>
        </div>
        
        <p>
          <a href="{{loginUrl}}" style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Login to DoneHub
          </a>
        </p>
        
        <p>Best regards,<br>The DoneHub Team</p>
      </div>
    `,
  },
};

// Simple template engine (replace {{variable}} with actual values)
const renderTemplate = (template, data) => {
  let rendered = template;

  // Replace simple variables
  Object.keys(data).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    rendered = rendered.replace(regex, data[key] || "");
  });

  // Handle conditional blocks {{#if variable}}...{{/if}}
  rendered = rendered.replace(
    /{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g,
    (match, variable, content) => {
      return data[variable] ? content : "";
    }
  );

  return rendered;
};

// Send email function
const sendEmail = async ({ to, subject, template, data = {} }) => {
  try {
    const transporter = createTransporter();

    let emailContent;
    if (template && templates[template]) {
      const templateData = templates[template];
      emailContent = {
        subject: renderTemplate(templateData.subject, data),
        html: renderTemplate(templateData.html, data),
      };
    } else {
      emailContent = { subject, html: data.html || data.text };
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || "DoneHub <noreply@donehub.com>",
      to,
      subject: emailContent.subject,
      html: emailContent.html,
    };

    const result = await transporter.sendMail(mailOptions);

    if (process.env.NODE_ENV !== "production") {
      console.log("Email sent:", nodemailer.getTestMessageUrl(result));
    }

    return result;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};

module.exports = {
  sendEmail,
};
