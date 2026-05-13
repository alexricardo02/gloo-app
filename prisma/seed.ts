import { Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';

async function main() {
  console.log('Start seeding...');

  // 1. Create a hashed password for dummy users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 2. Clear existing dummy data (optional, helps to avoid duplicates on re-runs)
  await prisma.groupLike.deleteMany({});
  await prisma.group.deleteMany({});
  await prisma.user.deleteMany({
    where: { email: { endsWith: '@dummy.com' } }
  });

  // 3. Create dummy users
  const dummyUsersData = [
    { name: 'Sophie', username: 'sophie_party', email: 'sophie@dummy.com', role: Role.USER, birthDate: new Date('2000-05-15') },
    { name: 'Marcus', username: 'marcus_berlin', email: 'marcus@dummy.com', role: Role.USER, birthDate: new Date('1998-08-22') },
    { name: 'Elena', username: 'elena_vibes', email: 'elena@dummy.com', role: Role.USER, birthDate: new Date('2001-02-10') },
    { name: 'Julian', username: 'julian_weekend', email: 'julian@dummy.com', role: Role.USER, birthDate: new Date('1999-11-05') },
    { name: 'Mia', username: 'mia_club', email: 'mia@dummy.com', role: Role.USER, birthDate: new Date('2002-07-30') },
  ];

  const createdUsers = [];
  for (const userData of dummyUsersData) {
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        isGuest: false,
      }
    });
    createdUsers.push(user);
    console.log(`Created user: ${user.username}`);
  }

  // 4. Create groups for those users
  const dummyGroupsData = [
    {
      hostId: createdUsers[0].id,
      hostName: 'Sophie & The Girls',
      description: 'Looking for a fun pre-party before hitting the club! We love techno and good cocktails. 🎉',
      membersCount: 4,
      ageMin: 20,
      ageMax: 25,
      groupGender: 'Women',
      isPartyMode: false, // Pre-party
      searchAgeMin: 20,
      searchAgeMax: 28,
      seekingGender: 'Any',
      images: [
        'https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=1000&auto=format&fit=crop'
      ]
    },
    {
      hostId: createdUsers[1].id,
      hostName: 'Marcus & Co',
      description: 'Pre-drinks at our place. We have Mario Kart and cold beers. Hit us up! 🍻🎮',
      membersCount: 3,
      ageMin: 22,
      ageMax: 28,
      groupGender: 'Men',
      isPartyMode: false, // Pre-party
      searchAgeMin: 21,
      searchAgeMax: 30,
      seekingGender: 'Any',
      images: [
        'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1000&auto=format&fit=crop'
      ]
    },
    {
      hostId: createdUsers[2].id,
      hostName: 'Elena & Friends',
      description: 'Going out tonight! Searching for a cool group to join for the pre-party. 💃',
      membersCount: 2,
      ageMin: 19,
      ageMax: 23,
      groupGender: 'Women',
      isPartyMode: false, // Pre-party
      searchAgeMin: 20,
      searchAgeMax: 26,
      seekingGender: 'Mixed',
      images: [
        'https://images.unsplash.com/photo-1525268771113-32d9e9021a97?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1533174000255-14f124803ea4?q=80&w=1000&auto=format&fit=crop'
      ]
    },
    {
      hostId: createdUsers[3].id,
      hostName: 'Julian’s Squad',
      description: 'We have an Airbnb in the center. Ready for a massive pre-party. Bring good energy! 🚀',
      membersCount: 5,
      ageMin: 23,
      ageMax: 29,
      groupGender: 'Mixed',
      isPartyMode: false, // Pre-party
      searchAgeMin: 20,
      searchAgeMax: 30,
      seekingGender: 'Any',
      images: [
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=crop'
      ]
    },
    {
      hostId: createdUsers[4].id,
      hostName: 'Mia Night Out',
      description: 'Just looking for a chill pre-party before going to the techno bunker. 🖤',
      membersCount: 3,
      ageMin: 21,
      ageMax: 26,
      groupGender: 'Women',
      isPartyMode: true, // Party mode (won't show in pre-party feed by default)
      searchAgeMin: 21,
      searchAgeMax: 28,
      seekingGender: 'Any',
      images: [
        'https://images.unsplash.com/photo-1542268305-64bc0ffdd64f?q=80&w=1000&auto=format&fit=crop'
      ]
    }
  ];

  for (const groupData of dummyGroupsData) {
    const group = await prisma.group.create({
      data: groupData
    });
    console.log(`Created group: ${group.hostName}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });