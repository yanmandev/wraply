function "user_check_status" {
  description = "403, если учётная запись не активна (inactive — временно ограничен, archived — в архиве)"
  input {
    text? status?
  }
  stack {
    // precondition с accessdenied отдаёт 403 — по нему фронт выходит из сессии
    precondition ($input.status != "inactive") {
      error_type = "accessdenied"
      error = "Доступ временно ограничен. Обратитесь к администратору."
    }

    precondition ($input.status != "archived") {
      error_type = "accessdenied"
      error = "Учётная запись в архиве. Обратитесь к администратору."
    }
  }
  response = true
}
