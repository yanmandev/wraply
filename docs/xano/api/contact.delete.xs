// DELETE /contact/{contact_id} — удаление контакта вместе с его привязками к сделкам
query "contact/{contact_id}" verb=DELETE {
  api_group = "Contact"
  auth = "user"
  input {
    int contact_id {
      table = "counterparty_contact"
    }
  }
  stack {
    db.query "deal_contact" {
      where = $db.deal_contact.contact_id == $input.contact_id
    } as $links

    db.transaction {
      stack {
        foreach ($links) {
          each as $link {
            db.del "deal_contact" {
              field_name = "id"
              field_value = $link.id
            }
          }
        }

        db.del "counterparty_contact" {
          field_name = "id"
          field_value = $input.contact_id
        }
      }
    }
  }
  response = { success: true }
}
