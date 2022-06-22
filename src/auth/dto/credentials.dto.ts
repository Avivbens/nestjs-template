import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class Credentials {
    @ApiProperty({ example: 'aviv.benshahar@gmail.com', required: true })
    @IsString()
    @IsNotEmpty()
    email: string

    @ApiProperty({ example: 'Aa123456', required: true })
    @IsString()
    @IsNotEmpty()
    password: string
}
