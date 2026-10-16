// DELETE /deal/{number}/contact/{contact_id} — отвязать контакт от сделки
// (сам контакт у контрагента остаётся)
query "deal/{number}/contact/{contact_id}" verb=DELETE {
  api_group = "Deal"
  auth = "user"
  input {
    text number filters=trim
    int contact_id {
      table = "counterparty_contact"
    }
  }
  stack {
    function.run "deal_by_number" {
      input = { number: $input.number }
    } as $deal

    db.query "deal_contact" {
      where = $db.deal_contact.deal_id == $deal.id && $db.deal_contact.contact_id == $input.contact_id
      return = { type: "single" }
    } as $link

    precondition ($link != null) {
      error_type = "notfound"
      error = "Контакт не привязан к сделке"
    }

    db.del "deal_contact" {
      field_name = "id"
      field_value = $link.id
    }

    function.run "deal_card" {
      input = { deal_id: $deal.id }
    } as $card
  }
  response = $card
}
