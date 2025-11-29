import prisma from './prismaClient.js';

const notes = [
  {
    content: 'Пастаяў у чарзе — падумаў пра жыццё. Нармальна, спакойна.',
    author: 'Андрэй Карповіч'
  },
  {
    content: 'Запісаў, каб не забыць. Потым забыў, дзе запісаў.',
    author: 'Вераніка Лявонава'
  },
  {
    content: 'Выпіў гарбаты — нібыта ўсё вырашылася само.',
    author: 'Раман Шупляк'
  }
];
//delete tables db
(async () => {
  try {
    // for (const note of notes) {
    //   await prisma.note.create({ data: note });
    // }
    await prisma.note.deleteMany({});
    await prisma.user.deleteMany({});

    console.log('Seed finished');
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
