# XanoScript для Wraply CRM

Это код таблиц, функций и эндпоинтов из [../data-model.md](../data-model.md). Каждый файл — одна конструкция. Его содержимое вставляется в редактор XanoScript в Xano (переключатель Visual / XanoScript) или загружается через Xano CLI/MCP.

## Порядок

1. **Таблицы** (`tables/`). В существующую таблицу `user` добавьте поле из `user.role.xs`. Остальные таблицы создавайте в таком порядке: `deal` → `deal_qualification` → `counterparty` → `deal_counterparty` → `counterparty_contact` → `deal_contact`. Порядок важен, потому что ссылки на таблицы требуют, чтобы целевая таблица уже существовала.
2. **Функции** (`functions/`): `deal_by_number`, `user_brief`, `counterparty_validate`, затем `deal_card`, потому что она вызывает `user_brief`.
3. **Эндпоинты** (`api/`). Сначала прочитайте `_api_group.xs`: там описано, в какую группу их класть.
4. **`auth/me`**. Поле `role` придёт в ответе само, если эндпоинт возвращает запись `user` целиком. Если ответ собран вручную, добавьте в него `role`.

## Эндпоинты

| Файл | Метод и путь |
|---|---|
| user.list.xs | GET /user?role= |
| deal.list.xs | GET /deal?search=&status=&mop_id=&page=&per_page= |
| deal.get.xs | GET /deal/{number} |
| deal.post.xs | POST /deal |
| deal.patch.xs | PATCH /deal/{number} |
| deal_qualification.patch.xs | PATCH /deal/{number}/qualification |
| counterparty.search.xs | GET /counterparty?search= |
| counterparty.post.xs | POST /counterparty |
| counterparty.patch.xs | PATCH /counterparty/{counterparty_id} |
| counterparty_contact.list.xs | GET /counterparty/{counterparty_id}/contact |
| counterparty_contact.post.xs | POST /counterparty_contact |
| counterparty_contact.patch.xs | PATCH /counterparty_contact/{contact_id} |
| counterparty_contact.delete.xs | DELETE /counterparty_contact/{contact_id} |
| deal_counterparty.post.xs | POST /deal/{number}/counterparty |
| deal_counterparty.delete.xs | DELETE /deal/{number}/counterparty/{counterparty_id} |
| deal_contact.post.xs | POST /deal/{number}/contact |
| deal_contact.patch.xs | PATCH /deal/{number}/contact/{contact_id} |
| deal_contact.delete.xs | DELETE /deal/{number}/contact/{contact_id} |

## Что проверить при импорте

Код написан по справочнику XanoScript (пакет `@xano/developer-mcp`), но в Xano ещё не запускался. Если редактор подсветит ошибку, она скорее всего в одном из этих мест:

- **`return = { type: "exists" }`** в `db.query`. Если такого типа нет, используйте `type: "count"` и сравнивайте результат с нулём.
- **`includes`** в поиске. Если поиск окажется чувствительным к регистру, приведите обе стороны к нижнему регистру или включите полнотекстовый индекс.
- **Поиск с пустой строкой.** Пустой `search` (`includes ""`) должен находить всё. Если не находит, оберните условие в null-safe вариант или в `conditional`.
- **`|map:{...}`** в `user.list.xs`. Если map с объектом не поддерживается, верните `$users` целиком: поля типа password Xano в ответ не отдаёт.
- **Фильтры `|shuffle`, `|get:0`, `|to_text`** в генерации номера сделки (`deal.post.xs`).
- **Входные `text` для enum-полей.** Недопустимое значение отклонит сама таблица при записи.
