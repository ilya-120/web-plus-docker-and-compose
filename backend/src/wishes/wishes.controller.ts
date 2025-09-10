import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';
import { AuthUser } from 'src/utils/decorators/user.decorator';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createWishDto: CreateWishDto, @AuthUser() user) {
    return this.wishesService.create(createWishDto, user.id);
  }

  @Get('last')
  findLastWishes() {
    return this.wishesService.getLastWishes();
  }

  @Get('top')
  findTopWishes() {
    return this.wishesService.getTopWishes();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findWishByWishId(@Param('id') id: number) {
    return this.wishesService.getWishByWishId(id);
  }

  @Post(':id/copy')
  @UseGuards(JwtAuthGuard)
  copy(@Param('id') id: number, @AuthUser() user: User) {
    return this.wishesService.copy(id, user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  updateWishById(
    @Param('id') id: number,
    @Body() updateWishDto: UpdateWishDto,
    @AuthUser() user: User,
  ) {
    const userId = user.id;
    return this.wishesService.updateWish(id, updateWishDto, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteWishById(@Param('id') id: number, @AuthUser() user: User) {
    const userId = user.id;
    return this.wishesService.deleteWish(id, userId);
  }
}
