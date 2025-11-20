/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, OneToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Customer } from '../../customer/entities/customer.entity';
import { Employee } from '../../employee/entities/employee.entity';
import { OrderProduct } from './order-product.entity';
import { Payment } from '../../payment/entities/payment.entity';

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id_pedido: number;

    @Column()
    id_cliente: number;

    @Column({ nullable: true })
    id_empleado: number | null;

    @CreateDateColumn()
    fecha_pedido: Date;

    @Column('decimal', { precision: 10, scale: 2 })
    total: number;

    @Column()
    estado: string;

    @ManyToOne(() => Customer, customer => customer.orders)
    @JoinColumn({ name: 'id_cliente' })
    customer: Customer;

    @ManyToOne(() => Employee, employee => employee.orders, { nullable: true })
    @JoinColumn({ name: 'id_empleado' })
    employee: Employee | null;

    @OneToMany(() => OrderProduct, orderProduct => orderProduct.order)
    orderProducts: OrderProduct[];

    @OneToOne(() => Payment, payment => payment.order)
    payment: Payment;
}
