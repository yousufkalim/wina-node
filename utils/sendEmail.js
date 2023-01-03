/**
 * Send email service for forgot password
 * @author Shuja Naqvi
 */
const nodemailer = require('nodemailer');
const senderName = process.env.MAILER_DOMAIN;
const sendEmail = process.env.MailingId;
const senderPassword = process.env.MailingPassword;

// Create transporter
const transporter = nodemailer.createTransport({
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

/**
 * sendEmail
 * @param {string} email
 * @param {string} password
 * @return {void}
 */
exports.interviewInvitation = (payload, subject = 'Invitation à un entretien via Winaa') => {
  return new Promise((resolve, reject) => {
    // Send email options
    var mailOptions = [
      {
        from: `${senderName} <${sendEmail}>`,
        to: payload.host,
        subject,
        text: payload?.host_link
          ? 'Bonjour,' +
            '\n\n' +
            `Vous avez invité un candidat à un entretien vidéo pour le poste de ${payload.job_position} au créneau suivant :` +
            '\n\n' +
            `Date : ${payload.date.split('T')[0]}` +
            '\n\n' +
            `Heure : ${payload.date.split('T')[1]}` +
            '\n\n' +
            `Description de l'entretien : ${payload.description}` +
            '\n\n' +
            `Lien de la réunion :  ${payload.host_link}` +
            '\n\n' +
            ` Merci,` +
            '\n\n' +
            `L’équipe Winaa.` +
            '\n\n'
          : 'Bonjour,' +
            '\n\n' +
            `Vous avez invité un candidat à un entretien physique pour le poste de ${payload.job_position} au créneau suivant :` +
            '\n\n' +
            `Date : ${payload.date.split('T')[0]}` +
            '\n\n' +
            `Heure : ${payload.date.split('T')[1]}` +
            '\n\n' +
            `Description de l'entretien : ${payload.description}` +
            '\n\n' +
            ` Merci,` +
            '\n\n' +
            `L’équipe Winaa.` +
            '\n\n'
      },
      {
        from: sendEmail,
        to: payload.guest,
        subject: 'Invitation à un entretien via Winaa',
        text: payload?.guest_link
          ? 'Bonjour,' +
            '\n\n' +
            `L’entreprise ${payload.company_name} vous invite à un entretien vidéo pour le poste de ${payload.job_position} au créneau suivant :` +
            '\n\n' +
            `Date : ${payload.date.split('T')[0]}` +
            '\n\n' +
            `Heure : ${payload.date.split('T')[1]}` +
            '\n\n' +
            `Description de l'entretien : ${payload.description}` +
            '\n\n' +
            `Lien de la réunion :  ${payload.guest_link}` +
            '\n\n' +
            ` Merci,` +
            '\n\n' +
            `L’équipe Winaa.` +
            '\n\n'
          : 'Bonjour,' +
            '\n\n' +
            `L’entreprise ${payload.company_name} vous invite à un entretien physique pour le poste de ${payload.job_position} au créneau suivant :` +
            '\n\n' +
            `Date : ${payload.date.split('T')[0]}` +
            '\n\n' +
            `Heure : ${payload.date.split('T')[1]}` +
            '\n\n' +
            `Description de l'entretien : ${payload.description}` +
            '\n\n' +
            ` Merci,` +
            '\n\n' +
            `L’équipe Winaa.` +
            '\n\n'
      }
    ];
    for (let i = 0; i < mailOptions.length; i++) {
      transporter.sendMail(mailOptions[i], function (error) {
        if (error) {
          // Error
          console.log('Email not sent', error);
          reject(error);
        } else {
          // Success
          console.log('Email sent');
          if (i == 1) {
            resolve({ success: true, message: 'Email sent successfully' });
          }
        }
      });
    }
  });
};

exports.interviewRejection = payload => {
  return new Promise((resolve, reject) => {
    // Send email options
    var mailOptions = [
      {
        from: `${senderName} <${sendEmail}>`,
        to: payload.host,
        subject: "L'interview a été rejetée sur wina",
        text: payload.reason
      },
      {
        from: sendEmail,
        to: payload.guest,
        subject: 'Invitation à un entretien via Winaa',
        text: payload.reason
      }
    ];
    for (let i = 0; i < mailOptions.length; i++) {
      transporter.sendMail(mailOptions[i], function (error) {
        if (error) {
          // Error
          console.log('Email not sent', error);
          reject(error);
        } else {
          // Success
          console.log('Email sent');
          if (i == 1) {
            resolve({ success: true, message: 'Email sent successfully' });
          }
        }
      });
    }
  });
};

exports.changeTimeEmail = payload => {
  return new Promise((resolve, reject) => {
    // Send email options
    var mailOptions = {
      from: `${senderName} <${sendEmail}>`,
      to: payload.guest,
      subject: "L'interview a été rejetée sur wina",
      text: payload.content
    };

    transporter.sendMail(mailOptions, function (error) {
      if (error) {
        // Error
        console.log('Email not sent', error);
        reject(error);
      } else {
        // Success
        console.log('Email sent');

        resolve({ success: true, message: 'Email sent successfully' });
      }
    });
  });
};
