// POST /deal — создание сделки (последний шаг мастера).
// Контрагенты и контакты создаются заранее (POST /counterparty, POST /contact),
// здесь передаются их id.
query "deal" verb=POST {
  api_group = "Deal"
  auth = "user"
  input {
    text name filters=trim
    text? client_type?
    int? mop_id? {
      table = "user"
    }
    int? mos_id? {
      table = "user"
    }
    int[] counterparty_ids?
    int? primary_counterparty_id?
    int[] contact_ids?
    int? primary_contact_id?
    object qualification? {
      schema {
        int? vehicle_count?
        text? operating_conditions?
        text? install_place?
        text? old_film?
        text? measurement?
        text? vehicles?
        text? goal?
        text? deadline?
        text? priority?
        text? design?
        text? invoice_requirements?
      }
    }
  }
  stack {
    precondition (($input.name|strlen) > 0) {
      error_type = "inputerror"
      error = "Укажите название сделки"
    }

    var $cp_ids { value = $input.counterparty_ids ?? [] }
    var $contact_ids { value = $input.contact_ids ?? [] }

    // Контакт можно привязать, только если его контрагент тоже в сделке
    foreach ($contact_ids) {
      each as $contact_id {
        db.get "counterparty_contact" {
          field_name = "id"
          field_value = $contact_id
        } as $contact

        precondition ($contact != null) {
          error_type = "inputerror"
          error = "Контакт не найден"
        }

        precondition ((($cp_ids|filter:$$ == $contact.counterparty_id)|count) > 0) {
          error_type = "inputerror"
          error = "Контакт принадлежит контрагенту, которого нет в сделке"
        }
      }
    }

    db.transaction {
      stack {
        // Временный уникальный номер, ниже заменяется на номер из id
        db.add "deal" {
          data = {
            number: "tmp-" ~ ($auth.id|to_text) ~ "-" ~ (now|to_text),
            name: $input.name,
            status: "need_identified",
            client_type: $input.client_type,
            mop_id: $input.mop_id ?? $auth.id,
            mos_id: $input.mos_id,
            created_by: $auth.id,
            created_at: now
          }
        } as $deal

        // Латиница без I и O (не путать с 1 и 0) — номер в URL без кодирования: /deals/10001KB
        var $letters {
          value = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]|shuffle
        }

        db.edit "deal" {
          field_name = "id"
          field_value = $deal.id
          data = {
            number: (($deal.id + 10000)|to_text) ~ ($letters|get:0) ~ ($letters|get:1)
          }
        } as $deal

        // db.add принимает в data только литерал объекта — перечисляем поля явно
        var $q { value = $input.qualification ?? {} }

        db.add "deal_qualification" {
          data = {
            deal_id: $deal.id,
            vehicle_count: $q.vehicle_count,
            operating_conditions: $q.operating_conditions,
            install_place: $q.install_place,
            old_film: $q.old_film,
            measurement: $q.measurement,
            vehicles: $q.vehicles,
            goal: $q.goal,
            deadline: $q.deadline,
            priority: $q.priority,
            design: $q.design,
            invoice_requirements: $q.invoice_requirements,
            created_at: now
          }
        }

        foreach ($cp_ids) {
          each as $cp_id {
            db.add "deal_counterparty" {
              data = {
                deal_id: $deal.id,
                counterparty_id: $cp_id,
                is_primary: $cp_id == $input.primary_counterparty_id,
                created_at: now
              }
            }
          }
        }

        foreach ($contact_ids) {
          each as $contact_id {
            db.add "deal_contact" {
              data = {
                deal_id: $deal.id,
                contact_id: $contact_id,
                is_primary: $contact_id == $input.primary_contact_id,
                created_at: now
              }
            }
          }
        }
      }
    }

    function.run "deal_card" {
      input = { deal_id: $deal.id }
    } as $card
  }
  response = $card
}
