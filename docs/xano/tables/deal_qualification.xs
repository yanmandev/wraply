table "deal_qualification" {
  auth = false
  schema {
    int id

    int deal_id {
      table = "deal"
    }

    int vehicle_count?
    text operating_conditions? filters=trim

    enum install_place? {
      values = ["our_site", "client_site", "discussing"]
    }

    enum old_film? {
      values = ["yes", "no", "partial"]
    }

    enum measurement? {
      values = ["yes", "no", "need_ours"]
    }

    text vehicles? filters=trim
    text goal? filters=trim
    text deadline? filters=trim

    enum priority? {
      values = ["max_lifetime", "budget", "discussing"]
    }

    enum design? {
      values = ["ready", "by_client", "by_us"]
    }

    text invoice_requirements? filters=trim

    timestamp created_at?=now
    timestamp updated_at?
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "deal_id"}]}
  ]
}
