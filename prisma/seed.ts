import { Gender } from '@prisma/client'
import { prisma } from '../lib/prisma'

// Test groups data
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
      description: "We are 4 friends looking for a cool pre-party in Mainz! Bring your own beer.",
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
      description: "Wiesbaden girls ready to hit the clubs later. Looking for a fun pre-party to start the night.",
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
      description: "Frankfurt massive! Heading to a techno rave later, who wants to join us for drinks before?",
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
];

// Static data for bars and clubs in Mainz
const VENUES = [
  {
    name: "Schon Schon",
    type: "CLUB",
    latitude: 50.0015,
    longitude: 8.2587
  },
  {
    name: "KUZ",
    type: "CLUB",
    latitude: 49.9947,
    longitude: 8.2787
  },
  {
    name: "Alexander the Great",
    type: "BAR",
    latitude: 49.9984,
    longitude: 8.2713
  },
  {
    name: "Irish Pub Mainz",
    type: "BAR",
    latitude: 49.9986,
    longitude: 8.2700
  },
  {
    name: "Eisgrub-Brau",
    type: "BAR",
    latitude: 49.9953,
    longitude: 8.2709
  }
];

async function main() {
  console.log('Starting Groups seeding...');

  for (const data of GROUPS) {
    // 1. Upsert user
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {
        username: data.username,
        name: data.name,
        isVerified: true,
      },
      create: {
        email: data.email,
        username: data.username,
        name: data.name,
        // bearer:disable javascript_lang_hardcoded_secret
        password: 'hashedpassword123',
        birthDate: data.birthDate,
        isGuest: false,
        isVerified: true, 
      },
    });

    // 2. Upsert group
    await prisma.group.upsert({
      where: { userId: user.id },
      update: {
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

    console.log(`  Saved: ${data.name} - ${data.group.photos.length} photos`);
  }

  console.log('Starting Venues seeding (Bars & Clubs)...');
  for (const venue of VENUES) {
    const existingVenue = await prisma.venue.findFirst({
      where: { name: venue.name }
    });
    
    if (existingVenue) {
      await prisma.venue.update({
        where: { id: existingVenue.id },
        data: venue
      });
    } else {
      await prisma.venue.create({
        data: venue
      });
    }
    console.log(`  Saved venue: ${venue.name}`);
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });