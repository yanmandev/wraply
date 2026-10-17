// PATCH /deal/{number}/counterparty/{counterparty_id} — сделать контрагента основным клиентом сделки
query "deal/{number}/counterparty/{counterparty_id}" verb=PATCH {
  api_group = "Deal"
  auth = "user"
  input {
    text number filters=trim
    int counterparty_id {
      table = "counterparty"
    }
    bool is_primary
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

    db.transaction {
      stack {
        // Основной может быть только один
        conditional {
          if ($input.is_primary) {
            db.query "deal_counterparty" {
              where = $db.deal_counterparty.deal_id == $deal.id && $db.deal_counterparty.is_primary == true
            } as $primaries

            foreach ($primaries) {
              each as $row {
                db.edit "deal_counterparty" {
                  field_name = "id"
                  field_value = $row.id
                  data = { is_primary: false }
                }
              }
            }
          }
        }

        db.edit "deal_counterparty" {
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
