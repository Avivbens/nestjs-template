import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class UserEditDto {
    @ApiProperty({ example: 'username' })
    @IsOptional()
    @IsString()
    username?: string

    @ApiProperty({ example: 'email@google.com' })
    @IsOptional()
    @IsString()
    email?: string

    @ApiProperty({ example: '053-3344556' })
    @IsOptional()
    @IsString()
    phoneNumber?: string
}

export interface UserEdit extends UserEditDto {}
