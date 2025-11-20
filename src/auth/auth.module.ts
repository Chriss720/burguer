/* eslint-disable prettier/prettier */
import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Customer } from '../customer/entities/customer.entity';
import { Employee } from '../employee/entities/employee.entity';
import { CartModule } from '../cart/cart.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Customer, Employee]),
        PassportModule,
        JwtModule.register({
            secret: 'Me_lleva_la_burguer_no_se_que_poner_mondongo_123',
            signOptions: { expiresIn: '24h' },
        }),
        forwardRef(() => CartModule),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService],
})
export class AuthModule { }
