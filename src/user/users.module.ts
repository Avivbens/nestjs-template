import { DynamicModule, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { AdminUsersController } from './admin-users.controller'
import { UserController } from './user.controller'
import { UsersService } from './services/users.service'
import { EnvVariables } from '../common/env'

@Module({
    imports: [
        JwtModule.registerAsync({
            useFactory: async (configService: ConfigService) => {
                return {
                    secret: configService.get(EnvVariables.SECRET),
                    signOptions: { expiresIn: '30d' },
                }
            },
            inject: [ConfigService],
        }),
    ],
    providers: [UsersService],
    exports: [UsersService],
    controllers: [UserController, AdminUsersController],
})
export class UsersModule {
    static forRoot(): DynamicModule {
        return {
            module: UsersModule,
            global: true,
        }
    }
}
