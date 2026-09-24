# Athlete photo staging — manual review

Скачано 16 файлов, 5323427 bytes. Все PNG 600×600, HTTP 200, final URL соответствует принятому URL. Все reviewStatus = PENDING_MANUAL_REVIEW. Identity по фотографии не подтверждалась.

[Открыть manual review HTML](../../.athlete-photo-staging/review.html) · [Полный staging manifest](../../.athlete-photo-staging/manifest.json) · [Проверки](athlete-photo-staging-validation.json)

Validation status REVIEW_REQUIRED означает слабый perceptual match; декодирование, MIME, размеры и SHA проверены у всех 16.

| Athlete | Validation | Dimensions | Bytes | SHA-256 |
|---|---|---|---:|---|
| Harry Palmer | VALIDATED | 600×600 | 396641 | `32bc7361c3496774d861c2b8446a2b42d7e448318016385993e375a41b577d8a` |
| Panagiotis Bitados | REVIEW_REQUIRED | 600×600 | 326492 | `20b1a4b67df51c762a5d7860a4ba7c1ab463b1db3422113dd97bc07552ec21bc` |
| Justus Nieschlag | REVIEW_REQUIRED | 600×600 | 365668 | `36a7cc10fbc0ffdd253b1d299aa488c38c4c8e7beb59614e6efecd2f42ee0360` |
| Pierre Le Corre | REVIEW_REQUIRED | 600×600 | 230729 | `67f8e7e208603f4aa6d208cbd12a7d17431aa68a15dc0167d60b2c4a440aa8a7` |
| Alistair Brownlee | REVIEW_REQUIRED | 600×600 | 349021 | `da5aa5719baf9bde507d83d763025570aa7b4733efd7d185c3e990f1647e57a4` |
| David McNamee | REVIEW_REQUIRED | 600×600 | 299384 | `7c9d48d15bf259e174cc7824ee0c5df9daf406a449910d473a22d69b0cf9b9e7` |
| Nicolas Mann | REVIEW_REQUIRED | 600×600 | 329801 | `013a30a6307fe3bc773343b034a7ecaada7ad42765cd03a73fe3ce046807904b` |
| Emma Pallant-Browne | REVIEW_REQUIRED | 600×600 | 309474 | `1480a61ed60cd2c62f803d003111262d93a5bd41dd229dd09a260bf0c151dc7e` |
| Anne Reischmann | REVIEW_REQUIRED | 600×600 | 287390 | `d9717e69e0120823a5158120a89074f673a7206c92c255a7e6e131e433b27de5` |
| Nikki Bartlett | VALIDATED | 600×600 | 278028 | `6222909c5c86a88e58572fd98af78bbdf36b36daf3af4c12f854d6aa9b10ee55` |
| Laura Madsen | VALIDATED | 600×600 | 510715 | `80b74cff4861128337412649c799b520e9c0f1ac85030b9cbea176256d6715fb` |
| Anne Haug | REVIEW_REQUIRED | 600×600 | 314316 | `2357b451a9aff4e6b179c3d5f85f8aac244c559b28e6c722dc0b185b6cb40ec2` |
| Alice Alberts | VALIDATED | 600×600 | 262697 | `159ce04fd9745ad39fd0a7e96ddf0ecad7004b4751dbb07f378c51d217bb7ac1` |
| Laura Jansen | VALIDATED | 600×600 | 303589 | `876e599237e667dc4ab0440ae6366a605eeda6a6cadbdcc3653accd3860e2d7e` |
| Lisa Becharas | VALIDATED | 600×600 | 420430 | `8637343144e3205570ec85077db311d1bc2c9c0606a9b3c11ff362935765f9b4` |
| Nina Derron | REVIEW_REQUIRED | 600×600 | 339052 | `abe0ac980a7df6709300175162f4513436f5685bf14c39fc0d6dd244cd469c5c` |

## Сопоставления

Exact bytes / одинаковые decoded pixels: 0. Ни один confirmed content collision с production не найден. Слабые dHash-сигналы: 5 пар staging и 57 пар с production. Сходство композиции не доказывает совпадение изображений/людей. Все пары доступны для визуального сравнения в HTML.

