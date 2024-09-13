import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import {sign, verify} from 'hono/jwt';  


const blogRouter = new Hono<{
  Bindings:{
    DATABASE_URL: string;
    JWT_SECRET: string;
  },
  userId: 'string'
}>();

blogRouter.use('/*', async (c, next) => {

    const jwt = c.req.header('Authorization');
    if(!jwt){
        c.status(403);
        return c.json({
            error: "unauthorized"
        });
    }

    // const token = jwt.split(' ')[1];
    const payload = await verify(jwt, c.env.JWT_SECRET);
    if(!payload){
        c.status(403);
        return c.json({
            error: "unauthorized"
        });
    }

    //@ts-ignore
    c.set('userId', payload.id);
    await next();

});

blogRouter.get('blog/:id', (c) => {

    return c.text('hello');
})

blogRouter.post('blog', async(c) => {

    const body = await c.req.json();
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())   ;

    await prisma.post.create({
        data:{
            title: body.title,
            content: body.content,
            authorId: '1'
        }
    })

    return c.text('hello');
})

blogRouter.get('/signin', async(c) => {
    //@ts-ignore
    console.log(c.get('userId'));
    return c.text('working');
})

blogRouter.put('blog', (c) => {
    return c.text('hello');
})

export default blogRouter;