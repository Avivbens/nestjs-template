import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
    IsBoolean,
    IsMongoId,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator'
import { ObjectId } from 'mongodb'
import { UserLimitsEdit } from './edit-admin-user.dto'

export class NewUserDto {
    @ApiProperty({ example: 'username' })
    @IsString()
    @IsNotEmpty()
    username: string

    @ApiProperty({ example: 'email@google.com' })
    @IsString()
    @IsNotEmpty()
    email: string

    @ApiProperty({ example: '123456' })
    @IsString()
    @IsNotEmpty()
    password: string

    @ApiProperty({ example: '053-3344556' })
    @IsString()
    @IsNotEmpty()
    phoneNumber: string

    @ApiProperty({ example: false })
    @IsBoolean()
    @IsOptional()
    isAdmin?: boolean

    @ApiProperty({ example: '62a8982996f4494e1f628592' })
    @IsString()
    @IsMongoId()
    @IsNotEmpty()
    companyId: string
}

export interface NewUser extends NewUserDto {
    createdAt: Date
}

export class UserLimitsDto {
    @IsOptional()
    @IsNumber()
    queryLimit?: number

    @IsOptional()
    @IsBoolean()
    passSingleLogin?: boolean
}

export class UserDto extends NewUserDto {
    @IsMongoId()
    @IsNotEmpty()
    _id: string | ObjectId

    @Type(() => UserLimitsDto)
    @ValidateNested()
    @IsOptional()
    userLimits?: UserLimitsDto

    @IsNumber()
    @IsNotEmpty()
    iat: number

    userPreferences: any
}

export interface User extends UserDto {}

export interface UpdateUser extends Omit<UserDto, 'userLimits'> {
    userLimits?: UserLimitsEdit[]
}
