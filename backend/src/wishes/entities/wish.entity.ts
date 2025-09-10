import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Offer } from '../../offers/entities/offer.entity';
@Entity()
export class Wish {
  @PrimaryGeneratedColumn()
  id: number;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @Column({ length: 250 })
  name: string;
  @Column()
  link: string;
  @Column()
  image: string;
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  raised: number;
  @Column({ length: 1024 })
  description: string;
  @Column({ default: 0 })
  copied: number;
  @ManyToOne(() => User, (user) => user.wishes)
  owner: User;
  @OneToMany(() => Offer, (offer) => offer.wish)
  offers: Offer[];
}
