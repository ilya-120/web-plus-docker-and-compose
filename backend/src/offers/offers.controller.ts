import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AuthUser } from 'src/utils/decorators/user.decorator';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createOfferDto: CreateOfferDto, @AuthUser() user) {
    return this.offersService.createOffer(createOfferDto, user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAllOffers() {
    return this.offersService.getAllOffers();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOfferByOfferId(@Param('id') id: number) {
    return this.offersService.findOfferById(id);
  }
}
