// PATCH /deal/{number}/qualification — сохранение квалификации.
// Фронт отправляет форму целиком.
query "deal/{number}/qualification" verb=PATCH {
  api_group = "Deal"
  auth = "user"
  input {
    text number filters=trim
    object qualification {
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
    function.run "deal_by_number" {
      input = { number: $input.number }
    } as $deal

    db.query "deal_qualification" {
      where = $db.deal_qualification.deal_id == $deal.id
      return = { type: "single" }
    } as $existing

    // Пустая запись при первом сохранении, дальше — всегда patch
    conditional {
      if ($existing == null) {
        db.add "deal_qualification" {
          data = {
            deal_id: $deal.id,
            created_at: now
          }
        } as $existing
      }
    }

    // В data передаём переменную, а не выражение с фильтрами
    var $updates {
      value = $input.qualification|set:"updated_at":now
    }

    db.patch "deal_qualification" {
      field_name = "id"
      field_value = $existing.id
      data = $updates
    } as $qualification
  }
  response = $qualification
}
