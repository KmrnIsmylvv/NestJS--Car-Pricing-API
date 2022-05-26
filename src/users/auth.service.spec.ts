import {Test} from '@nestjs/testing';
import {async} from 'rxjs';
import {AuthService} from './auth.service';
import {UsersService} from './users.service';
import {User} from "./user.entity";
import {assignToken} from "@nestjs/core/middleware/utils";

describe('AuthService', () => {
    let service: AuthService;
    let fakeUsersService: Partial<UsersService>;

    beforeEach(async () => {
        // Create a fake copy of the users service
        const users: User[] = [];
        const fakeUsersService = {
            find: (email: string) => {
                const filteredUsers = users.filter(user => user.email === email);
                return Promise.resolve(filteredUsers);
            },
            create: (email: string, password: string) => {
                const user = {id: Math.floor(Math.random() * 999999), email, password} as User;
                users.push(user);
                return Promise.resolve(user);
            }
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
        await service.signup('asdf@asdf.com', 'asdf');
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
        await service.signup('asdfjd@aoks.com', 'asjdowjd');
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

    it('throws if an invalid password is provided ', async (done) => {
        fakeUsersService.find =
            () => Promise.resolve([{email: 'asdf@asdf.com', password: 'laskls'} as User]);
        try {
            await service.signin('lakslaks@aldkla.com', 'pasoowd');
        } catch (err) {
            done();
        }
    });

    it('returns a user if correct password is provided', async (done) => {
        await service.signup('asdf@asdf.com', 'mypassword');

        const user = await service.signin('asdf@asdf.com', 'mypassword');
        expect(user).toBeDefined();
    });
});

