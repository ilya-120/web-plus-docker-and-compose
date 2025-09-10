import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { Wish } from './entities/wish.entity';
import { UsersService } from 'src/users/users.service';
@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private wishesRepository: Repository<Wish>,
    private readonly usersService: UsersService,
  ) {}
  findOne(query: FindOneOptions<Wish>) {
    return this.wishesRepository.findOneOrFail(query);
  }
  async create(createWishDto: CreateWishDto, userId: number): Promise<Wish> {
    const userOwner = await this.usersService.findById(userId);
    
    const ownerWithoutEmail = { ...userOwner };
    delete ownerWithoutEmail.email;
    
    const wish = this.wishesRepository.create({
      ...createWishDto,
      owner: ownerWithoutEmail,
    });
    
    return this.wishesRepository.save(wish);
  }
  async getLastWishes() {
    return this.wishesRepository.find({
      take: 40,
      order: {
        createdAt: 'DESC',
      },
      relations: ['owner', 'offers'],
    });
  }
  async getTopWishes() {
    return this.wishesRepository.find({
      take: 20,
      order: {
        copied: 'DESC',
      },
      relations: ['owner', 'offers'],
    });
  }
  async getWishByWishId(wishId: number) {
    return this.wishesRepository.findOne({
      where: { id: wishId },
      relations: ['owner', 'offers'],
    });
  }
  async updateWish(
    wishId: number,
    updateWishDto: UpdateWishDto,
    userId: number,
  ): Promise<Wish> {
    const wish = await this.wishesRepository.findOne({
      where: { id: wishId },
      relations: ['owner'],
    });
    if (!wish || !wish.owner) {
      throw new NotFoundException(
        'Запрошенное желание или его владелец не найден(ы)',
      );
    }
    if (userId !== wish.owner.id) {
      throw new ForbiddenException(
        'У вас нет разрешения редактировать желание, созданное другим пользователем',
      );
    }
    if (wish.raised > 0) {
      throw new ForbiddenException(
        'Нельзя изменить цену, так как кто-то уже поддержал данное желание',
      );
    }
    return this.wishesRepository.save({
      ...wish,
      ...updateWishDto,
    });
  }
  async deleteWish(wishId: number, userId: number): Promise<Wish> {
    const wish = await this.wishesRepository.findOne({
      where: { id: wishId },
      relations: ['owner', 'offers'],
    });
    if (!wish) {
      throw new NotFoundException('Запрошенное желание не найдено');
    }
    if (wish.owner.id !== userId) {
      throw new ForbiddenException(
        'Нельзя удалить данное желание, так как оно создано другим пользователем',
      );
    }
    return this.wishesRepository.remove(wish);
  }
  async copy(wishId: number, userId: number) {
    const wish = await this.wishesRepository.findOneOrFail({
      where: { id: wishId },
    });
    const alreadyCopied = await this.wishesRepository
      .createQueryBuilder('wish')
      .leftJoin('wish.owner', 'owner')
      .where('wish.id = :wishId', { wishId })
      .andWhere('owner.id = :userId', { userId })
      .getCount();
    if (alreadyCopied > 0) {
      throw new ConflictException('Вы уже скопировали это желание');
    }
    const createWishDto: CreateWishDto = {
      name: wish.name,
      link: wish.link,
      image: wish.image,
      price: wish.price,
      description: wish.description,
    };
    wish.copied++;
    await this.wishesRepository.save(wish);
    return this.create(createWishDto, userId);
  }
  async updateWishWithOffer(id: number, amount: number) {
    return this.wishesRepository.update({ id }, { raised: amount });
  }
  async getWishesArrayByWishesId(ids: number[]) {
    const wishesArray = await Promise.all(
      ids.map((id) => this.getWishByWishId(id)),
    );
    return wishesArray;
  }
  async getWishesList(item): Promise<Wish[]> {
    return this.wishesRepository.findBy(item);
  }
}
