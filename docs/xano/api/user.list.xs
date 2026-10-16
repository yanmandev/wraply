// GET /user?role=mop — сотрудники для полей «МОП» / «МОС»
query "user" verb=GET {
  api_group = "crm"
  auth = "user"
  input {
    text? role? filters=trim|lower
  }
  stack {
    db.query "user" {
      where = $db.user.role ==? $input.role
      sort = { name: "asc" }
    } as $users

    // наружу — только безопасные поля
    var $list {
      value = $users|map:{ id: $$.id, name: $$.name, email: $$.email, role: $$.role }
    }
  }
  response = $list
}
