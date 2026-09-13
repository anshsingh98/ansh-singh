/* EDIT THIS FILE to personalize the website. Keep the same field names when adding items. */
window.siteContent = {
  site: {
    name: "Ansh Singh's Corner",
    shortName: 'AS',
    title: "Ansh Singh's Corner",
    description: "Ansh Singh's personal corner: code, culture, music, movies, and independent projects."
  },
  pageCopy: {
    homeAboutLabel: 'THE SHORT VERSION',
    homeAboutHeading: 'I make websites, listen to everything, and stay curious.',
    homeAboutFirst: "When I'm not deep in a code editor, you'll probably find me hunting for a new song, rewatching a great film, or trying to understand how something works.",
    homeAboutSecond: 'This space is part portfolio, part personal archive. A little window into what I make and what makes me, me.',
    projectsLabel: 'THE COMPANY / THE PROJECTS',
    projectsNote: 'An imaginary company. Real ideas.',
    favouritesHeading: 'Things I love.',
    favouritesIntro: 'The songs that soundtrack my days and the films I keep coming back to.',
    songsHeading: 'Every song has a place.',
    songsIntro: 'The complete list. Update the data file when a new favourite earns a spot.',
    moviesHeading: 'Stories I return to.',
    moviesIntro: 'The complete film cabinet. Add your own favourites in one editable place.',
    extraSections: []
  },
  brand: {
    companyName: 'Deepika App Developers',
    shortName: 'DAD',
    tagline: 'An imaginary company. Real ideas.',
    description: 'Deepika App Developers is Ansh Singh\'s independent creative technology company for building useful, curious, and slightly ambitious digital products.',
    ownerLabel: 'Founder & owner',
    founded: '2026',
    companyEmail: 'hello@deepikaappdevelopers.dev'
  },
  profile: {
    name: 'Ansh',
    fullName: 'Ansh Singh',
    role: 'Developer, collector of good things',
    intro: 'A developer from India making useful things on the internet, and keeping a record of everything that makes life a little more interesting.',
    email: 'hello@anshsingh.dev',
    currently: 'figuring it out',
    photo: 'https://i.ibb.co/Z08Cdm1/IMG-20260711-WA0006.jpg',
    aboutHeading: 'I make websites, listen to everything, and stay curious.',
    aboutParagraphs: [
      'When I\'m not deep in a code editor, you\'ll probably find me hunting for a new song, rewatching a great film, or trying to understand how something works.',
      'This space is part portfolio, part personal archive. A little window into what I make and what makes me, me.'
    ],
    skills: [
      { title: 'Frontend development', details: 'React · JavaScript · CSS' },
      { title: 'UI & interaction design', details: 'Systems · Prototypes · Motion' },
      { title: 'Always learning', details: 'Currently: making better coffee' }
    ]
  },
  projects: [
    {
      name: 'Deep Clouds',
      category: 'Cloud platform',
      number: '01',
      description: 'A calm, simple home for files, ideas, and everything worth keeping close.',
      status: 'Concept / building',
      color: 'blue',
      link: 'https://deep-clouds.vercel.app'
    },
    {
      name: 'Deep Chats',
      category: 'Conversation app',
      number: '02',
      description: 'A focused space for conversations that go a little deeper than “hey”.',
      status: 'Concept / building',
      color: 'orange',
      link: 'https://deep-chats.vercel.app'
    },
    {
      name: 'Deep AI',
      category: 'AI experiments',
      number: '03',
      description: 'Small, thoughtful AI tools made to help people think, make, and explore.',
      status: 'Concept / building',
      color: 'green',
      link: 'https://deep-ai-dp.vercel.app'
    }
  ],
  featuredSong: { title: 'Good Days', artist: 'SZA', mood: 'soft reset' },
  songs: [
    { title: 'Good Days', artist: 'SZA', mood: 'soft reset' },
    { title: '505', artist: 'Arctic Monkeys', mood: 'late night' },
    { title: 'Kasoor', artist: 'Prateek Kuhad', mood: 'old feelings' },
    { title: 'Space Song', artist: 'Beach House', mood: 'somewhere else' },
    { title: 'Pink + White', artist: 'Frank Ocean', mood: 'golden hour' },
    { title: 'After Dark', artist: 'Mr.Kitty', mood: 'headphones on' },
    { title: 'Ilahi', artist: 'Arijit Singh', mood: 'go somewhere' },
    { title: 'Sweet Disposition', artist: 'The Temper Trap', mood: 'wide open' },
    { title: 'Sunflower', artist: 'Post Malone', mood: 'easy days' },
    { title: 'Fix You', artist: 'Coldplay', mood: 'always works' }
  ],
  movies: [
    { title: 'Interstellar', director: 'Christopher Nolan', year: '2014', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1000&q=85' },
    { title: 'Dead Poets Society', director: 'Peter Weir', year: '1989' },
    { title: 'Wake Up Sid', director: 'Ayan Mukerji', year: '2009' },
    { title: 'Before Sunrise', director: 'Richard Linklater', year: '1995' },
    { title: 'Into the Wild', director: 'Sean Penn', year: '2007' },
    { title: 'Her', director: 'Spike Jonze', year: '2013' },
    { title: '3 Idiots', director: 'Rajkumar Hirani', year: '2009' },
    { title: 'Whiplash', director: 'Damien Chazelle', year: '2014' },
    { title: 'The Secret Life of Walter Mitty', director: 'Ben Stiller', year: '2013' },
    { title: 'Arrival', director: 'Denis Villeneuve', year: '2016' }
  ]
};
// Admin edits are stored in the shared cloud database (Firestore) and fetched at
// runtime by script.js, so changes apply for every visitor — not just this browser.
