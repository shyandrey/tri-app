# PTO mapping review — photo cohort

19.10.2026 · READ-ONLY research / OWNER REVIEW; не импорт и не новые approvals.

Repository SHA: `eb3a27a23d6599828534e96c2cf24a93ed3059ba`.

## Scope и сохранность

- Runtime catalog: 1167; photo cohort: **221** (107 M / 114 W). После photoReview у всех есть непустой image, существующий локальный файл и image MIME type: 218 PNG / 3 WebP. 221 distinct photo paths. Это техническая пригодность зарегистрированного фото, не новый визуальный identity audit. Franzi Hofmann ID 172 исключена: approved placeholder.
- Все **20** существующих approved mappings входят в cohort и сохранены дословно. **201** новый mapping требует отдельного owner approval.
- Из новых candidate URLs 73 взяты из athletePhotoEvidence; 128 — детерминированные кандидаты из существующего photo URL policy (включая overrides). Угадывание slug не считается подтверждением.
- Existing AGE: 18 профилей; BORN: 18; social URLs: 43 у 17 профилей. Значения в CSV — только уже существующие runtime values. Новые AGE/BORN/social не извлекались и не применялись. Старые raw AGE/BORN exceptions и Kristian YouTube сохранены.

## Evidence и ограничения

- HIGH CONFIDENCE: exact normalized name + nationality + canonical URL, а также минимум один уникальный local result match по году, месту, total/swim/bike/run. Не name-only match и не автоматическое утверждение.
- Corroboration берётся из race-history table того же PTO profile и сравнивается с local result rows. Race URLs в evidence — реальные href из profile; отдельный запрос к каждой race page не выполнялся. Это независимые поля/локальные строки, но не второй независимый provider.
- REVIEW REQUIRED: canonical/name/country mismatch, alias или отсутствие точного race tuple. NO RELIABLE MATCH: страница недоступна/невалидный URL/недостаточно подтверждений. Не доказывает отсутствия спортсмена на PTO.
- Последовательные запросы, пауза 1.5 s, timeout 20 s, без retries, redirects не следуются; STOP на 403/429/access challenge. robots.txt вернул 404 — это не blanket authorization. Обход ограничений не использовался.
- Результаты относятся к timestamp в CSV; unavailable/changed identity требует review, а не автоматической замены. Approved 20 не запрашивались повторно.
- Полные HTML snapshots и промежуточный JSON: `/tmp/300w-photo-mapping-review/`; CSV хранит SHA256, timestamp и до трёх strongest race tuples. /tmp не является долговечным архивом; перед будущим импортом потребуется повторная проверка.

## Итог классификации

| Status | Count |
|---|---:|
| PREVIOUSLY APPROVED | 20 |
| HIGH CONFIDENCE | 198 |
| REVIEW REQUIRED | 3 |
| NO RELIABLE MATCH | 0 |

Проверено отсутствие duplicate athlete IDs и candidate PTO URLs. Registry и athlete/results/ranking data не изменялись.

[Полная owner-review таблица: все 221 ID, names, URL, coverage, evidence](athlete-pto-photo-mapping-review-2026-10-19.csv).

## Индивидуальный review

| ID | Athlete | PTO candidate | Reason |
|---|---|---|
| 67 | Jamie Riddle | https://stats.protriathletes.org/athlete/jamie-riddle | Local ZAF vs PTO ZA: existing country alias in src/utils/athleteCountryStrength.ts; representation difference, not established nationality conflict. Identity/race-history match; owner review before registry. |
| 133 | Lena Meißner | https://stats.protriathletes.org/athlete/lena-mei%C3%9Fner | Confirmed reachable Unicode canonical profile; current ASCII-only validProfileUrl rejects percent-encoded ß. Name/country/canonical and race history verified; importer compatibility review needed, no code change made. |
| 197 | Jamie Besse | https://stats.protriathletes.org/athlete/jamie-albert | Local country missing, PTO CH; absence is not a conflict. Existing jamie-albert slug override, exact Jamie Besse name and three race matches; owner review before registry. |

## Batch candidates и сохранённые mappings

