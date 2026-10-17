// POST /user — новый пользователь (группа User, только админ)
query "user" verb=POST {
  api_group = "User"
  auth = "user"
  input {
    text first_name filters=trim
    text last_name filters=trim
    email email filters=trim|lower
    text password
    text role
    text status?="active"
  }
  stack {
    function.run "require_admin" {
      input = { user_id: $auth.id }
    }

    precondition (($input.first_name|strlen) > 0 && ($input.last_name|strlen) > 0) {
      error_type = "inputerror"
      error = "Укажите имя и фамилию"
    }

    precondition (($input.password|strlen) >= 8) {
      error_type = "inputerror"
      error = "Пароль — не короче 8 символов"
    }

    db.has "user" {
      field_name = "email"
      field_value = $input.email
    } as $taken

    precondition ($taken == false) {
      error_type = "inputerror"
      error = "Пользователь с таким email уже есть"
    }

    db.add "user" {
      data = {
        first_name: $input.first_name,
        last_name: $input.last_name,
        name: $input.first_name ~ " " ~ $input.last_name,
        email: $input.email,
        password: $input.password,
        role: $input.role,
        status: $input.status,
        created_at: now
      }
    } as $user

    function.run "user_public" {
      input = { user: $user }
    } as $public
  }
  response = $public
}
