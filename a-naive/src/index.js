"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var graphql_yoga_1 = require("graphql-yoga");
var nexus_1 = require("nexus");
var mongodb_1 = require("mongodb");
var client = new mongodb_1.MongoClient("mongodb://prisma:prisma@localhost:27017/admin", { useNewUrlParser: true });
var userCollection;
var User = nexus_1.objectType({
    name: "User",
    definition: function (t) {
        t.id("id");
        t.string("name");
    }
});
var Query = nexus_1.queryType({
    definition: function (t) {
        var _this = this;
        t.field("user", {
            type: "User",
            nullable: true,
            args: { id: nexus_1.idArg() },
            resolve: function (_, args) { return __awaiter(_this, void 0, void 0, function () {
                var idFilter, res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            idFilter = { _id: new mongodb_1.ObjectId(args.id) };
                            return [4 /*yield*/, userCollection.findOne(idFilter)];
                        case 1:
                            res = _a.sent();
                            if (res) {
                                return [2 /*return*/, __assign({}, res, { id: res._id })];
                            }
                            else
                                return [2 /*return*/, null];
                            return [2 /*return*/];
                    }
                });
            }); }
        });
        t.int("userCount", function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, userCollection.countDocuments({})];
                case 1: return [2 /*return*/, _a.sent()];
            }
        }); }); });
    }
});
var Mutation = nexus_1.mutationType({
    definition: function (t) {
        var _this = this;
        t.field("createUser", {
            type: "User",
            args: { name: nexus_1.stringArg() },
            resolve: function (_, args) { return __awaiter(_this, void 0, void 0, function () {
                var user;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            user = {
                                _id: new mongodb_1.ObjectId(),
                                name: args.name
                            };
                            return [4 /*yield*/, userCollection.insertOne(user)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, __assign({}, user, { id: user._id.toHexString() })];
                    }
                });
            }); }
        });
        // t.field("updateUser", {
        //   type: "User",
        //   args: {
        //     id: idArg(),
        //     name: stringArg({ nullable: true }),
        //   },
        //   resolve: async (_, args) => {
        //     const idFilter = { _id: new ObjectId(args.id) };
        //     const oldUser = await userCollection.findOne(idFilter);
        //     if (oldUser) {
        //       const newUser = { name: args.name || oldUser.name };
        //       await userCollection.updateOne(idFilter, { $set: newUser });
        //       return {
        //         ...newUser,
        //         id: args.id,
        //       };
        //     } else return null;
        //   },
        // });
    }
});
var schema = nexus_1.makeSchema({
    types: [Query, Mutation, User],
    outputs: {
        schema: __dirname + "/generated/schema.graphql",
        typegen: __dirname + "/generated/nexus.ts"
    }
});
var server = new graphql_yoga_1.GraphQLServer({ schema: schema });
client.connect().then(function () {
    userCollection = client.db("demo_dev").collection("User");
    server.start(function () { return console.log("Server running on http://localhost:4000"); });
});
