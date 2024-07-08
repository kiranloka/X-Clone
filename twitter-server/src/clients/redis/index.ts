import Redis from "ioredis";

export const redisClient = new Redis(
  "rediss://default:Adv5AAIncDE1MGY1ZmQ5ZmI2OWE0ODA3ODIwMDcxZjFkYmRlZGFhNHAxNTYzMTM@prepared-unicorn-56313.upstash.io:6379"
);
