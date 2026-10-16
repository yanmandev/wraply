table "counterparty_contact" {
  auth = false
  schema {
    int id

    int counterparty_id {
      table = "counterparty"
    }

    text name filters=trim

    // Формат +79001234567 — нормализует фронт
    text phone? filters=trim

    // Примечание / роль: «водитель», «логист»
    text note? filters=trim

    timestamp created_at?=now
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "counterparty_id"}]}
  ]
}
