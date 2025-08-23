import errorHandler from "@/helpers/errHandler";

const { UserModel } = require("../../../db/models/UserModel");

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await UserModel.createUser(body);

    return Response.json({
      message: "User registered successfully",
      status: 201,
    });
  } catch (error) {
    return errorHandler(error);
  }
}
