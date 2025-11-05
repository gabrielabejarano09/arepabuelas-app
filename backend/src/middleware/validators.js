import { body, validationResult } from "express-validator";

export const validateRegister = [
    body("name")
        .trim()
        .isLength({ min: 5 })
        .withMessage("El nombre debe tener al menos 5 caracteres"),

    body("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Formato de email inválido"),

    body("password")
        .isLength({ min: 8 })
        .withMessage("La contraseña debe tener al menos 8 caracteres"),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
