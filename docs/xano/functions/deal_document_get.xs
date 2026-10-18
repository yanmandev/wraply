function "deal_document_get" {
  description = "Документ сделки по id или 404 (документ должен принадлежать этой сделке)"
  input {
    int deal_id
    int document_id
  }
  stack {
    db.query "deal_document" {
      where = $db.deal_document.id == $input.document_id && $db.deal_document.deal_id == $input.deal_id
      return = { type: "single" }
    } as $document

    precondition ($document != null) {
      error_type = "notfound"
      error = "Документ не найден"
    }
  }
  response = $document
}
