function "document_normalize" {
  description = "Правила полей документа по типу: сумма — у счёта и акта/УПД, дата и условия оплаты — только у счёта"
  input {
    text type
    decimal? amount?
    date? pay_date?
    text? payment_terms?
  }
  stack {
    var $has_amount { value = $input.type == "invoice" || $input.type == "act_upd" }
    var $is_invoice { value = $input.type == "invoice" }

    precondition ($input.amount == null || $input.amount >= 0) {
      error_type = "inputerror"
      error = "Сумма не может быть отрицательной"
    }

    var $result { value = { amount: null, pay_date: null, payment_terms: null } }

    conditional {
      if ($has_amount) {
        var.update $result { value = $result|set:"amount":$input.amount }
      }
    }
    conditional {
      if ($is_invoice) {
        var.update $result {
          value = $result|set:"pay_date":$input.pay_date|set:"payment_terms":$input.payment_terms
        }
      }
    }
  }
  response = $result
}
