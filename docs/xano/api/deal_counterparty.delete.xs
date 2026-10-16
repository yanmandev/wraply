// DELETE /deal/{number}/counterparty/{counterparty_id} — отвязать контрагента
// вместе с его контактами по этой сделке
query "deal/{number}/counterparty/{counterparty_id}" verb=DELETE {
  api_group = "crm"
  auth = "user"
  input {
    text number filters=trim
    int counterparty_id {
      table = "counterparty"
    }
  }
  stack {
    function.run "deal_by_number" {
      input = { number: $input.number }
    } as $deal

    db.query "deal_counterparty" {
      where = $db.deal_counterparty.deal_id == $deal.id && $db.deal_counterparty.counterparty_id == $input.counterparty_id
      return = { type: "single" }
    } as $link

    precondition ($link != null) {
      error_type = "notfound"
      error = "Контрагент не привязан к сделке"
    }

    // Привязки контактов этого контрагента к сделке
    db.query "deal_contact" {
      join = {
        cc: {
          table: "counterparty_contact",
          type: "inner",
          where: $db.cc.id == $db.deal_contact.contact_id
        }
      }
      where = $db.deal_contact.deal_id == $deal.id && $db.cc.counterparty_id == $input.counterparty_id
    } as $contact_links

    db.transaction {
      stack {
        foreach ($contact_links) {
          each as $row {
            db.del "deal_contact" {
              field_name = "id"
              field_value = $row.id
            }
          }
        }

        db.del "deal_counterparty" {
          field_name = "id"
          field_value = $link.id
        }
      }
    }

    function.run "deal_card" {
      input = { deal_id: $deal.id }
    } as $card
  }
  response = $card
}
