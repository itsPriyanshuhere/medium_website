import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import {sign, verify} from 'hono/jwt';  

interface PostData {
    title: string;
    content: string;
    id?: string;
  }


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

blogRouter.post('/', async (c) => {

    //@ts-ignore
    const userId = c.get('userId');

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const body = await c.req.json<PostData>();

    const post = await prisma.post.create({
        data:{
            title: body.title,
            content: body.content,
            authorId: userId as string
        }
    });
    return c.json({
        id: post.id
    });
});

blogRouter.put('/', async (c) => {
    //@ts-ignore
    const userId = c.get('userId');
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const body = await c.req.json<PostData>();

    try {
    await prisma.post.update({
        where: {
            //@ts-ignore
            id: body.id,
            authorId: userId as string
        },
        data: {
            title: body.title,
            content: body.content
        }
    });

    c.status(200);
    return c.json({
        message: 'Updated the blog'
    });
}
    catch(e){
        return c.json({
            error: e
        }, 500);
    }
});

blogRouter.get('/bulk', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const posts = await prisma.post.findMany({});
    return c.json({ posts });
});

blogRouter.get('/:id', async (c) => {
    const id = c.req.param('id');
    console.log(id);
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try{
    const post = await prisma.post.findUnique({
        where:{
            id
        },
    });

    if (!post) {
        return c.json({ error: 'Post not found' }, 500);
    }

    return c.json({post});
}
    catch(e){
        return c.json({
        error: e
        })
}

    
});



export default blogRouter;

//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjcyN2IyOWZiLTgwZDgtNDMxMy05NzZmLTNhN2U2MGNjM2MzZSJ9.c7qWet3v2bO2KQ-2JjvPYBrn0rZzOZWTYOZ5cJmCNd4
//6e1bcabf-266b-4b7f-9465-474e51970ecc