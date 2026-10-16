// PATCH /deal/{number}/contact/{contact_id} — сделать контакт основным по сделке
query "deal/{number}/contact/{contact_id}" verb=PATCH {
  api_group = "crm"
  auth = "user"
  input {
    text number filters=trim
    int contact_id {
      table = "counterparty_contact"
    }
    bool is_primary
  }
  stack {
    function.run "deal_by_number" {
      input = { number: $input.number }
    } as $deal

    db.query "deal_contact" {
      where = $db.deal_contact.deal_id == $deal.id && $db.deal_contact.contact_id == $input.contact_id
      return = { type: "single" }
    } as $link

    precondition ($link != null) {
      error_type = "notfound"
      error = "Контакт не привязан к сделке"
    }

    db.transaction {
      stack {
        conditional {
          if ($input.is_primary) {
            db.query "deal_contact" {
              where = $db.deal_contact.deal_id == $deal.id && $db.deal_contact.is_primary == true
            } as $primaries

            foreach ($primaries) {
              each as $row {
                db.edit "deal_contact" {
                  field_name = "id"
                  field_value = $row.id
                  data = { is_primary: false }
                }
              }
            }
          }
        }

        db.edit "deal_contact" {
          field_name = "id"
          field_value = $link.id
          data = { is_primary: $input.is_primary }
        }
      }
    }

    function.run "deal_card" {
      input = { deal_id: $deal.id }
    } as $card
  }
  response = $card
}
