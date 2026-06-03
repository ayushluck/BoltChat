import { resendClient, sender } from "../lib/resend.js";
import { createWelcomeEmailTemplate } from "./emailTemplates.js";
import ENV from "../lib/env.js";

const fallbackSender = {
    email: "onboarding@resend.dev",
    name: sender.name || "BoltChat",
};

export const sentWelcomeEmail = async (email, name, clientURL) => {
    if (!ENV.RESEND_API_KEY || !sender.name) {
        throw new Error("Missing Resend email configuration");
    }

    const message = {
        to: email,
        subject: "Welcome to BoltChat!",
        html: createWelcomeEmailTemplate(name, clientURL),
    };

    const sendWithSender = async (currentSender) => {
        const { data, error } = await resendClient.emails.send({
            ...message,
            from: `${currentSender.name} <${currentSender.email}>`,
        });

        if (error) {
            return { data: null, error };
        }

        return { data, error: null };
    };

    let result = await sendWithSender(sender);

    if (result.error?.statusCode === 403 && /domain.*verified|not verified|unverified/i.test(result.error.message)) {
        result = await sendWithSender(fallbackSender);
    }

    if (result.error) {
        if (result.error.statusCode === 403) {
            throw new Error(result.error.message);
        }

        throw new Error("Failed to send welcome email");
    }

    console.log("Welcome email sent successfully:", result.data);
}
