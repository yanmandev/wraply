// PATCH /deal/{number} — изменение полей сделки и статуса.
// Передаются только изменённые поля (null = не менять).
query "deal/{number}" verb=PATCH {
  api_group = "crm"
  auth = "user"
  input {
    text number filters=trim
    text? name? filters=trim
    text? status?
    text? client_type?
    int? mop_id? {
      table = "user"
    }
    int? mos_id? {
      table = "user"
    }
  }
  stack {
    function.run "deal_by_number" {
      input = { number: $input.number }
    } as $deal

    var $updates {
      value = ({ updated_at: now })|set_ifnotnull:"name":$input.name|set_ifnotnull:"status":$input.status|set_ifnotnull:"client_type":$input.client_type|set_ifnotnull:"mop_id":$input.mop_id|set_ifnotnull:"mos_id":$input.mos_id
    }

    db.patch "deal" {
      field_name = "id"
      field_value = $deal.id
      data = $updates
    }

    function.run "deal_card" {
      input = { deal_id: $deal.id }
    } as $card
  }
  response = $card
}
