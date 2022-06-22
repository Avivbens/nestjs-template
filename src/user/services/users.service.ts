import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { Collection, Db, ObjectId } from 'mongodb'
import { NewUser, UpdateUser, User } from '../dto/user.dto'
import { hash } from 'bcrypt'
import { USER_INDEXES } from '../user.indexes'
import { UserAdminEdit, UserLimitsEdit } from '../dto/edit-admin-user.dto'
import { UserEdit } from '../dto/edit-user.dto'
import { Collections } from '../../common/db/collections'

@Injectable()
export class UsersService {
    private logger = new Logger(UsersService.name)

    private col: Collection
    constructor(db: Db) {
        this.col = db.collection(Collections.User)
    }

    onModuleInit() {
        // this.col.createIndexes(USER_INDEXES)
        this.logger.debug('Successfully set indexes')
    }

    // TODO add pagination
    /**
     * @access - admin only
     * @param searchWord - search word
     * @returns - array of users
     */
    public async getUsers(searchWord: string): Promise<User[]> {
        return this.col
            .find<User>(
                {
                    ...this._adminSearchOptions(searchWord),
                },
                { projection: { password: 0 } },
            )
            .toArray()

        // return this.col.aggregate<User>([
        //     { $match: this._adminSearchOptions(searchWord) },
        //     { $addFields: { id: { $toString: '$_id' } } },

        //     {
        //         $lookup: {
        //             from: 'filter',
        //             localField: 'id',
        //             foreignField: 'userOwnerId',
        //             as: 'filters'
        //         }
        //     },

        //     { $addFields: { filtersCount: { $size: '$filters' } } },

        //     { $project: { password: 0, id: 0, filters: 0 } },
        // ]).toArray()
    }

    /**
     * @access - system only
     * @param email - email for user
     * @returns - user object
     */
    public async getByEmail(email: string): Promise<User> {
        return this.col.findOne<User>({ email })
    }

    /**
     * @access - system only
     * @param id - user id
     * @returns - user object
     */
    public async getById(id: string): Promise<User> {
        return this.col.findOne<User>({ _id: new ObjectId(id) })
    }

    /**
     * @access - admin only
     * @param user - user object
     * @returns - user object without hashed password
     */
    public async addUser({ email, password, username, phoneNumber, companyId, isAdmin }: Partial<NewUser>) {
        const isExists: boolean = !!(await this.getByEmail(email))

        if (isExists) {
            throw new BadRequestException('User with this email already exists')
        }

        const encryptedPass = await hash(password, 10)

        const userToAdd: NewUser = {
            email,
            password: encryptedPass,
            username,
            phoneNumber,
            companyId,
            isAdmin,
            createdAt: new Date(),
        }
        return this.col.insertOne(userToAdd, { ignoreUndefined: true }).then((o) =>
            this.getById(o.insertedId.toString()).then((u) => {
                const { password, ...rest } = u
                return rest
            }),
        )
    }

    /**
     * @access - admin only
     * @param user - user object
     * @param userId - user id
     * @returns - user object without hashed password
     */
    public async updateForAdmin(user: UserAdminEdit, userId: string) {
        const userToUpdate = this._buildUpdateForAdmin(user)

        await this._protectUniqueEmail(userToUpdate, userId)

        return this.col.findOneAndUpdate(
            { _id: new ObjectId(userId) },
            { $set: userToUpdate },
            { projection: { password: 0 }, returnDocument: 'after' },
        )
    }

    /**
     * @access - public
     * @param user - user object
     * @param userId - user id
     * @returns - user object without hashed password
     */
    public async updateByUser(user: Partial<User>, userId: string) {
        const userToUpdate = this._buildUpdate(user)

        await this._protectUniqueEmail(userToUpdate, userId)

        return this.col.findOneAndUpdate(
            { _id: new ObjectId(userId) },
            { $set: userToUpdate },
            { projection: { password: 0 } },
        )
    }

    /**
     * @access - system only
     * @param userToUpdate - user object
     * @param userId - user id
     */
    private async _protectUniqueEmail(userToUpdate: UserAdminEdit | UserEdit, userId: string) {
        if (userToUpdate?.email) {
            const existsUser: User = await this.getByEmail(userToUpdate.email)
            const isRunOver: boolean = !!existsUser && existsUser?._id.toString() !== userId

            if (isRunOver) {
                throw new BadRequestException('User with this email already exists')
            }
        }
    }

    /**
     * @access - system only
     * @param userId - user id
     * @param iat - time in UNIX timestamp
     * @returns - user object without hashed password
     */
    public saveIat(userId: string, iat: number) {
        return this.col.findOneAndUpdate(
            { _id: new ObjectId(userId) },
            { $set: { iat } },
            { projection: { password: 0 } },
        )
    }

    /**
     * @access - admin only
     * @param userId - user id
     * @returns - user object without hashed password
     */
    public async deleteUser(userId: string) {
        return this.col.findOneAndDelete(
            {
                _id: new ObjectId(userId),
                isAdmin: { $exists: false } as any,
            } as User,
            { projection: { password: 0 } },
        )
    }

    /**
     * @access - system only
     * @param updates - user updates object
     * @returns - user updates object
     */
    private _buildUpdate(updates: UserEdit) {
        const updateRes: Partial<User> = {}

        updates.phoneNumber && (updateRes.phoneNumber = updates.phoneNumber)
        updates.email && (updateRes.email = updates.email)
        updates.username && (updateRes.username = updates.username)

        return updateRes
    }

    /**
     * @access - system only
     * @param updates - user updates object for admin
     * @returns - user updates object for admin
     */
    private _buildUpdateForAdmin(updates: UserAdminEdit) {
        let updateRes: Partial<UpdateUser> = {}

        updates.phoneNumber && (updateRes.phoneNumber = updates.phoneNumber)
        updates.email && (updateRes.email = updates.email)
        updates.username && (updateRes.username = updates.username)

        updates.userLimits?.length &&
            (updateRes = {
                ...updateRes,
                ...this._buildUserLimits(updates.userLimits),
            })

        return updateRes
    }

    /**
     * @access - system only
     * @param userLimits - user limits object
     * @returns - user limits object mapped
     */
    private _buildUserLimits(userLimits: UserLimitsEdit[]) {
        if (!userLimits?.length) {
            return {}
        }

        const res = userLimits.reduce((acc, { key, value }) => {
            acc[`userLimits.${key}`] = value
            return acc
        }, {})

        return res
    }

    /**
     * @access - system only
     * @param searchWord - search word
     * @returns - search regex object
     */
    private _adminSearchOptions(searchWord: string) {
        const searchOptions = {} as { $or?: any[] }

        if (searchWord) {
            searchOptions.$or = [
                { username: { $regex: searchWord, $options: 'i' } },
                { email: { $regex: searchWord, $options: 'i' } },
                { phoneNumber: { $regex: searchWord, $options: 'i' } },
            ]
        }

        return searchOptions
    }
}
