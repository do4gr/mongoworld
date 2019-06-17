import { GraphQLServer } from "graphql-yoga";
import {
  makeSchema,
  queryType,
  objectType,
  idArg,
  mutationType,
  stringArg,
} from "nexus";
import { MongoClient, ObjectId, Collection } from "mongodb"; //remove
// import { prismaObjectType, makePrismaSchema } from "nexus-prisma";
// import { prisma } from "./generated/prisma-client";
// import datamodelInfo from "./generated/nexus-prisma";

const client = new MongoClient( //remove
  "mongodb://prisma:prisma@localhost:27017/admin",
  { useNewUrlParser: true },
);

var userCollection: Collection<any>; //remove

const User = objectType({
  // const User = prismaObjectType({
  name: "User",
  definition(t) {
    t.id("id");
    t.string("name");
    // t.prismaFields(["id", "name"]);
  },
});

const Query = queryType({
  // const Query = prismaObjectType({
  //   name: "Query",
  definition(t) {
    t.field("user", {
      type: "User",
      nullable: true,
      args: { id: idArg() },
      resolve: async (_, args) => {
        const idFilter = { _id: new ObjectId(args.id) };
        const res = await userCollection.findOne(idFilter);

        if (res) {
          return {
            ...res,
            id: res._id,
          };
        } else return null;
      },
      // resolve: (_, args) => prisma.user({ id: args.id }),
    });

    t.int("userCount", async () => await userCollection.countDocuments({}));
    // t.int("userCount", () =>   prisma.usersConnection().aggregate().count());
  },
});

const Mutation = mutationType({
  // const Mutation = prismaObjectType({
  //   name: "Mutation",
  definition(t) {
    t.field("createUser", {
      type: "User",
      args: { name: stringArg() },
      resolve: async (_, args) => {
        const user = {
          _id: new ObjectId(),
          name: args.name,
        };

        await userCollection.insertOne(user);

        return {
          ...user,
          id: user._id.toHexString(),
        };
      },
      // resolve: (_, args) => {
      //   return prisma.createUser({ name: args.name });
      // },
    });

    t.field("updateUser", {
      type: "User",
      args: {
        id: idArg(),
        name: stringArg({ nullable: true }),
      },
      resolve: async (_, args) => {
        const idFilter = { _id: new ObjectId(args.id) };
        const oldUser = await userCollection.findOne(idFilter);

        if (oldUser) {
          const newUser = { name: args.name || oldUser.name };

          await userCollection.updateOne(idFilter, { $set: newUser });

          return {
            ...newUser,
            id: args.id,
          };
        } else return null;
      },
      // resolve: (_, args) => {
      //   return prisma.updateUser({
      //     where: { id: args.id },
      //     data: { name: args.name },
      //   });
      // },
    });
  },
});

const schema = makeSchema({
  // const schema = makePrismaSchema({
  types: [Query, Mutation, User],

  outputs: {
    schema: __dirname + "/generated/schema.graphql",
    typegen: __dirname + "/generated/nexus.ts",
  },

  // prisma: {
  //   client: prisma,
  //   datamodelInfo,
  // },
});

const server = new GraphQLServer({ schema });

client.connect().then(() => {
  userCollection = client.db("demo_dev").collection("User");
  server.start(() => console.log(`Server running on http://localhost:4000`));
});
// server.start(() => console.log(`Server running on http://localhost:4000`));
