// Existing policy migrated verbatim; legacy no-photo entries have no dated evidence.
const MANUAL_PHOTO_NAMES = new Set(['Mika Noodt', 'Jelle Geens'])
const VERIFIED_NO_PHOTO_NAMES = new Set([
  'Andy Krueger','Matt Kerr','Brock Hoel','Matthew Richard','Blake Selm',
  'Ethan Sunseri','Federico Scarabino','James Hayes','John Killeen',
  'Tommy Doubleday','Yvan Jarrige','Albert Askengren',
  'Ari Klau','Benjamin Randall','Brad Bischoff','Brian Folts','David Reynolds',
  'Dries Matthys','Dylan Clough','Dylan Thissen','Erwan Jacobi','Florin Parfuss',
  'Fraser Minnican','Jack Sosinski','Jens Emil Nielsen','Joona Lehtonen','Stephanie Clutterbuck',
  'Abbie Sullivan','Adele Likin','Charlotte McShane','Nikita Paskiewiez','Sarah Karpinski',
  'Annette Rogers','Carolyn Olsen','Leslie Homol','Luisa Iogna Prat','Marissa Lovell',
  'Rebecca Kawaoka','Shiva Leisner','Amber Ferreira','Anne Basso','Antonia Milowsky','Jana Uderstadt',
  'Baiba Medne','Desiree Knecht','Emily Pincus','Eva Marsac','Freya Mckinley',
  'Gabriela Kaczka-Sanak','Hannah Knighton','Henrike Gueber','Jenna Campbell',
])
const PROFILE_SLUG_OVERRIDES = {
  'Magnus Ditlev': 'magnus-elbaek-ditlev', 'Daniel Bækkegård': 'daniel-baekkegard', 'Kristian Høgenhaug': 'kristian-hogenhaug',
  'Guillem Montiel': 'montiel-moreno-guillem', 'Solveig Løvseth': 'solveig-loevseth', 'Hannah Berry': 'hannah-wells',
  'Caroline Pohle': 'carolin-pohle', 'Katrine Græsbøll Christensen': 'katrine-graesboell-christensen', 'Lena Meißner': 'lena-meißner',
  'Benjamin Randall': 'ben-randall', 'Henry Räppo': 'henry-raeppo', 'Mathias Petersen': 'mathias-lyngsoe-petersen',
  'Franzi Hofmann': 'franzi-reng', 'Jamie Besse': 'jamie-albert',
}
const LOW_CONFIDENCE_NAMES = [
  'Andy Krueger','Matt Kerr','Brock Hoel','Matthew Richard','Blake Selm','Ethan Sunseri','Federico Scarabino','James Hayes','John Killeen','Tommy Doubleday','Yvan Jarrige','Ari Klau','Benjamin Randall','Brad Bischoff','Brian Folts','David Reynolds','Dries Matthys','Dylan Clough','Dylan Thissen','Erwan Jacobi','Florin Parfuss','Fraser Minnican','Jack Sosinski','Jens Emil Nielsen','Joona Lehtonen',
  'Stephanie Clutterbuck','Abbie Sullivan','Adele Likin','Charlotte McShane','Nikita Paskiewiez','Sarah Karpinski','Annette Rogers','Carolyn Olsen','Leslie Homol','Luisa Iogna Prat','Marissa Lovell','Rebecca Kawaoka','Shiva Leisner','Amber Ferreira','Anne Basso','Antonia Milowsky','Baiba Medne','Desiree Knecht','Emily Pincus','Eva Marsac','Freya Mckinley','Gabriela Kaczka-Sanak','Hannah Knighton','Henrike Gueber','Jenna Campbell',
]

export { MANUAL_PHOTO_NAMES, VERIFIED_NO_PHOTO_NAMES, PROFILE_SLUG_OVERRIDES, LOW_CONFIDENCE_NAMES }

// Aliases must include a source URL and reason; never inferred from spelling.
export const PROFILE_NAME_ALIASES = {}
export const DUAL_SOURCE_PHOTOS = [{ nameEn: "Kristian Blummenfelt", runtimePath: "/src/assets/athletes/blummenfelt.jpg", registryPath: "/athletes/kristian-blummenfelt.png" }]
