// Группы API в Xano. Deal и Counterparty уже созданы в кабинете, Contact нужно создать.
// У каждой группы свой base URL: https://<host>/api:<canonical>.
// Canonical группы виден в кабинете Xano; его нужно прописать в .env фронта
// (VITE_API_GROUP_DEAL / _COUNTERPARTY / _CONTACT).
//
//   Authentication (существующая, auth/login, auth/me) — user.list.xs
//   Deal          — deal.*.xs, deal_qualification.*, deal_counterparty.*, deal_contact.*
//   Counterparty  — counterparty.*.xs
//   Contact       — contact.*.xs
//
// Если создаёте Contact через XanoScript:
api_group "Contact" {
  canonical = "wraply-contact"
  description = "Контакты контрагентов"
}
