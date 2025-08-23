import * as z from "zod";

export default function errorHandler(err: unknown) {
  const error = err as { message: string; status: number };
  let message = error.message || "Internal Server Error";
  let status = error.status || 500;

  if (error instanceof z.ZodError) {
    message = error.issues.map((issue) => issue.message).join(", ");
    status = 400;
  }

  return Response.json({ message: message }, { status: status });
}
