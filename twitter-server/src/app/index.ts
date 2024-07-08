import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServer } from "@apollo/server";
import bodyParser from "body-parser";
import express from "express";
import { User } from "./users";
import { GraphqlContext } from "../interfaces";
import { Tweet } from "./tweet";
import JWTService from "../services/jwt";
export async function initServer() {
  const app = express();
  app.use(bodyParser.json());
  const graphqlServer = new ApolloServer<GraphqlContext>({
    typeDefs: `
    ${User.types}
    ${Tweet.types}
    type Query{
      ${User.queries}
      ${Tweet.queries}
    }
      
    type Mutation{
      ${User.mutations}
      ${Tweet.mutations}
    }`,
    resolvers: {
      Query: {
        ...User.resolvers.queries,
        ...Tweet.resolvers.queries,
      },
      Mutations: {
        ...User.resolvers.mutations,
        ...Tweet.resolvers.mutations,
      },
      ...Tweet.resolvers.extraResolvers,
      ...User.resolvers.extraResolvers,
    },
  });
  await graphqlServer.start();
  app.use(
    "/graphql",
    expressMiddleware(graphqlServer, {
      context: async ({ req, res }) => {
        return {
          user: req.headers.authorization
            ? JWTService.decodeToken(
                req.headers.authorization.split("Bearer ")[1]
              )
            : undefined,
        };
      },
    })
  );

  return app;
}
