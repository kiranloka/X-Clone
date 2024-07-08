import { prismaClient } from "../../clients/db";
import UserService from "../../services/user";
import { User } from "@prisma/client";
import { GraphqlContext } from "../../interfaces";
import { redisClient } from "../../clients/redis";

const queries = {
  verifyGoogleToken: async (parent: any, { token }: { token: string }) => {
    const resultToken = await UserService.verifyGoogleAuthToken(token);
    return resultToken;
  },
  getCurrentUser: async (parent: any, args: any, ctx: GraphqlContext) => {
    const id = ctx.user?.id;
    if (!id) return null;

    const user = await UserService.getUserById(id);
    return user;
  },
  getUserById: async (
    parent: any,
    { id }: { id: string },
    ctx: GraphqlContext
  ) => {
    UserService.getUserById(id);
  },
};

const extraResolvers = {
  User: {
    tweets: (parent: User) =>
      prismaClient.tweet.findMany({ where: { author: { id: parent.id } } }),
    followers: async (parent: User) => {
      const result = await prismaClient.follows.findMany({
        where: { following: { id: parent.id } },
        include: {
          follower: true,
        },
      });
      return result.map((el) => el.follower);
    },
    following: async (parent: User) => {
      const result = await prismaClient.follows.findMany({
        where: { follower: { id: parent.id } },
        include: {
          following: true,
        },
      });
      return result.map((el) => el.following);
    },
    recommendedUser: async (parent: User, _: any, ctx: GraphqlContext) => {
      if (!ctx.user) return [];
      const cachedValue = await redisClient.get(
        `RECOMMENDED_USERS:${ctx.user.id}`
      );
      if (cachedValue) {
        console.log("Cache Found!");
        return JSON.parse(cachedValue);
      }
      const myFollowing = await prismaClient.follows.findMany({
        where: {
          follower: { id: ctx.user.id },
        },
        include: {
          following: {
            include: { follower: { include: { following: true } } },
          },
        },
      });
      const user: User[] = [];

      for (const following of myFollowing) {
        for (const followingOfFollowedUser of following.following.follower) {
          if (
            followingOfFollowedUser.following.id != ctx.user.id &&
            myFollowing.findIndex(
              (e) => e?.followingId === followingOfFollowedUser.following.id
            ) < 0
          ) {
            user.push(followingOfFollowedUser.following);
          }
        }
      }

      console.log("Cache Not Found");
      await redisClient.set(
        `RECOMMENDED_USERS:${ctx.user.id}`,
        JSON.stringify(user)
      );
      return user;
    },
  },
};

const mutations = {
  followUser: async (
    parent: any,
    { to }: { to: string },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user || !ctx.user.id) throw new Error("Unauthenticated");
    await UserService.followUser(ctx.user.id, to);
    await redisClient.del(`RECOMMENDED_USERS:${ctx.user.id}`);
    return true;
  },
  unfollowUser: async (
    parent: any,
    { to }: { to: string },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user || !ctx.user.id) throw new Error("Unauthenticated!");
    await UserService.unfollowUser(ctx.user.id, to);
    await redisClient.del(`RECOMMENDED_USERS:${ctx.user.id}`);
    return true;
  },
};
export const resolvers = { queries, extraResolvers, mutations };
