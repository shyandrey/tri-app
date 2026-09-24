# Покрытие фотографиями athlete catalog

Снимок: **2026-09-23T16:15:55.763Z**. Commit: `15e60d6542e804d0ce05cfbda61de28dae5a0d5f`.

Отчёт использует сохранённый расчёт от 23 сентября 2026 года, а не новый ranking на дату оформления. Полные данные всех 1012 профилей без image, неокруглённые scores, списки исключений и SHA-256 файлов находятся в [JSON-отчёте](athlete-photo-coverage-report.json).

## Методика

Источник — runtime athlete catalog после применения registry и локализации. Без фото означает отсутствие truthy `image`. Позиция рассчитана через production `calculateAthleteRanking` и `sortAthletesByRanking` из `src/utils/athleteRanking.ts`, отдельно внутри MEN/WOMEN, среди реально входящих в ranking. Scores в таблицах округлены до трёх знаков; для сортировки округление не использовалось.

Result rows — все связанные строки базы, включая DNS/DNF/DSQ; это не то же самое, что число зачтённых ranking starts. Сезон взят из года race edition. Тип каталога определяется исходным массивом, а не уровнем ranking или полнотой профиля.

Priority A: TOP-100 своего пола ИЛИ не менее 5 result rows. Иначе Priority B: место 101–300 ИЛИ 3–4 result rows. Остальные — Priority C. Таблицы отсортированы по позиции внутри пола; при одинаковой позиции MEN перед WOMEN.

## Coverage

| Каталог | Всего | С image | Без image |
|---|---:|---:|---:|
| MEN | 745 | 75 | 670 |
| WOMEN | 416 | 74 | 342 |
| Всего | 1161 | 149 | 1012 |

Общее покрытие: **12.83%**. В TOP-100 без фото — **38 MEN и 38 WOMEN**. Все 1012 профилей без фото входят в ranking; только один result row имеют 395 из них.

| Тип | Всего | С image | Без image |
|---|---:|---:|---:|
| curated | 200 | 148 | 52 |
| generated | 951 | 1 | 950 |
| verified generated | 10 | 0 | 10 |

Единственный generated profile с зарегистрированным фото — Sam Laidlow.

| Priority | MEN | WOMEN | Всего | В VERIFIED_NO_PHOTO_NAMES |
|---|---:|---:|---:|---:|
| A | 123 | 68 | 191 | 31 |
| B | 184 | 171 | 355 | 20 |
| C | 363 | 103 | 466 | 1 |

## Полный Priority A — 191 спортсмен

123 MEN и 68 WOMEN. По происхождению: 31 curated, 153 generated, 7 verified generated. «Да» в последней колонке означает наличие в текущем статическом списке VERIFIED_NO_PHOTO_NAMES; это не новая проверка доступности фотографии на внешнем сайте.

