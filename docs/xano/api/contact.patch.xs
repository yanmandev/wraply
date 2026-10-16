// PATCH /contact/{contact_id} — изменение контакта
query "contact/{contact_id}" verb=PATCH {
  api_group = "Contact"
  auth = "user"
  input {
    int contact_id {
      table = "counterparty_contact"
    }
    text name filters=trim
    text? phone? filters=trim
    text? note? filters=trim
  }
  stack {
    db.get "counterparty_contact" {
      field_name = "id"
      field_value = $input.contact_id
    } as $existing

    precondition ($existing != null) {
      error_type = "notfound"
      error = "Контакт не найден"
    }

    db.edit "counterparty_contact" {
      field_name = "id"
      field_value = $input.contact_id
      data = {
        name: $input.name,
        phone: $input.phone,
        note: $input.note
      }
    } as $contact
  }
  response = $contact
}
