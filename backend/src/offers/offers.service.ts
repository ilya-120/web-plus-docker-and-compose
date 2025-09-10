import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Offer } from './entities/offer.entity';
import { UsersService } from 'src/users/users.service';
import { WishesService } from 'src/wishes/wishes.service';
@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offersRepository: Repository<Offer>,
    private readonly usersService: UsersService,
    private readonly wishesService: WishesService,
    private readonly dataSource: DataSource,
  ) {}
  async createOffer(createOfferDto: CreateOfferDto, userId: number) {
    const { amount, itemId } = createOfferDto;
    const offerGiver = await this.usersService.findOne({
      where: { id: userId },
    });
    const wish = await this.wishesService.findOne({
      where: { id: itemId },
      relations: ['owner'],
    });
    if (!wish) {
      throw new NotFoundException('Запрошенное желание не найдено');
    }
    if (wish.owner.id === userId) {
      throw new ForbiddenException(
        'Нельзя подавать предложение для своего желания',
      );
    }
    if (amount > wish.price) {
      throw new ForbiddenException(
        'Ваше предложение не может превышать стоимость желания',
      );
    }
    if (amount > Number(wish.price) - Number(wish.raised)) {
      throw new ForbiddenException(
        'Вы не можете предложить больше, чем недостающая сумма',
      );
    }
    if (wish.price === wish.raised) {
      throw new ForbiddenException('Требуемая сумма уже собрана, спасибо');
    }
    return await this.dataSource.transaction(async (manager) => {
      await this.wishesService.updateWishWithOffer(
        wish.id,
        Number(amount) + Number(wish.raised),
      );
      const offer = manager.create(Offer, {
        ...createOfferDto,
        user: offerGiver,
        item: wish,
      });
      return await manager.save(offer);
    });
  }
  async getAllOffers(): Promise<Offer[]> {
    return await this.offersRepository.find({
      relations: ['user'],
    });
  }
  async findOfferById(offerId: number): Promise<Offer> {
    const offer = await this.offersRepository.findOne({
      where: { id: offerId },
      relations: ['user', 'item'],
    });
    if (!offer) {
      throw new NotFoundException('Запрошенное предложение не найдено');
    }
    return offer;
  }
}