| nameEn | Пол | Страна | TRI место | Score | Result rows | Сезоны | Тип | No-photo list |
|---|---|---|---:|---:|---:|---|---|---|
| Harry Palmer | M | GB | 17 | 45.876 | 6 | 2024, 2025, 2026 | generated | — |
| Emma Pallant-Browne | W | GB | 18 | 42.543 | 8 | 2024 | generated | — |
| Panagiotis Bitados | M | GR | 19 | 41.859 | 5 | 2024, 2025 | generated | — |
| Anne Reischmann | W | DE | 25 | 38.901 | 9 | 2024, 2025 | generated | — |
| Kirsten Kasper | W | US | 26 | 37.472 | 2 | 2026 | generated | — |
| Michele Bortolamedi | M | IT | 27 | 37.914 | 4 | 2024, 2025, 2026 | generated | — |
| Nikki Bartlett | W | GB | 28 | 37.379 | 6 | 2024, 2025, 2026 | generated | — |
| Laura Madsen | W | DK | 30 | 35.234 | 9 | 2024, 2025 | generated | — |
| Anne Haug | W | DE | 32 | 34.297 | 6 | 2024 | generated | — |
| Jessica Fullagar | W | GB | 37 | 31.911 | 1 | 2026 | verified generated | — |
| Justus Nieschlag | M | DE | 40 | 29.835 | 8 | 2024, 2025, 2026 | generated | — |
| Nick Thompson | M | US | 41 | 29.606 | 11 | 2024, 2025, 2026 | generated | — |
| Cameron Main | M | GB | 42 | 29.455 | 7 | 2024, 2025, 2026 | generated | — |
| Alice Alberts | W | US | 42 | 29.064 | 10 | 2024, 2025 | generated | — |
| Pierre Le Corre | M | FR | 46 | 28.203 | 5 | 2025, 2026 | generated | — |
| Fabian Kraft | M | DE | 47 | 28.168 | 4 | 2025, 2026 | generated | — |
| Alistair Brownlee | M | GB | 48 | 27.987 | 7 | 2024 | generated | — |
| David McNamee | M | GB | 49 | 27.479 | 7 | 2024 | generated | — |
| Flora Duffy | W | BM | 52 | 26.817 | 4 | 2024, 2025 | generated | — |
| Nicolas Mann | M | DE | 53 | 26.364 | 13 | 2024, 2025, 2026 | generated | — |
| Maja Stage Nielsen | W | DK | 56 | 25.532 | 13 | 2024, 2025, 2026 | generated | — |
| Leonie Konczalla | W | DE | 57 | 24.403 | 3 | 2025, 2026 | generated | — |
| Laura Jansen | W | DE | 59 | 24.014 | 9 | 2024, 2025 | generated | — |
| Ari Klau | M | US | 60 | 23.852 | 5 | 2024, 2025, 2026 | curated | Да |
| Aaron Royle | M | AU | 61 | 23.818 | 10 | 2024, 2025 | generated | — |
| Robert Kallin | M | SE | 63 | 22.919 | 12 | 2024, 2025, 2026 | generated | — |
| Haley Chura | W | US | 64 | 23.667 | 6 | 2024, 2025 | generated | — |
| Nathan Guerbeur | M | FR | 65 | 22.722 | 7 | 2024, 2025, 2026 | generated | — |
| Paul Schuster | M | DE | 66 | 22.644 | 13 | 2024, 2025, 2026 | generated | — |
| Chelsea Sodaro | W | US | 66 | 23.583 | 7 | 2024, 2025, 2026 | generated | — |
| Sam Appleton | M | AU | 67 | 22.639 | 5 | 2024, 2025, 2026 | generated | — |
| Charlene Clavel | W | FR | 67 | 23.554 | 6 | 2024, 2025 | generated | — |
| Lisa Becharas | W | US | 68 | 23.528 | 10 | 2024, 2025, 2026 | generated | — |
| Ben Hamilton | M | NZ | 69 | 22.209 | 12 | 2024, 2025, 2026 | generated | — |
| Daniela Bleymehl | W | DE | 69 | 23.217 | 7 | 2024, 2026 | generated | — |
| Jarrod Osborne | M | AU | 71 | 22.116 | 8 | 2024, 2025, 2026 | generated | — |
| Rachel Zilinskas | W | US | 72 | 22.842 | 5 | 2024, 2025, 2026 | generated | — |
| Will Draper | M | GB | 73 | 21.570 | 5 | 2025, 2026 | verified generated | — |
| Kylie Simpson | W | AU | 73 | 22.698 | 7 | 2024, 2025 | generated | — |
| Tjebbe Kaindl | M | AT | 74 | 21.560 | 1 | 2026 | generated | — |
| Marlene De Boer | W | NL | 74 | 22.517 | 7 | 2024, 2025 | generated | — |
| Seth Rider | M | US | 75 | 21.533 | 3 | 2025 | generated | — |
| Thomas Bishop | M | GB | 77 | 21.308 | 4 | 2024, 2025, 2026 | generated | — |
| Adele Likin | W | US | 77 | 21.350 | 6 | 2025, 2026 | curated | Да |
| Joran Driesen | M | BE | 78 | 21.220 | 2 | 2026 | generated | — |
| Chloe Hartnett | W | AU | 78 | 21.192 | 5 | 2024, 2025, 2026 | verified generated | — |
| Mike Phillips | M | NZ | 79 | 20.979 | 11 | 2024, 2025, 2026 | generated | — |
| Antony Costes | M | FR | 80 | 20.918 | 11 | 2024, 2025 | generated | — |
| Wilhelm Hirsch | M | DE | 81 | 20.792 | 17 | 2024, 2025, 2026 | generated | — |
| Nina Derron | W | CH | 81 | 20.933 | 8 | 2024, 2025, 2026 | generated | — |
| Katharina Wolff | W | DE | 82 | 20.880 | 5 | 2024, 2025 | generated | — |
| Jana Uderstadt | W | DE | 83 | 20.737 | 6 | 2024, 2025, 2026 | curated | Да |
| Kevin McDowell | M | US | 84 | 20.373 | 5 | 2024, 2025 | generated | — |
| Amelia Watkinson | W | NZ | 84 | 20.670 | 6 | 2024, 2025 | generated | — |
| Tanja Neubert | W | DE | 86 | 20.478 | 2 | 2025, 2026 | generated | — |
| Bradley Weiss | M | ZA | 87 | 19.703 | 13 | 2024, 2025 | generated | — |
| Simone Dailey | W | GB | 87 | 20.396 | 5 | 2024, 2025 | generated | — |
| Josh Amberger | M | AU | 88 | 19.518 | 8 | 2024, 2025 | generated | — |
| Sif Bendix Madsen | W | DK | 88 | 20.174 | 5 | 2024, 2025, 2026 | generated | — |
| Jack Moody | M | NZ | 90 | 18.747 | 4 | 2024, 2025, 2026 | generated | — |
| Gurutze Frades Larralde | W | ES | 91 | 19.607 | 4 | 2024 | generated | — |
| Valdemar Solok | M | DK | 92 | 18.654 | 5 | 2025, 2026 | generated | — |
| Jocelyn McCauley | W | US | 92 | 19.320 | 5 | 2024, 2025, 2026 | generated | — |
| Henrike Gueber | W | DE | 93 | 18.886 | 6 | 2024, 2025, 2026 | curated | Да |
| Ben Faeh | M | CH | 94 | 18.227 | 2 | 2026 | generated | — |
| Elisabetta Curridori | W | IT | 94 | 18.666 | 4 | 2024, 2025 | generated | — |
| Mattia Ceccarelli | M | IT | 95 | 18.029 | 10 | 2024, 2025 | generated | — |
| Charlotte McShane | W | AU | 95 | 18.514 | 5 | 2025, 2026 | curated | Да |
| Simon Westermann | M | CH | 96 | 17.862 | 2 | 2025 | generated | — |
| Lauren Brandon | W | US | 96 | 18.216 | 6 | 2024 | generated | — |
| Jannik Schaufler | M | DE | 97 | 17.858 | 9 | 2024, 2025, 2026 | verified generated | — |
| Giorgia Priarone | W | IT | 97 | 18.030 | 7 | 2024, 2026 | generated | — |
| Arnaud Guilloux | M | FR | 98 | 17.783 | 8 | 2024, 2026 | generated | — |
| Danielle Fauteux | W | CA | 99 | 17.677 | 5 | 2024, 2025, 2026 | generated | — |
| Michele Sarzilla | M | IT | 100 | 17.534 | 3 | 2025, 2026 | generated | — |
| Daniela Ryf | W | CH | 100 | 17.655 | 1 | 2024 | generated | — |
| Erin Schenkels | W | CA | 101 | 17.633 | 6 | 2024 | generated | — |
| Maximilian Sperl | M | DE | 103 | 17.367 | 9 | 2024, 2025, 2026 | generated | — |
| Julie Iemmolo | W | FR | 103 | 17.263 | 10 | 2024, 2025 | generated | — |
| Brock Hoel | M | CA | 104 | 17.250 | 5 | 2025, 2026 | curated | Да |
| Anna Bergsten | W | SE | 106 | 17.143 | 7 | 2024, 2025 | generated | — |
| Rasmus Svenningsson | M | SE | 107 | 16.924 | 5 | 2024, 2026 | generated | — |
| Cecilia Perez | W | MX | 107 | 17.104 | 6 | 2024, 2025 | generated | — |
| Henri Schoeman | M | ZA | 109 | 16.661 | 5 | 2024, 2025, 2026 | verified generated | — |
| Finn Große-Freese | M | DE | 110 | 16.367 | 8 | 2024, 2025, 2026 | generated | — |
| Katie Remond | W | AU | 110 | 16.656 | 7 | 2024, 2025, 2026 | generated | — |
| Andy Krueger | M | US | 111 | 16.348 | 12 | 2024, 2025, 2026 | curated | Да |
| Nikita Paskiewiez | W | FR | 111 | 16.468 | 5 | 2024, 2025, 2026 | curated | Да |
| Nick Emde | M | DE | 113 | 16.206 | 6 | 2024, 2025, 2026 | generated | — |
| Tristan Olij | M | NL | 114 | 16.154 | 6 | 2024, 2025, 2026 | generated | — |
| Kristen Marchant | W | CA | 114 | 16.322 | 5 | 2024, 2025, 2026 | generated | — |
| Shiva Leisner | W | DK | 115 | 16.280 | 5 | 2025, 2026 | curated | Да |
| Miranda Tomenson | W | CA | 116 | 16.129 | 7 | 2024, 2025, 2026 | generated | — |
| Emilie Morier | W | FR | 118 | 15.898 | 5 | 2024, 2025 | generated | — |
| Luisa Iogna Prat | W | IT | 120 | 15.699 | 13 | 2024, 2025, 2026 | curated | Да |
| Merle Brunnee | W | DE | 121 | 15.418 | 5 | 2024, 2025, 2026 | generated | — |
| Dylan Magnien | M | FR | 122 | 15.367 | 7 | 2024, 2025, 2026 | verified generated | — |
| Andrew Horsfall-Turner | M | GB | 126 | 15.008 | 9 | 2024, 2025, 2026 | generated | — |
| Pamella Oliveira | W | BR | 128 | 14.919 | 5 | 2024 | generated | — |
| Thor Bendix Madsen | M | DK | 130 | 14.657 | 6 | 2024, 2026 | generated | — |
| Leonard Arnold | M | DE | 131 | 14.641 | 11 | 2024, 2025, 2026 | generated | — |
| Caleb Noble | M | AU | 132 | 14.630 | 7 | 2024, 2025, 2026 | generated | — |
| Florian Angert | M | DE | 133 | 14.619 | 6 | 2024, 2025 | generated | — |
| Leslie Homol | W | US | 133 | 14.418 | 5 | 2025, 2026 | curated | Да |
| Andre Lopes | M | BR | 134 | 14.582 | 9 | 2024, 2025, 2026 | generated | — |
| Benjamin Zorgnotti | M | FR | 135 | 14.530 | 6 | 2024, 2025, 2026 | generated | — |
| Stephanie Clutterbuck | W | GB | 135 | 14.071 | 10 | 2024, 2025, 2026 | curated | Да |
| Dieter Comhair | M | BE | 136 | 14.440 | 6 | 2024, 2025 | generated | — |
| Matt Burton | M | AU | 137 | 14.392 | 7 | 2024, 2025, 2026 | generated | — |
| Alexandra Watt | W | US | 137 | 14.022 | 6 | 2024, 2025 | generated | — |
| Mitchell Kibby | M | AU | 140 | 14.064 | 7 | 2024, 2025, 2026 | generated | — |
| Hunter Lussi | M | US | 142 | 13.896 | 6 | 2024, 2025, 2026 | generated | — |
| John Killeen | M | US | 144 | 13.775 | 10 | 2024, 2025, 2026 | curated | Да |
| Stenn Goetstouwers | M | BE | 145 | 13.690 | 8 | 2024, 2025, 2026 | generated | — |
| Ruben Zepuntke | M | DE | 146 | 13.661 | 6 | 2024, 2025, 2026 | generated | — |
| Piotr Lawicki | M | PL | 147 | 13.571 | 7 | 2024, 2025, 2026 | generated | — |
| Benjamin Randall | M | US | 150 | 13.470 | 5 | 2024, 2025, 2026 | curated | Да |
| Thomas Davis | M | GB | 152 | 13.262 | 10 | 2024, 2025, 2026 | generated | — |
| Calvin Amos | M | AU | 153 | 13.209 | 5 | 2024, 2025, 2026 | generated | — |
| Marc Eggeling | M | DE | 154 | 13.136 | 7 | 2024, 2025, 2026 | generated | — |
| Annette Rogers | W | US | 155 | 13.032 | 5 | 2025, 2026 | curated | Да |
| Michael Weiss | M | AT | 156 | 13.038 | 6 | 2024, 2025, 2026 | generated | — |
| Rebecca Yunginger | W | US | 159 | 12.873 | 7 | 2024, 2025, 2026 | generated | — |
| Connor Weaver | M | US | 160 | 12.717 | 6 | 2024, 2026 | generated | — |
| Allison Jacob | W | CA | 160 | 12.816 | 5 | 2024, 2025 | generated | — |
| Stephanie Wunderle | W | DE | 162 | 12.620 | 8 | 2024, 2025, 2026 | generated | — |
| Abbie Sullivan | W | US | 163 | 12.610 | 7 | 2024, 2025, 2026 | curated | Да |
| Jodie Stimpson | W | GB | 166 | 12.561 | 5 | 2024, 2025 | generated | — |
| Liam Lloyd | M | GB | 168 | 12.407 | 6 | 2024, 2025, 2026 | generated | — |
| Lisa-Maria Dornauer | W | AT | 168 | 12.502 | 6 | 2024, 2025, 2026 | verified generated | — |
| Tomasz Szala | M | PL | 170 | 12.349 | 7 | 2024, 2025, 2026 | generated | — |
| Zack Cooper | M | GB | 171 | 12.169 | 6 | 2024, 2025, 2026 | generated | — |
| Federico Scarabino | M | IT | 172 | 12.149 | 7 | 2024, 2025, 2026 | curated | Да |
| Sven Wies | M | DE | 173 | 12.133 | 10 | 2024, 2025 | generated | — |
| Dylan Gillespie | M | US | 174 | 12.056 | 7 | 2024, 2025, 2026 | generated | — |
| Timo Schaffeld | M | DE | 176 | 11.923 | 6 | 2024, 2025 | generated | — |
| Dries Matthys | M | BE | 177 | 11.882 | 5 | 2025, 2026 | curated | Да |
| Martin Ulloa | M | CL | 178 | 11.844 | 5 | 2024, 2025, 2026 | generated | — |
| Jessica Cullen | W | CA | 180 | 11.931 | 5 | 2024 | generated | — |
| David Reynolds | M | US | 181 | 11.580 | 5 | 2024, 2025, 2026 | curated | Да |
| Katie Spoelman-Vanacker | W | US | 184 | 11.626 | 5 | 2025, 2026 | generated | — |
| James Hayes | M | US | 188 | 11.050 | 10 | 2024, 2025, 2026 | curated | Да |
| Gabrielle Suver | W | US | 188 | 11.386 | 5 | 2024, 2025 | generated | — |
| Blake Selm | M | US | 195 | 10.638 | 5 | 2025, 2026 | curated | Да |
| Mathieu Merland | M | FR | 197 | 10.610 | 5 | 2025, 2026 | generated | — |
| Matt Schafer | M | US | 201 | 10.513 | 5 | 2024, 2025, 2026 | generated | — |
| Sarah Karpinski | W | US | 202 | 10.736 | 6 | 2024, 2025, 2026 | curated | Да |
| Yvan Jarrige | M | FR | 203 | 10.507 | 5 | 2024, 2026 | curated | Да |
| Andreas Dreitz | M | DE | 206 | 10.345 | 7 | 2024, 2025, 2026 | generated | — |
| William Mennesson | M | FR | 207 | 10.340 | 6 | 2025 | generated | — |
| Carolyn Olsen | W | US | 207 | 10.560 | 5 | 2024, 2025, 2026 | curated | Да |
| Nick Cosman | M | CA | 213 | 10.192 | 9 | 2024, 2025 | generated | — |
| Matt Kerr | M | NZ | 215 | 10.127 | 9 | 2025, 2026 | curated | Да |
| Milosz Sowinski | M | PL | 217 | 10.016 | 5 | 2025 | generated | — |
| Matthew Guenter | M | US | 223 | 9.810 | 7 | 2024, 2025, 2026 | generated | — |
| Robby Webster | M | US | 224 | 9.802 | 6 | 2024, 2026 | generated | — |
| Connor Ford | M | US | 229 | 9.708 | 5 | 2024, 2025, 2026 | generated | — |
| Corentin Chouvelon | M | FR | 233 | 9.614 | 6 | 2024, 2025 | generated | — |
| Finn Arentz | M | GB | 237 | 9.503 | 5 | 2024, 2025 | generated | — |
| Anne Basso | W | FR | 238 | 9.534 | 7 | 2024, 2025, 2026 | curated | Да |
| Albert Askengren | M | SE | 249 | 9.238 | 7 | 2024, 2025, 2026 | curated | Да |
| Miguel Mattox | M | US | 252 | 9.195 | 5 | 2024, 2025, 2026 | generated | — |
| Robin Hermann | M | DE | 255 | 9.132 | 5 | 2024, 2025, 2026 | generated | — |
| Matthew Richard | M | US | 261 | 8.901 | 5 | 2026 | curated | Да |
| Rinel Pius | M | EE | 264 | 8.843 | 6 | 2024, 2025, 2026 | generated | — |
| Max Neumann | M | AU | 266 | 8.811 | 6 | 2024, 2025 | generated | — |
| Simon Shi | M | US | 273 | 8.667 | 5 | 2024, 2025, 2026 | generated | — |
| Michael Arishita | M | US | 274 | 8.657 | 7 | 2024, 2025, 2026 | generated | — |
| Jose Cordova Perez | M | MX | 277 | 8.602 | 5 | 2024, 2025 | generated | — |
| Jonathan Fecik | M | US | 289 | 8.375 | 6 | 2024, 2025, 2026 | generated | — |
| Max Kohll | M | US | 292 | 8.327 | 6 | 2024, 2025, 2026 | generated | — |
| John Thelwell | M | GB | 299 | 8.204 | 6 | 2024 | generated | — |
| Kevin Bishop | M | US | 300 | 8.200 | 7 | 2024, 2025, 2026 | generated | — |
| Yang Pan | M | US | 309 | 8.039 | 8 | 2024, 2025, 2026 | generated | — |
| Brad Bischoff | M | US | 324 | 7.619 | 5 | 2024, 2025, 2026 | curated | Да |
| Strahinja Trakic | M | RS | 336 | 7.524 | 5 | 2024, 2026 | generated | — |
| Brian Folts | M | US | 346 | 7.309 | 7 | 2024, 2025, 2026 | curated | Да |
| Jacob Osswald | M | US | 348 | 7.267 | 5 | 2024, 2025 | generated | — |
| Florin Parfuss | M | AT | 357 | 7.126 | 5 | 2025, 2026 | curated | Да |
| Sven Oliver Thalmann | M | CH | 364 | 7.000 | 5 | 2024, 2025, 2026 | generated | — |
| Dimity-Lee Duke | W | AU | 371 | 5.152 | 5 | 2024, 2025 | generated | — |
| Ryan Sedivec | M | US | 377 | 6.878 | 6 | 2024, 2025 | generated | — |
| Branden Scheel | M | US | 410 | 6.462 | 5 | 2024, 2025 | generated | — |
| Garrick Loewen | M | CA | 426 | 6.262 | 5 | 2024, 2025 | generated | — |
| Robert Wilkowiecki | M | PL | 428 | 6.252 | 10 | 2024, 2025, 2026 | generated | — |
| Matti Weitz | M | DE | 435 | 6.148 | 5 | 2024, 2025 | generated | — |
| Mikel Txopitea Elorriaga | M | ES | 437 | 6.125 | 7 | 2024, 2025, 2026 | generated | — |
| Ross Baldwin | M | US | 492 | 5.494 | 7 | 2024, 2025, 2026 | generated | — |
| Trevor Delsaut | M | FR | 499 | 5.385 | 5 | 2024, 2025 | generated | — |
| Jason Pohl | M | CA | 500 | 5.375 | 8 | 2024, 2025, 2026 | generated | — |
| Robert Swan | M | US | 587 | 4.538 | 5 | 2024, 2025, 2026 | generated | — |

