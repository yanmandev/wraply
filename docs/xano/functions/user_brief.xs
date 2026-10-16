function "user_brief" {
  description = "Короткая карточка пользователя без служебных полей (или null)"
  input {
    int? user_id?
  }
  stack {
    var $brief { value = null }

    conditional {
      if ($input.user_id != null) {
        db.get "user" {
          field_name = "id"
          field_value = $input.user_id
        } as $user

        conditional {
          if ($user != null) {
            var.update $brief {
              value = { id: $user.id, name: $user.name, email: $user.email, role: $user.role }
            }
          }
        }
      }
    }
  }
  response = $brief
}
