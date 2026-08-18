import type { Athlete } from '../types/Athlete'
import blummenfeltImage from '../assets/athletes/blummenfelt.jpg'
export const athletes: Athlete[] = [
  {
    id: 1,
    name: 'Кристиан Блюмменфельт',
    country: 'Норвегия',
    flag: '🇳🇴',
    discipline: 'IRONMAN / T100',
    image: blummenfeltImage,
    bio:
      'Норвежский триатлет, выступающий на олимпийской, средней и полной дистанциях.',
    achievements: [
      'Олимпийский чемпион',
      'Чемпион мира IRONMAN',
      'Чемпион мира IRONMAN 70.3',
    ],
  },
  // остальные атлеты
]