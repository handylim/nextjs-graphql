/**
 * @jest-environment node
 */

import pg               from 'pg';
import duty             from '@/lib/db/duty';
import { faker }        from '@faker-js/faker';
import { GraphQLError } from 'graphql/index';

jest.mock('pg', () => {
	const mockPool = { query: jest.fn() };
	return {
		Pool: jest.fn(() => mockPool)
	};
});

const pgMocked   = jest.mocked(pg, { shallow: false });
const poolMocked = new pgMocked.Pool({});

describe('Duty database', () => {
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

			const result = await duty.isExist(faker.string.uuid());

			expect(result.isOk()).toBe(true);
			if (result.isOk())
				expect(result.value).toBe(true);
		});

		it('returns false for non-existing duty', async () => {
			const mock = jest.spyOn(poolMocked, 'query');
			mock.mockImplementation(() => Promise.resolve({
				                                              rows: [{ exists: false }]
			                                              }));

			const result = await duty.isExist(faker.string.uuid());

			expect(result.isOk()).toBe(true);
			if (result.isOk())
				expect(result.value).toBe(false);
		});

		describe('can properly handle database failure to check for existence of a duty', () => {
			it('reject with an Error instance', async () => {
				const mock = jest.spyOn(poolMocked, 'query');
				mock.mockImplementation(() => Promise.reject(new Error('Error: Database failure')));

				const result = await duty.isExist(faker.string.uuid());

				expect(result.isOk()).toBe(false);
				if (!result.isOk()) {
					expect(result.error).toBeInstanceOf(GraphQLError);
					expect((result.error as GraphQLError).extensions.code).toEqual('INTERNAL_SERVER_ERROR');
				}
			});

			it('reject with a non-Error instance', async () => {
				const mock = jest.spyOn(poolMocked, 'query');
				mock.mockImplementation(() => Promise.reject());

				const result = await duty.isExist(faker.string.uuid());

				expect(result.isOk()).toBe(false);
				if (!result.isOk()) {
					expect(result.error).toBeInstanceOf(GraphQLError);
					expect((result.error as GraphQLError).extensions.code).toEqual('INTERNAL_SERVER_ERROR');
				}
			});
		});
	});

	describe('getDuties', () => {
		it('returns empty array when there is no duty in the database', async () => {
			const mock = jest.spyOn(poolMocked, 'query');
			mock.mockImplementation(() => Promise.resolve({ rows: [] }));

			const result = await duty.getDuties();

			expect(result.isOk()).toBe(true);
			if (result.isOk())
				expect(result.value).toStrictEqual([]);
		});

		it('returns an array of Duty when there are duties in the database', async () => {
			const DUTIES = [{ id: faker.string.uuid(), name: faker.person.jobDescriptor() }];
			const mock   = jest.spyOn(poolMocked, 'query');
			mock.mockImplementation(() => Promise.resolve({ rows: DUTIES }));

			const result = await duty.getDuties();

			expect(result.isOk()).toBe(true);
			if (result.isOk())
				expect(result.value).toStrictEqual(DUTIES);
		});

		describe('can properly handle database failure to get all duties', () => {
			it('reject with an Error instance', async () => {
				const mock = jest.spyOn(poolMocked, 'query');
				mock.mockImplementation(() => Promise.reject(new Error('Error: Database failure')));

				const result = await duty.getDuties();

				expect(result.isOk()).toBe(false);
				if (!result.isOk()) {
					expect(result.error).toBeInstanceOf(GraphQLError);
					expect((result.error as GraphQLError).extensions.code).toEqual('INTERNAL_SERVER_ERROR');
				}
			});

			it('reject with a non-Error instance', async () => {
				const mock = jest.spyOn(poolMocked, 'query');
				mock.mockImplementation(() => Promise.reject());

				const result = await duty.getDuties();

				expect(result.isOk()).toBe(false);
				if (!result.isOk()) {
					expect(result.error).toBeInstanceOf(GraphQLError);
					expect((result.error as GraphQLError).extensions.code).toEqual('INTERNAL_SERVER_ERROR');
				}
			});
		});
	});

	describe('createDuty', () => {
		it('returns a newly created duty upon successful creation', async () => {
			const [id, name] = [faker.string.uuid(), faker.person.jobDescriptor()];
			const DUTY       = { id, name };
			const mock       = jest.spyOn(poolMocked, 'query');
			mock.mockImplementation(() => Promise.resolve({ rows: [DUTY] }));

			const result = await duty.createDuty(id, name);

			expect(result.isOk()).toBe(true);
			if (result.isOk())
				expect(result.value).toStrictEqual(DUTY);
		});

		describe('can properly handle database failure upon failing to create duty', () => {
			it('reject with an Error instance', async () => {
				const [id, name] = [faker.string.uuid(), faker.person.jobDescriptor()];
				const mock       = jest.spyOn(poolMocked, 'query');
				mock.mockImplementation(() => Promise.reject(new Error('Error: Database failure')));

				const result = await duty.createDuty(id, name);

				expect(result.isOk()).toBe(false);
				if (!result.isOk()) {
					expect(result.error).toBeInstanceOf(GraphQLError);
					expect((result.error as GraphQLError).extensions.code).toEqual('INTERNAL_SERVER_ERROR');
				}
			});

			it('reject with a non-Error instance', async () => {
				const [id, name] = [faker.string.uuid(), faker.person.jobDescriptor()];
				const mock       = jest.spyOn(poolMocked, 'query');
				mock.mockImplementation(() => Promise.reject());

				const result = await duty.createDuty(id, name);

				expect(result.isOk()).toBe(false);
				if (!result.isOk()) {
					expect(result.error).toBeInstanceOf(GraphQLError);
					expect((result.error as GraphQLError).extensions.code).toEqual('INTERNAL_SERVER_ERROR');
				}
			});
		});
	});

	describe('updateDuty', () => {
		it('returns a newly updated duty upon successful update', async () => {
			const [id, name] = [faker.string.uuid(), faker.person.jobDescriptor()];
			const DUTY       = { id, name };
			const mock       = jest.spyOn(poolMocked, 'query');
			mock.mockImplementation(() => Promise.resolve({ rows: [DUTY] }));

			const result = await duty.updateDuty(id, name);

			expect(result.isOk()).toBe(true);
			if (result.isOk())
				expect(result.value).toStrictEqual(DUTY);
		});

		describe('can properly handle database failure upon failing to update duty', () => {
			it('reject with an Error instance', async () => {
				const [id, name] = [faker.string.uuid(), faker.person.jobDescriptor()];
				const mock       = jest.spyOn(poolMocked, 'query');
				mock.mockImplementation(() => Promise.reject(new Error('Error: Database failure')));

				const result = await duty.updateDuty(id, name);

				expect(result.isOk()).toBe(false);
				if (!result.isOk()) {
					expect(result.error).toBeInstanceOf(GraphQLError);
					expect((result.error as GraphQLError).extensions.code).toEqual('INTERNAL_SERVER_ERROR');
				}
			});

			it('reject with a non-Error instance', async () => {
				const [id, name] = [faker.string.uuid(), faker.person.jobDescriptor()];
				const mock       = jest.spyOn(poolMocked, 'query');
				mock.mockImplementation(() => Promise.reject());

				const result = await duty.updateDuty(id, name);

				expect(result.isOk()).toBe(false);
				if (!result.isOk()) {
					expect(result.error).toBeInstanceOf(GraphQLError);
					expect((result.error as GraphQLError).extensions.code).toEqual('INTERNAL_SERVER_ERROR');
				}
			});
		});
	});

	describe('deleteDuty', () => {
		it('returns a deleted duty upon successful deletion', async () => {
			const [id, name] = [faker.string.uuid(), faker.person.jobDescriptor()];
			const DUTY       = { id, name };
			const mock       = jest.spyOn(poolMocked, 'query');
			mock.mockImplementation(() => Promise.resolve({ rows: [DUTY] }));

			const result = await duty.deleteDuty(id);

			expect(result.isOk()).toBe(true);
			if (result.isOk())
				expect(result.value).toStrictEqual(DUTY);
		});

		describe('can properly handle database failure upon failing to delete duty', () => {
			it('reject with an Error instance', async () => {
				const mock = jest.spyOn(poolMocked, 'query');
				mock.mockImplementation(() => Promise.reject(new Error('Error: Database failure')));

				const result = await duty.deleteDuty(faker.string.uuid());

				expect(result.isOk()).toBe(false);
				if (!result.isOk()) {
					expect(result.error).toBeInstanceOf(GraphQLError);
					expect((result.error as GraphQLError).extensions.code).toEqual('INTERNAL_SERVER_ERROR');
				}
			});

			it('reject with a non-Error instance', async () => {
				const mock = jest.spyOn(poolMocked, 'query');
				mock.mockImplementation(() => Promise.reject());

				const result = await duty.deleteDuty(faker.string.uuid());

				expect(result.isOk()).toBe(false);
				if (!result.isOk()) {
					expect(result.error).toBeInstanceOf(GraphQLError);
					expect((result.error as GraphQLError).extensions.code).toEqual('INTERNAL_SERVER_ERROR');
				}
			});
		});
	});
});