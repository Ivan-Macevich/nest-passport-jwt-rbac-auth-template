import { ApiProperty } from '@nestjs/swagger';
import { IsPhoneNumber } from 'class-validator';

export class SignInDto {
  @ApiProperty({
    description: 'Phone number in E.164 format',
    example: '+14155552671',
    required: true,
  })
  @IsPhoneNumber()
  phoneNumber!: string;

  @ApiProperty({
    description: 'Verification code',
    example: '123456',
    required: true,
  })
  code!: string;
}
