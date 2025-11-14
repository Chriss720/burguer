/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { JwtPayload, AuthUser } from '../../types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                // Primero intenta desde el header Authorization
                ExtractJwt.fromAuthHeaderAsBearerToken(),
                // Luego intenta desde la cookie Authorization
                (req: Request) => {
                    const token = req.cookies?.Authorization?.replace('Bearer ', '');
                    return token || null;
                },
            ]),
            ignoreExpiration: false,
            secretOrKey: 'Me_lleva_la_burguer_no_se_que_poner_mondongo_123'
        });
    }

    validate(payload: JwtPayload): AuthUser {
        return { 
            id: payload.sub, 
            email: payload.email, 
            tipo: payload.tipo 
        };
    }
}
