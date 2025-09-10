import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Wish } from '../../wishes/entities/wish.entity';
@Entity()
export class Wishlist {
  @PrimaryGeneratedColumn()
  id: number;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @Column({ length: 250 })
  name: string;
  @Column({ nullable: true, length: 1500 })
  description: string;
  @Column({ nullable: true })
  image: string;
  @ManyToOne(() => User, (user) => user.wishlists)
  owner: User;
  @ManyToMany(() => Wish)
  @JoinTable()
  items: Wish[];
}
