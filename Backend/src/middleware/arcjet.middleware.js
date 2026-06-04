import aj from "../lib/arcjet.js";

export const arcjetProtection = async (req, res, next) => {
    try {
        const decision = await aj.protect(req);
        if (decision.isDenied) {
            return res.status(403).json({ message: "Access denied by security policy" });
        }
        next();
    } catch (err) {
        console.error("Arcjet error:", err);
        next();
    }
} 