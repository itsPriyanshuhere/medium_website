// @ts-nocheck
import { Hono } from "hono";
import userRouter from "./routes/user";
import blogRouter from "./routes/blog";

export const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  }
}>();

// app.use('*', (c) => {
// 	const prisma = new PrismaClient({
//       datasourceUrl: c.env.DATABASE_URL,
//   }).$extends(withAccelerate());
  
//   c.set('prisma', prisma);
// })

app.route("/api/v1/user", userRouter);
app.route("/api/v1/blog", blogRouter);

export default app;