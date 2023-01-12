import {
  IsEmail,
  IsNotEmpty,
  IsString,
} from 'class-validator';

/* This class is a DTO (Data Transfer Object) that is used to validate the data that is sent to the
server when a user logs in. */
export class AuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
