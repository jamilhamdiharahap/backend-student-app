import jwt from "jsonwebtoken";

export function authProtocol(token , duration, KEY) {
    const result = { status: 401, message: "", user: {} };
    if (!token) {
        result.message = "UNAUTHORIZED";
    } else {
        try {
            result.user = jwt.verify(token, KEY);
            if (result.user?.iat !== undefined && (Date.now() / 1000) - result.user?.iat > duration) {
                result.status = 403;
                result.message = "TOKEN EXPIRED.";  
            } else {
                result.status = 200
            }
        } catch (error) {
            result.message = "INVALID TOKEN!";
            result.error = error
        }
    }
    return result;
}