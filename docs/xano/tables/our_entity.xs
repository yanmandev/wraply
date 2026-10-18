// Наши юрлица («Наши реквизиты» в документах): от чьего имени выставляем счёт и подписываем договор.
// Создавать до deal_document (на неё ссылается our_entity_id).
table "our_entity" {
  auth = false
  schema {
    int id

    // Как показываем в списках: «ООО Марк Групп»
    text short_name filters=trim
    text full_name? filters=trim

    text inn? filters=trim
    text kpp? filters=trim
    text ogrn? filters=trim
    text address? filters=trim

    // Банк — для печатной формы счёта
    text bank_name? filters=trim
    text bik? filters=trim
    text account? filters=trim
    text corr_account? filters=trim

    // Ставка НДС, %: null — без НДС (УСН/ИП), 20 — суммы документов указываются с НДС
    int vat_rate?

    // Неактивные не предлагаются для новых документов, но остаются в старых
    bool is_active?=true
    int sort?=0

    timestamp created_at?=now
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "is_active"}, {name: "sort"}]}
  ]
}
