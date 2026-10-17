// Группы API в Xano. Deal, Counterparty и Contact уже созданы, User нужно создать.
// У каждой группы свой base URL: https://<host>/api:<canonical>.
// Canonical группы виден в кабинете Xano; его нужно прописать в .env фронта
// (VITE_API_GROUP_DEAL / _COUNTERPARTY / _CONTACT / _USER).
//
//   Authentication (существующая) — auth.login.xs, auth.me.xs, auth.user.list.xs
//   User          — user.*.xs (управление пользователями, только admin)
//   Deal          — deal.*.xs, deal_qualification.*, deal_counterparty.*, deal_contact.*
//   Counterparty  — counterparty.*.xs
//   Contact       — contact.*.xs
//
// Если создаёте Contact через XanoScript:
api_group "Contact" {
  canonical = "wraply-contact"
  description = "Контакты контрагентов"
}
