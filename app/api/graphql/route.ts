import { ApolloServer }                    from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { NextRequest }                     from 'next/server';
import typeDefs                            from '@/app/api/graphql/schema.graphql';
import resolvers                           from '@/app/api/graphql/resolver';

const server = new ApolloServer({
	                                resolvers,
	                                typeDefs,
	                                formatError: (formattedError, error) => {
		                                if (process.env.NODE_ENV === 'development')
			                                return formattedError;
		                                else {
			                                const { message, extensions } = formattedError;
			                                return { message, extensions }; // only passed necessary error information to the front-end; filter out all possible sensitive information
		                                }
	                                }
                                });

const handler = startServerAndCreateNextHandler<NextRequest>(server, {
	context: async req => ({ req })
});

export { handler as GET, handler as POST };