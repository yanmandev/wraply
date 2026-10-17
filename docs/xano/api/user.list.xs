// GET /user — список пользователей для администратора (группа User).
// Поиск по имени, фамилии и email; фильтры роли и статуса; пагинация.
query "user" verb=GET {
  api_group = "User"
  auth = "user"
  input {
    text search?="" filters=trim
    text? role?
    text? status?
    int page?=1 filters=min:1
    int per_page?=25 filters=min:1|max:100
  }
  stack {
    function.run "require_admin" {
      input = { user_id: $auth.id }
    }

    db.query "user" {
      where = $db.user.role ==? $input.role && $db.user.status ==? $input.status && ($db.user.first_name includes $input.search || $db.user.last_name includes $input.search || $db.user.email includes $input.search || $db.user.name includes $input.search)
      sort = { name: "asc" }
      return = {
        type: "list",
        paging: { page: $input.page, per_page: $input.per_page, totals: true }
      }
    } as $users

    // наружу — без пароля и служебных полей
    var $items {
      value = $users.items|map:{ id: $$.id, email: $$.email, name: $$.name, first_name: $$.first_name, last_name: $$.last_name, role: $$.role, status: $$.status, created_at: $$.created_at }
    }
  }
  response = $users|set:"items":$items
}
