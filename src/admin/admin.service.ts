/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../order/entities/order.entity';
import { Product } from '../product/entities/product.entity';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
    ) { }

    async getOrders() {
        return this.orderRepository.find({
            relations: ['cliente', 'productos'],
            order: { id_pedido: 'DESC' }
        });
    }

    async getProducts() {
        return this.productRepository.find();
    }

    async getDashboardStats() {
        const totalOrders = await this.orderRepository.count();
        const totalProducts = await this.productRepository.count();
        const pendingOrders = await this.orderRepository.count({
            where: { estado: 'pendiente' }
        });

        return {
            totalOrders,
            totalProducts,
            pendingOrders,
        };
    }
}
