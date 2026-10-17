// Таблица user уже есть — добавьте поля В КОНЕЦ блока schema
// (Xano рекомендует не вставлять новые поля в середину).
// role уже добавлено раньше; first_name, last_name, status — новые.
//
//   schema {
//     ...существующие поля (id, name, email, password, created_at, role)...

    enum role?="mop" {
      values = ["admin", "mop", "mos"]
    }

    text first_name? filters=trim
    text last_name? filters=trim

    // active — работает; inactive — доступ временно ограничен; archived — больше не нужен
    enum status?="active" {
      values = ["active", "inactive", "archived"]
    }

//   }
//
// Поле name оставляем: эндпоинты заполняют его как «Имя Фамилия», и всё, что уже
// показывает name (МОП/МОС в сделках), продолжает работать.
//
// Индексы в массив index:
//   {type: "btree", field: [{name: "role"}]}
//   {type: "btree", field: [{name: "status"}]}
//   {type: "btree|unique", field: [{name: "email"}]}   — если ещё нет
//
// Существующим пользователям после добавления поля status проставьте "active",
// а себе — role "admin", иначе раздел «Пользователи» будет недоступен.
