import { UserModel } from "@/db/models/UserModel";
import errorHandler from "@/helpers/errHandler";

export async function POST(req: Request) {
  console.log("=== REGISTER ROUTE HIT ===");
  try {
    const body = await req.json();
    console.log("REGISTER BODY:", body);

    const result = await UserModel.createUser(body);
    console.log("REGISTER RESULT:", result);

    return Response.json({
      message: "User registered successfully",
      status: 201,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error)
    return errorHandler(error);
  }
}
