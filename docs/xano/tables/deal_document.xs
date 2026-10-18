// Документы по сделке: счета, акты/УПД, договоры, спецификации, счета-фактуры.
// Создавать после deal, counterparty, our_entity.
table "deal_document" {
  auth = false
  schema {
    int id

    int deal_id {
      table = "deal"
    }

    // invoice — Счёт · act_upd — Акт/УПД · contract — Договор · specification — Спецификация
    // invoice_factura — Счёт-фактура · other — Прочее
    enum type?="invoice" {
      values = ["invoice", "act_upd", "contract", "specification", "invoice_factura", "other"]
    }

    // Название в списке: «Счёт №112 от 14.08.2026»; по умолчанию — имя файла
    text title filters=trim

    // Номер и дата документа (необязательно — часто уже есть в title)
    text number? filters=trim
    date doc_date?

    // Сумма, ₽ — только у invoice и act_upd. С НДС, если у our_entity задан vat_rate
    decimal amount?

    // Только у счёта: дата оплаты (плановая или фактическая) и условия оплаты
    date pay_date?
    enum payment_terms? {
      values = ["prepay_100", "postpay_30", "postpay_60", "postpay_90"]
    }

    // draft — Черновик · issued — Выставлен, не оплачен · paid — Оплачен
    // signing — На подписании (ЭДО) · signed — Подписан · uploaded — Загружен
    enum status?="uploaded" {
      values = ["draft", "issued", "paid", "signing", "signed", "uploaded"]
    }

    // edo — ЭДО · paper — Бумага
    enum exchange?="edo" {
      values = ["edo", "paper"]
    }

    // От чьего имени документ («Наши реквизиты»)
    int our_entity_id? {
      table = "our_entity"
    }

    // Для какого контрагента сделки (у сделки их может быть несколько)
    int counterparty_id? {
      table = "counterparty"
    }

    text comment? filters=trim

    // Ссылка на файл (Яндекс.Диск, Google Drive и т.п.) и его название.
    // Не attachment: загрузка файлов в хранилище Xano недоступна на бесплатном тарифе
    // («Not supported. Please upgrade your Xano instance»).
    text file_url? filters=trim
    text file_name? filters=trim

    int created_by? {
      table = "user"
    }
    timestamp created_at?=now
    timestamp updated_at?
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "deal_id"}, {name: "created_at"}]}
    {type: "btree", field: [{name: "type"}, {name: "status"}]}
  ]
}
