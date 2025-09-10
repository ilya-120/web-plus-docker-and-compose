import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Not } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { hashPassword } from 'src/utils/auth/passwords/hash';
import { Wish } from 'src/wishes/entities/wish.entity';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}
  async getAllUsers(): Promise<Partial<User>[]> {
    const users = await this.usersRepository.find({
      select: [
        'id',
        'username',
        'email',
        'about',
        'avatar',
        'createdAt',
        'updatedAt',
      ],
    });
    return users;
  }
  async findById(id: number): Promise<Partial<User>> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: [
        'id',
        'username',
        'email',
        'about',
        'avatar',
        'createdAt',
        'updatedAt',
      ],
    });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return user;
  }
  async findOne(query: object): Promise<User> {
    try {
      const user = await this.usersRepository.findOneOrFail(query);
      if (user.password) {
        delete user.password;
      }
      return user;
    } catch (error) {
      throw new NotFoundException('Пользователь не найден', error);
    }
  }
  async create(createUserDto: CreateUserDto) {
    const { password, username, email, ...rest } = createUserDto;
    const existingUser = await this.usersRepository.findOne({
      where: [{ username }, { email }],
    });
    if (existingUser) {
      if (existingUser.username === username) {
        throw new ConflictException(
          'Пользователь с таким именем уже существует',
        );
      }
      if (existingUser.email === email) {
        throw new ConflictException(
          'Пользователь с таким email уже существует',
        );
      }
    }
    const hashedPassword = await hashPassword(password);
    try {
      const userToCreate = this.usersRepository.create({
        username,
        email,
        ...rest,
        password: hashedPassword,
      });
      const savedUser = await this.usersRepository.save(userToCreate);
      if (savedUser.password) {
        delete savedUser.password;
      }
      return savedUser;
    } catch (error) {
      throw new ConflictException('Ошибка при создании пользователя', error);
    }
  }
  async findByUsername(username: string): Promise<Partial<User> | null> {
    const user = await this.usersRepository.findOne({
      where: { username },
      select: [
        'id',
        'username',
        'password',
        'email',
        'about',
        'avatar',
        'createdAt',
        'updatedAt',
      ],
    });
    return user;
  }
  async findByEmail(email: string): Promise<Partial<User> | null> {
    const user = await this.usersRepository.findOne({
      where: { email },
      select: [
        'id',
        'username',
        'email',
        'about',
        'avatar',
        'createdAt',
        'updatedAt',
      ],
    });
    return user;
  }
  async findMany(query: string) {
    return await this.usersRepository.find({
      where: [
        { username: ILike(`%${query}%`) },
        { email: ILike(`%${query}%`) },
      ],
      select: [
        'id',
        'username',
        'about',
        'avatar',
        'email',
        'createdAt',
        'updatedAt',
      ],
    });
  }
  async updateMyProfile(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    const { password, email, username } = updateUserDto;
    if (email || username) {
      const conflictUsers = await this.usersRepository.find({
        where: [
          { email, id: Not(user.id) },
          { username, id: Not(user.id) },
        ],
      });
      conflictUsers.forEach((conflictUser) => {
        if (conflictUser.email === email) {
          throw new ConflictException('Email уже используется');
        }
        if (conflictUser.username === username) {
          throw new ConflictException('Username уже используется');
        }
      });
    }
    if (password) {
      updateUserDto.password = await hashPassword(password);
    }
    const allowedUpdates = {
      username: updateUserDto.username,
      email: updateUserDto.email,
      about: updateUserDto.about,
      avatar: updateUserDto.avatar,
      password: updateUserDto.password,
    };
    const updatedUser = await this.usersRepository.save({
      ...user,
      ...allowedUpdates,
    });
    if (updatedUser.password) {
      delete updatedUser.password;
    }
    return updatedUser;
  }
  async getMyWishes(userId: number): Promise<Wish[]> {
    const currentUser = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['wishes'],
    });
    if (!currentUser) {
      throw new NotFoundException('Пользователь не найден');
    }
    return currentUser.wishes;
  }
  async getUserWishesByUsername(username: string): Promise<Wish[]> {
    const user = await this.usersRepository.findOne({
      where: { username: ILike(username) },
      relations: ['wishes'],
    });
    if (!user) {
      throw new NotFoundException('Запрашиваемый пользователь не найден');
    }
    return user.wishes;
  }
}
