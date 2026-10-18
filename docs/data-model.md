# Модель данных: сделка, квалификация, контрагенты

Таблицы для Xano. Типы полей указаны так, как они называются в Xano. Значения enum совпадают с константами в `src/shared/constants/*.ts`.

Готовый XanoScript (таблицы, функции, эндпоинты) — в [xano/](xano/README.md).

```
user (role) ─< deal (mop_id, mos_id, created_by)
                 ├── deal_qualification   (1 : 1, deal_id unique)
                 ├─< deal_counterparty >── counterparty ──< counterparty_contact
                 └─< deal_contact >──────────────────────────┘
```

Контакт принадлежит контрагенту (`counterparty_contact`). К сделке контакты привязываются отдельно через `deal_contact`: у компании может быть десять контактов, а по конкретной сделке работают двое.

## user — добавить поля

| Поле | Тип Xano | Обяз. | Описание |
|---|---|---|---|
| role | enum, default `mop` | ✓ | `admin` Администратор · `mop` МОП · `mos` МОС |
| first_name | text | ✓ | Имя |
| last_name | text | ✓ | Фамилия |
| status | enum, default `active` | ✓ | `active` Активный · `inactive` Неактивный (доступ временно ограничен) · `archived` Архивный (больше не нужен) |

- Поле `name` остаётся: эндпоинты заполняют его как «Имя Фамилия», его показывают МОП и МОС в сделках.
- Войти может только `active`. Это проверяют `auth/login` и `auth/me`: для `inactive` и `archived` они отвечают 403. Фронт перепроверяет `auth/me` при возвращении на вкладку и раз в 5 минут, поэтому ограниченный пользователь выходит из системы, не дожидаясь, пока истечёт токен.
- В выборе МОП и МОС (`GET /user?role=`) показываются только активные.
- Управлять пользователями (группа User) может только активный `admin` — это проверяет функция `require_admin`. Себя нельзя понизить, ограничить или удалить. Пользователя, который указан в сделках, удалить нельзя — только перевести в архив.

## deal — сделка

| Поле | Тип Xano | Обяз. | Описание |
|---|---|---|---|
| id | integer (auto) | ✓ | |
| number | text, **unique index** | ✓ | Красивый номер `10001KB` (латиница), генерирует бэкенд при создании; по нему строится URL `/deals/:number` |
| name | text | ✓ | Название сделки |
| status | enum | ✓ | Этап воронки, по умолчанию `need_identified` (см. ниже) |
| client_type | enum | | `organization` · `ip` · `individual` · `government` |
| mop_id | table reference → user | | МОП по сделке |
| mos_id | table reference → user | | МОС по сделке |
| created_by | table reference → user | | Кто создал (заполняется из `auth.id`) |
| created_at | timestamp (default now) | ✓ | |
| updated_at | timestamp | | Обновлять в каждом PATCH-эндпоинте |

Индексы: `number` (unique), `status`, `mop_id`, `created_at`.

### Генерация number

Самый быстрый способ — номер строится из `id`, тогда он уникален без лишних проверок. В эндпоинте `POST /deal`:

1. **Add Record** в `deal`, поле `number` пока пустое.
2. Две случайные латинские буквы без I и O (их легко спутать с 1 и 0): `["A", "B", …, "Z"]|shuffle`, затем `|get:0` и `|get:1`. Латиница нужна, чтобы номер попадал в URL без кодирования (`/deals/10001KB`).
3. **Edit Record**: `number = (deal.id + 10000)|to_text ~ letters`. Получается `10001KB`, `10002AM` и так далее.

Если позже понадобится другой формат, менять придётся только этот шаг: на фронте `number` — обычная строка.

### status — этапы воронки

| Значение | Подпись |
|---|---|
| need_identified | Потребность выявлена |
| tz_formed | ТЗ сформировано |
| zm_dm_cp | ЗМ/ДМ/ЦП |
| pre_calc | Предварительный расчёт |
| zm_dm_cp_push | ЗМ/ДМ/ЦП Дожим |
| kp_sent | КП отправлено |
| push_started | Дожим запущен |
| contract_sent | Договор/Счёт направлен |
| handed_to_mos | Передано МОСУ |
| closing_docs | Закрывающие документы |
| completed | Сделка завершена |

## deal_qualification — квалификация (заполняет МОП)

Отдельная таблица в связи 1 : 1 со сделкой. Тип клиента, МОП и МОС хранятся в `deal`: они нужны в реестре сделок и в фильтрах. Форма квалификации показывает и сохраняет их вместе с ответами ниже.

