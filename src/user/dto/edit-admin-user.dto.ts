import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
    IsOptional,
    IsString,
    IsBoolean,
    ValidateNested,
    IsEnum,
} from 'class-validator'

export class UserAdminEditDto {
    @ApiProperty({ example: 'username' })
    @IsOptional()
    @IsString()
    username?: string

    @ApiProperty({ example: 'email@google.com' })
    @IsOptional()
    @IsString()
    email?: string

    @ApiProperty({ example: '123456' })
    @IsOptional()
    @IsString()
    phoneNumber?: string

    @ApiProperty({ example: false })
    @IsOptional()
    @IsBoolean()
    isAdmin?: boolean

    @IsOptional()
    @Type(() => UserLimitsEdit)
    @ValidateNested({ each: true })
    userLimits?: { key: string; value: boolean }[]
}

export interface UserAdminEdit extends UserAdminEditDto {}

export enum UserLimitsEditKeys {
    SINGLE_LOGIN = 'passSingleLogin',
}

export class UserLimitsEdit {
    @IsEnum(UserLimitsEditKeys)
    key: string

    @IsBoolean()
    value: boolean
}
