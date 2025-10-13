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
        console.log("[debug]", token === c.env.IMAGE_OPTIMIZER_SECRET);
        return token === c.env.IMAGE_OPTIMIZER_SECRET;
      },
    }),
  )

  // アバター画像
  .post("/avatar", vValidator("form", imageFormSchema), async (c) => {
    try {
      const { image } = c.req.valid("form");
      const arrayBuffer = await image.arrayBuffer();

      console.log("[avatar] ok");

      // オリジナル画像の縦横を取得
      const originalImageDimensions = getImageDimensions(arrayBuffer);

      console.log("[avatar] get image dimensions");

      const avatarImage = await generateAvatarImage(arrayBuffer, {
        originalWidth: originalImageDimensions.width,
        originalHeight: originalImageDimensions.height,
      });

      console.log("[avatar] generate");

      return new Response(avatarImage as BodyInit, {
        headers: {
          "Content-Type": "image/webp",
        },
      });
    } catch (error) {
      if (error instanceof HTTPException) {
        console.error("[avatar] HTTPException", error);
        throw error;
      }

      console.error("[avatar]", error);

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
      if (error instanceof HTTPException) {
        console.error("[image] HTTPException", error);
        throw error;
      }

      console.error("[avatar]", error);

      throw new HTTPException(500, { message: `${error}` });
    }
  });

export default app;

export type AppType = typeof app;
