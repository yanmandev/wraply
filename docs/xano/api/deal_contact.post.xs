// POST /deal/{number}/contact — привязать контакт к сделке
query "deal/{number}/contact" verb=POST {
  api_group = "crm"
  auth = "user"
  input {
    text number filters=trim
    int contact_id {
      table = "counterparty_contact"
    }
    bool is_primary?=false
  }
  stack {
    function.run "deal_by_number" {
      input = { number: $input.number }
    } as $deal

    db.get "counterparty_contact" {
      field_name = "id"
      field_value = $input.contact_id
    } as $contact

    precondition ($contact != null) {
      error_type = "notfound"
      error = "Контакт не найден"
    }

    // Контрагент контакта должен быть привязан к сделке
    db.query "deal_counterparty" {
      where = $db.deal_counterparty.deal_id == $deal.id && $db.deal_counterparty.counterparty_id == $contact.counterparty_id
      return = { type: "exists" }
    } as $cp_linked

    precondition ($cp_linked) {
      error_type = "inputerror"
      error = "Сначала привяжите к сделке контрагента этого контакта"
    }

    db.query "deal_contact" {
      where = $db.deal_contact.deal_id == $deal.id && $db.deal_contact.contact_id == $input.contact_id
      return = { type: "exists" }
    } as $already

    precondition ($already == false) {
      error_type = "inputerror"
      error = "Контакт уже привязан к сделке"
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

        db.add "deal_contact" {
          data = {
            deal_id: $deal.id,
            contact_id: $input.contact_id,
            is_primary: $input.is_primary,
            created_at: now
          }
        }
      }
    }

    function.run "deal_card" {
      input = { deal_id: $deal.id }
    } as $card
  }
  response = $card
}
