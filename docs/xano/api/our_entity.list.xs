// GET /our_entity — наши юрлица для поля «Наши реквизиты» (группа Deal).
// Отдаём все, с флагом is_active: для новых документов фронт предлагает только активные,
// а у старых документов показывает и неактивное юрлицо.
query "our_entity" verb=GET {
  api_group = "Deal"
  auth = "user"
  input {}
  stack {
    db.query "our_entity" {
      sort = { sort: "asc" }
    } as $entities
  }
  response = $entities
}
