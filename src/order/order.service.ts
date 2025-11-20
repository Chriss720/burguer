/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { OrderProduct } from './entities/order-product.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CartProduct } from '../cart/entities/cart-product.entity';
import { Product } from '../product/entities/product.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderProduct)
    private readonly orderProductRepository: Repository<OrderProduct>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartProduct)
    private readonly cartProductRepository: Repository<CartProduct>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = this.orderRepository.create(createOrderDto as Partial<Order>);
    return this.orderRepository.save(order);
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({ relations: ['orderProducts'] });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id_pedido: id }, relations: ['orderProducts', 'orderProducts.product'] });
    if (!order) throw new NotFoundException(`Order with ID ${id} not found`);
    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    Object.assign(order, updateOrderDto);
    return this.orderRepository.save(order);
  }

  async remove(id: number): Promise<{ message: string; order?: Order }> {
    const order = await this.findOne(id);
    await this.orderRepository.remove(order);
    return { message: `Order with ID ${id} removed`, order };
  }

  async fromCart(cartId: number, employeeId: number): Promise<Order> {
    const cart = await this.cartRepository.findOne({ where: { id_carrito: cartId }, relations: ['cartProducts', 'cartProducts.product'] });
    if (!cart) throw new NotFoundException(`Cart with ID ${cartId} not found`);

    const order = this.orderRepository.create({id_cliente: cart.id_cliente, id_empleado: employeeId || null,total: 0,estado: 'Pendiente',} as Partial<Order>);
    const savedOrder = await this.orderRepository.save(order);

    let total = 0;
    for (const cp of cart.cartProducts ?? []) {
      const product = cp.product ?? await this.productRepository.findOneBy({ id_producto: cp.id_producto });
      const subtotal = Number(product.precio) * cp.cantidad;
      total += subtotal;
      const op = this.orderProductRepository.create({ id_pedido: savedOrder.id_pedido, id_producto: cp.id_producto, cantidad: cp.cantidad, subtotal } as Partial<OrderProduct>);
      await this.orderProductRepository.save(op);
    }

    savedOrder.total = Number(total.toFixed(2));
    await this.orderRepository.save(savedOrder);


    await this.cartProductRepository.delete({ id_carrito: cartId });

    return this.findOne(savedOrder.id_pedido);
  }

  async findByCustomer(customerId: number): Promise<Order[]> {
    return this.orderRepository.find({ where: { id_cliente: customerId }, relations: ['orderProducts', 'orderProducts.product'] });
  }

  async findByEmployee(employeeId: number): Promise<Order[]> {
    return this.orderRepository.find({ where: { id_empleado: employeeId }, relations: ['orderProducts', 'orderProducts.product'] });
  }

  async patchStatus(id: number, status: string): Promise<Order> {
    const order = await this.findOne(id);
    order.estado = status;
    return this.orderRepository.save(order);
  }
}
