function "deal_card" {
  description = "Полная карточка сделки: квалификация, контрагенты, контакты, МОП/МОС"
  input {
    int deal_id {
      table = "deal"
    }
  }
  stack {
    db.get "deal" {
      field_name = "id"
      field_value = $input.deal_id
    } as $deal

    precondition ($deal != null) {
      error_type = "notfound"
      error = "Сделка не найдена"
    }

    db.query "deal_qualification" {
      where = $db.deal_qualification.deal_id == $deal.id
      return = { type: "single" }
    } as $qualification

    // Контрагенты сделки целиком + флаг is_primary из связи
    db.query "counterparty" {
      join = {
        dc: {
          table: "deal_counterparty",
          type: "inner",
          where: $db.dc.counterparty_id == $db.counterparty.id
        }
      }
      eval = {
        is_primary: $db.dc.is_primary
      }
      where = $db.dc.deal_id == $deal.id
    } as $counterparties

    // Контакты сделки + флаг is_primary
    db.query "counterparty_contact" {
      join = {
        dct: {
          table: "deal_contact",
          type: "inner",
          where: $db.dct.contact_id == $db.counterparty_contact.id
        }
      }
      eval = {
        is_primary: $db.dct.is_primary
      }
      where = $db.dct.deal_id == $deal.id
    } as $contacts

    function.run "user_brief" {
      input = { user_id: $deal.mop_id }
    } as $mop

    function.run "user_brief" {
      input = { user_id: $deal.mos_id }
    } as $mos

    var $card {
      value = $deal|set:"qualification":$qualification|set:"counterparties":$counterparties|set:"contacts":$contacts|set:"mop":$mop|set:"mos":$mos
    }
  }
  response = $card
}
