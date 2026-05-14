import { Gender } from '@prisma/client'
import { prisma } from '../lib/prisma'

async function main() {
  console.log('🌱 Iniciando el seeding de la base de datos...');

  // --- GRUPO 1: Muy cerca (Mainz Center - Aprox 2km) ---
  const user1 = await prisma.user.upsert({
    where: { email: 'party1@test.com' },
    update: {},
    create: {
      email: 'party1@test.com',
      username: 'mainz_crew',
      name: 'Mainz Party Animals',
      password: 'hashedpassword123',
      birthDate: new Date('2000-01-01'),
      isGuest: false,
      group: {
        create: {
          membersCount: 4,
          gender: Gender.MIXED,
          ageMin: 20,
          ageMax: 26,
          searchGender: Gender.ANY,
          description: "We are 4 friends looking for a cool pre-party in Mainz! Bring your own beer 🍻",
          latitude: 49.9920, 
          longitude: 8.2700,
          photos: ["https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000&auto=format&fit=crop"],
          instagram: ["mainz_party"],
        }
      }
    },
  });

  // --- GRUPO 2: Distancia media (Wiesbaden - Aprox 12km) ---
  const user2 = await prisma.user.upsert({
    where: { email: 'girlsnight@test.com' },
    update: {},
    create: {
      email: 'girlsnight@test.com',
      username: 'wiesbaden_girls',
      name: 'Girls Night Out',
      password: 'hashedpassword123',
      birthDate: new Date('2001-05-15'),
      isGuest: false,
      group: {
        create: {
          membersCount: 3,
          gender: Gender.FEMALE,
          ageMin: 21,
          ageMax: 24,
          searchGender: Gender.MALE,
          description: "Wiesbaden girls ready to hit the clubs later. Looking for a fun pre-party to start the night ✨",
          latitude: 50.0825, 
          longitude: 8.2400,
          photos: ["https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1000&auto=format&fit=crop"],
          instagram: ["wiesbaden_girls"],
        }
      }
    },
  });

  // --- GRUPO 3: Más lejos (Frankfurt - Aprox 35km) ---
  const user3 = await prisma.user.upsert({
    where: { email: 'techno@test.com' },
    update: {},
    create: {
      email: 'techno@test.com',
      username: 'techno_bros',
      name: 'Techno Bros',
      password: 'hashedpassword123',
      birthDate: new Date('1998-10-20'),
      isGuest: false,
      group: {
        create: {
          membersCount: 5,
          gender: Gender.MALE,
          ageMin: 23,
          ageMax: 29,
          searchGender: Gender.ANY,
          description: "Frankfurt massive! Heading to a techno rave later, who wants to join us for drinks before? 🎵🔊",
          latitude: 50.1109, 
          longitude: 8.6821,
          photos: ["https://images.unsplash.com/photo-1574406280735-351fc1a7c5e0?q=80&w=1000&auto=format&fit=crop"],
          instagram: ["techno_bros"],
        }
      }
    },
  });

  console.log('✅ Seeding completado con 3 grupos de prueba.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });