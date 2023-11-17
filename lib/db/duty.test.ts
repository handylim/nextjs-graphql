/**
 * @jest-environment node
 */

import assert           from 'node:assert';
import pg               from 'pg';
import duty             from '@/lib/db/duty';
import { GraphQLError } from 'graphql';

jest.mock('pg', () => {
	const mockPool = { query: jest.fn() };
	return {
		Pool: jest.fn(() => mockPool)
	};
});

const pgMocked   = jest.mocked(pg, { shallow: false });
const poolMocked = new pgMocked.Pool({});

describe('Duty database', () => {
	const id   = '3c649136-a832-4f13-a526-edeb27ab6299';
	const name = 'Duty 1';

	beforeEach(() => {
		jest.spyOn(console, 'info').mockImplementation(() => {});
		jest.spyOn(console, 'error').mockImplementation(() => {});
	});
	afterEach(() => jest.clearAllMocks());

	describe('isExist', () => {
		it('returns true for existing duty', async () => {
			const mock = jest.spyOn(poolMocked, 'query');
			mock.mockImplementation(() => Promise.resolve({
				                                              rows: [{ exists: true }]
			                                              }));

			const result = await duty.isExist({ id });

			assert(result.isOk());
			expect(result.value).toBe(true);
		});

		it('returns false for non-existing duty', async () => {
			const mock = jest.spyOn(poolMocked, 'query');
			mock.mockImplementation(() => Promise.resolve({
				                                              rows: [{ exists: false }]
			                                              }));

			const result = await duty.isExist({ name });

			assert(result.isOk());
			expect(result.value).toBe(false);
		});

		describe('can properly handle database failure to check for existence of a duty', () => {
			it('reject with an Error instance', async () => {
				const mock = jest.spyOn(poolMocked, 'query');
				mock.mockImplementation(() => Promise.reject(new Error('Error: Database failure')));

				const result = await duty.isExist({ id });

				assert(!result.isOk());
				expect(result.error).toBeInstanceOf(GraphQLError);
				expect(result.error.message).toEqual('Internal server error');
				expect(result.error.extensions.code).toEqual('INTERNAL_SERVER_ERROR');
			});

			it('reject with a non-Error instance', async () => {
				const mock = jest.spyOn(poolMocked, 'query');
				mock.mockImplementation(() => Promise.reject());

				const result = await duty.isExist({ id });

				assert(!result.isOk());
				expect(result.error).toBeInstanceOf(GraphQLError);
				expect(result.error.message).toEqual('Unknown error');
				expect(result.error.extensions.code).toEqual('INTERNAL_SERVER_ERROR');
			});
		});
	});

	describe('getDuties', () => {
		it('returns empty array when there is no duty in the database', async () => {
			const mock = jest.spyOn(poolMocked, 'query');
			mock.mockImplementation(() => Promise.resolve({ rows: [] }));

			const result = await duty.getDuties();

			assert(result.isOk());
			expect(result.value).toStrictEqual([]);
		});

		it('returns an array of Duty when there are duties in the database', async () => {
			const DUTIES = [{ id, name }];
			const mock   = jest.spyOn(poolMocked, 'query');
			mock.mockImplementation(() => Promise.resolve({ rows: DUTIES }));

			const result = await duty.getDuties();

			assert(result.isOk());
			expect(result.value).toStrictEqual(DUTIES);
		});

		describe('can properly handle database failure to get all duties', () => {
			it('reject with an Error instance', async () => {
				const mock = jest.spyOn(poolMocked, 'query');
				mock.mockImplementation(() => Promise.reject(new Error('Error: Database failure')));

				const result = await duty.getDuties();

				assert(!result.isOk());
				expect(result.error).toBeInstanceOf(GraphQLError);
				expect(result.error.message).toEqual('Internal server error');
				expect(result.error.extensions.code).toEqual('INTERNAL_SERVER_ERROR');
			});

			it('reject with a non-Error instance', async () => {
				const mock = jest.spyOn(poolMocked, 'query');
				mock.mockImplementation(() => Promise.reject());

				const result = await duty.getDuties();

				assert(!result.isOk());
				expect(result.error).toBeInstanceOf(GraphQLError);
				expect(result.error.message).toEqual('Unknown error');
				expect(result.error.extensions.code).toEqual('INTERNAL_SERVER_ERROR');
			});
		});
	});

	describe('createDuty', () => {
		it('returns a newly created duty upon successful creation', async () => {
			const DUTY = { id, name };
			const mock = jest.spyOn(poolMocked, 'query');
			mock.mockImplementation(() => Promise.resolve({ rows: [DUTY] }));

			const result = await duty.createDuty(id, name);

			assert(result.isOk());
			expect(result.value).toStrictEqual(DUTY);
		});

		describe('can properly handle database failure upon failing to create duty', () => {
			it('reject with an Error instance', async () => {
				const mock = jest.spyOn(poolMocked, 'query');
				mock.mockImplementation(() => Promise.reject(new Error('Error: Database failure')));

				const result = await duty.createDuty(id, name);

				assert(!result.isOk());
				expect(result.error).toBeInstanceOf(GraphQLError);
				expect(result.error.message).toEqual('Internal server error');
				expect(result.error.extensions.code).toEqual('INTERNAL_SERVER_ERROR');
			});

			it('reject with a non-Error instance', async () => {
				const mock = jest.spyOn(poolMocked, 'query');
				mock.mockImplementation(() => Promise.reject());

				const result = await duty.createDuty(id, name);

				assert(!result.isOk());
				expect(result.error).toBeInstanceOf(GraphQLError);
				expect(result.error.message).toEqual('Unknown error');
				expect(result.error.extensions.code).toEqual('INTERNAL_SERVER_ERROR');
			});
		});
	});

	describe('updateDuty', () => {
		it('returns a newly updated duty upon successful update', async () => {
			const DUTY = { id, name };
			const mock = jest.spyOn(poolMocked, 'query');
			mock.mockImplementation(() => Promise.resolve({ rows: [DUTY] }));

			const result = await duty.updateDuty(id, name);

			assert(result.isOk());
			expect(result.value).toStrictEqual(DUTY);
		});

		describe('can properly handle database failure upon failing to update duty', () => {
			it('reject with an Error instance', async () => {
				const mock = jest.spyOn(poolMocked, 'query');
				mock.mockImplementation(() => Promise.reject(new Error('Error: Database failure')));

				const result = await duty.updateDuty(id, name);

				assert(!result.isOk());
				expect(result.error).toBeInstanceOf(GraphQLError);
				expect(result.error.message).toEqual('Internal server error');
				expect(result.error.extensions.code).toEqual('INTERNAL_SERVER_ERROR');
			});

			it('reject with a non-Error instance', async () => {
				const mock = jest.spyOn(poolMocked, 'query');
				mock.mockImplementation(() => Promise.reject());

				const result = await duty.updateDuty(id, name);

				assert(!result.isOk());
				expect(result.error).toBeInstanceOf(GraphQLError);
				expect(result.error.message).toEqual('Unknown error');
				expect(result.error.extensions.code).toEqual('INTERNAL_SERVER_ERROR');
			});
		});
	});

	describe('deleteDuty', () => {
		it('returns a deleted duty upon successful deletion', async () => {
			const DUTY = { id, name };
			const mock = jest.spyOn(poolMocked, 'query');
			mock.mockImplementation(() => Promise.resolve({ rows: [DUTY] }));

			const result = await duty.deleteDuty(id);

			assert(result.isOk());
			expect(result.value).toStrictEqual(DUTY);
		});

		describe('can properly handle database failure upon failing to delete duty', () => {
			it('reject with an Error instance', async () => {
				const mock = jest.spyOn(poolMocked, 'query');
				mock.mockImplementation(() => Promise.reject(new Error('Error: Database failure')));

				const result = await duty.deleteDuty(id);

				assert(!result.isOk());
				expect(result.error).toBeInstanceOf(GraphQLError);
				expect(result.error.message).toEqual('Internal server error');
				expect(result.error.extensions.code).toEqual('INTERNAL_SERVER_ERROR');
			});

			it('reject with a non-Error instance', async () => {
				const mock = jest.spyOn(poolMocked, 'query');
				mock.mockImplementation(() => Promise.reject());

				const result = await duty.deleteDuty(id);

				assert(!result.isOk());
				expect(result.error).toBeInstanceOf(GraphQLError);
				expect(result.error.message).toEqual('Unknown error');
				expect(result.error.extensions.code).toEqual('INTERNAL_SERVER_ERROR');
			});
		});
	});
});