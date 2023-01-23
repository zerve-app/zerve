import { router, publicProcedure, protectedProcedure } from "../trpc";
import z from "zod";
import { prisma } from "../../db/client";

export const authRouter = router({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
  setUserName: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      await prisma.user.update({
        data: { name: input },
        where: {
          id: ctx.session.user.id,
        },
      });
    }),
});
