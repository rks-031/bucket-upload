// src/utils/emailService.js
import emailjs from '@emailjs/browser';

export const sendShareEmail = async (recipientEmail, fileLink, fileName, senderName) => {
  try {
    const templateParams = {
      to_email: recipientEmail,
      file_link: fileLink,
      file_name: fileName,
      from_name: senderName,
    };

    const response = await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      templateParams,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    );

    return response;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};