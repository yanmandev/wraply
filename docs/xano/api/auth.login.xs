// POST /auth/login — ЗАМЕНА стандартного эндпоинта входа (группа Authentication).
// Отличие от шаблона Xano: неактивных и архивных пользователей не пускаем.
// Ответ прежний — { authToken, user_id }, фронт менять не нужно.
query "auth/login" verb=POST {
  api_group = "Authentication"
  input {
    email email filters=trim|lower
    text password
  }
  stack {
    db.get "user" {
      field_name = "email"
      field_value = $input.email
    } as $user

    // Одинаковый текст для «нет такого email» и «неверный пароль» — не подсказываем, что email существует
    precondition ($user != null) {
      error_type = "accessdenied"
      error = "Неверный email или пароль"
    }

    security.check_password {
      text_password = $input.password
      hash_password = $user.password
    } as $is_valid

    precondition ($is_valid) {
      error_type = "accessdenied"
      error = "Неверный email или пароль"
    }

    // Статус проверяем после пароля: иначе по сообщению можно узнать статус чужой учётки
    function.run "user_check_status" {
      input = { status: $user.status }
    }

    security.create_auth_token {
      table = "user"
      id = $user.id
      extras = { role: $user.role }
      expiration = 86400
    } as $token
  }
  response = { authToken: $token, user_id: $user.id }
}
