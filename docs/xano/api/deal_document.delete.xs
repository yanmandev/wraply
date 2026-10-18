// DELETE /deal/{number}/document/{document_id} — удаление документа (группа Deal).
// Файл по ссылке (Яндекс.Диск и т.п.) остаётся там, где лежал — удаляется только запись.
query "deal/{number}/document/{document_id}" verb=DELETE {
  api_group = "Deal"
  auth = "user"
  input {
    text number filters=trim
    int document_id {
      table = "deal_document"
    }
  }
  stack {
    function.run "deal_by_number" {
      input = { number: $input.number }
    } as $deal

    function.run "deal_document_get" {
      input = { deal_id: $deal.id, document_id: $input.document_id }
    } as $document

    db.del "deal_document" {
      field_name = "id"
      field_value = $document.id
    }
  }
  response = { success: true }
}
