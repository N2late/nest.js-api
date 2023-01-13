import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';

@UseGuards(JwtGuard) // This decorator will make sure that the JwtGuard is applied to all the routes in this controller.
@Controller('users')
export class UserController {
  @Get('me')
  getMe(@GetUser() user: User) {
    // @GetUser() is a custom decorator that we created in src\auth\decorator\get-user.decorator.ts; it will return the user object from the request object and assign it to the user variable in this method.
    return user;
  }
}
