import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import {sign} from 'hono/jwt';  

const userRouter = new Hono<{
  Bindings:{
    DATABASE_URL: string;
    JWT_SECRET: string;
  }
}>()


userRouter.post('/signup', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  
  const body = await c.req.json();

  try{
    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        password: body.password,
      }
    });

    const jwt = await sign({ id: user.id}, c.env.JWT_SECRET);

    c.header('Authorization', `${jwt}`)

    return c.json({ message: 'Signup successful', token: jwt });
  }
  catch(e){
    c.status(403);
    return c.json({
      message: e
    });
  }


})

userRouter.post('/signin', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const body = await c.req.json();

  try{
    const user = await prisma.user.findFirst({
        where: {
        email: body.email,
        password: body.password
        }
    });

    if(!user){
        c.status(403);
        return c.json({
            message: "user doesn't exist"
        });
    }

    const jwt = await sign({id: user.id},c.env.JWT_SECRET);

    c.header('Authorization', `${jwt}`);

    return c.json({ message: 'Signin successful', token: jwt });
  }
  catch(e){
    c.status(411);
    return c.json({message: "Some error occured: wrong creds"});
  }

})

export default userRouter;


