table "deal" {
  auth = false
  schema {
    int id

    // Красивый номер 10001KB (цифры + 2 латинские буквы). При вставке временный, сразу после — из id (см. api/deal.post.xs)
    text number filters=trim

    text name filters=trim

    enum status?="need_identified" {
      values = [
        "need_identified",
        "tz_formed",
        "zm_dm_cp",
        "pre_calc",
        "zm_dm_cp_push",
        "kp_sent",
        "push_started",
        "contract_sent",
        "handed_to_mos",
        "closing_docs",
        "completed"
      ]
    }

    enum client_type? {
      values = ["organization", "ip", "individual", "government"]
    }

    int mop_id? {
      table = "user"
    }

    int mos_id? {
      table = "user"
    }

    int created_by? {
      table = "user"
    }

    timestamp created_at?=now
    timestamp updated_at?
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "number"}]}
    {type: "btree", field: [{name: "status"}]}
    {type: "btree", field: [{name: "mop_id"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]
}
