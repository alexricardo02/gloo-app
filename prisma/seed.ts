import { Gender } from '@prisma/client'
import { prisma } from '../lib/prisma'

// Datos de los grupos de prueba
const GROUPS = [
  {
    email: 'party1@test.com',
    username: 'mainz_crew',
    name: 'Mainz Party Animals',
    birthDate: new Date('2000-01-01'),
    group: {
      membersCount: 4,
      gender: Gender.MIXED,
      ageMin: 20,
      ageMax: 26,
      searchGender: Gender.MIXED,
      description: "We are 4 friends looking for a cool pre-party in Mainz! Bring your own beer 🍻",
      latitude: 49.9920,
      longitude: 8.9400,
      photos: [
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1574406280735-351fc1a7c5e0?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1529543544282-ea669407fca3?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1000&auto=format&fit=crop",
      ],
      instagram: ["mainz_party"],
    }
  },
  {
    email: 'girlsnight@test.com',
    username: 'wiesbaden_girls',
    name: 'Girls Night Out',
    birthDate: new Date('2001-05-15'),
    group: {
      membersCount: 3,
      gender: Gender.FEMALE,
      ageMin: 21,
      ageMax: 24,
      searchGender: Gender.MALE,
      description: "Wiesbaden girls ready to hit the clubs later. Looking for a fun pre-party to start the night ✨",
      latitude: 50.0825,
      longitude: 8.2400,
      photos: [
        "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1574406280735-351fc1a7c5e0?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1529543544282-ea669407fca3?q=80&w=1000&auto=format&fit=crop",
      ],
      instagram: ["wiesbaden_girls"],
    }
  },
  {
    email: 'techno@test.com',
    username: 'techno_bros',
    name: 'Techno Bros',
    birthDate: new Date('1998-10-20'),
    group: {
      membersCount: 5,
      gender: Gender.MALE,
      ageMin: 23,
      ageMax: 29,
      searchGender: Gender.MIXED,
      description: "Frankfurt massive! Heading to a techno rave later, who wants to join us for drinks before? 🎵🔊",
      latitude: 50.1109,
      longitude: 8.6821,
      photos: [
        "https://images.unsplash.com/photo-1574406280735-351fc1a7c5e0?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1000&auto=format&fit=crop",
      ],
      instagram: ["techno_bros"],
    }
  },
]

async function main() {
  console.log('🌱 Iniciando el seeding...');

  for (const data of GROUPS) {
    // 1. Upsert del usuario — ahora el update SÍ actualiza los campos
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {
        username: data.username,
        name: data.name,
      },
      create: {
        email: data.email,
        username: data.username,
        name: data.name,
        password: 'hashedpassword123',
        birthDate: data.birthDate,
        isGuest: false,
      },
    });

    // 2. Upsert del grupo por separado — así las fotos SIEMPRE se actualizan
    // aunque el usuario ya existiera de un seed anterior.
    await prisma.group.upsert({
      where: { userId: user.id },
      update: {
        // Todo lo que queremos que se actualice en re-seeds
        photos: data.group.photos,
        description: data.group.description,
        membersCount: data.group.membersCount,
        gender: data.group.gender,
        ageMin: data.group.ageMin,
        ageMax: data.group.ageMax,
        searchGender: data.group.searchGender,
        latitude: data.group.latitude,
        longitude: data.group.longitude,
        instagram: data.group.instagram,
      },
      create: {
        userId: user.id,
        ...data.group,
      },
    });

    console.log(`  ✅ ${data.name} — ${data.group.photos.length} fotos`);
  }

  console.log('🎉 Seeding completado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });