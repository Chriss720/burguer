/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../customer/entities/customer.entity';
import { Employee } from '../employee/entities/employee.entity';
import { LoginCustomerDto } from './dto/login-customer.dto';
import { LoginEmployeeDto } from './dto/login-employee.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload, LoginResponse } from '../types';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Customer)
        private customerRepository: Repository<Customer>,
        @InjectRepository(Employee)
        private employeeRepository: Repository<Employee>,
        private jwtService: JwtService,
    ) { }

    async loginCustomer(loginDto: LoginCustomerDto): Promise<LoginResponse> {
        const customer = await this.customerRepository.findOne({
            where: { correo_cliente: loginDto.correo_cliente }
        });

        if (!customer) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const isPasswordValid = await bcrypt.compare(
            loginDto.contrasena_cliente,
            customer.contrasena_cliente
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const payload: JwtPayload = {
            sub: customer.id_cliente,
            email: customer.correo_cliente,
            tipo: 'customer'
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: customer.id_cliente,
                nombre: customer.nombre_cliente,
                apellido: customer.apellido_cliente,
                email: customer.correo_cliente,
                tipo: 'customer'
            }
        };
    }

    async loginEmployee(loginDto: LoginEmployeeDto): Promise<LoginResponse> {
        const employee = await this.employeeRepository.findOne({
            where: { correo_empleado: loginDto.correo_empleado }
        });

        if (!employee) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const isPasswordValid = await bcrypt.compare(
            loginDto.contrasena_empleado,
            employee.contrasena_empleado
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const payload: JwtPayload = {
            sub: employee.id_empleado,
            email: employee.correo_empleado,
            tipo: 'employee'
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: employee.id_empleado,
                nombre: employee.nombre_empleado,
                apellido: employee.apellido_empleado,
                email: employee.correo_empleado,
                cargo: employee.cargo,
                tipo: 'employee'
            }
        };
    }

    async login(loginDto: LoginDto): Promise<LoginResponse> {
        // Intentar login como cliente
        try {
            const customer = await this.customerRepository.findOne({
                where: { correo_cliente: loginDto.email }
            });

            if (customer) {
                const isPasswordValid = await bcrypt.compare(
                    loginDto.contrasena,
                    customer.contrasena_cliente
                );

                if (isPasswordValid) {
                    const payload: JwtPayload = {
                        sub: customer.id_cliente,
                        email: customer.correo_cliente,
                        tipo: 'customer'
                    };

                    return {
                        access_token: this.jwtService.sign(payload),
                        user: {
                            id: customer.id_cliente,
                            nombre: customer.nombre_cliente,
                            apellido: customer.apellido_cliente,
                            email: customer.correo_cliente,
                            tipo: 'customer'
                        }
                    };
                }
            }
        } catch (error) {
            // Continuar a login de empleado
        }

        // Intentar login como empleado
        const employee = await this.employeeRepository.findOne({
            where: { correo_empleado: loginDto.email }
        });

        if (employee) {
            const isPasswordValid = await bcrypt.compare(
                loginDto.contrasena,
                employee.contrasena_empleado
            );

            if (isPasswordValid) {
                const payload: JwtPayload = {
                    sub: employee.id_empleado,
                    email: employee.correo_empleado,
                    tipo: 'employee'
                };

                return {
                    access_token: this.jwtService.sign(payload),
                    user: {
                        id: employee.id_empleado,
                        nombre: employee.nombre_empleado,
                        apellido: employee.apellido_empleado,
                        email: employee.correo_empleado,
                        cargo: employee.cargo,
                        tipo: 'employee'
                    }
                };
            }
        }

        throw new UnauthorizedException('Credenciales inválidas');
    }
}
