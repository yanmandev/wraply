table "deal_counterparty" {
  auth = false
  schema {
    int id

    int deal_id {
      table = "deal"
    }

    int counterparty_id {
      table = "counterparty"
    }

    // Основной клиент — показывается в реестре сделок
    bool is_primary?=false

    timestamp created_at?=now
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "deal_id"}, {name: "counterparty_id"}]}
    {type: "btree", field: [{name: "counterparty_id"}]}
  ]
}
