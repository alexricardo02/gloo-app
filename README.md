This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.




LUKAS, LUCA, DAS IST FÜR EUCH:



### 1. Repository klonen
Zuerst das Repo auf deinen Rechner laden:
```bash
git clone [https://github.com/alexricardo02/gloo-app.git]
cd [PROJEKT_ORDNER]
```

2. Abhängigkeiten installieren
Installiere alle notwendigen Node.js-Pakete:

```bash
npm install
```
3. Umgebungsvariablen (.env) einrichten
Erstelle deine lokale .env-Datei basierend auf unserer Vorlage. Ändere die Zugangsdaten nicht, damit sie mit Docker kompatibel bleiben:

```bash
cp .env.example .env
```
4. Datenbank mit Docker starten
Stelle sicher, dass Docker Desktop läuft. Dieser Befehl startet unsere PostgreSQL-Datenbank im Hintergrund:

```bash
docker-compose up -d
```
5. Datenbank-Schema synchronisieren
Damit deine lokale Datenbank die richtigen Tabellen (User, Group, etc.) hat, führen wir Prisma aus:

```bash
npx prisma db push
```
6. App starten
Jetzt kannst du die Anwendung im Development-Modus starten:

```bash
npm run dev
```
Die App ist nun unter http://localhost:3000 erreichbar. ✨

🛠 Wichtige Hinweise:
CI/CD: Wir haben einen GitHub-Workflow eingerichtet. Bevor du einen Pull Request (PR) erstellst, stelle sicher, dass dein Code fehlerfrei baut (npm run build).

Datenbank: Falls du die Datenbank stoppen möchtest, nutze docker-compose down. Deine Daten bleiben dank der Docker-Volumes erhalten.