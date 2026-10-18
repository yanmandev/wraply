# XanoScript для Wraply CRM

Это код таблиц, функций и эндпоинтов из [../data-model.md](../data-model.md). Каждый файл — одна конструкция. Его содержимое вставляется в редактор XanoScript в Xano (переключатель Visual / XanoScript) или загружается через Xano CLI/MCP.

## Порядок

1. **Таблицы** (`tables/`). В существующую таблицу `user` добавьте поля из `user.fields.xs` (role, first_name, last_name, status). Остальные таблицы создавайте в таком порядке: `deal` → `deal_qualification` → `counterparty` → `deal_counterparty` → `counterparty_contact` → `deal_contact` → `our_entity` → `deal_document`. Порядок важен, потому что ссылки на таблицы требуют, чтобы целевая таблица уже существовала.
2. **Функции** (`functions/`): `deal_by_number`, `user_brief`, `counterparty_validate`, затем `deal_card`, потому что она вызывает `user_brief`. Для пользователей: `user_check_status`, `user_public`, `require_admin`. Для документов: `document_normalize`, `document_link_check`, `deal_document_get`.
3. **Эндпоинты** (`api/`) раскладываются по группам Deal, Counterparty, Contact, User и Authentication (см. таблицу ниже и `_api_group.xs`). Группу User нужно создать.
4. **`auth/login` и `auth/me`** замените версиями из `auth.login.xs` и `auth.me.xs`: они не пускают неактивных и архивных пользователей.

## Эндпоинты

| Группа | Файл | Метод и путь |
|---|---|---|
| Authentication | auth.login.xs | POST /auth/login (замена: проверка статуса) |
| Authentication | auth.me.xs | GET /auth/me (замена: проверка статуса, без пароля в ответе) |
| Authentication | auth.user.list.xs | GET /user?role= (только активные) |
| User | user.list.xs | GET /user?search=&role=&status=&page= |
| User | user.post.xs | POST /user |
| User | user.patch.xs | PATCH /user/{user_id} |
| User | user.delete.xs | DELETE /user/{user_id} |
| Deal | deal.list.xs | GET /deal?search=&status=&mop_id=&page=&per_page= |
| Deal | deal.stats.xs | GET /deal_stats?mop_id=&since= (сводка над реестром) |
| Deal | deal.get.xs | GET /deal/{number} |
| Deal | deal.post.xs | POST /deal |
| Deal | deal.patch.xs | PATCH /deal/{number} |
| Deal | our_entity.list.xs | GET /our_entity |
| Deal | deal_document.list.xs | GET /deal/{number}/document |
| Deal | deal_document.post.xs | POST /deal/{number}/document (JSON, файл — ссылкой file_url) |
| Deal | deal_document.patch.xs | PATCH /deal/{number}/document/{document_id} (JSON) |
| Deal | deal_document.delete.xs | DELETE /deal/{number}/document/{document_id} |
| Deal | deal_qualification.patch.xs | PATCH /deal/{number}/qualification |
| Deal | deal_counterparty.post.xs | POST /deal/{number}/counterparty |
| Deal | deal_counterparty.patch.xs | PATCH /deal/{number}/counterparty/{counterparty_id} |
| Deal | deal_counterparty.delete.xs | DELETE /deal/{number}/counterparty/{counterparty_id} |
| Deal | deal_contact.post.xs | POST /deal/{number}/contact |
| Deal | deal_contact.patch.xs | PATCH /deal/{number}/contact/{contact_id} |
| Deal | deal_contact.delete.xs | DELETE /deal/{number}/contact/{contact_id} |
| Counterparty | counterparty.search.xs | GET /counterparty?search= |
| Counterparty | counterparty.post.xs | POST /counterparty |
| Counterparty | counterparty.patch.xs | PATCH /counterparty/{counterparty_id} |
| Contact | contact.list.xs | GET /contact?counterparty_id= |
| Contact | contact.post.xs | POST /contact |
| Contact | contact.patch.xs | PATCH /contact/{contact_id} |
| Contact | contact.delete.xs | DELETE /contact/{contact_id} |

У каждой группы свой base URL (`https://<host>/api:<canonical>`). Canonical групп нужно прописать во фронте, в `.env.loc` / `.env.dev`: `VITE_API_GROUP_DEAL`, `VITE_API_GROUP_COUNTERPARTY`, `VITE_API_GROUP_CONTACT`, `VITE_API_GROUP_USER`.
## Что проверить при импорте

Код написан по справочнику XanoScript (пакет `@xano/developer-mcp`), но в Xano ещё не запускался. Если редактор подсветит ошибку, она скорее всего в одном из этих мест:

- **`return = { type: "exists" }`** в `db.query`. Если такого типа нет, используйте `type: "count"` и сравнивайте результат с нулём.
- **`includes`** в поиске. Если поиск окажется чувствительным к регистру, приведите обе стороны к нижнему регистру или включите полнотекстовый индекс.
- **Поиск с пустой строкой.** Пустой `search` (`includes ""`) должен находить всё. Если не находит, оберните условие в null-safe вариант или в `conditional`.
- **`|map:{...}`** в `user.list.xs`. Если map с объектом не поддерживается, верните `$users` целиком: поля типа password Xano в ответ не отдаёт.
- **Фильтры `|shuffle`, `|get:0`, `|to_text`** в генерации номера сделки (`deal.post.xs`).
- **Входные `text` для enum-полей.** Недопустимое значение отклонит сама таблица при записи.
