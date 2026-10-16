// POST /contact — новый контакт контрагента
query "contact" verb=POST {
  api_group = "Contact"
  auth = "user"
  input {
    int counterparty_id {
      table = "counterparty"
    }
    text name filters=trim
    text? phone? filters=trim
    text? note? filters=trim
  }
  stack {
    precondition (($input.name|strlen) > 0) {
      error_type = "inputerror"
      error = "Укажите имя контакта"
    }

    db.add "counterparty_contact" {
      data = {
        counterparty_id: $input.counterparty_id,
        name: $input.name,
        phone: $input.phone,
        note: $input.note,
        created_at: now
      }
    } as $contact
  }
  response = $contact
}
