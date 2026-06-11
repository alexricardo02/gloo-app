import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { registerUser } from "@/app/actions/auth";
import bcrypt from "bcryptjs";

// 1. MOCK NEXT.JS COOKIES (Because we are not in a browser environment)
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

// 2. MOCK SUPABASE STORAGE (To simulate the upload without going to the internet)
vi.mock("@/lib/supabase", () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ data: { path: "profiles/test.png" }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: "https://dummy-project.supabase.co/storage/v1/object/public/gloo-images/profiles/test.png" } }),
      }),
    },
  },
}));

describe("Auth Integration Tests", () => {
  // Clear the User table before each test case to avoid email/username collisions
  beforeEach(async () => {
    // If your dummy local database is not active, Prisma will safely catch the failure.
    try {
      await prisma.user.deleteMany();
    } catch (e) {
      console.warn("Warning: Could not clear the local database (make sure Docker is running).");
    }
  });

  describe("registerUser", () => {
    it("should save a real user in PostgreSQL with the correct fields", async () => {
      const formData = new FormData();
      formData.append("name", "Alex Test");
      formData.append("email", "alex@gloo.app");
      formData.append("username", "alextest");
      formData.append("password", "GlooPassword2026!");
      formData.append("birthDate", "2000-05-15");

      const result = await registerUser(formData, "en");

      // Verify the response from the Server Action
      expect(result.success).toBe(true);
      expect(result.needsVerification).toBe(true);

      // INTEGRATION VERIFICATION: Query the real DB to check the impact of the flow
      const dbUser = await prisma.user.findUnique({
        where: { email: "alex@gloo.app" },
      });

      expect(dbUser).not.toBeNull();
      expect(dbUser?.name).toBe("Alex Test");
      expect(dbUser?.username).toBe("alextest");
      
      // Verify that the password was hashed correctly using bcrypt
      const isPasswordSecure = await bcrypt.compare("GlooPassword2026!", dbUser!.password);
      expect(isPasswordSecure).toBe(true);
    });

    it("should reject the registration if the user is under 18 years old", async () => {
      const formData = new FormData();
      formData.append("name", "Minor User");
      formData.append("email", "minor@gloo.app");
      formData.append("username", "minoruser");
      formData.append("password", "GlooPassword2026!");
      
      // Force a date that makes the user less than 18 years old relative to the current year
      formData.append("birthDate", "2015-01-01");

      const result = await registerUser(formData, "en");

      expect(result.error).toBe("You must be at least 18 years old to register.");
    });
  });
});