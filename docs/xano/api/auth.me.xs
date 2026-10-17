// GET /auth/me — ЗАМЕНА стандартного эндпоинта (группа Authentication).
// Фронт вызывает его при входе и периодически: если пользователя ограничили
// или отправили в архив, ответ 403 — и сессия на фронте завершается.
query "auth/me" verb=GET {
  api_group = "Authentication"
  auth = "user"
  input {}
  stack {
    db.get "user" {
      field_name = "id"
      field_value = $auth.id
    } as $user

    precondition ($user != null) {
      error_type = "accessdenied"
      error = "Пользователь не найден"
    }

    function.run "user_check_status" {
      input = { status: $user.status }
    }

    function.run "user_public" {
      input = { user: $user }
    } as $me
  }
  response = $me
}
