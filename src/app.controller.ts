/* eslint-disable prettier/prettier */
import { Controller, Get, Render } from '@nestjs/common';
import { ProductService } from './product/product.service';

@Controller()
export class AppController {
  constructor(private readonly productService: ProductService) {}
  @Get()
  @Render('index')
  async root() {
    const [allProducts, totalCount] = await this.productService.findAvailable();
    const products = allProducts.slice(0, 5);
    const showMoreButton = totalCount > 5;
    return { products, showMoreButton };
  }

  @Get('all-products')
  async getAllProducts() {
    return this.productService.findAllAvailable();
  }

  @Get('acceder')
  @Render('acceder')
  acceder() {
    return {};
  }
}
