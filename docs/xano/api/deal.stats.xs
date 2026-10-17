// GET /deal_stats — данные для блока «Сводка» над реестром сделок (группа Deal).
// Путь deal_stats, а не deal/stats: иначе запрос может уйти в deal/{number} с number = "stats".
//
// Границы периодов (начало 12 недель назад, начало прошлого месяца) присылает фронт —
// так недели и месяцы считаются в часовом поясе пользователя, а не сервера.
// Раскладку по неделям и месяцам делает фронт по возвращённым датам.
query "deal_stats" verb=GET {
  api_group = "Deal"
  auth = "user"
  input {
    int? mop_id?
    // ms; самая ранняя из двух дат: начало окна 12 недель и начало прошлого месяца
    int since
  }
  stack {
    // Количество сделок по каждому статусу — 11 лёгких count-запросов по индексу status
    var $by_status { value = {} }

    foreach (["need_identified", "tz_formed", "zm_dm_cp", "pre_calc", "zm_dm_cp_push", "kp_sent", "push_started", "contract_sent", "handed_to_mos", "closing_docs", "completed"]) {
      each as $status {
        db.query "deal" {
          where = $db.deal.status == $status && $db.deal.mop_id ==? $input.mop_id
          return = { type: "count" }
        } as $count

        var.update $by_status {
          value = $by_status|set:$status:$count
        }
      }
    }

    // Даты создания сделок за период — для «новых по неделям» и «новых за месяц»
    db.query "deal" {
      where = $db.deal.created_at >= $input.since && $db.deal.mop_id ==? $input.mop_id
      sort = { created_at: "asc" }
    } as $recent

    // Завершённые за период — дата завершения ≈ updated_at (отдельного closed_at пока нет)
    db.query "deal" {
      where = $db.deal.status == "completed" && $db.deal.updated_at >= $input.since && $db.deal.mop_id ==? $input.mop_id
    } as $completed

    var $created { value = $recent|map:$$.created_at }
    var $completed_at { value = $completed|map:$$.updated_at }
  }
  response = { by_status: $by_status, created: $created, completed: $completed_at }
}
