
// Centralized validation logic to ensure data integrity and security

export const validationRules = {
    code: {
        pattern: /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/,
        message: "صيغة الكود غير صحيحة. يجب أن يكون بالشكل XXXX-XXXX-XXXX"
    },
    textInput: {
        maxLength: 5000, // Reasonable limit for Gemini context
        message: "النص طويل جداً. يرجى الاختصار."
    },
    name: {
        pattern: /^[\u0600-\u06FFa-zA-Z\s0-9-_]{2,50}$/,
        message: "الاسم يجب أن يحتوي على أحرف وأرقام فقط (2-50 حرف)"
    },
    adminAuth: {
        minLength: 5,
        maxLength: 50
    }
};

export const sanitizeText = (text: string): string => {
    if (!text) return "";
    // Remove HTML tags to prevent XSS (though React escapes by default, this is for backend safety)
    let clean = text.replace(/<\/?[^>]+(>|$)/g, "");
    // Trim whitespace
    clean = clean.trim();
    return clean;
};

export const isValidCode = (code: string): boolean => {
    return validationRules.code.pattern.test(code);
};

export const isValidTextLength = (text: string): boolean => {
    return text.length <= validationRules.textInput.maxLength;
};

export const isValidName = (name: string): boolean => {
    return validationRules.name.pattern.test(name);
};

export const validateVital = (value: any, min: number, max: number): { isValid: boolean; msg?: string } => {
    const num = Number(value);
    if (isNaN(num)) return { isValid: false, msg: "قيمة غير رقمية" };
    if (num < min || num > max) return { isValid: false, msg: `القيمة يجب أن تكون بين ${min} و ${max}` };
    return { isValid: true };
};
