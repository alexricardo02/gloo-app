import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Verhindert mehrfache Instanzen des Prisma-Clients während der Entwicklung
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Initialisierung mit expliziter Log-Ausgabe für das Terminal
const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function POST(req: Request) {
  try {
    // 1. Daten aus dem Request extrahieren
    const body = await req.json();
    const { firstName, lastName, email, password, dob } = body;

    // Validierung: Sind alle Felder da?
    if (!firstName || !lastName || !email || !password || !dob) {
      return NextResponse.json(
        { error: "Alle Felder müssen ausgefüllt sein." },
        { status: 400 }
      );
    }

    console.log(`Versuche User zu registrieren: ${email}`);

    // 2. Prüfen, ob die E-Mail bereits existiert
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Diese E-Mail-Adresse wird bereits verwendet." },
        { status: 400 }
      );
    }

    // 3. Passwort verschlüsseln (Hashing)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. User in der Datenbank anlegen
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        dob: new Date(dob),
      },
    });

    console.log("User erfolgreich erstellt:", newUser.id);

    // 5. Erfolgsantwort senden
    return NextResponse.json(
      { 
        message: "Registrierung erfolgreich!", 
        userId: newUser.id 
      }, 
      { status: 201 }
    );

  } catch (error: any) {
    // Detailliertes Error-Logging im VS Code Terminal
    console.error("KRITISCHER FEHLER IN DER API ROUTE:", error);

    // Falls es ein spezieller Prisma-Verbindungsfehler ist
    if (error.code === 'P1001') {
      return NextResponse.json(
        { error: "Datenbank-Server ist nicht erreichbar. Prüfe deine DATABASE_URL." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Interner Server-Fehler: " + (error.message || "Unbekannter Fehler") },
      { status: 500 }
    );
  }
}