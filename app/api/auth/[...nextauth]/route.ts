import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Daten unvollständig");
        }

        // 1. User in der Datenbank suchen
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error("Kein Nutzer mit dieser Email gefunden");
        }

        // 2. Passwort prüfen
        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error("Falsches Passwort");
        }

        // 3. User-Objekt zurückgeben (wird in der Session gespeichert)
        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
        };
      }
    })
  ],
  session: {
    strategy: "jwt", // Wir nutzen JSON Web Tokens für die Session
  },
  pages: {
    signIn: "/login", // Wo ist deine Login-Seite?
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };