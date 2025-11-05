export const sanitizeInput = (req, res, next) => {
    const sanitize = (value) => {
        if (typeof value === "string") {
            // Elimina símbolos potencialmente peligrosos
            return value.replace(/[<>$;]/g, "");
        }
        if (typeof value === "object" && value !== null) {
            for (const key in value) {
                value[key] = sanitize(value[key]);
            }
        }
        return value;
    };

    // Limpia sin reasignar las propiedades protegidas
    sanitize(req.body);
    sanitize(req.params);
    sanitize(req.query);

    next();
};
