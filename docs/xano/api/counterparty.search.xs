// GET /counterparty?search= — поиск по названию или ИНН (для выбора в сделку)
query "counterparty" verb=GET {
  api_group = "Counterparty"
  auth = "user"
  input {
    text search?="" filters=trim
    int page?=1 filters=min:1
    int per_page?=20 filters=min:1|max:100
  }
  stack {
    db.query "counterparty" {
      where = $db.counterparty.short_name includes $input.search || $db.counterparty.full_name includes $input.search || $db.counterparty.inn includes $input.search
      sort = { short_name: "asc" }
      return = {
        type: "list",
        paging: { page: $input.page, per_page: $input.per_page, totals: true }
      }
    } as $items
  }
  response = $items
}
