import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Ip,
    Logger,
    Param,
    Patch,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger'
import { AdminGuard } from '../auth/admin.guard'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { UserExistsGuard } from '../auth/user-exists.guard'
import { CurrentUser } from '../common/decorators/user.decorator'
import { UsersService } from './services/users.service'
import { NewUserDto, User, UserDto } from './dto/user.dto'
import { UserAdminEditDto } from './dto/edit-admin-user.dto'
import { GetUsersDto } from './dto/get-users.dto'

@ApiTags(AdminUsersController.name)
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, UserExistsGuard, AdminGuard)
@Controller('admin/users')
export class AdminUsersController {
    private logger = new Logger(AdminUsersController.name)

    constructor(
        private readonly usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    // TODO add pagination
    @Get()
    getUsers(
        @Query() queryParams: GetUsersDto,
        @CurrentUser() user: User,
        @Ip() ip: string,
    ) {
        const { searchWord } = queryParams
        this.logger.log(
            `Searching for users with search word ${searchWord}, admin is ${user.email} - ${user._id}, ip is ${ip}`,
        )
        return this.usersService.getUsers(searchWord)
    }

    @ApiBody({ type: () => NewUserDto })
    @Post('signup')
    async signup(
        @Body() user: NewUserDto,
        @CurrentUser() currUser: User,
        @Ip() ip: string,
    ) {
        this.logger.log(
            `Signing up user ${user.email}, admin is ${currUser.email} - ${currUser._id}, ip is ${ip}`,
        )
        if (!user) {
            throw new BadRequestException()
        }

        return this.usersService.addUser(user)
    }

    @ApiParam({ name: 'id', description: 'User id' })
    @Patch(':id')
    async loginViaUser(
        @Param('id') id: string,
        @CurrentUser() adminUser: User,
        @Ip() ip: string,
    ) {
        const user = await this.usersService.getById(id)
        if (!user) {
            throw new BadRequestException('User not found')
        }
        if (user.isAdmin) {
            this.logger.warn(
                `Admin ${adminUser.email} - ${adminUser._id} tried to logged via user ${user.email} - ${id} which is admin, ip is ${ip}`,
            )
            throw new BadRequestException(
                'Admin user cannot login via another admin',
            )
        }

        const { email, phoneNumber, username, userLimits, _id } = user

        // sign as admin
        const decode = {
            email,
            phoneNumber,
            username,
            isAdmin: true,
            userLimits,
            _id,
        }
        this.logger.warn(
            `Admin ${adminUser.email} - ${adminUser._id} logged in into user: email - ${user.email}, id - ${user._id} successfully logged in, ip is ${ip}`,
        )
        return {
            access_token: this.jwtService.sign(decode),
        }
    }

    @ApiBody({ type: () => UserDto })
    @Put(':id')
    updateUserProfile(
        @Param('id') id: string,
        @Body() updatedUser: UserAdminEditDto,
        @CurrentUser() user: User,
        @Ip() ip: string,
    ) {
        this.logger.log(
            `Updating user ${id}, admin is ${user.email} - ${user._id}, ip is ${ip}`,
        )
        return this.usersService.updateForAdmin(updatedUser, id)
    }

    @Delete('delete-user/:id')
    async deleteUser(
        @Param('id') id: string,
        @CurrentUser() user: User,
        @Ip() ip: string,
    ) {
        const targetUser = await this.usersService.getById(id)
        if (targetUser?.isAdmin) {
            this.logger.warn(
                `Admin ${user.email} - ${user._id} tried to delete admin user ${targetUser.email} - ${id}, ip is ${ip}`,
            )
            throw new BadRequestException('Admin cannot be deleted')
        }

        this.logger.warn(
            `Deleting user ${id}, admin is ${user.email} - ${user._id}, ip is ${ip}`,
        )

        return this.usersService.deleteUser(id)
    }
}
