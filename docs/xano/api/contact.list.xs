// GET /contact?counterparty_id= — контакты контрагента
query "contact" verb=GET {
  api_group = "Contact"
  auth = "user"
  input {
    int counterparty_id {
      table = "counterparty"
    }
  }
  stack {
    db.query "counterparty_contact" {
      where = $db.counterparty_contact.counterparty_id == $input.counterparty_id
      sort = { name: "asc" }
    } as $contacts
  }
  response = $contacts
}
