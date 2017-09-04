import * as express from 'express';
import * as bodyParser from 'body-parser';
import { GraphQLSchema } from 'graphql';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';

import typeDefs from './schema';
import resolvers from './resolvers';

// Build GraphQLSchema.
const schema: GraphQLSchema = makeExecutableSchema({
	resolvers: resolvers,
	typeDefs: typeDefs,
});

const PORT = 3666;
const app = express();

// bodyParser is needed just for POST.
app.use('/graphql', bodyParser.json(), graphqlExpress({ schema: schema }));
app.use('/graphiql', graphiqlExpress({endpointURL: '/graphql' }));


app.listen(PORT, () => {
	console.log(`App listening on port ${PORT}`);
});
