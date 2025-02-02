const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { nom, email, message } = JSON.parse(event.body);

    if (!nom || !email || !message) {
      return { statusCode: 400, body: 'Tous les champs sont requis' };
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `Nouveau message de ${nom}`,
      html: `
        <h2>Nouveau message du formulaire de contact</h2>
        <p><strong>Nom:</strong> ${nom}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };

    await transporter.sendMail(mailOptions);
    return { statusCode: 200, body: 'Message envoyé avec succès' };
  } catch (error) {
    console.error('Erreur:', error);
    return { 
      statusCode: 500, 
      body: error.message || 'Erreur lors de l\'envoi du message'
    };
  }
}; 