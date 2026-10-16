// POST /counterparty — новый контрагент
query "counterparty" verb=POST {
  api_group = "crm"
  auth = "user"
  input {
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
    function.run "counterparty_validate" {
      input = {
        type: $input.type,
        inn: $input.inn,
        kpp: $input.kpp,
        ogrn: $input.ogrn,
        full_name: $input.full_name
      }
    }

    db.add "counterparty" {
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
        created_at: now
      }
    } as $counterparty
  }
  response = $counterparty
}
