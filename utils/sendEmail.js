/**
 * Send email service for forgot password
 * @author Shuja Naqvi
 */
var nodemailer = require('nodemailer');
const senderName = process.env.MAILER_DOMAIN;
const sendEmail = process.env.MailingId;
const senderPassword = process.env.MailingPassword;

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
        subject: 'Invitation à un entretien via Winaa',
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
