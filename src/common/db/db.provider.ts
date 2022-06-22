import { Db, MongoClient } from 'mongodb'
import { ConfigService } from '@nestjs/config'
import { EnvVariables } from '../env'

export const DB_PROVIDER = {
    provide: Db,
    inject: [ConfigService],
    useFactory: async (conf: ConfigService) => {
        const con = new MongoClient(conf.get(EnvVariables.DB_HOST))
        await con.connect()
        return con.db(conf.get(EnvVariables.DB_NAME))
    },
}
