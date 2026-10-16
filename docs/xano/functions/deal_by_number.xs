function "deal_by_number" {
  description = "Сделка по красивому номеру или 404"
  input {
    text number filters=trim|to_upper
  }
  stack {
    db.get "deal" {
      field_name = "number"
      field_value = $input.number
    } as $deal

    precondition ($deal != null) {
      error_type = "notfound"
      error = "Сделка не найдена"
    }
  }
  response = $deal
}
