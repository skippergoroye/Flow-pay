import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.userService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userService.createWithWallet({
      ...dto,
      password: hashedPassword,
    });

    const token = this.generateToken(user.id, user.email);
    return { user, token };
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user.id, user.email);
    return { user, token };
  }

  private generateToken(userId: string, email: string) {
    return this.jwtService.sign({ sub: userId, email });
  }

  async validateUser(userId: string) {
    return this.userService.findById(userId);
  }
}