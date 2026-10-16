function "counterparty_validate" {
  description = "Проверка обязательных реквизитов в зависимости от типа контрагента"
  input {
    text type
    text? inn?
    text? kpp?
    text? ogrn?
    text? full_name?
  }
  stack {
    var $inn { value = $input.inn ?? "" }
    var $kpp { value = $input.kpp ?? "" }
    var $ogrn { value = $input.ogrn ?? "" }

    precondition ((($input.full_name ?? "")|strlen) > 0) {
      error_type = "inputerror"
      error = "Укажите полное наименование / ФИО"
    }

    conditional {
      if ($input.type == "organization") {
        precondition (($inn|strlen) == 10) {
          error_type = "inputerror"
          error = "ИНН организации — 10 цифр"
        }
        precondition (($kpp|strlen) == 9) {
          error_type = "inputerror"
          error = "КПП — 9 цифр"
        }
        precondition (($ogrn|strlen) == 13) {
          error_type = "inputerror"
          error = "ОГРН — 13 цифр"
        }
      }
      elseif ($input.type == "ip") {
        precondition (($inn|strlen) == 12) {
          error_type = "inputerror"
          error = "ИНН ИП — 12 цифр"
        }
        precondition (($ogrn|strlen) == 15) {
          error_type = "inputerror"
          error = "ОГРНИП — 15 цифр"
        }
      }
      elseif ($input.type == "individual") {
        // ИНН физлица необязателен, но если указан — 12 цифр
        precondition ((($inn|strlen) == 0) || (($inn|strlen) == 12)) {
          error_type = "inputerror"
          error = "ИНН физлица — 12 цифр"
        }
      }
      else {
        throw {
          name = "inputerror"
          value = "Неизвестный тип контрагента"
        }
      }
    }
  }
  response = true
}
