import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { User } from '../user/dto/user.dto'
import { UsersService } from '../user/services/users.service'

@Injectable()
export class UserExistsGuard implements CanActivate {
    constructor(private readonly usersService: UsersService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const user: User = context.switchToHttp().getRequest().user
        if (!user) {
            return false
        }

        const existsUser = await this.usersService.getById(user._id as string)
        if (!existsUser) {
            return false
        }

        // handle iat
        const isLoginMeetLimits = this._isLoginMeetLimits(user, existsUser)

        return isLoginMeetLimits
    }

    private _isLoginMeetLimits(signUser: User, existsUser: User): boolean {
        const { iat, isAdmin } = signUser
        const { userLimits } = existsUser

        if (isAdmin) {
            return true
        }
        if (userLimits?.passSingleLogin) {
            return true
        }

        return iat && iat === existsUser.iat
    }
}
