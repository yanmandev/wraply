table "counterparty" {
  auth = false
  schema {
    int id

    enum type?="organization" {
      values = ["organization", "ip", "individual"]
    }

    // Реквизиты — text: бывают ведущие нули, важна длина
    text inn? filters=trim
    text kpp? filters=trim
    text ogrn? filters=trim
    text short_name? filters=trim
    text full_name filters=trim
    date registered_at?
    text okpo? filters=trim
    text oktmo? filters=trim
    text director? filters=trim
    text accountant? filters=trim
    text address? filters=trim

    timestamp created_at?=now
    timestamp updated_at?
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "inn"}]}
  ]
}
