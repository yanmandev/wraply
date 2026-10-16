// Таблица user уже есть — добавьте это поле В КОНЕЦ блока schema
// (Xano рекомендует не вставлять новые поля в середину)
//
//   schema {
//     ...существующие поля...
    enum role?="mop" {
      values = ["admin", "mop", "mos"]
    }
//   }
//
// и индекс в массив index:
//   {type: "btree", field: [{name: "role"}]}
