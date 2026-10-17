// PATCH /deal/{number} — сохранение основных полей сделки (форма редактирования).
// name, client_type, mop_id, mos_id записываются как пришли — null очищает поле.
// status необязателен: не передан (null) — остаётся прежним.
query "deal/{number}" verb=PATCH {
  api_group = "Deal"
  auth = "user"
  input {
    text number filters=trim
    text name filters=trim
    text? client_type?
    int? mop_id? {
      table = "user"
    }
    int? mos_id? {
      table = "user"
    }
    text? status?
  }
  stack {
    function.run "deal_by_number" {
      input = { number: $input.number }
    } as $deal

    precondition (($input.name|strlen) > 0) {
      error_type = "inputerror"
      error = "Укажите название сделки"
    }

    db.edit "deal" {
      field_name = "id"
      field_value = $deal.id
      data = {
        name: $input.name,
        client_type: $input.client_type,
        mop_id: $input.mop_id,
        mos_id: $input.mos_id,
        status: $input.status ?? $deal.status,
        updated_at: now
      }
    }

    function.run "deal_card" {
      input = { deal_id: $deal.id }
    } as $card
  }
  response = $card
}
