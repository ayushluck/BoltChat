import { resendClient, sender } from "../lib/resend.js";
import { createWelcomeEmailTemplate } from "./emailTemplates.js";
import ENV from "../lib/env.js";

export const sentWelcomeEmail = async (email,name,clientURL)=> {
    if (!ENV.RESEND_API_KEY || !sender.email || !sender.name) {
        throw new Error("Missing Resend email configuration");
    }

    const {data,error} = await resendClient.emails.send({
        from: `${sender.name} <${sender.email}>`,
        to: email,
        subject: "Welcome to BoltChat!",
        html: createWelcomeEmailTemplate(name, clientURL)
    });
    if(error){
        if (error.statusCode === 403) {
            throw new Error(error.message);
        }
        throw new Error("Failed to send welcome email");
    }
    console.log("Welcome email sent successfully:",data);
}
