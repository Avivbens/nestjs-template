import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsOptional } from 'class-validator'

export class GetUsersDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    searchWord: string
}
