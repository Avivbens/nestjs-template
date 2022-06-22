import { IndexDescription } from 'mongodb'

export const USER_INDEXES: IndexDescription[] = [
    { key: { email: 1 }, unique: true },

    { key: { username: 1 }, unique: false },
    { key: { companyId: 1 }, unique: false },
    { key: { password: 1 }, unique: false },
    { key: { isAdmin: 1 }, unique: false },
]
