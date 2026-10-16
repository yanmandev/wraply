// POST /deal/{number}/counterparty — привязать контрагента к сделке
query "deal/{number}/counterparty" verb=POST {
  api_group = "crm"
  auth = "user"
  input {
    text number filters=trim
    int counterparty_id {
      table = "counterparty"
    }
    bool is_primary?=false
  }
  stack {
    function.run "deal_by_number" {
      input = { number: $input.number }
    } as $deal

    db.query "deal_counterparty" {
      where = $db.deal_counterparty.deal_id == $deal.id && $db.deal_counterparty.counterparty_id == $input.counterparty_id
      return = { type: "exists" }
    } as $already

    precondition ($already == false) {
      error_type = "inputerror"
      error = "Контрагент уже привязан к сделке"
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

        db.add "deal_counterparty" {
          data = {
            deal_id: $deal.id,
            counterparty_id: $input.counterparty_id,
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
