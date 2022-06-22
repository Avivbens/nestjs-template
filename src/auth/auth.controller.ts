import {
    BadRequestException,
    Body,
    Controller,
    Ip,
    Logger,
    Post,
} from '@nestjs/common'
import { ApiBody, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../common/decorators/user.decorator'
import { UserDto } from '../user/dto/user.dto'
import { AuthService } from './auth.service'
import { Credentials } from './dto/credentials.dto'

@ApiTags(AuthController.name)
@Controller('auth')
export class AuthController {
    private logger = new Logger(AuthController.name)

    constructor(private readonly authService: AuthService) {}

    @ApiBody({ type: () => Credentials })
    @Post('login')
    async login(@Body() credentials: Credentials, @Ip() ip: string) {
        this.logger.log(`Login attempt from ${ip}, email: ${credentials.email}`)
        if (!credentials) {
            throw new BadRequestException()
        }

        return this.authService.login(credentials)
    }

    @Post('logout')
    async logout(@CurrentUser() user: UserDto) {
        this.logger.debug(`User ${user.email} logout`)
        return this.authService.logout()
    }
}
