import {Test} from '@nestjs/testing';
import {async} from 'rxjs';
import {AuthService} from './auth.service';
import {UsersService} from './users.service';
import {User} from "./user.entity";

describe('AuthService', () => {
    let service: AuthService;
    let fakeUsersService: Partial<UsersService>;

    beforeEach(async () => {
        // Create a fake copy of the users service
        const fakeUsersService = {
            find: () => Promise.resolve([]),
            create: (email: string, password: string) =>
                Promise.resolve({id: 1, email, password} as User),
        };

        const module = await Test.createTestingModule({
            providers: [
                AuthService,
                {provide: UsersService, useValue: fakeUsersService},
            ],
        }).compile();

        const service = module.get(AuthService);
    });

    it('can create an instance of auth service', async () => {
        expect(service).toBeDefined();
    });

    it('creates a new user with a salted and hashed password', async () => {
        const user = await service.signup('asdf@asdf.com', 'asdf');

        expect(user.password).not.toEqual('asdf');
        const [salt, hash] = user.password.split('.');
        expect(salt).toBeDefined();
        expect(hash).toBeDefined();
    });

    it('throws an error if user signs up with email that is in use', async (done) => {
        fakeUsersService.find = () => Promise.resolve([{id: 1, email: 'a', password: '1'} as User]);

        try {
            await service.signup('asdf@asdf.com', 'asdf');
        } catch (err) {
            done();
        }
    });

    it('throws if signin is called with an unused email', async (done) => {
        try {
            await service.signin('asdfkjds@fiajd.com', 'asniasj');
        } catch (err) {
            done();
        }
    });

    it('throws if an invalid password is provided', async (done) => {
        fakeUsersService.find =
            () => Promise.resolve([{email: 'asdf@asdf.com', password: 'asdf'} as User]);

        try {
            await service.signin('laslas@fklas.com', 'pasword')
        } catch (err) {
            done();
        }
    });

    it('returns a user if correct password is provided', async () => {
        fakeUsersService.find =
            () => Promise.resolve([{email: 'asdf@asdf.com', password: 'asdf'} as User]);

        const user = await service.signin('asdf@asdf.com', 'mypassword');
        expect(user).toBeDefined();
    });

    it('throws if signin is called with an unused email', async (done) => {
        try {
            await service.signin('asdk@fslkm.com', 'aosksao');
        } catch (err) {
            done();
        }
    });
});

