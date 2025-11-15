/* eslint-disable prettier/prettier */
import { Controller, Get, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AuthUser } from '../types';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('employee')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('dashboard')
    async getDashboard(@GetUser() user: AuthUser, @Res() res: Response) {
        const stats = await this.adminService.getDashboardStats();
        res.render('admin/dashboard', { user, stats });
    }

    @Get('pedidos')
    async getPedidos(@GetUser() user: AuthUser, @Res() res: Response) {
        const orders = await this.adminService.getOrders();
        res.render('admin/pedidos', { user, orders });
    }

    @Get('menu')
    async getMenu(@GetUser() user: AuthUser, @Res() res: Response) {
        const products = await this.adminService.getProducts();
        res.render('admin/menu', { user, products });
    }

    @Get('ingredientes')
    async getIngredientes(@GetUser() user: AuthUser, @Res() res: Response) {
        res.render('admin/ingredientes', { user });
    }

    @Get('empleados')
    async getEmpleados(@GetUser() user: AuthUser, @Res() res: Response) {
        // Vista simple con título; el resto lo implementará otro compañero
        res.render('admin/empleados', { user });
    }
}
