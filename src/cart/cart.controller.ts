/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Render } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { AddProductDto } from './dto/add-product.dto';
import { RemoveProductDto } from './dto/remove-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AuthUser } from '../types';
import { ProductService } from '../product/product.service';

@ApiTags('Carritos')
@Controller('carts')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly productService: ProductService,
  ) {}

  // -----------------------------
  //      RUTAS FIJAS (PRIMERO)
  // -----------------------------

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Obtener el carrito del usuario autenticado',
    description: 'Devuelve el carrito asociado al usuario que está actualmente autenticado.',
  })
  async getMyCart(@GetUser() user: AuthUser) {
    const carts = await this.cartService.findByCustomer(user.id);
    if (carts.length === 0) {
      return [await this.cartService.getOrCreateCart(user.id)];
    }
    return carts;
  }

  @Get('add/:id')
  @Render('add-to-cart')
  @ApiOperation({
    summary: 'Mostrar página para agregar un producto al carrito',
    description: 'Muestra una página donde el usuario puede seleccionar la cantidad de un producto para agregarlo al carrito.',
  })
  async showAddToCartPage(@Param('id') id: string) {
    const product = await this.productService.findOne(+id);
    return { product };
  }

  @Get('customer/:customerId')
  @ApiOperation({
    summary: 'Obtener el carrito de un cliente',
    description: 'Busca y devuelve el carrito activo de un cliente específico.',
  })
  findByCustomer(@Param('customerId') customerId: string) {
    return this.cartService.findByCustomer(+customerId);
  }

  // -----------------------------
  //      CRUD BASE
  // -----------------------------

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo carrito de compras' })
  create(@Body() createCartDto: CreateCartDto) {
    return this.cartService.create(createCartDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los carritos de compras' })
  findAll() {
    return this.cartService.findAll();
  }

  // -----------------------------
  //      RUTA DINÁMICA (AL FINAL)
  // -----------------------------

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un carrito por su ID' })
  findOne(@Param('id') id: string) {
    return this.cartService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un carrito de compras' })
  update(@Param('id') id: string, @Body() updateCartDto: UpdateCartDto) {
    return this.cartService.update(+id, updateCartDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un carrito por su ID' })
  remove(@Param('id') id: string) {
    return this.cartService.remove(+id);
  }

  // -----------------------------
  //      OPERACIONES DEL CARRITO
  // -----------------------------

  @Post(':id/add')
  @ApiOperation({ summary: 'Agregar un producto al carrito' })
  addProduct(@Param('id') id: string, @Body() addProductDto: AddProductDto) {
    return this.cartService.addProduct(+id, addProductDto);
  }

  @Post(':id/remove')
  @ApiOperation({ summary: 'Eliminar un producto del carrito' })
  removeProduct(@Param('id') id: string, @Body() removeProductDto: RemoveProductDto) {
    return this.cartService.removeProduct(+id, removeProductDto.id_producto);
  }

  @Post(':id/clear')
  @ApiOperation({ summary: 'Vaciar el carrito de compras' })
  clearCart(@Param('id') id: string) {
    return this.cartService.clearCart(+id);
  }

  @Post(':id/checkout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Procesar el checkout del carrito' })
  checkout(@Param('id') id: string, @Query('employeeId') employeeId?: string) {
    return this.cartService.checkout(+id, employeeId ? +employeeId : 0);
  }
}