| Поле | Тип Xano | Вопрос | Значения |
|---|---|---|---|
| id | integer (auto) | | |
| deal_id | table reference → deal, **unique** | | |
| vehicle_count | integer | Сколько авто надо забрендировать? | |
| operating_conditions | text | Где и в каких условиях эксплуатируется авто? | |
| install_place | enum | Монтаж у нас или выезд к клиенту? | `our_site` У нас · `client_site` Выезд к клиенту · `discussing` Обсуждается |
| old_film | enum | Есть плёнка, которую надо снять? | `yes` Да · `no` Нет · `partial` Частично |
| measurement | enum | Есть ли замер ТС? | `yes` Да · `no` Нет · `need_ours` Нужен наш замер |
| vehicles | text | Тип/модель и кол-во ТС? | |
| goal | text | Основная цель брендирования? | |
| deadline | text | Сроки оклейки? | |
| priority | enum | Максимальный срок службы или бюджет? | `max_lifetime` Максимальный срок · `budget` Бюджетный · `discussing` Обсуждается |
| design | enum | Дизайн: есть / сам / у нас? | `ready` Есть готовый · `by_client` Разрабатывает сам · `by_us` Делает у нас |
| invoice_requirements | text | Требования к счёту? | |
| created_at | timestamp (default now) | | |
| updated_at | timestamp | | |

Все поля необязательные: квалификация заполняется постепенно, а прогресс «N из 12» считается на фронте.

## counterparty — контрагент

| Поле | Тип Xano | Описание |
|---|---|---|
| id | integer (auto) | |
| type | enum | `organization` Организация · `ip` ИП · `individual` Физлицо |
| inn | text | ИНН (10 цифр у организации, 12 у ИП и физлица) |
| kpp | text | КПП (9 цифр, только у организации) |
| ogrn | text | ОГРН (13 цифр) или ОГРНИП (15 цифр) |
| short_name | text | Сокращённое наименование |
| full_name | text | Полное наименование или ФИО |
| registered_at | date | Дата гос. регистрации |
| okpo | text | ОКПО |
| oktmo | text | ОКТМО |
| director | text | Ген. директор |
| accountant | text | Гл. бухгалтер |
| address | text | Адрес |
| created_at | timestamp (default now) | |
| updated_at | timestamp | |

Реквизиты хранятся в text, а не в integer: в них бывают ведущие нули, а длина важна. Индекс по `inn` не уникальный, потому что у филиалов один ИНН и разные КПП.

Какие поля обязательны:

| Тип | Обязательные | Показываемые |
|---|---|---|
| organization | inn, kpp, ogrn, full_name | все |
| ip | inn, ogrn, full_name | все, кроме kpp, director, accountant |
| individual | full_name | inn, full_name, address |

Валидация выполняется в Zod на фронте и дублируется в API-эндпоинте Xano (preconditions).

## deal_counterparty — связь сделки и контрагента (многие ко многим)

| Поле | Тип Xano | Описание |
|---|---|---|
| id | integer (auto) | |
| deal_id | table reference → deal | |
| counterparty_id | table reference → counterparty | |
| is_primary | bool (default false) | Основной клиент: его показываем в реестре сделок в колонке «Клиент» |
| created_at | timestamp (default now) | |

Уникальный составной индекс: `deal_id + counterparty_id`.

## counterparty_contact — контакт контрагента

| Поле | Тип Xano | Описание |
|---|---|---|
| id | integer (auto) | |
| counterparty_id | table reference → counterparty | |
| name | text | Имя |
| phone | text | Телефон, хранится в формате `+79001234567` |
| note | text | Примечание или роль («водитель», «логист») |
| created_at | timestamp (default now) | |

## deal_contact — контакты сделки (многие ко многим)

| Поле | Тип Xano | Описание |
|---|---|---|
| id | integer (auto) | |
| deal_id | table reference → deal | |
| contact_id | table reference → counterparty_contact | |
| is_primary | bool (default false) | Основное контактное лицо по сделке |
| created_at | timestamp (default now) | |

Уникальный составной индекс: `deal_id + contact_id`.

Привязать к сделке можно только контакт контрагента, который сам привязан к этой сделке. Это проверяется в эндпоинте (precondition). Если контрагента отвязывают от сделки, его контакты отвязываются вместе с ним.

## our_entity — наши юрлица («Наши реквизиты»)

От чьего имени выставляется счёт и подписывается договор. В прототипе это ИП Куранов, ООО Марк Групп и ООО Супер Винил. Начальные данные — в [xano/seed/our_entity.csv](xano/seed/our_entity.csv).

| Поле | Тип Xano | Описание |
|---|---|---|
| short_name | text | Название в списках: «ООО Марк Групп» |
| full_name, inn, kpp, ogrn, address | text | Реквизиты |
| bank_name, bik, account, corr_account | text | Банк — для печатной формы счёта |
| vat_rate | int | НДС, %: `null` — без НДС, `20` — суммы документов указываются с НДС |
| is_active | bool, default true | Неактивные не предлагаются для новых документов |
| sort | int | Порядок в списке |

Отдельная таблица, а не enum: у юрлиц есть реквизиты, ставка НДС и банк, а их список может меняться.

## deal_document — документы по сделке

