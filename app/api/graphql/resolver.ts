import db               from '@/lib/db/duty';
import { GraphQLError } from 'graphql';
import { ulid }         from 'ulid';
import { Result }       from 'neverthrow';

export default {
	Query   : {
		duties: async (): Promise<Array<Duty> | GraphQLError> => {
			const result = await db.getDuties();
			if (result.isOk())
				return result.value;
			else
				return result.error;
		}
	},
	Mutation: {
		createDuty: async (_: any, args: { name: string }): Promise<Duty | GraphQLError> => {
			if (args.name === '')
				return new GraphQLError('Invalid user input', { extensions: { code: 'BAD_USER_INPUT' } });

			const isExist = await db.isExist({ name: args.name });
			if (isExist.isOk()) {
				if (isExist.value)
					return new GraphQLError('Duty already existed', { extensions: { code: 'BAD_USER_INPUT' } });
				else {
					const result = await db.createDuty(ulid(), args.name);
					if (result.isOk())
						return result.value;
					else
						return result.error;
				}
			}
			else
				return isExist.error;
		},
		updateDuty: async (_: any, args: { id: string, name: string }): Promise<Duty | GraphQLError> => {
			if (args.id === '' || args.name === '')
				return new GraphQLError('Invalid user input', { extensions: { code: 'BAD_USER_INPUT' } });

			const isExist = Result.combine(await Promise.all([db.isExist({ id: args.id }),
			                                                  db.isExist({ name: args.name })]));
			if (isExist.isOk()) {
				if (isExist.value[0]) { // check for existing duty id
					if (isExist.value[1]) // check for duplicate name
						return new GraphQLError(`Duty's name already exist`,
						                        { extensions: { code: 'BAD_USER_INPUT' } });
					else {
						const result = await db.updateDuty(args.id, args.name);
						if (result.isOk())
							return result.value;
						else
							return result.error;
					}
				}
				else
					return new GraphQLError('Duty not found', { extensions: { code: 'BAD_USER_INPUT' } });
			}
			else
				return isExist.error;
		},
		deleteDuty: async (_: any, args: { id: string }): Promise<Duty | GraphQLError> => {
			if (args.id === '')
				return new GraphQLError('Invalid user input', { extensions: { code: 'BAD_USER_INPUT' } });

			const isExist = await db.isExist({ id: args.id });
			if (isExist.isOk()) {
				if (isExist.value) {
					const result = await db.deleteDuty(args.id);
					if (result.isOk())
						return result.value;
					else
						return result.error;
				}
				else
					return new GraphQLError('Duty not found', { extensions: { code: 'BAD_USER_INPUT' } });
			}
			else
				return isExist.error;
		}
	}
};