## Первые 30 Priority B

Это первые 30 общей последовательности по позиции внутри пола, не по 30 каждого пола.

| nameEn | Пол | Страна | TRI место | Score | Result rows | Сезоны | Тип | No-photo list |
|---|---|---|---:|---:|---:|---|---|---|
| Benjamin Hill | M | AU | 101 | 17.499 | 3 | 2025, 2026 | generated | — |
| Richelle Hill | W | AU | 102 | 17.506 | 1 | 2024 | generated | — |
| Jeanni Metzler | W | ZA | 104 | 17.258 | 1 | 2024 | generated | — |
| Jeanne Collonge | W | FR | 105 | 17.149 | 4 | 2024, 2025, 2026 | generated | — |
| Tayler Reid | M | NZ | 108 | 16.798 | 2 | 2025 | generated | — |
| Sarah Schoenfelder | W | DE | 108 | 17.082 | 3 | 2025, 2026 | generated | — |
| Jack Sosinski | M | AU | 112 | 16.286 | 4 | 2025, 2026 | curated | Да |
| Solenne Billouin | W | FR | 112 | 16.428 | 3 | 2025, 2026 | generated | — |
| Marissa Lovell | W | US | 113 | 16.424 | 4 | 2025, 2026 | curated | Да |
| Luke Jones | M | US | 115 | 16.115 | 3 | 2025, 2026 | generated | — |
| Kenji Nener | M | JP | 116 | 16.110 | 3 | 2024, 2025 | generated | — |
| Johannes Vogel | M | DE | 117 | 15.899 | 4 | 2024, 2025, 2026 | generated | — |
| Arlette Mariana Gonzalez Hurtado | W | MX | 117 | 15.923 | 4 | 2024, 2025 | generated | — |
| Damien Le Mesnager | M | FR | 118 | 15.866 | 2 | 2025, 2026 | generated | — |
| Pierre Dupuy | M | FR | 120 | 15.570 | 3 | 2025, 2026 | generated | — |
| Rafael Lukatsch | M | AT | 121 | 15.425 | 4 | 2025, 2026 | generated | — |
| Batya Beard | W | US | 122 | 15.266 | 4 | 2024, 2025 | generated | — |
| Josh Ferris | M | AU | 123 | 15.230 | 2 | 2025, 2026 | generated | — |
| Anna Pabinger | W | AT | 123 | 15.266 | 2 | 2024, 2026 | generated | — |
| Jon Sæverås Breivold | M | NO | 124 | 15.106 | 3 | 2024, 2025 | generated | — |
| Tom Hug | M | DE | 125 | 15.044 | 2 | 2024, 2026 | generated | — |
| Ai Ueda | W | JP | 125 | 15.012 | 3 | 2024 | generated | — |
| Sophie Evans | W | GB | 126 | 14.964 | 1 | 2024 | generated | — |
| Samantha Kingsford | W | NZ | 127 | 14.932 | 3 | 2024, 2025 | generated | — |
| Matt Hauser | M | AU | 128 | 14.855 | 2 | 2025, 2026 | generated | — |
| Laura Kessler | W | CH | 129 | 14.795 | 3 | 2025 | generated | — |
| Amanda Macuiba | W | US | 131 | 14.529 | 4 | 2025, 2026 | generated | — |
| Julia Skala | W | DE | 132 | 14.425 | 3 | 2024, 2025 | generated | — |
| Kate Gillespie-Jones | W | AU | 134 | 14.236 | 3 | 2024, 2025 | generated | — |
| Justine Mathieux | W | FR | 136 | 14.061 | 3 | 2025 | generated | — |

