import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, html }) => {
  try {
    // Fallback log if SMTP credentials are not fully set
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('\n==================================================');
      console.log(`[SIMULATED E-MAIL DISPATCH]`);
      console.log(`To:      ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body:\n${html.replace(/<[^>]*>/g, '')}`); // Strip tags for clean log print
      console.log('==================================================\n');
      return { success: true, simulated: true };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"VoteChain Admin" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`Email successfully sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};
