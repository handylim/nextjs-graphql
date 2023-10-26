/**
 * @jest-environment node
 */

import db               from '@/lib/db/duty';
import resolver         from '@/app/api/graphql/resolver';
import { faker }        from '@faker-js/faker';
import { err, ok }      from 'neverthrow';
import { GraphQLError } from 'graphql';

jest.mock('../../../lib/db/duty');

const dbMocked = jest.mocked(db, { shallow: false });
describe('Duty resolver', () => {
	afterEach(() => jest.clearAllMocks());

	describe('read duties', () => {
		it('gets empty duties', async () => {
			const EXPECTED_RESPONSE = [] as Array<Duty>;

			dbMocked.getDuties.mockResolvedValue(ok(EXPECTED_RESPONSE));

			const duties = await resolver.Query.duties();

			expect(duties).toBe(EXPECTED_RESPONSE);
		});

		it('gets all duties', async () => {
			let EXPECTED_RESPONSE = [] as Array<Duty>;
			for (let i = 0; i < 3; i++)
				EXPECTED_RESPONSE.push({
					                       id  : faker.string.uuid(),
					                       name: faker.person.jobDescriptor()
				                       });

			dbMocked.getDuties.mockResolvedValue(ok(EXPECTED_RESPONSE));

			const duties = await resolver.Query.duties();

			expect(duties).toBe(EXPECTED_RESPONSE);
		});

		it('can properly handle database failure to get all duties', async () => {
			dbMocked.getDuties.mockResolvedValue(err(new GraphQLError('Unknown error', {
				extensions: { code: 'INTERNAL_SERVER_ERROR' }
			})));

			const duties = await resolver.Query.duties();

			expect(duties).toBeInstanceOf(GraphQLError);
			expect((duties as GraphQLError).extensions.code).toEqual('INTERNAL_SERVER_ERROR');
		});
	});

	describe('create duty', () => {
		it('failed on empty id', async () => {
			const [id, name] = ['', faker.person.jobDescriptor()];

			dbMocked.isExist.mockResolvedValue(ok(true));
			dbMocked.createDuty.mockResolvedValue(ok({ id, name }));

			const duty = await resolver.Mutation.createDuty(null, { id, name });

			expect(dbMocked.isExist).not.toHaveBeenCalled();
			expect(dbMocked.createDuty).not.toHaveBeenCalled();
			expect(duty).toBeInstanceOf(GraphQLError);
			expect((duty as GraphQLError).message).toEqual('Invalid user input');
			expect((duty as GraphQLError).extensions.code).toEqual('BAD_USER_INPUT');
		});

		it('failed on empty name', async () => {
			const [id, name] = [faker.string.uuid(), ''];

			dbMocked.isExist.mockResolvedValue(ok(true));
			dbMocked.createDuty.mockResolvedValue(ok({ id, name }));

			const duty = await resolver.Mutation.createDuty(null, { id, name });

			expect(dbMocked.isExist).not.toHaveBeenCalled();
			expect(dbMocked.createDuty).not.toHaveBeenCalled();
			expect(duty).toBeInstanceOf(GraphQLError);
			expect((duty as GraphQLError).message).toEqual('Invalid user input');
			expect((duty as GraphQLError).extensions.code).toEqual('BAD_USER_INPUT');
		});

		it('failed on empty id and empty name', async () => {
			const [id, name] = ['', ''];

			dbMocked.isExist.mockResolvedValue(ok(true));
			dbMocked.createDuty.mockResolvedValue(ok({ id, name }));

			const duty = await resolver.Mutation.createDuty(null, { id, name });

			expect(dbMocked.isExist).not.toHaveBeenCalled();
			expect(dbMocked.createDuty).not.toHaveBeenCalled();
			expect(duty).toBeInstanceOf(GraphQLError);
			expect((duty as GraphQLError).message).toEqual('Invalid user input');
			expect((duty as GraphQLError).extensions.code).toEqual('BAD_USER_INPUT');
		});

		it('failed on existing duty', async () => {
			const [id, name] = [faker.string.uuid(), faker.person.jobDescriptor()];

			dbMocked.isExist.mockResolvedValue(ok(true));
			dbMocked.createDuty.mockResolvedValue(ok({ id, name }));

			const duty = await resolver.Mutation.createDuty(null, { id, name });

			expect(dbMocked.isExist).toHaveBeenCalledTimes(1);
			expect(dbMocked.createDuty).not.toHaveBeenCalled();
			expect(duty).toBeInstanceOf(GraphQLError);
			expect((duty as GraphQLError).message).toEqual('Duty already existed');
			expect((duty as GraphQLError).extensions.code).toEqual('BAD_USER_INPUT');
		});

		it('can properly handle database failure to check existing duty', async () => {
			const [id, name] = [faker.string.uuid(), faker.person.jobDescriptor()];

			dbMocked.isExist.mockResolvedValue(err(new GraphQLError('Unknown error', {
				extensions: { code: 'INTERNAL_SERVER_ERROR' }
			})));
			dbMocked.createDuty.mockResolvedValue(err(new GraphQLError('Unknown error', {
				extensions: { code: 'INTERNAL_SERVER_ERROR' }
			})));

			const duty = await resolver.Mutation.createDuty(null, { id, name });

			expect(dbMocked.isExist).toHaveBeenCalledTimes(1);
			expect(dbMocked.createDuty).toHaveBeenCalledTimes(0);
			expect(duty).toBeInstanceOf(GraphQLError);
			expect((duty as GraphQLError).extensions.code).toEqual('INTERNAL_SERVER_ERROR');
		});

		it('success on non-existing duty', async () => {
			const [id, name] = [faker.string.uuid(), faker.person.jobDescriptor()];

			dbMocked.isExist.mockResolvedValue(ok(false));
			dbMocked.createDuty.mockResolvedValue(ok({ id, name }));

			const duty = await resolver.Mutation.createDuty(null, { id, name });

			expect(dbMocked.isExist).toHaveBeenCalledTimes(1);
			expect(dbMocked.createDuty).toHaveBeenCalledTimes(1);
			expect((duty as Duty)?.id).toEqual(id);
			expect((duty as Duty)?.name).toEqual(name);
		});

		it('can properly handle database failure to create duty', async () => {
			const [id, name] = [faker.string.uuid(), faker.person.jobDescriptor()];

			dbMocked.isExist.mockResolvedValue(ok(false));
			dbMocked.createDuty.mockResolvedValue(err(new GraphQLError('Unknown error', {
				extensions: { code: 'INTERNAL_SERVER_ERROR' }
			})));

			const duty = await resolver.Mutation.createDuty(null, { id, name });

			expect(dbMocked.isExist).toHaveBeenCalledTimes(1);
			expect(dbMocked.createDuty).toHaveBeenCalledTimes(1);
			expect(duty).toBeInstanceOf(GraphQLError);
			expect((duty as GraphQLError).extensions.code).toEqual('INTERNAL_SERVER_ERROR');
		});
	});

	describe('update duty', () => {
		it('failed on empty id', async () => {
			const [id, name] = ['', faker.person.jobDescriptor()];

			dbMocked.isExist.mockResolvedValue(ok(false));
			dbMocked.updateDuty.mockResolvedValue(ok({ id, name }));

			const duty = await resolver.Mutation.updateDuty(null, { id, name });

			expect(dbMocked.isExist).not.toHaveBeenCalled();
			expect(dbMocked.updateDuty).not.toHaveBeenCalled();
			expect(duty).toBeInstanceOf(GraphQLError);
			expect((duty as GraphQLError).message).toEqual('Invalid user input');
			expect((duty as GraphQLError).extensions.code).toEqual('BAD_USER_INPUT');
		});

		it('failed on empty name', async () => {
			const [id, name] = [faker.string.uuid(), ''];

			dbMocked.isExist.mockResolvedValue(ok(false));
			dbMocked.updateDuty.mockResolvedValue(ok({ id, name }));

			const duty = await resolver.Mutation.updateDuty(null, { id, name });

			expect(dbMocked.isExist).not.toHaveBeenCalled();
			expect(dbMocked.updateDuty).not.toHaveBeenCalled();
			expect(duty).toBeInstanceOf(GraphQLError);
			expect((duty as GraphQLError).message).toEqual('Invalid user input');
			expect((duty as GraphQLError).extensions.code).toEqual('BAD_USER_INPUT');
		});

		it('failed on empty id and empty name', async () => {
			const [id, name] = ['', ''];

			dbMocked.isExist.mockResolvedValue(ok(false));
			dbMocked.updateDuty.mockResolvedValue(ok({ id, name }));

			const duty = await resolver.Mutation.updateDuty(null, { id, name });

			expect(dbMocked.isExist).not.toHaveBeenCalled();
			expect(dbMocked.updateDuty).not.toHaveBeenCalled();
			expect(duty).toBeInstanceOf(GraphQLError);
			expect((duty as GraphQLError).message).toEqual('Invalid user input');
			expect((duty as GraphQLError).extensions.code).toEqual('BAD_USER_INPUT');
		});

		it('failed on non-existing duty', async () => {
			const [id, name] = [faker.string.uuid(), faker.person.jobDescriptor()];

			dbMocked.isExist.mockResolvedValue(ok(false));
			dbMocked.updateDuty.mockResolvedValue(ok({ id, name }));

			const duty = await resolver.Mutation.updateDuty(null, { id, name });

			expect(dbMocked.isExist).toHaveBeenCalledTimes(1);
			expect(dbMocked.updateDuty).not.toHaveBeenCalled();
			expect(duty).toBeInstanceOf(GraphQLError);
			expect((duty as GraphQLError).message).toEqual('Duty not found');
			expect((duty as GraphQLError).extensions.code).toEqual('BAD_USER_INPUT');
		});

		it('can properly handle database failure to check existing duty', async () => {
			const [id, name] = [faker.string.uuid(), faker.person.jobDescriptor()];

			dbMocked.isExist.mockResolvedValue(err(new GraphQLError('Unknown error', {
				extensions: { code: 'INTERNAL_SERVER_ERROR' }
			})));
			dbMocked.updateDuty.mockResolvedValue(err(new GraphQLError('Unknown error', {
				extensions: { code: 'INTERNAL_SERVER_ERROR' }
			})));

			const duty = await resolver.Mutation.updateDuty(null, { id, name });

			expect(dbMocked.isExist).toHaveBeenCalledTimes(1);
			expect(dbMocked.updateDuty).toHaveBeenCalledTimes(0);
			expect(duty).toBeInstanceOf(GraphQLError);
			expect((duty as GraphQLError).extensions.code).toEqual('INTERNAL_SERVER_ERROR');
		});

		it('success on existing duty', async () => {
			const [id, name] = [faker.string.uuid(), faker.person.jobDescriptor()];

			dbMocked.isExist.mockResolvedValue(ok(true));
			dbMocked.updateDuty.mockResolvedValue(ok({ id, name }));

			const duty = await resolver.Mutation.updateDuty(null, { id, name });

			expect(dbMocked.isExist).toHaveBeenCalledTimes(1);
			expect(dbMocked.updateDuty).toHaveBeenCalledTimes(1);
			expect((duty as Duty)?.id).toEqual(id);
			expect((duty as Duty)?.name).toEqual(name);
		});

		it('can properly handle database failure to update duty', async () => {
			const [id, name] = [faker.string.uuid(), faker.person.jobDescriptor()];

			dbMocked.isExist.mockResolvedValue(ok(true));
			dbMocked.updateDuty.mockResolvedValue(err(new GraphQLError('Unknown error', {
				extensions: { code: 'INTERNAL_SERVER_ERROR' }
			})));

			const duty = await resolver.Mutation.updateDuty(null, { id, name });

			expect(dbMocked.isExist).toHaveBeenCalledTimes(1);
			expect(dbMocked.updateDuty).toHaveBeenCalledTimes(1);
			expect(duty).toBeInstanceOf(GraphQLError);
			expect((duty as GraphQLError).extensions.code).toEqual('INTERNAL_SERVER_ERROR');
		});
	});

	describe('delete duty', () => {
		it('failed on empty id', async () => {
			const id = '';

			dbMocked.isExist.mockResolvedValue(ok(false));
			dbMocked.deleteDuty.mockResolvedValue(ok({ id, name: faker.person.jobDescriptor() }));

			const duty = await resolver.Mutation.deleteDuty(null, { id });

			expect(dbMocked.isExist).not.toHaveBeenCalled();
			expect(dbMocked.deleteDuty).not.toHaveBeenCalled();
			expect(duty).toBeInstanceOf(GraphQLError);
			expect((duty as GraphQLError).message).toEqual('Invalid user input');
			expect((duty as GraphQLError).extensions.code).toEqual('BAD_USER_INPUT');
		});

		it('failed on non-existing duty', async () => {
			const id = faker.string.uuid();

			dbMocked.isExist.mockResolvedValue(ok(false));
			dbMocked.deleteDuty.mockResolvedValue(ok({ id, name: faker.person.jobDescriptor() }));

			const duty = await resolver.Mutation.deleteDuty(null, { id });

			expect(dbMocked.isExist).toHaveBeenCalledTimes(1);
			expect(dbMocked.deleteDuty).not.toHaveBeenCalled();
			expect(duty).toBeInstanceOf(GraphQLError);
			expect((duty as GraphQLError).message).toEqual('Duty not found');
			expect((duty as GraphQLError).extensions.code).toEqual('BAD_USER_INPUT');
		});

		it('can properly handle database failure to check existing duty', async () => {
			const id = faker.string.uuid();

			dbMocked.isExist.mockResolvedValue(err(new GraphQLError('Unknown error', {
				extensions: { code: 'INTERNAL_SERVER_ERROR' }
			})));
			dbMocked.deleteDuty.mockResolvedValue(err(new GraphQLError('Unknown error', {
				extensions: { code: 'INTERNAL_SERVER_ERROR' }
			})));

			const duty = await resolver.Mutation.deleteDuty(null, { id });

			expect(dbMocked.isExist).toHaveBeenCalledTimes(1);
			expect(dbMocked.deleteDuty).toHaveBeenCalledTimes(0);
			expect(duty).toBeInstanceOf(GraphQLError);
			expect((duty as GraphQLError).extensions.code).toEqual('INTERNAL_SERVER_ERROR');
		});

		it('success on existing duty', async () => {
			const [id, name] = [faker.string.uuid(), faker.person.jobDescriptor()];

			dbMocked.isExist.mockResolvedValue(ok(true));
			dbMocked.deleteDuty.mockResolvedValue(ok({ id, name }));

			const duty = await resolver.Mutation.deleteDuty(null, { id });

			expect(dbMocked.isExist).toHaveBeenCalledTimes(1);
			expect(dbMocked.deleteDuty).toHaveBeenCalledTimes(1);
			expect((duty as Duty)?.id).toEqual(id);
			expect((duty as Duty)?.name).toEqual(name);
		});

		it('can properly handle database failure to delete duty', async () => {
			const [id, name] = [faker.string.uuid(), faker.person.jobDescriptor()];

			dbMocked.isExist.mockResolvedValue(ok(true));
			dbMocked.deleteDuty.mockResolvedValue(err(new GraphQLError('Unknown error', {
				extensions: { code: 'INTERNAL_SERVER_ERROR' }
			})));

			const duty = await resolver.Mutation.deleteDuty(null, { id });

			expect(dbMocked.isExist).toHaveBeenCalledTimes(1);
			expect(dbMocked.deleteDuty).toHaveBeenCalledTimes(1);
			expect(duty).toBeInstanceOf(GraphQLError);
			expect((duty as GraphQLError).extensions.code).toEqual('INTERNAL_SERVER_ERROR');
		});
	});
});