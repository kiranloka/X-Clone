import { Tweet } from "@prisma/client";
import { GraphqlContext } from "../../interfaces";
import TweetService, { CreateTweetPayload } from "../../services/tweet";
import UserService from "../../services/user";

const queries = {
  getAllTweets: () => TweetService.getAllTweets(),
};

const mutations = {
  createTweet: async (
    parent: any,
    { payload }: { payload: CreateTweetPayload },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user) throw new Error("User not authenticated!");
    const tweet = await TweetService.createTweet({
      ...payload,
      userId: ctx.user.id,
    });
    return tweet;
  },
};

const extraResolvers = {
  Tweet: {
    author: (parent: Tweet) => UserService.getUserById(parent.authorId),
  },
};

export const resolvers = { mutations, extraResolvers, queries };
