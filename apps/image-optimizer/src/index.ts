import { vValidator } from "@hono/valibot-validator";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { HTTPException } from "hono/http-exception";
import { generateAvatarImage, generateImageVariants, getImageDimensions } from "./lib/image";
import { imageFormSchema } from "./schemas/image";

type Bindings = {
  IMAGE_OPTIMIZER_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>()
  .use(
    "/*",
    bearerAuth({
      verifyToken: (token, c) => {
        return token === c.env.IMAGE_OPTIMIZER_SECRET;
      },
    }),
  )

  // アバター画像
  .post("/avatar", vValidator("form", imageFormSchema), async (c) => {
    try {
      const { image } = c.req.valid("form");
      const arrayBuffer = await image.arrayBuffer();

      // オリジナル画像の縦横を取得
      const originalImageDimensions = getImageDimensions(arrayBuffer);

      const avatarImage = await generateAvatarImage(arrayBuffer, {
        originalWidth: originalImageDimensions.width,
        originalHeight: originalImageDimensions.height,
      });

      return new Response(avatarImage as BodyInit, {
        headers: {
          "Content-Type": "image/webp",
        },
      });
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }

      throw new HTTPException(500, { message: `${error}` });
    }
  })

  // 投稿画像
  .post("/image", vValidator("form", imageFormSchema), async (c) => {
    try {
      const { image } = c.req.valid("form");
      const arrayBuffer = await image.arrayBuffer();

      // オリジナル画像の縦横を取得
      const originalImageDimensions = getImageDimensions(arrayBuffer);

      const variants = await generateImageVariants(arrayBuffer, {
        originalWidth: originalImageDimensions.width,
        originalHeight: originalImageDimensions.height,
      });

      return c.json(variants);
    } catch (error) {
      console.log(error);

      if (error instanceof HTTPException) {
        throw error;
      }

      throw new HTTPException(500, { message: `${error}` });
    }
  });

export default app;

export type AppType = typeof app;
