/**
 * @jest-environment node
 */

import assert           from 'node:assert';
import db               from '@/lib/db/duty';
import resolver         from '@/app/api/graphql/resolver';
import { when }         from 'jest-when';
import { err, ok }      from 'neverthrow';
import { GraphQLError } from 'graphql';

jest.mock('../../../lib/db/duty');

const dbMocked = jest.mocked(db, { shallow: false });

describe('Duty resolver', () => {
	const id   = '230bd56d-a777-4799-a863-72876d2375bb';
	const name = 'Duty 1';

	afterEach(() => jest.clearAllMocks());

	describe('read duties', () => {
		it('gets empty duties', async () => {
			const EXPECTED_RESPONSE = [] as Array<Duty>;

			dbMocked.getDuties.mockResolvedValue(ok(EXPECTED_RESPONSE));

			const duties = await resolver.Query.duties();

			expect(duties).toEqual(EXPECTED_RESPONSE);
		});

		it('gets all duties', async () => {
			let EXPECTED_RESPONSE = [{ id: 'a33de6b9-480d-4b57-a56d-5159adb7a80f', name: 'Duty 1' },
			                         { id: 'efc5f7cf-aed1-4fad-ba87-41d8b3f21e38', name: 'Duty 2' },
			                         { id: '128ee80e-b48a-468c-98e1-8f109b957188', name: 'Duty 3' }] as Array<Duty>;

			dbMocked.getDuties.mockResolvedValue(ok(EXPECTED_RESPONSE));

			const duties = await resolver.Query.duties();

			expect(duties).toEqual<Array<Duty>>(EXPECTED_RESPONSE);
		});

		it('can properly handle database failure when getting all duties', async () => {
			dbMocked.getDuties.mockResolvedValue(err(new GraphQLError('Unknown error', {
				extensions: { code: 'INTERNAL_SERVER_ERROR' }
			})));

			const duties = await resolver.Query.duties();

			assert(duties instanceof GraphQLError); // to narrow down the Typescript type
			expect(duties.message).toEqual('Unknown error');
			expect(duties.extensions.code).toEqual('INTERNAL_SERVER_ERROR');
		});
	});

	describe('create duty', () => {
		it('failed on empty name', async () => {
			const duty = await resolver.Mutation.createDuty(null, { name: '' });

			expect(dbMocked.isExist).not.toHaveBeenCalled();
			expect(dbMocked.createDuty).not.toHaveBeenCalled();

			assert(duty instanceof GraphQLError); // to narrow down the Typescript type
			expect(duty.message).toEqual('Invalid user input');
			expect(duty.extensions.code).toEqual('BAD_USER_INPUT');
		});

		it('failed on duplicate duty name', async () => {
			dbMocked.isExist.mockResolvedValue(ok(true));

			const duty = await resolver.Mutation.createDuty(null, { name });

			expect(dbMocked.isExist).toHaveBeenCalledTimes(1);
			expect(dbMocked.isExist).toHaveBeenCalledWith({ name });
			expect(dbMocked.createDuty).not.toHaveBeenCalled();

			assert(duty instanceof GraphQLError); // to narrow down the Typescript type
			expect(duty.message).toEqual('Duty already existed');
			expect(duty.extensions.code).toEqual('BAD_USER_INPUT');
		});

		it('can properly handle database failure when checking for existing duty', async () => {
			dbMocked.isExist.mockResolvedValue(err(new GraphQLError('Unknown error', {
				extensions: { code: 'INTERNAL_SERVER_ERROR' }
			})));

			const duty = await resolver.Mutation.createDuty(null, { name });

			expect(dbMocked.isExist).toHaveBeenCalledTimes(1);
			expect(dbMocked.isExist).toHaveBeenCalledWith({ name });
			expect(dbMocked.createDuty).not.toHaveBeenCalled();

			assert(duty instanceof GraphQLError); // to narrow down the Typescript type
			expect(duty.message).toEqual('Unknown error');
			expect(duty.extensions.code).toEqual('INTERNAL_SERVER_ERROR');
		});

		it('success on non-existing duty', async () => {
			dbMocked.isExist.mockResolvedValue(ok(false));
			dbMocked.createDuty.mockResolvedValue(ok({ id, name }));

			const duty = await resolver.Mutation.createDuty(null, { name });

			expect(dbMocked.isExist).toHaveBeenCalledTimes(1);
			expect(dbMocked.isExist).toHaveBeenCalledWith({ name });
			expect(dbMocked.createDuty).toHaveBeenCalledTimes(1);

			expect(duty).toEqual<Duty>({ id, name });
		});

		it('can properly handle database failure when creating a new duty', async () => {
			dbMocked.isExist.mockResolvedValue(ok(false));
			dbMocked.createDuty.mockResolvedValue(err(new GraphQLError('Unknown error', {
				extensions: { code: 'INTERNAL_SERVER_ERROR' }
			})));

			const duty = await resolver.Mutation.createDuty(null, { name });

			expect(dbMocked.isExist).toHaveBeenCalledTimes(1);
			expect(dbMocked.isExist).toHaveBeenCalledWith({ name });
			expect(dbMocked.createDuty).toHaveBeenCalledTimes(1);

			assert(duty instanceof GraphQLError); // to narrow down the Typescript type
			expect(duty.message).toEqual('Unknown error');
			expect(duty.extensions.code).toEqual('INTERNAL_SERVER_ERROR');
		});
	});

	describe('update duty', () => {
		const newDutyName = 'Duty 2';

		it('failed on empty id', async () => {
			const duty = await resolver.Mutation.updateDuty(null, { id: '', name: newDutyName });

			expect(dbMocked.isExist).not.toHaveBeenCalled();
			expect(dbMocked.updateDuty).not.toHaveBeenCalled();

			assert(duty instanceof GraphQLError); // to narrow down the Typescript type
			expect(duty.message).toEqual('Invalid user input');
			expect(duty.extensions.code).toEqual('BAD_USER_INPUT');
		});

		it('failed on empty name', async () => {
			const duty = await resolver.Mutation.updateDuty(null, { id, name: '' });

			expect(dbMocked.isExist).not.toHaveBeenCalled();
			expect(dbMocked.updateDuty).not.toHaveBeenCalled();

			assert(duty instanceof GraphQLError); // to narrow down the Typescript type
			expect(duty.message).toEqual('Invalid user input');
			expect(duty.extensions.code).toEqual('BAD_USER_INPUT');
		});

		it('failed on empty id and empty name', async () => {
			const duty = await resolver.Mutation.updateDuty(null, { id: '', name: '' });

			expect(dbMocked.isExist).not.toHaveBeenCalled();
			expect(dbMocked.updateDuty).not.toHaveBeenCalled();

			assert(duty instanceof GraphQLError); // to narrow down the Typescript type
			expect(duty.message).toEqual('Invalid user input');
			expect(duty.extensions.code).toEqual('BAD_USER_INPUT');
		});

		it('failed on non-existing duty', async () => {
			when(dbMocked.isExist).calledWith({ id }).mockResolvedValue(ok(false));
			when(dbMocked.isExist).calledWith({ name }).mockResolvedValue(ok(true));

			const duty = await resolver.Mutation.updateDuty(null, { id, name });

			expect(dbMocked.isExist).toHaveBeenCalledTimes(2);
			expect(dbMocked.isExist).toHaveBeenNthCalledWith(1, { id });
			expect(dbMocked.isExist).toHaveBeenNthCalledWith(2, { name });
			expect(dbMocked.updateDuty).not.toHaveBeenCalled();

			assert(duty instanceof GraphQLError); // to narrow down the Typescript type
			expect(duty.message).toEqual('Duty not found');
			expect(duty.extensions.code).toEqual('BAD_USER_INPUT');
		});

		it('can properly handle database failure when checking for existing duty', async () => {
			when(dbMocked.isExist).calledWith({ id }).mockResolvedValue(err(new GraphQLError('Unknown error', {
				extensions: { code: 'INTERNAL_SERVER_ERROR' }
			})));
			when(dbMocked.isExist).calledWith({ name }).mockResolvedValue(ok(true));

			const duty = await resolver.Mutation.updateDuty(null, { id, name });

			expect(dbMocked.isExist).toHaveBeenCalledTimes(2);
			expect(dbMocked.isExist).toHaveBeenNthCalledWith(1, { id });
			expect(dbMocked.isExist).toHaveBeenNthCalledWith(2, { name });
			expect(dbMocked.updateDuty).not.toHaveBeenCalled();

			assert(duty instanceof GraphQLError); // to narrow down the Typescript type
			expect(duty.message).toEqual('Unknown error');
			expect(duty.extensions.code).toEqual('INTERNAL_SERVER_ERROR');
		});

		it('failed on duplicate duty name', async () => {
			when(dbMocked.isExist).calledWith({ id }).mockResolvedValue(ok(true));
			when(dbMocked.isExist).calledWith({ name }).mockResolvedValue(ok(true));

			const duty = await resolver.Mutation.updateDuty(null, { id, name });

			expect(dbMocked.isExist).toHaveBeenCalledTimes(2);
			expect(dbMocked.isExist).toHaveBeenNthCalledWith(1, { id });
			expect(dbMocked.isExist).toHaveBeenNthCalledWith(2, { name });
			expect(dbMocked.updateDuty).not.toHaveBeenCalled();

			assert(duty instanceof GraphQLError); // to narrow down the Typescript type
			expect(duty.message).toEqual(`Duty's name already exist`);
			expect(duty.extensions.code).toEqual('BAD_USER_INPUT');
		});

		it('can properly handle database failure when checking for duplicate duty name', async () => {
			when(dbMocked.isExist).calledWith({ id }).mockResolvedValue(ok(true));
			when(dbMocked.isExist).calledWith({ name }).mockResolvedValue(err(new GraphQLError('Unknown error', {
				extensions: { code: 'INTERNAL_SERVER_ERROR' }
			})));

			const duty = await resolver.Mutation.updateDuty(null, { id, name });

			expect(dbMocked.isExist).toHaveBeenCalledTimes(2);
			expect(dbMocked.isExist).toHaveBeenNthCalledWith(1, { id });
			expect(dbMocked.isExist).toHaveBeenNthCalledWith(2, { name });
			expect(dbMocked.updateDuty).not.toHaveBeenCalled();

			assert(duty instanceof GraphQLError); // to narrow down the Typescript type
			expect(duty.message).toEqual('Unknown error');
			expect(duty.extensions.code).toEqual('INTERNAL_SERVER_ERROR');
		});

		it('success on existing duty', async () => {
			when(dbMocked.isExist).calledWith({ id }).mockResolvedValue(ok(true));
			when(dbMocked.isExist).calledWith({ name: newDutyName }).mockResolvedValue(ok(false));
			dbMocked.updateDuty.mockResolvedValue(ok({ id, name: newDutyName }));

			const duty = await resolver.Mutation.updateDuty(null, { id, name: newDutyName });

			expect(dbMocked.isExist).toHaveBeenCalledTimes(2);
			expect(dbMocked.isExist).toHaveBeenNthCalledWith(1, { id });
			expect(dbMocked.isExist).toHaveBeenNthCalledWith(2, { name: newDutyName });
			expect(dbMocked.updateDuty).toHaveBeenCalledTimes(1);

			expect(duty).toEqual<Duty>({ id, name: newDutyName });
		});

		it(`can properly handle database failure when updating existing duty's name`, async () => {
			when(dbMocked.isExist).calledWith({ id }).mockResolvedValue(ok(true));
			when(dbMocked.isExist).calledWith({ name: newDutyName }).mockResolvedValue(ok(false));
			dbMocked.updateDuty.mockResolvedValue(err(new GraphQLError('Unknown error', {
				extensions: { code: 'INTERNAL_SERVER_ERROR' }
			})));

			const duty = await resolver.Mutation.updateDuty(null, { id, name: newDutyName });

			expect(dbMocked.isExist).toHaveBeenCalledTimes(2);
			expect(dbMocked.isExist).toHaveBeenNthCalledWith(1, { id });
			expect(dbMocked.isExist).toHaveBeenNthCalledWith(2, { name: newDutyName });
			expect(dbMocked.updateDuty).toHaveBeenCalledTimes(1);

			assert(duty instanceof GraphQLError); // to narrow down the Typescript type
			expect(duty.message).toEqual('Unknown error');
			expect(duty.extensions.code).toEqual('INTERNAL_SERVER_ERROR');
		});
	});

	describe('delete duty', () => {
		it('failed on empty id', async () => {
			const duty = await resolver.Mutation.deleteDuty(null, { id: '' });

			expect(dbMocked.isExist).not.toHaveBeenCalled();
			expect(dbMocked.deleteDuty).not.toHaveBeenCalled();

			assert(duty instanceof GraphQLError); // to narrow down the Typescript type
			expect(duty.message).toEqual('Invalid user input');
			expect(duty.extensions.code).toEqual('BAD_USER_INPUT');
		});

		it('failed on non-existing duty', async () => {
			dbMocked.isExist.mockResolvedValue(ok(false));

			const duty = await resolver.Mutation.deleteDuty(null, { id: '123' });

			expect(dbMocked.isExist).toHaveBeenCalledTimes(1);
			expect(dbMocked.isExist).toHaveBeenCalledWith({ id: '123' });
			expect(dbMocked.deleteDuty).not.toHaveBeenCalled();

			assert(duty instanceof GraphQLError); // to narrow down the Typescript type
			expect(duty.message).toEqual('Duty not found');
			expect(duty.extensions.code).toEqual('BAD_USER_INPUT');
		});

		it('can properly handle database failure when checking for existing duty', async () => {
			dbMocked.isExist.mockResolvedValue(err(new GraphQLError('Unknown error', {
				extensions: { code: 'INTERNAL_SERVER_ERROR' }
			})));

			const duty = await resolver.Mutation.deleteDuty(null, { id });

			expect(dbMocked.isExist).toHaveBeenCalledTimes(1);
			expect(dbMocked.isExist).toHaveBeenCalledWith({ id });
			expect(dbMocked.deleteDuty).not.toHaveBeenCalled();

			assert(duty instanceof GraphQLError); // to narrow down the Typescript type
			expect(duty.message).toEqual('Unknown error');
			expect(duty.extensions.code).toEqual('INTERNAL_SERVER_ERROR');
		});

		it('success on existing duty', async () => {
			dbMocked.isExist.mockResolvedValue(ok(true));
			dbMocked.deleteDuty.mockResolvedValue(ok({ id, name }));

			const duty = await resolver.Mutation.deleteDuty(null, { id });

			expect(dbMocked.isExist).toHaveBeenCalledTimes(1);
			expect(dbMocked.isExist).toHaveBeenCalledWith({ id });
			expect(dbMocked.deleteDuty).toHaveBeenCalledTimes(1);

			expect(duty).toEqual<Duty>({ id, name });
		});

		it('can properly handle database failure when deleting duty', async () => {
			dbMocked.isExist.mockResolvedValue(ok(true));
			dbMocked.deleteDuty.mockResolvedValue(err(new GraphQLError('Unknown error', {
				extensions: { code: 'INTERNAL_SERVER_ERROR' }
			})));

			const duty = await resolver.Mutation.deleteDuty(null, { id });

			expect(dbMocked.isExist).toHaveBeenCalledTimes(1);
			expect(dbMocked.isExist).toHaveBeenCalledWith({ id });
			expect(dbMocked.deleteDuty).toHaveBeenCalledTimes(1);

			assert(duty instanceof GraphQLError); // to narrow down the Typescript type
			expect(duty.message).toEqual('Unknown error');
			expect(duty.extensions.code).toEqual('INTERNAL_SERVER_ERROR');
		});
	});
});