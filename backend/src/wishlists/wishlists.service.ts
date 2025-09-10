import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Wishlist } from './entities/wishlist.entity';
import { WishesService } from 'src/wishes/wishes.service';
import { User } from 'src/users/entities/user.entity';
@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistsRepository: Repository<Wishlist>,
    private readonly wishesService: WishesService,
  ) {}
  async create(
    createWishlistDto: CreateWishlistDto,
    user: User,
  ): Promise<Wishlist> {
    const { itemsId } = createWishlistDto;
    const myWishes = await this.wishesService.getWishesArrayByWishesId(itemsId);

    if (!myWishes || myWishes.length === 0) {
      throw new ForbiddenException(
        'Список желаний должен содержать хотя бы одно желание для создания',
      );
    }
    const myWishlist = await this.wishlistsRepository.save({
      ...createWishlistDto,
      items: myWishes,
      owner: user,
    });
    return myWishlist;
  }
  async getAllWishlists(): Promise<Wishlist[]> {
    const wishlists = await this.wishlistsRepository.find({
      relations: ['items', 'owner'],
    });
    return wishlists;
  }
  async getWishlistById(id: number): Promise<Wishlist> {
    const wishlist = await this.wishlistsRepository.findOne({
      where: { id },
      relations: ['items', 'owner'],
    });
    if (!wishlist) {
      throw new NotFoundException('Запрошенный список желаний не найден');
    }
    return wishlist;
  }
  async editWishlist(
    id: number,
    updateWishlistDto: UpdateWishlistDto,
    userId: number,
  ): Promise<Wishlist> {
    const wishlist = await this.wishlistsRepository.findOne({
      where: { id },
      relations: ['items', 'owner'],
    });
    if (!wishlist) {
      throw new NotFoundException('Запрошенный список желаний не найден');
    }
    if (wishlist.owner.id !== userId) {
      throw new ForbiddenException(
        'Список желаний создан другим пользователем и не может быть отредактирован',
      );
    }
    const relevantWishes = await this.wishesService.getWishesList(
      updateWishlistDto.itemsId,
    );
    const editedWishList = await this.wishlistsRepository.save({
      ...wishlist,
      name: updateWishlistDto.name,
      description: updateWishlistDto.description,
      image: updateWishlistDto.image,
      items: relevantWishes,
    });
    return editedWishList;
  }
  async deleteWishlist(wishlistId: number, userId: number): Promise<Wishlist> {
    const wishlist = await this.getWishlistById(wishlistId);
    if (wishlist.owner.id !== userId) {
      throw new ForbiddenException(
        'Список желаний создан другим пользователем и не может быть удалён',
      );
    }
    return await this.wishlistsRepository.remove(wishlist);
  }
}
