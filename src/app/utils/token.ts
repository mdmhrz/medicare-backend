import { JwtPayload, SignOptions } from "jsonwebtoken";
import { jwtUtils } from "./jwt";
import { Response } from "express";
import { cookieUtils } from "./cookie";
import { envVars } from "../config/env";



// create access token
const getAccessToken = (payload: JwtPayload) => {
    const accessToken = jwtUtils.createToken(
        payload,
        envVars.ACCESS_TOKEN_SECRET,
        { expiresIn: envVars.ACCESS_TOKEN_EXPIRES_IN } as SignOptions
    );

    return accessToken;
}

// create refresh token
const getRefreshToken = (payload: JwtPayload) => {
    const refreshToken = jwtUtils.createToken(
        payload,
        envVars.REFRESH_TOKEN_SECRET,
        { expiresIn: 60 * 60 * 60 * 24 * 7 } as SignOptions
    );

    return refreshToken;
}

// set access token in cookie
const setAccessTokenCookie = (res: Response, token: string) => {
    // const maxAge = ms(envVars.ACCESS_TOKEN_EXPIRES_IN as StringValue);

    cookieUtils.setCookie(res, "accessToken", token, {
        httpOnly: true,
        secure: envVars.NODE_ENV === "production",
        sameSite: "none",
        path: "/",
        //1day
        // maxAge: Number(maxAge) this was experimental by using ms
        maxAge: 60 * 60 * 60 * 24
    })
}


//set refress token in cookie
const setRefreshTokenCookie = (res: Response, token: string) => {
    cookieUtils.setCookie(res, "refreshToken", token, {
        httpOnly: true,
        secure: envVars.NODE_ENV === "production",
        sameSite: "none",
        path: "/",
        //7 days
        maxAge: 60 * 60 * 60 * 24 * 7
    })
}

// set better auth session token in cookie
const setBetterAuthSessionCookie = (res: Response, token: string) => {

    cookieUtils.setCookie(res, "better-auth.session_token", token, {
        httpOnly: true,
        secure: envVars.NODE_ENV === "production",
        sameSite: "none",
        path: "/",
        //1 day
        maxAge: 60 * 60 * 60 * 24

    })
}


export const tokenUtils = {
    getAccessToken,
    getRefreshToken,
    setAccessTokenCookie,
    setRefreshTokenCookie,
    setBetterAuthSessionCookie
}