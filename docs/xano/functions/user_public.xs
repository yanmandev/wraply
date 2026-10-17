function "user_public" {
  description = "Пользователь без служебных полей (пароль и т.п.) — для ответов API"
  input {
    json user
  }
  stack {
    var $u { value = $input.user }
    var $public {
      value = {
        id: $u.id,
        email: $u.email,
        name: $u.name,
        first_name: $u.first_name,
        last_name: $u.last_name,
        role: $u.role,
        status: $u.status,
        created_at: $u.created_at
      }
    }
  }
  response = $public
}
