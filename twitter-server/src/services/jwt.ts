import { User } from "@prisma/client";

import JWT from "jsonwebtoken";
import { JWTUser } from "../interfaces";

const SECRET = "afdkjask";
class JWTService {
  public static async GenerateTokenForUser(user: User) {
    const payload = {
      id: user?.id,
      email: user?.email,
    };
    const token = JWT.sign(payload, SECRET);
    return token;
  }

  public static decodeToken(token: string) {
    try {
      return JWT.verify(token, SECRET) as JWTUser;
    } catch (error) {
      return null;
    }
  }
}

export default JWTService;
