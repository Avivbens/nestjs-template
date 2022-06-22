import { DynamicModule, Module } from '@nestjs/common'
import { DB_PROVIDER } from './db.provider'

@Module({
    exports: [DB_PROVIDER],
    providers: [DB_PROVIDER],
})
export class DbModule {
    static forRoot(): DynamicModule {
        return {
            module: DbModule,
            global: true,
        }
    }
}
