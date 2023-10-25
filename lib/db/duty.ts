import pg                  from 'pg';
import { err, ok, Result } from 'neverthrow';
import { GraphQLError }    from 'graphql';

const pool = new pg.Pool({
	                         host    : process.env.DB_HOST,
	                         port    : parseInt(process.env.DB_PORT),
	                         user    : process.env.DB_USER,
	                         password: process.env.DB_PASSWORD,
	                         database: process.env.DB_DATABASE
                         });

const isExist = async (id: string): Promise<Result<boolean, GraphQLError>> => {
	try {
		const result = await pool.query<{ exists: boolean }>('SELECT EXISTS(SELECT 1 FROM duty WHERE id = $1)', [id]);
		return ok(result.rows[0].exists);
	}
	catch (e) {
		console.error(e);
		return err(new GraphQLError(e instanceof Error ? e.message : 'Unknown error', {
			extensions: { code: 'INTERNAL_SERVER_ERROR' }
		}));
	}
}

const getDuties = async (): Promise<Result<Array<Duty>, GraphQLError>> => {
	try {
		const result = await pool.query<Duty>('SELECT * FROM duty');
		return ok(result.rows);
	}
	catch (e) {
		console.error(e);
		return err(new GraphQLError(e instanceof Error ? e.message : 'Unknown error', {
			extensions: { code: 'INTERNAL_SERVER_ERROR' }
		}));
	}
};

const createDuty = async (id: string, name: string): Promise<Result<Duty, GraphQLError>> => {
	try {
		const result = await pool.query<Duty>('INSERT INTO duty (id, name) VALUES ($1, $2) RETURNING *', [id, name]);
		const duty   = result.rows[0];
		console.info(`Created new duty with id:${duty.id} and name: ${duty.name}`);
		return ok(duty);
	}
	catch (e) {
		console.error(e);
		return err(new GraphQLError(e instanceof Error ? e.message : 'Unknown error', {
			extensions: { code: 'INTERNAL_SERVER_ERROR' }
		}));
	}
};

const updateDuty = async (id: string, name: string): Promise<Result<Duty, GraphQLError>> => {
	try {
		const result = await pool.query<Duty>('UPDATE duty SET name = $2 WHERE id = $1 RETURNING *', [id, name]);
		const duty   = result.rows[0];
		console.info(`Updated duty with id:${duty.id} with new name: ${duty.name}`);
		return ok(duty);
	}
	catch (e) {
		return err(new GraphQLError(e instanceof Error ? e.message : 'Unknown error', {
			extensions: { code: 'INTERNAL_SERVER_ERROR' }
		}));
	}
};

const deleteDuty = async (id: string): Promise<Result<Duty, GraphQLError>> => {
	try {
		const result = await pool.query<Duty>('DELETE FROM duty WHERE id = $1 RETURNING *', [id]);
		const duty   = result.rows[0];
		console.info(`Deleted duty with id:${duty.id} and name: ${duty.name}`);
		return ok(duty);
	}
	catch (e) {
		return err(new GraphQLError(e instanceof Error ? e.message : 'Unknown error', {
			extensions: { code: 'INTERNAL_SERVER_ERROR' }
		}));
	}
};

export default {
	isExist,
	getDuties,
	createDuty,
	updateDuty,
	deleteDuty
};