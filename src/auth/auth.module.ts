import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { JwtStrategy } from './jwt.strategy'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { AuthController } from './auth.controller'
import { ConfigService } from '@nestjs/config'
import { EnvVariables } from '../common/env'

@Module({
    imports: [
        PassportModule,
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
    providers: [AuthService, JwtStrategy],
    exports: [AuthService],
    controllers: [AuthController],
})
export class AuthModule {}
