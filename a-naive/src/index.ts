import { GraphQLServer } from "graphql-yoga";
import {
  makeSchema,
  queryType,
  objectType,
  idArg,
  mutationType,
  stringArg,
} from "nexus";
import { MongoClient, ObjectId, Collection } from "mongodb";

const client = new MongoClient(
  "mongodb://prisma:prisma@localhost:27017/admin",
  { useNewUrlParser: true },
);

var userCollection: Collection<any>;

const User = objectType({
  name: "User",
  definition(t) {
    t.id("id");
    t.string("name");
  },
});

const Query = queryType({
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
    });

    t.int("userCount", async () => await userCollection.countDocuments({}));
  },
});

const Mutation = mutationType({
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
    });
  },
});

const schema = makeSchema({
  types: [Query, Mutation, User],

  outputs: {
    schema: __dirname + "/generated/schema.graphql",
    typegen: __dirname + "/generated/nexus.ts",
  },
});

const server = new GraphQLServer({ schema });

client.connect().then(() => {
  userCollection = client.db("demo_dev").collection("User");
  server.start(() => console.log(`Server running on http://localhost:4000`));
});
