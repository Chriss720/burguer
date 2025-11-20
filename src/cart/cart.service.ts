/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Cart } from './entities/cart.entity';
import { CartProduct } from './entities/cart-product.entity';
import { Product } from '../product/entities/product.entity';
import { AddProductDto } from './dto/add-product.dto';
import { OrderService } from '../order/order.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartProduct)
    private readonly cartProductRepository: Repository<CartProduct>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly orderService: OrderService,
  ) { }

  async create(createCartDto: CreateCartDto): Promise<Cart> {
    const cart = this.cartRepository.create(createCartDto as Partial<Cart>);
    return this.cartRepository.save(cart);
  }

  async findAll(): Promise<Cart[]> {
    return this.cartRepository.find({ relations: ['cartProducts'] });
  }

  async findOne(id: number): Promise<Cart> {
    console.log('cartService.findOne called with id:', id);
    if (isNaN(id)) {
      try {
        throw new Error('findOne called with NaN');
      } catch (e) {
        console.error(e.stack);
      }
    }
    const cart = await this.cartRepository.findOne({ where: { id_carrito: id }, relations: ['cartProducts', 'cartProducts.product'] });
    if (!cart) throw new NotFoundException(`Cart with ID ${id} not found`);
    return cart;
  }

  async update(id: number, updateCartDto: UpdateCartDto): Promise<Cart> {
    const cart = await this.findOne(id);
    Object.assign(cart, updateCartDto);
    return this.cartRepository.save(cart);
  }

  async remove(id: number): Promise<{ message: string; cart?: Cart }> {
    const cart = await this.findOne(id);
    await this.cartRepository.remove(cart);
    return { message: `Cart with ID ${id} removed`, cart };
  }

  async addProduct(id: number, addProductDto: AddProductDto) {
    const product = await this.productRepository.findOneBy({ id_producto: addProductDto.id_producto });
    if (!product) throw new NotFoundException(`Product with ID ${addProductDto.id_producto} not found`);

    let cartProduct = await this.cartProductRepository.findOne({ where: { id_carrito: id, id_producto: addProductDto.id_producto } });
    if (cartProduct) {
      cartProduct.cantidad += addProductDto.cantidad;
    } else {
      cartProduct = this.cartProductRepository.create({ id_carrito: id, id_producto: addProductDto.id_producto, cantidad: addProductDto.cantidad } as Partial<CartProduct>);
    }
    await this.cartProductRepository.save(cartProduct);
    return this.findOne(id);
  }

  async removeProduct(id: number, id_producto: number) {
    await this.findOne(id);
    const cartProduct = await this.cartProductRepository.findOne({ where: { id_carrito: id, id_producto } });
    if (!cartProduct) throw new NotFoundException(`Product with ID ${id_producto} not found in cart ${id}`);
    await this.cartProductRepository.remove(cartProduct);
    return this.findOne(id);
  }

  async clearCart(id: number) {
    await this.findOne(id);
    await this.cartProductRepository.delete({ id_carrito: id });
    return this.findOne(id);
  }

  async findByCustomer(customerId: number): Promise<Cart[]> {
    return this.cartRepository.find({ where: { id_cliente: customerId }, relations: ['cartProducts', 'cartProducts.product'] });
  }

  async getOrCreateCart(customerId: number): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { id_cliente: customerId, estado: 'activo' },
    });

    if (!cart) {
      cart = this.cartRepository.create({
        id_cliente: customerId,
        estado: 'activo'
      } as Partial<Cart>);
      cart = await this.cartRepository.save(cart);
    }

    return cart;
  }

  async checkout(cartId: number, employeeId?: number) {
    return this.orderService.fromCart(cartId, employeeId ?? 1);
  }
}
