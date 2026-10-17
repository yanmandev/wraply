// PATCH /user/{user_id} — изменение пользователя (группа User, только админ).
// Форма отправляет все поля; password необязателен — пустой/null не меняет пароль.
query "user/{user_id}" verb=PATCH {
  api_group = "User"
  auth = "user"
  input {
    int user_id {
      table = "user"
    }
    text first_name filters=trim
    text last_name filters=trim
    email email filters=trim|lower
    text role
    text status
    text? password?
  }
  stack {
    function.run "require_admin" {
      input = { user_id: $auth.id }
    }

    db.get "user" {
      field_name = "id"
      field_value = $input.user_id
    } as $user

    precondition ($user != null) {
      error_type = "notfound"
      error = "Пользователь не найден"
    }

    // Нельзя лишить доступа самого себя — иначе в системе может не остаться администратора
    precondition ($input.user_id != $auth.id || ($input.role == "admin" && $input.status == "active")) {
      error_type = "inputerror"
      error = "Нельзя снять с себя роль администратора или ограничить свой доступ"
    }

    precondition (($input.first_name|strlen) > 0 && ($input.last_name|strlen) > 0) {
      error_type = "inputerror"
      error = "Укажите имя и фамилию"
    }

    db.query "user" {
      where = $db.user.email == $input.email && $db.user.id != $input.user_id
      return = { type: "exists" }
    } as $taken

    precondition ($taken == false) {
      error_type = "inputerror"
      error = "Пользователь с таким email уже есть"
    }

    var $password { value = $input.password ?? "" }

    precondition (($password|strlen) == 0 || ($password|strlen) >= 8) {
      error_type = "inputerror"
      error = "Пароль — не короче 8 символов"
    }

    db.edit "user" {
      field_name = "id"
      field_value = $input.user_id
      data = {
        first_name: $input.first_name,
        last_name: $input.last_name,
        name: $input.first_name ~ " " ~ $input.last_name,
        email: $input.email,
        role: $input.role,
        status: $input.status
      }
    } as $user

    // Новый пароль — отдельной записью (поле password хешируется автоматически)
    conditional {
      if (($password|strlen) > 0) {
        db.edit "user" {
          field_name = "id"
          field_value = $input.user_id
          data = { password: $password }
        } as $user
      }
    }

    function.run "user_public" {
      input = { user: $user }
    } as $public
  }
  response = $public
}
