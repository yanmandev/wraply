// GET /deal/{number}/document — документы сделки (группа Deal).
// Файл — ссылкой (file_url / file_name).
query "deal/{number}/document" verb=GET {
  api_group = "Deal"
  auth = "user"
  input {
    text number filters=trim
  }
  stack {
    function.run "deal_by_number" {
      input = { number: $input.number }
    } as $deal

    db.query "deal_document" {
      join = {
        oe: {
          table: "our_entity",
          type: "left",
          where: $db.oe.id == $db.deal_document.our_entity_id
        }
      }
      eval = {
        our_entity_name: $db.oe.short_name,
        our_entity_vat_rate: $db.oe.vat_rate
      }
      where = $db.deal_document.deal_id == $deal.id
      sort = { created_at: "asc" }
    } as $documents

    var $items {
      value = $documents|map:{ id: $$.id, deal_id: $$.deal_id, type: $$.type, title: $$.title, number: $$.number, doc_date: $$.doc_date, amount: $$.amount, pay_date: $$.pay_date, payment_terms: $$.payment_terms, status: $$.status, exchange: $$.exchange, our_entity_id: $$.our_entity_id, our_entity_name: $$.our_entity_name, our_entity_vat_rate: $$.our_entity_vat_rate, counterparty_id: $$.counterparty_id, comment: $$.comment, file_url: $$.file_url, file_name: $$.file_name, created_by: $$.created_by, created_at: $$.created_at, updated_at: $$.updated_at }
    }
  }
  response = $items
}
