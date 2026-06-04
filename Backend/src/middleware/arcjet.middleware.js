import aj from "../lib/arcjet.js";

export const arcjetProtection = async (req, res, next) => {
    try {
        const decision = await aj.protect(req);
        if (decision.isDenied) {
            if (decision.reason.isRateLimit()) {
                return res.status(429).json({ message: "Rate limit exceeded. Please try again later." });
            }
            else if (decision.reason.isBot()) {
                return res.status(403).json({ message: "Bot traffic is not allowed." });
            }
            else {
                return res.status(403).json({ message: "Access denied by security policy" });
            }
        }
        next();
    } catch (err) {
        console.error("Arcjet error:", err);
        next();
    }
} 