## Photo registry и локальные файлы

| Проверка | Результат |
|---|---|
| Registry entries / уникальные пути | 149 / 149 |
| Файлы в public/athletes | 149, все .png |
| Дополнительные bundled assets | 1: src/assets/athletes/blummenfelt.jpg |
| Registry entries без файла | 0 |
| Файлы public/athletes без registry entry | 0 |
| Несколько файлов на slug в public/athletes | 0 |
| Дубли ключей / общие registry paths | 0 / 0 |
| Коллизии catalog slug / profile slug | 0 / 0 |
| Registry names вне runtime catalog | 0 |
| Runtime image с отсутствующим файлом | 0 |
| Побайтово одинаковые файлы в public/athletes | 0 |

Всего в двух каталогах 150 файлов для 149 спортсменов. У Kristian Blummenfelt есть `/athletes/kristian-blummenfelt.png` в registry и отдельный `src/assets/athletes/blummenfelt.jpg`. В runtime используется второй файл: явное `athlete.image` имеет приоритет над registry. Это не битая ссылка и не orphan registry entry, но зарегистрированный PNG сейчас не используется этим профилем. Файлы различаются по SHA-256.

Проверены наличие файлов и хеши, но не декодирование, визуальное качество и соответствие лица спортсмену. Наличие image не равнозначно подтверждённой идентичности фотографии.

