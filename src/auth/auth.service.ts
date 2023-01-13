import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist';
import { JwtService } from '@nestjs/jwt/dist';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async signup(dto: AuthDto) {
    // generate the password hash
    const hash = await argon.hash(dto.password);
    // save the new user
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });
      // return the saved user
      return this.signToken(user.id, user.email);
    } catch (error) {
      /* This is a check for a unique constraint violation. In this case, if the user signs up with an email already in use. Email is unique */
      if (error.code === 'P2002') {
        throw new ForbiddenException('Credentials already in use');
      }
      throw error;
    }
  }

  async signin(dto: AuthDto) {
    // find the user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    // if the user does not exist, throw an error
    if (!user) throw new ForbiddenException('Invalid credentials');

    // compare password
    const pwMatch = await argon.verify(user.hash, dto.password);
    // if the password is incorrect, throw an error
    if (!pwMatch) throw new ForbiddenException('Invalid credentials');
    // return the user

    return this.signToken(user.id, user.email);
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '1d',
      secret,
    });
    return {
      access_token: token,
    };
  }
}
