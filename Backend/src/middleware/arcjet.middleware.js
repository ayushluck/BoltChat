import aj from "../lib/arcjet.js";

export const arcjetProtection = async (req, res, next) => {
    try {
        const decision = await aj.protect(req);
        if (decision.isDenied) {
            console.warn("Arcjet denied a request, allowing it through to avoid blocking normal users.");
        }
        next();
    } catch (err) {
        console.error("Arcjet error:", err);
        next();
    }
} 