## Ограничения и ручные настройки импортера

Источник анализа: `scripts/import-athlete-photos.mjs`, `src/data/athletes/createAthlete.ts`, `src/data/athletes/index.ts`. Сам импортер не запускался.

- Режим по умолчанию обрабатывает только Mika Noodt. `--all` собирает имена из четырёх исходных файлов, включая generated и verified generated. `--only` выбирает точное имя без учёта регистра.
- Два защищённых имени: Mika Noodt и Jelle Geens. Защита от замены действует, если локальный файл уже найден. Это не реестр подтверждённых источников всех фото.
- VERIFIED_NO_PHOTO_NAMES содержит 52 имени. Такой же список дублируется в createAthlete.ts; на снимке списки совпадают. Все 52 имени есть в каталоге и не имеют ни runtime image, ни registry entry, ни локального файла. Даты и источники проверки отсутствия фото не сохранены.
- LOW_CONFIDENCE_NAMES содержит 50 имён, все входят в VERIFIED_NO_PHOTO_NAMES. Не включены только Albert Askengren и Jana Uderstadt. В `--audit-weak` проверка no-photo выполняется раньше вывода кандидатов: все 50 выбранных имён пропускаются, хотя предварительное сканирование страниц уже выполнено.
- Ошибка regex-сборщика: Valentina D'Angeli превращается в Valentina D. Суммарное число собранных имён остаётся 1161 и маскирует ошибку: одно действительное имя потеряно и одно ложное добавлено.
- Обычный `--all` не включает shared-asset filter. Он включается только при `--audit-weak`, `--dry-run` или `--refresh`. Общими считаются URL, встреченные на трёх и более страницах. Изображения, повторённые на двух страницах, либо одинаковые изображения под разными URL такой фильтр не исключает.
- Даже `--only NAME --dry-run` предварительно сканирует весь каталог для shared-asset filter. `--dry-run` выполняет сетевые запросы и mkdir; это не офлайн-анализ. В текущей задаче ни один из этих режимов не запускался.
- После HTTP 200 не проверяются итоговый URL редиректа, имя владельца профиля или соответствие личности. PROFILE_SLUG_OVERRIDES задают URL для отдельных имён, но не заменяют проверку ответа сервера.
- Кандидаты выбираются по HTML-контексту, URL и эвристическому score; проверяются первые 12 с score не ниже 35. Требуются Content-Type image/* и не менее 8000 байт. Это не подтверждение портрета: нет проверки лица, размеров/декодирования изображения и личности.
- Нет явно заданных timeout, retries и ограничителя частоты запросов. Запросы выполняются последовательно, но массовое сканирование всё равно затрагивает весь каталог.
- Существующий файл без --refresh переиспользуется, но HTML профиля запрашивается до этого решения. Поиск файла берёт первое совпадение slug.*. При refresh со сменой расширения старый файл не удаляется, поэтому потенциально могут появиться несколько файлов на slug; сейчас их нет.
- В обычном импорте no-photo удаляет запись из registry, но не локальный файл. --clean-no-photo удаляет локальные файлы всех 52 имён и переписывает registry. Эта ветка выполняется раньше dry-run: сочетание --clean-no-photo --dry-run не является безопасным просмотром.
- Runtime withRegisteredPhoto использует `athlete.image ?? registry[nameEn]`: он может снова подставить registry entry после no-photo suppression в makeAthlete. Сейчас такого конфликта нет, поскольку для всех 52 имён записи отсутствуют.
- Registry хранит только nameEn → путь. Нет URL источника, даты проверки, решения проверяющего и evidence. Ошибки отдельных загрузок логируются и не дают полноценного отчёта о подтверждённых/неподтверждённых совпадениях.

Ручные PROFILE_SLUG_OVERRIDES — 14:

| nameEn | PTO profile slug |
|---|---|
| Magnus Ditlev | `magnus-elbaek-ditlev` |
| Daniel Bækkegård | `daniel-baekkegard` |
| Kristian Høgenhaug | `kristian-hogenhaug` |
| Guillem Montiel | `montiel-moreno-guillem` |
| Solveig Løvseth | `solveig-loevseth` |
| Hannah Berry | `hannah-wells` |
| Caroline Pohle | `carolin-pohle` |
| Katrine Græsbøll Christensen | `katrine-graesboell-christensen` |
| Lena Meißner | `lena-meißner` |
| Benjamin Randall | `ben-randall` |
| Henry Räppo | `henry-raeppo` |
| Mathias Petersen | `mathias-lyngsoe-petersen` |
| Franzi Hofmann | `franzi-reng` |
| Jamie Besse | `jamie-albert` |

## Рекомендация для безопасного массового импорта

1. До массовой загрузки исправить сбор имён: получать каталог через runtime, сохранять точные nameEn и athleteId, проверять коллизии. Отдельно исправить порядок веток audit-weak/no-photo и семантику dry-run. Изменения кода в текущую задачу не входили и не выполнены.
2. Начать с Priority A. Из 191 имени 31 находится в no-photo list; эти случаи оставить отдельной очередью на повторную проверку. Остальные 160 — очередь поиска кандидатов, а не разрешение автоматически принять любое найденное фото.
3. Для каждой цели проверить реальный профиль Stats PTO, итоговый URL и личность по имени/вариантам и биографическому контексту. Не принимать HTTP 200, редирект или score как доказательство. Не угадывать источники для спорных фамилий и переименований.
4. Сохранять кандидатов отдельно от production registry. Применять shared-asset filter во всех режимах; сравнивать также хеши и проверять декодирование/размеры. Для совпадений, подтверждённых только эвристикой, сохранять REVIEW_REQUIRED.
5. Первую партию ограничить 10–20 кандидатами с ручным визуальным сопоставлением. Сохранить evidence: точное имя и ID, profile URL, image URL, дату проверки, checksum и решение. После проверки переносить только принятые фото в локальный registry, сохраняя ручные overrides.
6. После будущего импорта проверить registry ↔ файлы ↔ runtime image, дубли slug/содержимого, audit:athletes, неизменность ranking order/scores и result linkage. Не заменять текущие фото и не удалять no-photo записи автоматически.

## Что выполнено и сохранность данных

Сетевые запросы и скачивания в рамках этого анализа не выполнялись. Существующие tracked-файлы и athlete-audit.txt, ranking.txt, sof.json проверены по SHA-256 и не изменены. JSON-снимок сохранён без изменений при оформлении Markdown. Исходный код, registry и фотографии не редактировались. Commit/push не выполнялись.

Проверены полнота 1012 строк, уникальность athleteId, правила A/B/C и состав таблиц (191 + 30). Audits/build не запускались: задача ограничена анализом и созданием отчётов.
