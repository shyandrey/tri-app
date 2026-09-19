import type { Athlete } from '../../types/Athlete'

const COUNTRY_NAMES_RU: Record<string, string> = {
  AR:'Аргентина', AT:'Австрия', AU:'Австралия', BE:'Бельгия', BR:'Бразилия', CA:'Канада',
  CH:'Швейцария', CL:'Чили', CN:'Китай', CO:'Колумбия', CZ:'Чехия', DE:'Германия', DK:'Дания',
  EE:'Эстония', ES:'Испания', FI:'Финляндия', FR:'Франция', GB:'Великобритания', HR:'Хорватия',
  HU:'Венгрия', IE:'Ирландия', IL:'Израиль', IT:'Италия', JP:'Япония', LT:'Литва', LU:'Люксембург',
  LV:'Латвия', MX:'Мексика', NL:'Нидерланды', NO:'Норвегия', NZ:'Новая Зеландия', PL:'Польша',
  PT:'Португалия', RO:'Румыния', SE:'Швеция', SI:'Словения', SK:'Словакия', US:'США', ZA:'ЮАР',
}

const COUNTRY_NAMES_EN: Record<string, string> = {
  AR:'Argentina', AT:'Austria', AU:'Australia', BE:'Belgium', BR:'Brazil', CA:'Canada',
  CH:'Switzerland', CL:'Chile', CN:'China', CO:'Colombia', CZ:'Czechia', DE:'Germany', DK:'Denmark',
  EE:'Estonia', ES:'Spain', FI:'Finland', FR:'France', GB:'United Kingdom', HR:'Croatia',
  HU:'Hungary', IE:'Ireland', IL:'Israel', IT:'Italy', JP:'Japan', LT:'Lithuania', LU:'Luxembourg',
  LV:'Latvia', MX:'Mexico', NL:'Netherlands', NO:'Norway', NZ:'New Zealand', PL:'Poland',
  PT:'Portugal', RO:'Romania', SE:'Sweden', SI:'Slovenia', SK:'Slovakia', US:'United States', ZA:'South Africa',
}

const ISO3_TO_ISO2: Record<string, string> = {
  ARG:'AR', AUT:'AT', AUS:'AU', BEL:'BE', BRA:'BR', CAN:'CA', SUI:'CH', CHI:'CL', CHN:'CN',
  COL:'CO', CZE:'CZ', GER:'DE', DEN:'DK', EST:'EE', ESP:'ES', FIN:'FI', FRA:'FR', GBR:'GB',
  CRO:'HR', HUN:'HU', IRL:'IE', ISR:'IL', ITA:'IT', JPN:'JP', LTU:'LT', LUX:'LU', LAT:'LV',
  MEX:'MX', NED:'NL', NOR:'NO', NZL:'NZ', POL:'PL', POR:'PT', ROU:'RO', SWE:'SE', SLO:'SI',
  SVK:'SK', USA:'US', RSA:'ZA',
}

const ATHLETE_NAMES_RU: Record<string, string> = {
  'Justus Nieschlag':'Юстус Нишлаг',
  'Nick Thompson':'Ник Томпсон',
  'Cameron Main':'Кэмерон Мэйн',
  'Alice Alberts':'Элис Альбертс',
  'Henri Schoeman':'Анри Шуман',
  'Jannik Schaufler':'Янник Шауфлер',
  'Carlos Oliver Vives':'Карлос Оливер Вивес',
  'Dylan Magnien':'Дилан Маньен',
  'Marcel Bolbat':'Марсель Болбат',
  'Will Draper':'Уилл Дрейпер',
  'Chloe Hartnett':'Хлоя Хартнетт',
  'Danielle De Francesco':'Даниэль Де Франческо',
  'Jessica Fullagar':'Джессика Фуллагар',
  'Lisa-Maria Dornauer':'Лиза-Мария Дорнауэр',
  'Sam Laidlow':'Сэм Лэйдлоу',
}

export function localizeAthlete(athlete: Athlete): Athlete {
  const rawCode = athlete.countryCode?.trim().toUpperCase()
  const code = rawCode ? (ISO3_TO_ISO2[rawCode] ?? rawCode) : undefined
  const nameEn = athlete.nameEn ?? athlete.name
  return {
    ...athlete,
    name: athlete.name !== nameEn ? athlete.name : (ATHLETE_NAMES_RU[nameEn] ?? athlete.name),
    countryCode: code ?? athlete.countryCode,
    country: code ? (COUNTRY_NAMES_RU[code] ?? athlete.country) : athlete.country,
    countryEn: code ? (COUNTRY_NAMES_EN[code] ?? athlete.countryEn) : athlete.countryEn,
    countryCode: code ?? athlete.countryCode,
  }
}
