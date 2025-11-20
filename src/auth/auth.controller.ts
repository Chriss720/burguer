/* eslint-disable prettier/prettier */
import { Controller, Post, Body, UseInterceptors } from '@nestjs/common';
import { LoggingInterceptor } from 'src/common/interceptors/logging.interceptor';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CartService } from '../cart/cart.service';
import { LoginCustomerDto } from './dto/login-customer.dto';
import { LoginEmployeeDto } from './dto/login-employee.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponse } from '../types';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly cartService: CartService,
    ) { }

    @UseInterceptors(LoggingInterceptor)
    @Post('login/customer')
    @ApiOperation({ 
        summary: 'Iniciar sesión como cliente',
        description: 'Permite a un cliente iniciar sesión proporcionando su correo electrónico y contraseña. Devuelve un token de acceso si las credenciales son correctas.'
    })
    @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso. Devuelve un token de acceso.' })
    @ApiResponse({ status: 401, description: 'Credenciales inválidas. El correo electrónico o la contraseña son incorrectos.' })
    async loginCustomer(@Body() loginDto: LoginCustomerDto): Promise<LoginResponse> {
        const result = await this.authService.loginCustomer(loginDto);
        try {
            if (result && result.user && result.user.tipo === 'customer') {
                await this.cartService.getOrCreateCart(result.user.id);
            }
        } catch (error) {
            console.error('Error asegurando carrito tras login de cliente:', error);
        }
        return result;
    }

    @UseInterceptors(LoggingInterceptor)
    @Post('login')
    @ApiOperation({ 
        summary: 'Iniciar sesión unificado',
        description: 'Permite a un cliente o empleado iniciar sesión. Diferencia automáticamente el tipo de usuario.'
    })
    @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso. Devuelve un token de acceso.' })
    @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
    async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
        const result = await this.authService.login(loginDto);
        try {
            if (result && result.user && result.user.tipo === 'customer') {
                console.log('ID de cliente para getOrCreateCart:', result.user.id);
                await this.cartService.getOrCreateCart(result.user.id);
            }
        } catch (error) {
            console.error('Error asegurando carrito tras login unificado (cliente):', error);
        }
        return result;
    }

    @UseInterceptors(LoggingInterceptor)
    @Post('login/employee')
    @ApiOperation({ 
        summary: 'Iniciar sesión como empleado',
        description: 'Permite a un empleado iniciar sesión proporcionando su correo electrónico y contraseña. Devuelve un token de acceso si las credenciales son correctas.'
    })
    @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso. Devuelve un token de acceso.' })
    @ApiResponse({ status: 401, description: 'Credenciales inválidas. El correo electrónico o la contraseña son incorrectos.' })
    loginEmployee(@Body() loginDto: LoginEmployeeDto): Promise<LoginResponse> {
        return this.authService.loginEmployee(loginDto);
    }

    @UseInterceptors(LoggingInterceptor)
    @Post('logout')
    @ApiOperation({
        summary: 'Cerrar sesión',
        description: 'Permite a un usuario cerrar su sesión.'
    })
    @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente.' })
    logout(): { message: string } {
        // Here you would implement actual logout logic, e.g.,
        // invalidating a token or clearing session data.
        return { message: 'Logout successful' };
    }
}