| ID | Athlete | Status | PTO URL | Race matches |
|---|---|---|---|
| 1 | Kristian Blummenfelt | PREVIOUSLY APPROVED | https://stats.protriathletes.org/athlete/kristian-blummenfelt | existing approval |
| 2 | Marten Van Riel | PREVIOUSLY APPROVED | https://stats.protriathletes.org/athlete/marten-van-riel | existing approval |
| 3 | Hayden Wilde | PREVIOUSLY APPROVED | https://stats.protriathletes.org/athlete/hayden-wilde | existing approval |
| 4 | Mika Noodt | PREVIOUSLY APPROVED | https://stats.protriathletes.org/athlete/mika-noodt | existing approval |
| 5 | Rico Bogen | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/rico-bogen | 21 |
| 6 | Jelle Geens | PREVIOUSLY APPROVED | https://stats.protriathletes.org/athlete/jelle-geens | existing approval |
| 7 | Casper Stornes | PREVIOUSLY APPROVED | https://stats.protriathletes.org/athlete/casper-stornes | existing approval |
| 8 | Jonas Schomburg | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/jonas-schomburg | 15 |
| 9 | Samuel Dickinson | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/samuel-dickinson | 12 |
| 10 | Menno Koolhaas | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/menno-koolhaas | 14 |
| 11 | Lasse Nygaard Priester | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/lasse-nygaard-priester | 8 |
| 12 | Youri Keulen | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/youri-keulen | 15 |
| 13 | Mathis Margirier | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/mathis-margirier | 15 |
| 14 | Jason West | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/jason-west | 20 |
| 15 | Morgan Pearson | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/morgan-pearson | 8 |
| 16 | Gregory Barnaby | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/gregory-barnaby | 17 |
| 17 | Jake Birtwhistle | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/jake-birtwhistle | 13 |
| 18 | Kurt McDonald | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/kurt-mcdonald | 9 |
| 19 | Gregor Payet | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/gregor-payet | 10 |
| 20 | Matthew Marquardt | PREVIOUSLY APPROVED | https://stats.protriathletes.org/athlete/matthew-marquardt | existing approval |
| 21 | Magnus Ditlev | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/magnus-elbaek-ditlev | 12 |
| 22 | Sam Long | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/sam-long | 21 |
| 23 | Lionel Sanders | PREVIOUSLY APPROVED | https://stats.protriathletes.org/athlete/lionel-sanders | existing approval |
| 24 | Patrick Lange | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/patrick-lange | 9 |
| 25 | Gustav Iden | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/gustav-iden | 12 |
| 26 | Rudy von Berg | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/rudy-von-berg | 16 |
| 27 | Ben Kanute | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/ben-kanute | 14 |
| 28 | Daniel Bækkegård | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/daniel-baekkegard | 7 |
| 29 | Leon Chevalier | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/leon-chevalier | 15 |
| 30 | Clément Mignon | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/clement-mignon | 6 |
| 31 | Braden Currie | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/braden-currie | 9 |
| 32 | Kyle Smith | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/kyle-smith | 11 |
| 33 | Pieter Heemeryck | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/pieter-heemeryck | 11 |
| 34 | Frederic Funk | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/frederic-funk | 13 |
| 35 | Kristian Høgenhaug | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/kristian-hogenhaug | 17 |
| 36 | Joe Skipper | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/joe-skipper | 4 |
| 37 | Cameron Wurf | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/cameron-wurf | 13 |
| 38 | Jackson Laundry | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/jackson-laundry | 14 |
| 39 | Trevor Foley | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/trevor-foley | 11 |
| 40 | Marc Dubrick | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/marc-dubrick | 11 |
| 41 | Vincent Luis | PREVIOUSLY APPROVED | https://stats.protriathletes.org/athlete/vincent-luis | existing approval |
| 42 | Léo Bergère | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/leo-bergere | 5 |
| 43 | Guillem Montiel | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/montiel-moreno-guillem | 5 |
| 44 | Antonio Benito López | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/antonio-benito-lopez | 14 |
| 45 | Jordi Montraveta Moya | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/jordi-montraveta-moya | 2 |
| 46 | Filipe Azevedo | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/filipe-azevedo | 8 |
| 47 | Fernando Toldi | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/fernando-toldi | 2 |
| 48 | Chris Leiferman | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/chris-leiferman | 7 |
| 49 | Matt Hanson | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/matt-hanson | 21 |
| 50 | Bart Aernouts | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/bart-aernouts | 6 |
| 52 | Henrik Goesch | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/henrik-goesch | 12 |
| 53 | Jonas Hoffmann | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/jonas-hoffmann | 15 |
| 55 | Matthew Collins | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/matthew-collins | 13 |
| 56 | Adam Feigh | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/adam-feigh | 11 |
| 57 | Andrea Salvisberg | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/andrea-salvisberg | 10 |
| 59 | Julian Becker | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/julian-becker | 6 |
| 61 | Pamphiel Pareyn | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/pamphiel-pareyn | 9 |
| 62 | Blake Harris | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/blake-harris | 5 |
| 68 | Jan Stratmann | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/jan-stratmann | 11 |
| 70 | Justin Riele | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/justin-riele | 11 |
| 71 | Kacper Stepniak | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/kacper-stepniak | 16 |
| 72 | Kieran Lindars | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/kieran-lindars | 8 |
| 73 | Nicholas Chase | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/nicholas-chase | 9 |
| 74 | Sam Osborne | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/sam-osborne | 9 |
| 75 | Simon Viain | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/simon-viain | 8 |
| 83 | Colin Szuch | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/colin-szuch | 11 |
| 85 | Dominik Sowieja | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/dominik-sowieja | 9 |
| 89 | Eduardo Perez Sandi Garcia | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/eduardo-perez-sandi-garcia | 6 |
| 93 | Henry Räppo | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/henry-raeppo | 8 |
| 95 | James Teagle | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/james-teagle | 7 |
| 98 | Joshua Lewis | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/joshua-lewis | 6 |
| 99 | Lukas Stahl | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/lukas-stahl | 6 |
| 100 | Mathias Petersen | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/mathias-lyngsoe-petersen | 9 |
| 101 | Kate Waugh | PREVIOUSLY APPROVED | https://stats.protriathletes.org/athlete/kate-waugh | existing approval |
| 102 | Julie Derron | PREVIOUSLY APPROVED | https://stats.protriathletes.org/athlete/julie-derron | existing approval |
| 103 | Lucy Charles-Barclay | PREVIOUSLY APPROVED | https://stats.protriathletes.org/athlete/lucy-charles-barclay | existing approval |
| 104 | Taylor Knibb | PREVIOUSLY APPROVED | https://stats.protriathletes.org/athlete/taylor-knibb | existing approval |
| 105 | Georgia Taylor-Brown | PREVIOUSLY APPROVED | https://stats.protriathletes.org/athlete/georgia-taylor-brown | existing approval |
| 106 | Solveig Løvseth | PREVIOUSLY APPROVED | https://stats.protriathletes.org/athlete/solveig-loevseth | existing approval |
| 107 | Jessica Learmonth | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/jessica-learmonth | 8 |
| 108 | Kat Matthews | PREVIOUSLY APPROVED | https://stats.protriathletes.org/athlete/kat-matthews | existing approval |
| 109 | Laura Philipp | PREVIOUSLY APPROVED | https://stats.protriathletes.org/athlete/laura-philipp | existing approval |
| 110 | Holly Lawrence | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/holly-lawrence | 8 |
| 111 | Alanis Siffert | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/alanis-siffert | 8 |
| 112 | Imogen Simmonds | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/imogen-simmonds | 13 |
| 113 | Hannah Berry | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/hannah-wells | 19 |
| 114 | Paula Findlay | PREVIOUSLY APPROVED | https://stats.protriathletes.org/athlete/paula-findlay | existing approval |
| 115 | Ellie Salthouse | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/ellie-salthouse | 14 |
| 116 | Sara Pérez Sala | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/sara-perez-sala | 8 |
| 117 | Caroline Pohle | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/carolin-pohle | 10 |
| 118 | Taylor Spivey | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/taylor-spivey | 10 |
| 119 | Lisa Perterer | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/lisa-perterer | 15 |
| 120 | Marjolaine Pierré | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/marjolaine-pierre | 12 |
| 121 | Bianca Bogen | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/bianca-bogen | 6 |
| 122 | Lotte Wilms | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/lotte-wilms | 17 |
| 123 | Nicole Van der Kaay | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/nicole-van-der-kaay | 3 |
| 124 | Lizzie Rayner | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/lizzie-rayner | 14 |
| 125 | Hanne De Vet | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/hanne-de-vet | 16 |
| 126 | Katrine Græsbøll Christensen | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/katrine-graesboell-christensen | 10 |
| 127 | Audrey Merle | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/audrey-merle | 5 |
| 128 | Daisy Davies | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/daisy-davies | 3 |
| 129 | Grace Thek | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/grace-thek | 24 |
| 130 | Marta Sánchez | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/marta-sanchez | 18 |
| 131 | India Lee | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/india-lee | 13 |
| 132 | Natalie Van Coevorden | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/natalie-van-coevorden | 4 |
| 134 | Anne-Sophie Pierre | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/anne-sophie-pierre | 8 |
| 135 | Cathia Schär | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/cathia-schar | 2 |
| 136 | Sara Svensk | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/sara-svensk | 7 |
| 137 | Tamara Jewett | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/tamara-jewett | 15 |
| 138 | Jackie Hering | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/jackie-hering | 18 |
| 139 | Daniela Kleiser | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/daniela-kleiser | 10 |
| 140 | Leana Bissig | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/leana-bissig | 8 |
| 141 | Kaidi Kivioja | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/kaidi-kivioja | 18 |
| 142 | Diede Diederiks | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/diede-diederiks | 9 |
| 143 | Megan McDonald | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/megan-mcdonald | 8 |
| 144 | Kate Curran | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/kate-curran | 13 |
| 145 | Fenella Langridge | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/fenella-langridge | 10 |
| 146 | Els Visser | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/els-visser | 13 |
| 147 | Ashleigh Gentle | PREVIOUSLY APPROVED | https://stats.protriathletes.org/athlete/ashleigh-gentle | existing approval |
| 148 | Rebecca Clarke | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/rebecca-clarke | 13 |
| 149 | Penny Slater | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/penny-slater | 8 |
| 150 | Lucy Byram | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/lucy-byram | 11 |
| 151 | Johanna Ahrens | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/johanna-ahrens | 8 |
| 152 | Danielle Lewis | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/danielle-lewis | 17 |
| 153 | Rhianne Hughes | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/rhianne-hughes | 8 |
| 158 | Gabrielle Lumkes | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/gabrielle-lumkes | 10 |
| 159 | Grace Alexander | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/grace-alexander | 11 |
| 160 | Jenny Jendryschik | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/jenny-jendryschik | 12 |
| 161 | Lydia Russell | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/lydia-russell | 6 |
| 162 | Marta Lagownik | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/marta-lagownik | 8 |
| 164 | Olivia Dietzel | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/olivia-dietzel | 13 |
| 166 | Alexia Bailly | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/alexia-bailly | 3 |
| 167 | Anastacia Damm Nielsen | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/anastacia-damm-nielsen | 5 |
| 170 | Chloe Lane | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/chloe-lane | 5 |
| 171 | Fiona Moriarty | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/fiona-moriarty | 9 |
| 173 | Joanna Ryter | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/joanna-ryter | 6 |
| 174 | Justine Guerard | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/justine-guerard | 3 |
| 178 | Rebecca Anderbury | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/rebecca-anderbury | 10 |
| 180 | Regan Hollioake | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/regan-hollioake | 10 |
| 182 | Skye Wallace | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/skye-wallace | 5 |
| 183 | Ali Brauer | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/ali-brauer | 2 |
| 185 | Annamarie Strehlow | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/annamarie-strehlow | 4 |
| 189 | Caroline Kaplan | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/caroline-kaplan | 5 |
| 199 | Jasmine Brown | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/jasmine-brown | 2 |
| 10002 | Aaron Royle | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/aaron-royle | 9 |
| 10021 | Alistair Brownlee | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/alistair-brownlee | 5 |
| 10041 | Antony Costes | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/antony-costes | 11 |
| 10054 | Ben Hamilton | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/ben-hamilton | 10 |
| 10061 | Benjamin Zorgnotti | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/benjamin-zorgnotti | 6 |
| 10064 | Bradley Weiss | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/bradley-weiss | 10 |
| 10075 | Caleb Noble | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/caleb-noble | 7 |
| 10116 | David McNamee | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/david-mcnamee | 6 |
| 10163 | Florian Angert | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/florian-angert | 6 |
| 10185 | Harry Palmer | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/harry-palmer | 6 |
| 10226 | Jarrod Osborne | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/jarrod-osborne | 9 |
| 10263 | Josh Amberger | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/josh-amberger | 8 |
| 10278 | Justus Nieschlag | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/justus-nieschlag | 8 |
| 10287 | Kenji Nener | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/kenji-nener | 3 |
| 10362 | Matt Burton | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/matt-burton | 3 |
| 10382 | Mattia Ceccarelli | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/mattia-ceccarelli | 9 |
| 10392 | Maximilian Sperl | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/maximilian-sperl | 6 |
| 10428 | Nicholas Quenet | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/nicholas-quenet | 2 |
| 10439 | Nicolas Mann | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/nicolas-mann | 9 |
| 10457 | Ondrej Kubo | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/ondrej-kubo | 3 |
| 10458 | Panagiotis Bitados | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/panagiotis-bitados | 4 |
| 10467 | Paul Schuster | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/paul-schuster | 13 |
| 10475 | Pierre Le Corre | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/pierre-le-corre | 5 |
| 10485 | Rasmus Svenningsson | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/rasmus-svenningsson | 4 |
| 10502 | Robert Kallin | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/robert-kallin | 11 |
| 10521 | Sam Laidlow | PREVIOUSLY APPROVED | https://stats.protriathletes.org/athlete/sam-laidlow | existing approval |
| 10569 | Thomas Bishop | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/thomas-bishop | 4 |
| 10581 | Thor Bendix Madsen | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/thor-bendix-madsen | 5 |
| 10610 | Valdemar Solok | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/valdemar-solok | 6 |
| 10640 | Ai Ueda | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/ai-ueda | 3 |
| 10644 | Alice Alberts | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/alice-alberts | 10 |
| 10653 | Amelia Watkinson | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/amelia-watkinson | 5 |
| 10661 | Anna Bergsten | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/anna-bergsten | 4 |
| 10667 | Anne Haug | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/anne-haug | 5 |
| 10668 | Anne Reischmann | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/anne-reischmann | 8 |
| 10697 | Cecilia Perez | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/cecilia-perez | 6 |
| 10698 | Charlene Clavel | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/charlene-clavel | 6 |
| 10701 | Chelsea Sodaro | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/chelsea-sodaro | 4 |
| 10712 | Daniela Bleymehl | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/daniela-bleymehl | 6 |
| 10713 | Daniela Ryf | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/daniela-ryf | 1 |
| 10715 | Danielle Fauteux | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/danielle-fauteux | 5 |
| 10721 | Diana Castillo Franco | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/diana-castillo-franco | 5 |
| 10728 | Elisabetta Curridori | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/elisabetta-curridori | 5 |
| 10736 | Emma Pallant-Browne | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/emma-pallant-browne | 6 |
| 10745 | Flora Duffy | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/flora-duffy | 3 |
| 10754 | Gurutze Frades Larralde | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/gurutze-frades-larralde | 4 |
| 10767 | Jeanni Metzler | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/jeanni-metzler | 1 |
| 10773 | Jocelyn McCauley | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/jocelyn-mccauley | 4 |
| 10779 | Julie Iemmolo | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/julie-iemmolo | 9 |
| 10780 | Justine Mathieux | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/justine-mathieux | 1 |
| 10798 | Kirsten Kasper | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/kirsten-kasper | 3 |
| 10802 | Kylie Simpson | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/kylie-simpson | 6 |
| 10808 | Laura Jansen | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/laura-jansen | 7 |
| 10810 | Laura Madsen | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/laura-madsen | 9 |
| 10813 | Laura Zimmermann | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/laura-zimmermann | 2 |
| 10814 | Lauren Brandon | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/lauren-brandon | 6 |
| 10821 | Lesley Smith | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/lesley-smith | 3 |
| 10825 | Lisa Becharas | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/lisa-becharas | 11 |
| 10827 | Lisa Norden | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/lisa-norden | 3 |
| 10849 | Marlene De Boer | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/marlene-de-boer | 7 |
| 10862 | Merle Brunnee | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/merle-brunnee | 4 |
| 10878 | Nikki Bartlett | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/nikki-bartlett | 6 |
| 10879 | Nina Derron | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/nina-derron | 7 |
| 10881 | Pamella Oliveira | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/pamella-oliveira | 5 |
| 10889 | Rachel Zilinskas | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/rachel-zilinskas | 4 |
| 10922 | Sif Bendix Madsen | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/sif-bendix-madsen | 4 |
| 10926 | Skye Moench | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/skye-moench | 2 |
| 10928 | Solenne Billouin | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/solenne-billouin | 3 |
| 20000 | Henri Schoeman | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/henri-schoeman | 4 |
| 20001 | Jannik Schaufler | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/jannik-schaufler | 9 |
| 20003 | Dylan Magnien | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/dylan-magnien | 6 |
| 20005 | Will Draper | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/will-draper | 6 |
| 20006 | Chloe Hartnett | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/chloe-hartnett | 5 |
| 20008 | Jessica Fullagar | HIGH CONFIDENCE | https://stats.protriathletes.org/athlete/jessica-fullagar | 1 |

## Owner action

Для новых строк заполнить owner_decision: APPROVE / REPLACE / SKIP. Для REPLACE указать replacement_url; это требует повторной live identity verification. Пустое поле — нет approval. Эти новые review CSV не передавать автоматически существующему importer: формат evidence шире исходного decisions CSV.

URL identity approval, field-level approval и запись registry — отдельные решения. HIGH CONFIDENCE лишь кандидат для batch review. Существующие 20 approvals нельзя заменять этим файлом. Никакого расширенного AGE/BORN/social import до отдельного согласования.

References: [source policy](scripts.md#data-source-policy), [import design](athlete-pto-import-design.md), [approved mappings](../src/data/athletes/ptoProfileMappings.json), [photo evidence](../src/data/athletes/athletePhotoEvidence.json).
