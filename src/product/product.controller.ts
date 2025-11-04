/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('Productos')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Post()
  @ApiOperation({ 
    summary: 'Crear un nuevo producto',
    description: 'Permite agregar un nuevo producto al catálogo de la tienda. Se debe especificar el nombre, precio, categoría y otros detalles del producto.'
  })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Obtener todos los productos',
    description: 'Devuelve una lista completa de todos los productos registrados en el catálogo, sin importar su disponibilidad.'
  })
  async findAll() {
    const [products, total] = await this.productService.findAll();
    return {
      data: products,
      total: total,
    };
  }

  @Get('available')
  @ApiOperation({ 
    summary: 'Obtener productos disponibles con paginación',
    description: 'Devuelve una lista paginada de productos que están actualmente disponibles. Use los parámetros `page` y `limit` para navegar entre los resultados.'
  })
  async findAvailable(@Query('page') page = 1, @Query('limit') limit = 10) {
    const [products, total] = await this.productService.findAvailable(+page, +limit);
    return {
      data: products,
      total: total,
      page: +page,
      limit: +limit,
    };
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener un producto por su ID',
    description: 'Busca y devuelve la información de un producto específico utilizando su ID único. Ideal para ver los detalles de un producto.'
  })
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Actualizar un producto',
    description: 'Permite actualizar la información de un producto existente, como su precio, descripción o disponibilidad. Requiere el ID del producto.'
  })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(+id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Eliminar un producto',
    description: 'Elimina un producto del catálogo utilizando su ID. Esta acción es permanente y debe ser usada con precaución.'
  })
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}
