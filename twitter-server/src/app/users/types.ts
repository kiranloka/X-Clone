export const types = `#graphql

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
