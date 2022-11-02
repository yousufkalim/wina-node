/**
 * Send email service for forgot password
 * @author Shuja Naqvi
 */
var nodemailer = require('nodemailer');
const senderName = process.env.MAILER_DOMAIN;
const sendEmail = process.env.MailingId;
const senderPassword = process.env.MailingPassword;
// MailingId=contact@winaa.fr
// MailingPassword=Winaa***2021
/**
 * sendEmail
 * @param {string} email
 * @param {string} password
 * @return {void}
 */
exports.interviewInvitation = payload => {
  return new Promise((resolve, reject) => {
    // Sender mail server config
    var transporter = nodemailer.createTransport({
      host: 'mail.gandi.net',
      port: 465,
      secure: true,
      tls: {
        rejectUnauthorized: false
      },
      auth: {
        user: sendEmail,
        pass: senderPassword
      }
    });

    // Send email options
    var mailOptions = [
      {
        from: sendEmail,
        to: payload.host,
        subject: payload.title,
        text: 'Please Join the meeting using this link :' + payload.host_link
      },
      {
        from: sendEmail,
        to: payload.guest,
        subject: payload.title,
        text: 'Please Join the meeting using this link :' + payload.guest_link
      }
    ];
    for (let i = 0; i < mailOptions.length; i++) {
      transporter.sendMail(mailOptions[i], function (error) {
        if (error) {
          // Error
          reject(error);
        } else {
          // Success
          if (i == 1) {
            resolve({ success: true, message: 'Email sent successfully' });
          }
        }
      });
    }
  });
};
