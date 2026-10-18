// POST /deal/{number}/document — новый документ сделки (группа Deal).
// JSON. Файл — ссылкой (file_url): загрузка в хранилище Xano недоступна на бесплатном тарифе.
query "deal/{number}/document" verb=POST {
  api_group = "Deal"
  auth = "user"
  input {
    text number filters=trim
    text type
    text title filters=trim
    text? doc_number? filters=trim
    date? doc_date?
    decimal? amount?
    date? pay_date?
    text? payment_terms?
    text status?="uploaded"
    text exchange?="edo"
    int? our_entity_id? {
      table = "our_entity"
    }
    int? counterparty_id? {
      table = "counterparty"
    }
    text? comment? filters=trim
    text? file_url? filters=trim
    text? file_name? filters=trim
  }
  stack {
    function.run "deal_by_number" {
      input = { number: $input.number }
    } as $deal

    precondition (($input.title|strlen) > 0) {
      error_type = "inputerror"
      error = "Укажите название документа"
    }

    function.run "document_link_check" {
      input = { file_url: $input.file_url }
    }

    function.run "document_normalize" {
      input = {
        type: $input.type,
        amount: $input.amount,
        pay_date: $input.pay_date,
        payment_terms: $input.payment_terms
      }
    } as $n

    db.add "deal_document" {
      data = {
        deal_id: $deal.id,
        type: $input.type,
        title: $input.title,
        number: $input.doc_number,
        doc_date: $input.doc_date,
        amount: $n.amount,
        pay_date: $n.pay_date,
        payment_terms: $n.payment_terms,
        status: $input.status,
        exchange: $input.exchange,
        our_entity_id: $input.our_entity_id,
        counterparty_id: $input.counterparty_id,
        comment: $input.comment,
        file_url: $input.file_url,
        file_name: $input.file_name,
        created_by: $auth.id,
        created_at: now
      }
    } as $document
  }
  response = { id: $document.id }
}
