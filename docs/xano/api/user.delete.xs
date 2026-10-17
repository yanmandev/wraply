// DELETE /user/{user_id} — удаление пользователя (группа User, только админ).
// Удалить можно только того, кто не участвует в сделках. Иначе — перевести в архив:
// удаление сломало бы ссылки МОП/МОС/автора в сделках.
query "user/{user_id}" verb=DELETE {
  api_group = "User"
  auth = "user"
  input {
    int user_id {
      table = "user"
    }
  }
  stack {
    function.run "require_admin" {
      input = { user_id: $auth.id }
    }

    precondition ($input.user_id != $auth.id) {
      error_type = "inputerror"
      error = "Нельзя удалить свою учётную запись"
    }

    db.query "deal" {
      where = $db.deal.mop_id == $input.user_id || $db.deal.mos_id == $input.user_id || $db.deal.created_by == $input.user_id
      return = { type: "count" }
    } as $deals

    precondition ($deals == 0) {
      error_type = "inputerror"
      error = "Пользователь указан в сделках — переведите его в архив вместо удаления"
    }

    db.del "user" {
      field_name = "id"
      field_value = $input.user_id
    }
  }
  response = { success: true }
}
