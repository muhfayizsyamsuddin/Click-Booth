import { UserModel } from "@/db/models/UserModel";
import { comparePassword } from "@/helpers/bcrypt";
import errorHandler from "@/helpers/errHandler";
import { signToken } from "@/helpers/jwt";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;
    if (!email) {
      throw {
        message: "Email is required",
        status: 400,
      };
    }

    if (!password) {
      throw {
        message: "Password is required",
        status: 400,
      };
    }

    const user = await UserModel.findUserByEmail(email);
    if (!user) {
      throw {
        message: "User not found",
        status: 404,
      };
    }

    const isPasswordValid = comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw {
        message: "Invalid password",
        status: 401,
      };
    }

    const token = signToken({
      id: user._id.toString(),
      email: user.email,
    });

    const cookieStore = await cookies();
    cookieStore.set("access_token", token);

    return Response.json({
      message: "Login successful",
      status: 200,
      access_token: token,
    });
  } catch (error) {
    return errorHandler(error);
  }
}
