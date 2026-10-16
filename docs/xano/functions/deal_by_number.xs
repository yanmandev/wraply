function "deal_by_number" {
  description = "Сделка по красивому номеру или 404"
  input {
    text number filters=trim
  }
  stack {
    // Номер латиницей (10001KB). to_upper нельзя в filters у input — приводим регистр здесь,
    // чтобы находился и набранный строчными 10001kb.
    // url_decode — на случай старых номеров с кириллицей в URL (%D0%96…); латиницу не меняет.
    var $number { value = $input.number|url_decode|to_upper }

    db.get "deal" {
      field_name = "number"
      field_value = $number
    } as $deal

    precondition ($deal != null) {
      error_type = "notfound"
      error = "Сделка не найдена"
    }
  }
  response = $deal
}
