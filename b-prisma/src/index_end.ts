import { GraphQLServer } from "graphql-yoga";
import { idArg, stringArg } from "nexus";
import { prismaObjectType, makePrismaSchema } from "nexus-prisma";
import { prisma } from "./generated/prisma-client";
import datamodelInfo from "./generated/nexus-prisma";

const User = prismaObjectType({
  name: "User",
  definition(t) {
    t.prismaFields(["id", "name"]);
  },
});

const Post = prismaObjectType({
  name: "Post",
  definition(t) {
    t.prismaFields(["*"]);
  },
});

const Query = prismaObjectType({
  name: "Query",
  definition(t) {
    t.field("user", {
      type: "User",
      nullable: true,
      args: { id: idArg() },
      resolve: (_, args) => prisma.user({ id: args.id }),
    });

    t.int("userCount", () =>
      prisma
        .usersConnection()
        .aggregate()
        .count(),
    );

    t.prismaFields(["posts", "post"]);
  },
});

const Mutation = prismaObjectType({
  name: "Mutation",
  definition(t) {
    t.field("createUser", {
      type: "User",
      args: { name: stringArg() },
      resolve: (_, args) => {
        return prisma.createUser({ name: args.name });
      },
    });

    t.field("updateUser", {
      type: "User",
      args: {
        id: idArg(),
        name: stringArg({ nullable: true }),
      },
      resolve: (_, args) => {
        return prisma.updateUser({
          where: { id: args.id },
          data: { name: args.name.toUpperCase() },
        });
      },
    });

    t.prismaFields(["createPost", "updatePost"]);
  },
});

const schema = makePrismaSchema({
  types: [Query, Mutation, User, Post],

  outputs: {
    schema: __dirname + "/generated/schema.graphql",
    typegen: __dirname + "/generated/nexus.ts",
  },

  prisma: {
    client: prisma,
    datamodelInfo,
  },
});

const server = new GraphQLServer({ schema });
server.start(() => console.log(`Server running on http://localhost:4000`));