| Поле | Тип Xano | Описание |
|---|---|---|
| deal_id | ссылка → deal | |
| type | enum, default `invoice` | `invoice` Счёт · `act_upd` Акт/УПД · `contract` Договор · `specification` Спецификация · `invoice_factura` Счёт-фактура · `other` Прочее |
| title | text, обязательное | «Счёт №112 от 14.08.2026»; по умолчанию — имя файла |
| number, doc_date | text, date | Номер и дата документа (необязательно) |
| amount | decimal | Сумма, ₽ — **только у Счёта и Акта/УПД**. С НДС, если у `our_entity` задан `vat_rate` |
| pay_date | date | Дата оплаты — **только у Счёта** |
| payment_terms | enum | **Только у Счёта:** `prepay_100` Предоплата 100% · `postpay_30` / `postpay_60` / `postpay_90` Постоплата 30/60/90 дней |
| status | enum, default `uploaded` | `draft` Черновик · `issued` Выставлен, не оплачен · `paid` Оплачен · `signing` На подписании (ЭДО) · `signed` Подписан · `uploaded` Загружен |
| exchange | enum, default `edo` | `edo` ЭДО · `paper` Бумага |
| our_entity_id | ссылка → our_entity | «Наши реквизиты» |
| counterparty_id | ссылка → counterparty | Для какого контрагента сделки документ (их может быть несколько) |
| comment | text | Комментарий |
| file_url | text | Ссылка на файл (Яндекс.Диск, Google Drive и т.п.), проверяется на http(s):// |
| file_name | text | Название файла — фронт берёт его из ссылки |
| created_by, created_at, updated_at | | |

- **Поля по типу.** Сумма есть только у Счёта и Акта/УПД, дата и условия оплаты — только у Счёта, как в прототипе. Лишние поля сервер обнуляет: это делает функция `document_normalize`.
- **Статусы по типу.** Для счёта осмысленны «Черновик → Выставлен → Оплачен», для актов и договоров — «Черновик → На подписании → Подписан». Сервер этого не ограничивает, это подсказка для интерфейса (`DOC_STATUSES_BY_TYPE` во фронте).
- **Сводка блока** «Выставлено N ₽ · оплачено M ₽» = сумма счетов / сумма счетов в статусе «Оплачен». Её считает фронт по списку документов.
- **Файлы — ссылками, а не загрузкой в Xano.** На бесплатном тарифе Xano закрыта вся работа с файлами: и входной параметр типа `file`, и поле `attachment`. Xano отвечает «Not supported. Please upgrade your Xano instance» даже на запрос без файла. Поэтому документ хранит ссылку `file_url` на файл во внешнем хранилище, а при удалении документа удаляется только запись.
- **Как вернуть загрузку файлов** (платный тариф Xano или S3): добавить в `deal_document` поле `attachment? file`, в post/patch — входной параметр `file? upload` и `storage.create_attachment`, скачивание — через `storage.sign_private_url`. Колонку «Файл» во фронте можно оставить: она открывает ссылку.

## Пошаговая форма создания сделки

1. **Основное:** название, тип клиента, МОП (по умолчанию текущий пользователь), МОС.
2. **Клиент:** поиск контрагента по названию или ИНН среди существующих либо создание нового с реквизитами по типу. Можно добавить несколько контрагентов и отметить основного. Здесь же контакты по сделке: выбираются из контактов добавленных контрагентов или создаются новые. Контактов может быть несколько, один отмечается основным.
3. **Квалификация:** 11 вопросов. Шаг можно пропустить и заполнить позже в карточке сделки.

Сделка создаётся в Xano одним запросом `POST /deal` после последнего шага: это проще, чем держать черновики. В ответе приходит `number`, и фронт переходит на `/deals/:number`.

## Предлагаемые эндпоинты Xano

| Метод | Путь | Что делает |
|---|---|---|
| GET | /user?role= | Сотрудники для полей МОП и МОС: id, name, role |
| GET | /deal | Реестр сделок: фильтры status, mop_id, поиск; пагинация |
| GET | /deal/{number} | Сделка вместе с qualification, counterparties[], contacts[] (контакты сделки с флагом is_primary), mop, mos |
| POST | /deal | Создание: deal, qualification, counterparties, contacts; генерирует number |
| PATCH | /deal/{number} | Сохранение основных полей (name, client_type, mop_id, mos_id; null очищает), status — по желанию |
| PATCH | /deal/{number}/qualification | Сохранение квалификации |
| GET | /counterparty?search= | Поиск контрагентов по названию или ИНН |
| POST / PATCH | /counterparty | Создание или изменение контрагента |
| POST / PATCH / DELETE | /contact | Контакты контрагентов (группа Contact) |
| POST / DELETE | /deal/{number}/counterparty | Привязка или отвязка контрагента (вместе с его контактами) |
| PATCH | /deal/{number}/counterparty/{counterparty_id} | Сделать контрагента основным |
| GET | /contact?counterparty_id= | Контакты контрагента для выбора в сделку |
| POST / PATCH / DELETE | /deal/{number}/contact | Привязка или отвязка контакта, смена основного |
