function "require_admin" {
  description = "Пропускает только активного администратора, иначе 403"
  input {
    int user_id
  }
  stack {
    db.get "user" {
      field_name = "id"
      field_value = $input.user_id
    } as $user

    precondition ($user != null && $user.role == "admin" && $user.status == "active") {
      error_type = "accessdenied"
      error = "Раздел доступен только администратору"
    }
  }
  response = $user
}
