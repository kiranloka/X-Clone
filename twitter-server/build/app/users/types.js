"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = void 0;
exports.types = `#graphql

    type User{
        id:String!
        firstName:String!
        lastName:String
        email:String!
        profileImageURL:String
        

        follwers:[User]
        following:[User]

        recommendedUsers:[User]

        tweets:[Tweet]
    }`;
