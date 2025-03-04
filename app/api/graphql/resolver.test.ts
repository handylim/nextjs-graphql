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
	const id   = '01JMGAEX00BJQADQJW52NCFHX5';
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
			let EXPECTED_RESPONSE = [{ id: '01JMGAR1Z0E1JD2AXYX5YJ52A7', name: 'Duty 1' },
			                         { id: '01JMGB16Y0SVZ6ZBJX3XQG9FQF', name: 'Duty 2' },
			                         { id: '01JMGBABX0A4ST2YAGHYHHKVTD', name: 'Duty 3' }] as Array<Duty>;

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