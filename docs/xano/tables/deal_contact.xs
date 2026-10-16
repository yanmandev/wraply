table "deal_contact" {
  auth = false
  schema {
    int id

    int deal_id {
      table = "deal"
    }

    int contact_id {
      table = "counterparty_contact"
    }

    // Основное контактное лицо по сделке
    bool is_primary?=false

    timestamp created_at?=now
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "deal_id"}, {name: "contact_id"}]}
    {type: "btree", field: [{name: "contact_id"}]}
  ]
}
