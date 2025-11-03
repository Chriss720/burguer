/* eslint-disable prettier/prettier */
import { Controller, Get, Render } from '@nestjs/common';
import { ProductService } from './product/product.service';

@Controller()
export class AppController {
  constructor(private readonly productService: ProductService) {}
  @Get()
  @Render('index')
  async root() {
    const products = await this.productService.findAvailable();
    return { products };
  }

  @Get('acceder')
  @Render('acceder')
  acceder() {
    return {};
  }
}
