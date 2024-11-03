import { SignJWT, JWTPayload } from "jose";
import { JWT_SECRET_KEY } from '../config/config';

export const signJwt = async (payload: JWTPayload) => {
    const secretKey = new TextEncoder().encode(JWT_SECRET_KEY);

    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1w")
        .sign(secretKey);
};
