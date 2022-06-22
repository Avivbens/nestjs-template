import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { DbModule } from './common/db/db.module'
import { selectEnv } from './common/env'
import { UsersModule } from './user/users.module'
import { RxRetryModule } from 'rx-retry'
import { WHITELIST_HTTP_CODES } from './common/config/consts'

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: selectEnv(),
            isGlobal: true,
        }),
        DbModule.forRoot(),
        UsersModule.forRoot(),

        AuthModule,

        RxRetryModule.register(
            {
                backoffWithRandom: true,
                timeoutTime: 1000 * 60 * 3,
                retryStrategy: {
                    initialInterval: 1000,
                    maxRetries: 5,
                    maxInterval: 8000,
                    shouldRetry: (error) => {
                        const shouldRetry: boolean =
                            error?.response?.status &&
                            WHITELIST_HTTP_CODES.includes(
                                error?.response?.status,
                            )
                        return shouldRetry
                    },
                },
            },
            true,
        ),
    ],
})
export class AppModule {}
