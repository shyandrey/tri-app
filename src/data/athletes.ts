import type { Athlete } from '../types/Athlete'
import blummenfeltImage from '../assets/athletes/blummenfelt.jpg'

export const athletes: Athlete[] = [
  {
    id: 1,
    name: 'Кристиан Блюмменфельт',
    nameEn: 'Kristian Blummenfelt',
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
  {
    id: 2,
    name: 'Мартен ван Рил',
    nameEn: 'Marten Van Riel',
    country: 'Бельгия',
    flag: '🇧🇪',
    discipline: 'T100',
    bio:
      'Бельгийский профессиональный триатлет, специализирующийся на коротких и средних дистанциях.',
    achievements: [
      'Победитель международных стартов',
      'Один из ведущих атлетов серии T100',
    ],
  },
  {
    id: 3,
    name: 'Хайден Уайлд',
    nameEn: 'Hayden Wilde',
    country: 'Новая Зеландия',
    flag: '🇳🇿',
    discipline: 'T100',
    bio:
      'Новозеландский профессиональный триатлет, выступающий на олимпийской и средней дистанциях.',
    achievements: [
      'Призёр Олимпийских игр',
      'Победитель международных стартов',
      'Один из ведущих атлетов серии T100',
    ],
  },
]