| Candidate | Other athlete | Scope | dHash distance |
|---|---|---|---:|
| Panagiotis Bitados | Justus Nieschlag | staging | 5 |
| Panagiotis Bitados | Colin Szuch | production | 6 |
| Panagiotis Bitados | Grace Thek | production | 4 |
| Panagiotis Bitados | Jackson Laundry | production | 6 |
| Panagiotis Bitados | Leana Bissig | production | 6 |
| Panagiotis Bitados | Lisa Perterer | production | 6 |
| Panagiotis Bitados | Marc Dubrick | production | 6 |
| Justus Nieschlag | Ashleigh Gentle | production | 6 |
| Justus Nieschlag | Colin Szuch | production | 5 |
| Justus Nieschlag | Ellie Salthouse | production | 6 |
| Justus Nieschlag | Grace Thek | production | 3 |
| Justus Nieschlag | Lisa Perterer | production | 5 |
| Justus Nieschlag | Marc Dubrick | production | 5 |
| Justus Nieschlag | Mika Noodt | production | 6 |
| Justus Nieschlag | Sam Long | production | 6 |
| Pierre Le Corre | Marc Dubrick | production | 6 |
| Pierre Le Corre | Mika Noodt | production | 5 |
| Alistair Brownlee | David McNamee | staging | 6 |
| Alistair Brownlee | Anne Haug | staging | 6 |
| Alistair Brownlee | Rudy von Berg | production | 3 |
| Alistair Brownlee | Sam Laidlow | production | 1 |
| David McNamee | Anne Haug | staging | 6 |
| David McNamee | Jackie Hering | production | 6 |
| David McNamee | James Teagle | production | 5 |
| David McNamee | Jan Stratmann | production | 6 |
| David McNamee | Kate Curran | production | 4 |
| David McNamee | Laura Philipp | production | 5 |
| David McNamee | Rudy von Berg | production | 5 |
| Nicolas Mann | Antonio Benito López | production | 4 |
| Nicolas Mann | Grace Alexander | production | 6 |
| Nicolas Mann | Grace Thek | production | 6 |
| Nicolas Mann | Gregor Payet | production | 6 |
| Nicolas Mann | Jake Birtwhistle | production | 6 |
| Nicolas Mann | Jelle Geens | production | 6 |
| Nicolas Mann | Jonas Schomburg | production | 5 |
| Nicolas Mann | Kyle Smith | production | 5 |
| Nicolas Mann | Lena Meißner | production | 4 |
| Nicolas Mann | Lisa Perterer | production | 4 |
| Nicolas Mann | Marc Dubrick | production | 6 |
| Nicolas Mann | Marta Sánchez | production | 6 |
| Nicolas Mann | Marten Van Riel | production | 4 |
| Nicolas Mann | Mika Noodt | production | 5 |
| Nicolas Mann | Sam Long | production | 5 |
| Nicolas Mann | Samuel Dickinson | production | 6 |
| Nicolas Mann | Vincent Luis | production | 4 |
| Emma Pallant-Browne | Anne Haug | staging | 6 |
| Emma Pallant-Browne | Jackie Hering | production | 6 |
| Emma Pallant-Browne | Joshua Lewis | production | 6 |
| Emma Pallant-Browne | Kat Matthews | production | 6 |
| Anne Reischmann | Ben Kanute | production | 4 |
| Anne Reischmann | Clément Mignon | production | 6 |
| Anne Reischmann | Kat Matthews | production | 5 |
| Anne Reischmann | Tamara Jewett | production | 5 |
| Anne Haug | Jackie Hering | production | 6 |
| Anne Haug | James Teagle | production | 5 |
| Anne Haug | Jordi Montraveta Moya | production | 6 |
| Anne Haug | Joshua Lewis | production | 6 |
| Anne Haug | Kat Matthews | production | 6 |
| Anne Haug | Kate Curran | production | 6 |
| Anne Haug | Rudy von Berg | production | 5 |
| Anne Haug | Sam Laidlow | production | 5 |
| Nina Derron | Penny Slater | production | 6 |

## Проверки

24/24 tests; обе audits выполнены. Athlete audit: прежние 2 missing-country issues; results: 0 errors, 0 warnings, 52 source notes. Ranking order/scores и linkage не изменились при фиксированном asOf. 149 production files, registry и bundled athlete assets побайтово сохранены. Повторный staging run выполнен с запретом сетевых вызовов и использовал все 16 файлов повторно.

Защищённые фото/registry: before = after = 0ac70e0ce0a66f38de12b272b232381319fc0542ea7f3e282e3fb6e55435152c.

Publish реализован отдельно и испытан только на временных test roots: APPROVED, byte-bound review, preflight, old-extension cleanup, post-write photo audit, rollback после files/registry. На реальном каталоге publish не запускался. Для возможных perceptual совпадений публикация блокируется до отдельного разбора.

Следующий шаг — ручной визуальный review человеком. Ничего не staged в Git, commit/push не выполнялись.
