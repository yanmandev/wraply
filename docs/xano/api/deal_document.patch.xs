// PATCH /deal/{number}/document/{document_id} — изменение документа (группа Deal).
// JSON, форма отправляет все поля (null очищает значение).
query "deal/{number}/document/{document_id}" verb=PATCH {
  api_group = "Deal"
  auth = "user"
  input {
    text number filters=trim
    int document_id {
      table = "deal_document"
    }
    text type
    text title filters=trim
    text? doc_number? filters=trim
    date? doc_date?
    decimal? amount?
    date? pay_date?
    text? payment_terms?
    text status
    text exchange
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

    function.run "deal_document_get" {
      input = { deal_id: $deal.id, document_id: $input.document_id }
    } as $document

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

    db.edit "deal_document" {
      field_name = "id"
      field_value = $document.id
      data = {
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
        updated_at: now
      }
    }
  }
  response = { id: $document.id }
}
