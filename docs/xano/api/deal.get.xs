// GET /deal/{number} — карточка сделки
query "deal/{number}" verb=GET {
  api_group = "Deal"
  auth = "user"
  input {
    text number filters=trim
  }
  stack {
    function.run "deal_by_number" {
      input = { number: $input.number }
    } as $deal

    function.run "deal_card" {
      input = { deal_id: $deal.id }
    } as $card
  }
  response = $card
}
