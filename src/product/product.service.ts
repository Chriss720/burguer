/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto as DeepPartial<Product>);
    return await this.productRepository.save(product);
  }

  async findAll(): Promise<[Product[], number]> {
    return this.productRepository.findAndCount();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOneBy({ id_producto: id });
    if (!product) throw new NotFoundException(`Product with ID ${id} not found`);
    return product;
  }

  async findAvailable(page = 1, limit = 10): Promise<[Product[], number]> {
    const truths = ['disponible', 'available', 'true', '1', 'si', 'sí', 'yes'];
    const skip = (page - 1) * limit;

    return this.productRepository
      .createQueryBuilder('product')
      .where('LOWER(product.disponibilidad) IN (:...vals)', { vals: truths })
      .skip(skip)
      .take(limit)
      .getManyAndCount();
  }

  async findAllAvailable(): Promise<Product[]> {
    const truths = ['disponible', 'available', 'true', '1', 'si', 'sí', 'yes'];
    return this.productRepository
      .createQueryBuilder('product')
      .where('LOWER(product.disponibilidad) IN (:...vals)', { vals: truths })
      .getMany();
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async remove(id: number): Promise<{ message: string; product?: Product }> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
    return { message: `Product with ID ${id} removed`, product };
  }
}
