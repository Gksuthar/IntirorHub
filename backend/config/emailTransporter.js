import nodemailer from "nodemailer";

let cachedTransporter = null;

const createEmailTransporter = () => {
    if (cachedTransporter) {
        return cachedTransporter;
    }

    const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, EMAIL, EMAIL_PASS } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !EMAIL || !EMAIL_PASS) {
        console.warn("SMTP configuration missing. Emails will not be sent until configuration is provided.");
        return null;
    }

    cachedTransporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: SMTP_SECURE === "true",
        auth: {
            user: EMAIL,
            pass: EMAIL_PASS,
        },
    });

    return cachedTransporter;
};

export default createEmailTransporter;