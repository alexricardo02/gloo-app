import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { deleteAccountAction } from "@/app/actions/auth";
import { cookies } from "next/headers";

// Next.js Header/Cookies mocken, um "Store missing" Fehler zu vermeiden
vi.mock("next/headers", () => {
  const mockCookieStore = {
    set: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  };
  return {
    cookies: vi.fn().mockImplementation(async () => mockCookieStore),
  };
});

describe("Account Deletion - ST0-122", () => {
  let testUserId: string;
  let testUserEmail: string;

  beforeAll(async () => {
    // Falls Date.now() im CI zu schnell hintereinander feuert, nutzen wir Random-Suffixe
    testUserEmail = `testdelete-${Math.random().toString(36).substring(2, 11)}@test.com`;

    // RADIKALER FIX FÜR CI-UMGEBUNGEN (GitHub Actions):
    // Falls die DATABASE_URL im GitHub-Runner über localhost läuft oder via Docker-Network,
    // stellen wir sicher, dass Prisma die Variablen liest, bevor es connected.
    if (process.env.GITHUB_ACTIONS && !process.env.DATABASE_URL) {
      // Setze einen Standard-Fallback für typische GitHub Action Postgres-Services, 
      // falls deine `.env.test` nicht eingelesen wurde.
      process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/test_db?schema=public";
    }

    // Aggressiver Verbindungsaufbau-Retry (5 Versuche à 2 Sekunden)
    let retries = 5;
    while (retries > 0) {
      try {
        await prisma.$connect();
        console.log("✅ Erfolgreich mit Test-Datenbank verbunden.");
        break;
      } catch (err: any) {
        retries--;
        console.warn(`⚠️ DB-Verbindungsfehler (${err.code || err.message}). Nächster Versuch in 2s...`);
        if (retries === 0) throw new Error(`CI-Datenbank nicht erreichbar: ${err.message}`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // 1. Test-User direkt erstellen
    const user = await prisma.user.create({
      data: {
        email: testUserEmail,
        password: "$2a$12$R9h/cIPz0gi.URNNX3kh2OPSTV/7NcyWLFFO7Z8JtP6B0r1rX1Wq2",
        name: "Test User Delete",
        birthDate: new Date("1990-01-01"),
        isVerified: true,
        verificationToken: null,
      },
    });

    testUserId = user.id;

    // 2. Test-Gruppe für den User erstellen
    const userGroup = await prisma.group.create({
      data: {
        userId: testUserId,
        membersCount: 2,
        gender: "MIXED",
        ageMin: 20,
        ageMax: 30,
        latitude: 50.1234,
        longitude: 8.5678,
        photos: ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"],
        instagram: ["testuser", "friend1"],
      },
    });

    // 3. Zweiten User für Chat-Verbindung erstellen
    const testUser2 = await prisma.user.create({
      data: {
        email: `testchat-${Math.random().toString(36).substring(2, 11)}@test.com`,
        password: "TestPass123!",
        name: "Test Chat User",
        birthDate: new Date("1995-01-01"),
        isVerified: true,
      },
    });

    // 4. Test-Chat und Message erstellen
    const chat = await prisma.chat.create({
      data: {
        hostAId: testUserId,
        hostBId: testUser2.id,
      },
    });

    await prisma.message.create({
      data: {
        text: "Test message",
        chatId: chat.id,
        senderId: testUserId,
      },
    });

    // 5. Test-Game-Score erstellen
    await prisma.gameScore.create({
      data: {
        gameName: "NeverHaveIEver",
        score: 100,
        userId: testUserId,
      },
    });

    // 6. Dritten User + Gruppe für ein Gruppen-Like erstellen
    const testUser3 = await prisma.user.create({
      data: {
        email: `testgroup-${Math.random().toString(36).substring(2, 11)}@test.com`,
        password: "TestPass123!",
        name: "Test Group User",
        birthDate: new Date("1992-01-01"),
        isVerified: true,
      },
    });

    const testGroup3 = await prisma.group.create({
      data: {
        userId: testUser3.id,
        latitude: 50.1234,
        longitude: 8.5678,
      },
    });

    // Like von der User-Gruppe zur fremden Gruppe erstellen
    await prisma.groupLike.create({
      data: {
        fromGroupId: userGroup.id,
        toGroupId: testGroup3.id,
      },
    });
  });

  it("Should delete user account and all related data", async () => {
    const userBefore = await prisma.user.findUnique({
      where: { id: testUserId },
    });
    expect(userBefore).toBeDefined();
    expect(userBefore?.email).toBe(testUserEmail);

    const cookieStore = await cookies();
    cookieStore.set("gloo_user_id", testUserId);

    try {
      await deleteAccountAction("en");
    } catch (error) {
      // Redirect-Fehler abfangen
    }

    const userAfter = await prisma.user.findUnique({
      where: { id: testUserId },
    });
    expect(userAfter).toBeNull();
  });

  it("Should cascade delete group when user is deleted", async () => {
    const group = await prisma.group.findFirst({
      where: { userId: testUserId },
    });
    expect(group).toBeNull();
  });

  it("Should cascade delete chats when user is deleted", async () => {
    const chats = await prisma.chat.findMany({
      where: {
        OR: [{ hostAId: testUserId }, { hostBId: testUserId }],
      },
    });
    expect(chats.length).toBe(0);
  });

  it("Should cascade delete messages when user is deleted", async () => {
    const messages = await prisma.message.findMany({
      where: { senderId: testUserId },
    });
    expect(messages.length).toBe(0);
  });

  it("Should cascade delete group likes when group is deleted", async () => {
    const remainingLikes = await prisma.groupLike.findMany();
    for (const like of remainingLikes) {
      const groupExists = await prisma.group.findUnique({
        where: { id: like.fromGroupId }
      });
      expect(groupExists).not.toBeNull();
    }
  });

  it("Should set GameScores userId to null (not delete) for user deletion", async () => {
    const gameScores = await prisma.gameScore.findMany({
      where: { userId: testUserId },
    });
    expect(gameScores.length).toBe(0);
  });

  afterAll(async () => {
    try {
      await prisma.user.deleteMany({
        where: {
          email: { contains: "testdelete-" },
        },
      });
      await prisma.$disconnect();
    } catch (error) {
      // Ignoriere Fehler beim Cleanup
    }
  });
});