import { UserExistsGuard } from './user-exists.guard'

describe('UserExistsGuard', () => {
    const usersService = {
        getById: jest.fn(),
    }
    it('should be defined', () => {
        expect(new UserExistsGuard(usersService as any)).toBeDefined()
    })
})
