// GET /deal — реестр сделок с фильтрами, поиском, пресетами и пагинацией
//   preset: all (по умолчанию) | work (в работе: всё до закрывающих) | closed (закрывающие + завершённые)
// Оператора `in` в XanoScript нет, поэтому пресеты — три варианта запроса.
query "deal" verb=GET {
  api_group = "Deal"
  auth = "user"
  input {
    text search?="" filters=trim
    text? status?
    int? mop_id?
    text preset?="all" filters=trim|lower
    int page?=1 filters=min:1
    int per_page?=25 filters=min:1|max:100
  }
  stack {
    conditional {
      if ($input.preset == "work") {
        db.query "deal" {
          join = {
            mop: { table: "user", type: "left", where: $db.deal.mop_id == $db.mop.id },
            dc: { table: "deal_counterparty", type: "left", where: $db.dc.deal_id == $db.deal.id && $db.dc.is_primary == true },
            cp: { table: "counterparty", type: "left", where: $db.cp.id == $db.dc.counterparty_id }
          }
          eval = { mop_name: $db.mop.name, client_name: $db.cp.short_name, client_full_name: $db.cp.full_name }
          where = $db.deal.status ==? $input.status && $db.deal.mop_id ==? $input.mop_id && $db.deal.status != "closing_docs" && $db.deal.status != "completed" && ($db.deal.name includes $input.search || $db.deal.number includes $input.search)
          sort = { created_at: "desc" }
          return = { type: "list", paging: { page: $input.page, per_page: $input.per_page, totals: true } }
        } as $deals
      }
      elseif ($input.preset == "closed") {
        db.query "deal" {
          join = {
            mop: { table: "user", type: "left", where: $db.deal.mop_id == $db.mop.id },
            dc: { table: "deal_counterparty", type: "left", where: $db.dc.deal_id == $db.deal.id && $db.dc.is_primary == true },
            cp: { table: "counterparty", type: "left", where: $db.cp.id == $db.dc.counterparty_id }
          }
          eval = { mop_name: $db.mop.name, client_name: $db.cp.short_name, client_full_name: $db.cp.full_name }
          where = $db.deal.status ==? $input.status && $db.deal.mop_id ==? $input.mop_id && ($db.deal.status == "closing_docs" || $db.deal.status == "completed") && ($db.deal.name includes $input.search || $db.deal.number includes $input.search)
          sort = { created_at: "desc" }
          return = { type: "list", paging: { page: $input.page, per_page: $input.per_page, totals: true } }
        } as $deals
      }
      else {
        db.query "deal" {
          join = {
            mop: { table: "user", type: "left", where: $db.deal.mop_id == $db.mop.id },
            dc: { table: "deal_counterparty", type: "left", where: $db.dc.deal_id == $db.deal.id && $db.dc.is_primary == true },
            cp: { table: "counterparty", type: "left", where: $db.cp.id == $db.dc.counterparty_id }
          }
          eval = { mop_name: $db.mop.name, client_name: $db.cp.short_name, client_full_name: $db.cp.full_name }
          where = $db.deal.status ==? $input.status && $db.deal.mop_id ==? $input.mop_id && ($db.deal.name includes $input.search || $db.deal.number includes $input.search)
          sort = { created_at: "desc" }
          return = { type: "list", paging: { page: $input.page, per_page: $input.per_page, totals: true } }
        } as $deals
      }
    }
  }
  response = $deals
}
