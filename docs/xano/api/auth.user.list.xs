// GET /user?role=mop — сотрудники для полей «МОП» / «МОС» (группа Authentication).
// Только активные: ограниченных и архивных в сделку не назначаем.
query "user" verb=GET {
  api_group = "Authentication" // группа, где auth/login — подставьте её имя
  auth = "user"
  input {
    text? role? filters=trim|lower
  }
  stack {
    db.query "user" {
      where = $db.user.role ==? $input.role && $db.user.status == "active"
      sort = { name: "asc" }
    } as $users

    // наружу — только безопасные поля
    var $list {
      value = $users|map:{ id: $$.id, name: $$.name, first_name: $$.first_name, last_name: $$.last_name, email: $$.email, role: $$.role }
    }
  }
  response = $list
}
