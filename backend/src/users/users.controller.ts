import {
  Controller,
  Get,
  Body,
  Patch,
  UseGuards,
  Param,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from './entities/user.entity';
import { AuthUser } from 'src/utils/decorators/user.decorator';
import { Wish } from 'src/wishes/entities/wish.entity';
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('all')
  getUsers(): Promise<Partial<User>[]> {
    return this.usersService.getAllUsers();
  }

  @Get('me')
  async findOne(@AuthUser() user: User): Promise<User> {
    return this.usersService.findOne({
      where: { id: user.id },
      select: {
        email: true,
        username: true,
        id: true,
        avatar: true,
        about: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
  @Patch('me')
  async updateMyProfile(
    @AuthUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const { id } = user;
    return this.usersService.updateMyProfile(id, updateUserDto);
  }
  @Get(':username')
  async findUserByUsername(@Param('username') username: string) {
    const user = await this.usersService.findByUsername(username);
    if (user && user.password) {
      delete user.password;
    }
    return user;
  }
  @Post('find')
  findUserByUsernameOrEmail(@Body('query') query: string) {
    return this.usersService.findMany(query);
  }
  @Get('me/wishes')
  async findMyWishes(@AuthUser() user: User): Promise<Wish[]> {
    const userId = user.id;
    return await this.usersService.getMyWishes(userId);
  }
  @Get(':username/wishes')
  findUserWishesByUsername(@Param('username') username: string) {
    return this.usersService.getUserWishesByUsername(username);
  }
}
