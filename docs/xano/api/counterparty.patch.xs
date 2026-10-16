// PATCH /counterparty/{counterparty_id} — изменение реквизитов.
// Фронт отправляет форму реквизитов целиком.
query "counterparty/{counterparty_id}" verb=PATCH {
  api_group = "Counterparty"
  auth = "user"
  input {
    int counterparty_id {
      table = "counterparty"
    }
    text type
    text? inn? filters=trim
    text? kpp? filters=trim
    text? ogrn? filters=trim
    text? short_name? filters=trim
    text full_name filters=trim
    date? registered_at?
    text? okpo? filters=trim
    text? oktmo? filters=trim
    text? director? filters=trim
    text? accountant? filters=trim
    text? address? filters=trim
  }
  stack {
    db.get "counterparty" {
      field_name = "id"
      field_value = $input.counterparty_id
    } as $existing

    precondition ($existing != null) {
      error_type = "notfound"
      error = "Контрагент не найден"
    }

    function.run "counterparty_validate" {
      input = {
        type: $input.type,
        inn: $input.inn,
        kpp: $input.kpp,
        ogrn: $input.ogrn,
        full_name: $input.full_name
      }
    }

    db.edit "counterparty" {
      field_name = "id"
      field_value = $input.counterparty_id
      data = {
        type: $input.type,
        inn: $input.inn,
        kpp: $input.kpp,
        ogrn: $input.ogrn,
        short_name: $input.short_name,
        full_name: $input.full_name,
        registered_at: $input.registered_at,
        okpo: $input.okpo,
        oktmo: $input.oktmo,
        director: $input.director,
        accountant: $input.accountant,
        address: $input.address,
        updated_at: now
      }
    } as $counterparty
  }
  response = $counterparty
}
