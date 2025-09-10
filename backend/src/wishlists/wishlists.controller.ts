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
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';
import { AuthUser } from 'src/utils/decorators/user.decorator';
import { Wishlist } from './entities/wishlist.entity';

@Controller('wishlistlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createWishlist(
    @Body() createWishlistDto: CreateWishlistDto,
    @AuthUser() user: User,
  ): Promise<Wishlist> {
    return this.wishlistsService.create(createWishlistDto, user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAllWishlists(): Promise<Wishlist[]> {
    return this.wishlistsService.getAllWishlists();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findWishlistById(@Param('id') id: number) {
    return this.wishlistsService.getWishlistById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  editWishlistById(
    @Param('id') id: number,
    @Body() updateWishlistDto: UpdateWishlistDto,
    @AuthUser() user: User,
  ) {
    const userId = user.id;
    return this.wishlistsService.editWishlist(id, updateWishlistDto, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteWishlistById(@Param('id') id: number, @AuthUser() user: User) {
    const userId = user.id;
    return this.wishlistsService.deleteWishlist(id, userId);
  }
}
