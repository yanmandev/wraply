function "document_link_check" {
  description = "Ссылка на файл документа: пусто или начинается с http:// / https://"
  input {
    text? file_url?
  }
  stack {
    var $url { value = ($input.file_url ?? "")|trim|to_lower }

    // Без регулярного выражения: обратные слэши в строке шаблона XanoScript обрабатывает
    // по-своему, и проверка отклоняла даже правильные ссылки. Сравниваем начало строки.
    var $ok {
      value = ($url|strlen) == 0 || ($url|substr:0:7) == "http://" || ($url|substr:0:8) == "https://"
    }

    precondition ($ok) {
      error_type = "inputerror"
      error = "Ссылка на файл должна начинаться с http:// или https://"
    }
  }
  response = true
}
