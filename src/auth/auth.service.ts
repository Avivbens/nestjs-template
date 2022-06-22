import { ForbiddenException, Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../user/services/users.service'
import { Credentials } from './dto/credentials.dto'
import { compare } from 'bcrypt'

@Injectable()
export class AuthService {
    private logger = new Logger(AuthService.name)

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    /**
     * @access - public
     * @param credentials - email and password
     * @returns - jwt token
     */
    async login(credentials: Credentials) {
        const user = await this.usersService.getByEmail(credentials.email)
        if (!user) {
            throw new ForbiddenException()
        }

        const isAuth = await compare(credentials.password, user.password)

        if (!isAuth) {
            this.logger.warn(`Invalid credentials for user ${user.email}`)
            throw new ForbiddenException()
        }

        const iat = Date.now()
        this.usersService.saveIat(user._id as string, iat)

        const { email, phoneNumber, username, isAdmin, userLimits, _id } = user

        // saved properties on JWT
        const decode = {
            email,
            phoneNumber,
            username,
            isAdmin,
            userLimits,
            _id,
            iat,
        }
        this.logger.log(`User ${user.email} successfully logged in`)
        return {
            access_token: this.jwtService.sign(decode),
        }
    }

    /**
     * @access - public
     * @returns - OK message
     */
    async logout() {
        return { msg: 'logout' }
    }
}
