
window.onload = function() {
  // Build a system
  var url = window.location.search.match(/url=([^&]+)/);
  if (url && url.length > 1) {
    url = decodeURIComponent(url[1]);
  } else {
    url = window.location.origin;
  }
  var options = {
  "swaggerDoc": {
    "openapi": "3.0.0",
    "info": {
      "title": "104 HR Max Open APIs",
      "description": "OpenAPI3.0 (Swagger) 格式文件請看 [https://swagger.io/specification/#schema](https://swagger.io/specification/#schema)\n\t\t\t`description` 裡可用的 CommonMark syntax 請看 [https://spec.commonmark.org/](https://spec.commonmark.org/)\n\t\t\t匯出 [swagger-json](../swagger-json)"
    },
    "paths": {
      "/api/am/shift": {
        "post": {
          "tags": [
            "AM"
          ],
          "summary": "班別基本檔資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nshift = {\n  \"SHIFT_ID\": number,               //班別_ID\n  \"CO_ID\": number,                  //公司_ID\n  \"SHIFT_CODE\": string,             //班別代碼\n  \"SHIFT_NAME\": string,             //班別名稱\n  \"SHIFT_NAME_JSON\": boject,        //班別名稱_JSON\n  \"SHIFT_ABBR_NAME\": string,        //班別簡稱\n  \"SHIFT_ABBR_NAME_JSON\": boject,   //班別簡稱_JSON\n  \"IS_FIX_SHIFT\": number,           //是否為固定班用途\n  \"IS_SA_SHIFT\": number,            //是否為排班用途\n  \"SHIFT_WORK_HOUR\": number,        //班別實際工時\n  \"IS_ACT\": number,                 //使用狀態\n  \"SORT_ORDER\": number,             //排序\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 13
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200, \n  data: [shift, shift, ...]\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/am/shift_worktime": {
        "post": {
          "tags": [
            "AM"
          ],
          "summary": "班別工作時間檔資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nshift_worktime = {\n  \"CO_ID\": number,      //公司_ID\n  \"SHIFT_ID\": number,   //班別_ID\n  \"WEEKDAY\": number,    //星期別\n  \"DATA_TYPE\": string,  //資料類別\n  \"STIME\":date,         //時間起\n  \"ETIME\":date,         //時間迄\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "SHIFT_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "SHIFT_ID": {
                      "type": "integer",
                      "description": "班別ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 13,
                  "SHIFT_ID": 188
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200, \n  data: [shift_worktime, shift_worktime, ...]\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/am/calendar_leave": {
        "post": {
          "tags": [
            "AM"
          ],
          "summary": "行事曆類別檔資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\ncalendar_leave = {\n  \"CALENDAR_LEAVE_ID\": number,  //行事曆別_ID\n  \"LEAVE_NAME\": string,         //行事曆別名稱\n  \"LEAVE_NAME_JSON\": boject,    //行事曆別名稱_JSON\n  \"LEAVE_NAME_COLOR\": string,   //行事曆填滿顏色\n  \"TEXT_COLOR\": string,         //行事曆文字顏色\n  \"SORT_ORDER\": number,         //排序\n},\n```\n",
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200, \n  data: [calendar_leave, calendar_leave, ...]\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/am/calendar_basic": {
        "post": {
          "tags": [
            "AM"
          ],
          "summary": "行事曆基本資料檔資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\ncalendar_basic = {\n  \"CALENDAR_BASIC_ID\": number,//行事曆基本檔_ID\n  \"CO_ID\": number,//公司_ID\n  \"CALENDAR_CODE\": string,//行事曆代碼\n  \"CALENDAR_NAME\": string,//行事曆名稱\n  \"CALENDAR_NAME_JSON\": boject,//行事曆別名稱_JSON\n  \"IS_ACT\": number,//使用狀態\n  \"SORT_ORDER\": number,//排序\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 13
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200, \n  data: [calendar_basic, calendar_basic, ...]\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/am/calendar_day": {
        "post": {
          "tags": [
            "AM"
          ],
          "summary": "行事曆日檔資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\ncalendar_day = {\n  \"CO_ID\": number,//公司_ID\n  \"CALENDAR_BASIC_ID\": number,//行事曆基本檔_ID\n  \"CALENDAR_DATE\":date,//行事曆日期\n  \"CALENDAR_WEEK\": number,//星期\n  \"CALENDAR_LEAVE_ID\": number,//行事曆別_ID\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "CALENDAR_BASIC_ID",
                    "CALENDAR_YEAR"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "CALENDAR_BASIC_ID": {
                      "type": "integer",
                      "description": "行事曆基本檔ID"
                    },
                    "CALENDAR_YEAR": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "行事曆年度"
                    }
                  }
                },
                "example": {
                  "CO_ID": 13,
                  "CALENDAR_BASIC_ID": 109,
                  "CALENDAR_YEAR": 2019
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200, \n  data: [calendar_day, calendar_day, ...]\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/am/emp_worktime": {
        "post": {
          "tags": [
            "AM"
          ],
          "summary": "員工班別資料展開檔資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nemp_worktime = {\n  \"CO_ID\": number,                //公司_ID\n  \"EMP_ID\": number,               //員工_ID\n  \"WORK_DATE\":date,               //應出勤日期\n  \"WORK_DATE_SEQ\": number,        //應出勤日期_分段\n  \"IS_EMPTY_WORKTIME\": number,    //當日是否未排班\n  \"IS_EMPTY_CALENDAR\": number,    //當日是否未設定行事曆\n  \"WORK_DATE_WEEK\": number,       //應出勤日期_星期\n  \"SHIFT_TYPE\": number,           //員工班別屬性\n  \"SHIFT_ID\": number,             //員工班別_ID\n  \"CALENDAR_BASIC_ID\": number,    //員工行事曆_ID\n  \"CALENDAR_LEAVE_ID\": number,    //員工行事曆類別_ID\n  \"WORK_LABEL_IDS\": string,       //班別標籤\n  \"IS_LEAVE_OVERTIME\": number,    //行事曆可否加班\n  \"WORKDAY_STIME\":date,           //班別曆日區間-起\n  \"WORKDAY_ETIME\":date,           //班別曆日區間-迄\n  \"CLOCK_FIRST_TIME\":date,        //班別最早有效刷卡時間起\n  \"CLOCK_LAST_TIME\":date,         //班別最晚有效刷卡時間迄\n  \"WORKTIME_START\":date,          //上班時間起\n  \"WORKTIME_END\":date,            //上班時間迄\n  \"WORK_HOURS\": number,           //班別時數\n  \"REAL_HOURS\": number,           //當日班別時數時數\n  \"PAY_TYPE\": string,             //加班支領方式\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "WORK_SDATE",
                    "WORK_EDATE",
                    "EMP_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "WORK_SDATE": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "出勤日期起"
                    },
                    "WORK_EDATE": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "出勤日期迄"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 13,
                  "WORK_SDATE": "2021/01/01",
                  "WORK_EDATE": "2021/12/31",
                  "EMP_ID": 33389
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200, \n  data: [emp_worktime, emp_worktime, ...]\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/am/leaveitem": {
        "post": {
          "tags": [
            "AM"
          ],
          "summary": "一般假勤項目檔資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nleaveitem = {\n  \"LEAVEITEM_ID\": number,       //假勤項目_ID\n  \"CO_ID\": number,              //公司_ID\n  \"LEAVEITEM_CODE\":string,      //假勤項目代碼\n  \"LEAVEITEM_NAME\":string,      //假勤項目名稱\n  \"LEAVEITEM_NAME_JSON\":boject, //假勤項目名稱_JSON\n  \"SPECIFIC_CODE\":string,       //特定代碼\n  \"UNIT\":string,                //假勤單位\n  \"UNIT_VALUE\": number,         //假勤單位(數值)\n  \"PERIOD_TYPE\":string,         //計算期間(種類)\n  \"SORT_ORDER\": number,         //排序\n  \"IS_ACT\": number,             //使用狀態\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 13
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200, \n  data: [leaveitem, leaveitem, ...]\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/am/emp_leave": {
        "post": {
          "tags": [
            "AM"
          ],
          "summary": "員工請假主檔資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nemp_leave = {\n  \"EMP_LEAVE_ID\": number,         //ID\n  \"CO_ID\": number,                //公司_ID\n  \"EMP_ID\": number,               //員工_ID\n  \"LEAVEITEM_ID\": number,         //假勤項目_ID\n  \"EMP_LEAVE_EVENT_ID\": number,   //事件發生日_ID\n  \"LEAVE_START\":date,             //請假起始時間\n  \"LEAVE_END\":date,               //請假結束時間\n  \"LEAVE_VALUE\": number,          //合計扣假請假數\n  \"DED_VALUE\": number,            //合計扣除分鐘數\n  \"CANCEL_VALUE\": number,         //合計銷假數\n  \"UNIT\":string,                  //請假當時假勤單位\n  \"REASON\":string,                //請假原因\n  \"AGENT_IDS\":string,             //職務代理人_IDS\n  \"FILES\":string,                 //附件\n  \"NOTE\":string,                  //備註\n  \"LEAVE_SOURCE\": number,         //資料來源\n  \"WF_NO\":string,                 //WORKFLOW 表單編號\n  \"WF_RESULT\": number,            //表單狀態\n  \"WF_SIGN_TIME\":date,            //簽核完成時間\n  \"C_DATETIME\":date,              //新增_日期\n  \"E_DATETIME\":date,              //修改_日期\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "LEAVE_START",
                    "LEAVE_END",
                    "EMP_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "LEAVE_START": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "請假起始日"
                    },
                    "LEAVE_END": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "請假結束日"
                    },
                    "LEAVEITEM_ID": {
                      "type": "integer",
                      "description": "假勤項目ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    }
                  }
                },
                "examples": {
                  "案例1": {
                    "value": {
                      "CO_ID": 13,
                      "LEAVE_START": "2019/10/01",
                      "LEAVE_END": "2019/12/31",
                      "LEAVEITEM_ID": 566,
                      "EMP_ID": 33389
                    }
                  },
                  "案例2": {
                    "value": {
                      "CO_ID": 13,
                      "LEAVE_START": "2019/10/01",
                      "LEAVE_END": "2019/12/31",
                      "EMP_ID": 33389
                    }
                  },
                  "案例3": {
                    "value": {
                      "CO_ID": 13,
                      "LEAVE_START": "2019/10/01",
                      "LEAVE_END": "2019/12/31",
                      "LEAVEITEM_ID": 566,
                      "LIMIT": 10
                    }
                  },
                  "案例4": {
                    "value": {
                      "CO_ID": 13,
                      "LEAVE_START": "2019/10/07",
                      "LEAVE_END": "2019/10/08",
                      "LIMIT": 10
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200, \n  data: [emp_leave, emp_leave, ...]\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/am/emp_leave/daily": {
        "post": {
          "tags": [
            "AM"
          ],
          "summary": "員工請假日檔資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nemp_leave_daily = {\n  \"EMP_LEAVE_ID\": number,       //請假主檔_ID\n  \"CO_ID\": number,              //公司_ID\n  \"EMP_ID\": number,             //員工_ID\n  \"LEAVEITEM_ID\": number,       //假勤項目_ID\n  \"LEAVE_DATE\":date,            //請假歸屬日期\n  \"LEAVE_DATE_SEQ\": number,     //請假歸屬日期分段\n  \"WORKTIME_START\":date,        //應上班時間起\n  \"WORKTIME_END\":date,          //應上班時間迄\n  \"LEAVED_START\":date,          //請假起始時間\n  \"LEAVED_END\":date,            //請假結束時間\n  \"LEAVE_MINS\": number,         //請假分鐘數\n  \"DED_MINS\": number,           //扣除分鐘數\n  \"CANCEL_MINS\": number,        //銷假分鐘數\n  \"DED_DETAIL\":string,          //扣除休息時間明細\n  \"UNIT\":string,                //請假當時假勤單位\n  \"DAY_TO_HOUR\": number,        //一天換小時\n  \"SHIFT_TYPE\": number,         //員工班別屬性\n  \"SHIFT_ID\": number,           //員工班別_ID\n  \"CALENDAR_BASIC_ID\": number,  //員工行事曆_ID\n  \"CALENDAR_LEAVE_ID\": number,  //員工行事曆類別_ID\n  \"CAL_STATUS\": number,         //結算狀態\n  \"SALARY_CLOSE_ID\": number,    //薪資結檔主檔_ID\n  \"C_DATETIME\":date,            //新增_日期\n  \"E_DATETIME\":date,            //修改_日期\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "LEAVE_START",
                    "LEAVE_END",
                    "EMP_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "LEAVE_START": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "請假起始日"
                    },
                    "LEAVE_END": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "請假結束日"
                    },
                    "LEAVEITEM_ID": {
                      "type": "integer",
                      "description": "假勤項目ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    }
                  }
                },
                "examples": {
                  "案例1": {
                    "value": {
                      "CO_ID": 13,
                      "LEAVE_START": "2019/10/06",
                      "LEAVE_END": "2019/10/08",
                      "LEAVEITEM_ID": 570,
                      "EMP_ID": 33546
                    }
                  },
                  "案例2": {
                    "value": {
                      "CO_ID": 13,
                      "LEAVE_START": "2019/10/06",
                      "LEAVE_END": "2019/10/08",
                      "EMP_ID": 33546
                    }
                  },
                  "案例3": {
                    "value": {
                      "CO_ID": 13,
                      "LEAVE_START": "2019/10/06",
                      "LEAVE_END": "2019/10/08",
                      "LEAVEITEM_ID": 570,
                      "LIMIT": 10
                    }
                  },
                  "案例4": {
                    "value": {
                      "CO_ID": 13,
                      "LEAVE_START": "2019/10/06",
                      "LEAVE_END": "2019/10/08",
                      "LIMIT": 10
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200, \n  data: [emp_leave_daily, emp_leave_daily, ...]\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/am/emp_ot": {
        "post": {
          "tags": [
            "AM"
          ],
          "summary": "員工加班主檔資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nemp_ot = {\n  \"EMP_OT_ID\": number,        //ID\n  \"CO_ID\": number,            //公司_ID\n  \"EMP_ID\": number,           //員工_ID\n  \"OT_START\":date,            //加班申請起始時間\n  \"OT_END\":date,              //加班申請結束時間\n  \"OT_DATE\":date,             //加班歸屬日期\n  \"REASON\":string,            //加班原因\n  \"UNIT\":string,              //加班當時單位\n  \"OT_VALUE\": number,         //合計加班數\n  \"DED_MINS\": number,         //合計扣除分鐘數\n  \"PAY_VALUE\": number,        //合計支領加班費\n  \"CL_VALUE\": number,         //合計支領補休\n  \"FILES_UUID\":string,        //附件\n  \"NOTE\":string,              //備註\n  \"OT_SOURCE\": number,        //資料來源\n  \"WF_NO\":string,             //WORKFLOW 表單編號\n  \"WF_RESULT\": number,        //表單狀態\n  \"WF_SIGN_TIME\":date,        //簽核完成時間\n  \"CAL_STATUS\": number,       //結算狀態\n  \"SALARY_CLOSE_ID\": number,  //薪資結檔主檔_ID\n  \"CALENDAR_LEAVE_ID\": number, //員工行事曆類別_ID\n  \"OT_COEF_JSON\": array,      //折現倍率JSON\n  \"C_DATETIME\":date,          //新增_日期\n  \"E_DATETIME\":date,          //修改_日期\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "OT_SDATE",
                    "OT_EDATE",
                    "EMP_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "OT_SDATE": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "加班起始日"
                    },
                    "OT_EDATE": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "加班結束日"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "OT_DATE_S": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "加班歸屬日起"
                    },
                    "OT_DATE_E": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "加班歸屬日迄"
                    }
                  }
                },
                "examples": {
                  "案例1": {
                    "value": {
                      "CO_ID": 13,
                      "OT_SDATE": "2019/10/02",
                      "OT_EDATE": "2019/10/05",
                      "EMP_ID": 33549
                    }
                  },
                  "案例2": {
                    "value": {
                      "CO_ID": 13,
                      "OT_SDATE": "2019/10/02",
                      "OT_EDATE": "2019/10/05",
                      "LIMIT": 10
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200, \n  data: [emp_ot, emp_ot, ...]\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/am/emp_cardmatch": {
        "post": {
          "tags": [
            "AM"
          ],
          "summary": "員工打卡比對結果檔資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nemp_cardmatch = {\n  \"EMP_CARDMATCH_ID\": number,           //ID\n  \"CO_ID\": number,                      //公司_ID\n  \"EMP_ID\": number,                     //員工_ID\n  \"WORK_DATE\":date,                     //應出勤日期\n  \"WORK_DATE_SEQ\": number,              //出勤日期分段\n  \"CARD_TYPE\": number,                  //打卡別\n  \"CARD_GROUP\": number,                 //打卡組別\n  \"IS_FLEXIBLE\": number,                //此段刷卡是否有彈性\n  \"FLEXIBLE_MIN\": number,               //實際彈性分鐘數\n  \"WORK_CARD_DATETIME\":date,            //應刷卡時間(不含彈性)\n  \"FLEXIBLE_CARD_DATETIME\":date,        //應刷卡時間(含彈性)\n  \"EMP_OT_ID\": number,                  //加班資料_ID\n  \"RANGE1_START\":date,                  //應打卡區間起(合理時間)\n  \"RANGE1_END\":date,                    //應打卡區間迄(合理時間)\n  \"RANGE2_START\":date,                  //應打卡區間起(不合理時間)\n  \"RANGE2_END\":date,                    //應打卡區間迄(不合理時間)\n  \"EMP_LEAVE_ID\": number,               //應打卡區間-請假主檔_ID\n  \"IS_REST_OVERTIME\": number,           //休息時間-可否加班\n  \"CARD_DATETIME\":date,                 //實際打卡時間\n  \"TEMP_UNIT\":string,                   //體溫單位\n  \"TEMP_VALUE\": number,                 //體溫值\n  \"CARD_SOURCE\": number,                //實際打卡資料來源\n  \"EMP_CARDDATA_ID\": number,            //實際打卡明細檔_ID\n  \"CARD_MATCH_STATUS\": number,          //異常比對結果\n  \"UNUSUAL_ACTION\": number,             //異常處理方式\n  \"UNUSUAL_REMARK\":string,              //異常處理備註\n  \"UNUSUAL_FILL_DATETIME\":date,         //異常處理_填寫日期\n  \"UNUSUAL_START\":date,                 //異常起始時間\n  \"UNUSUAL_END\":date,                   //異常結束時間\n  \"LATE_MIN\": number,                   //遲到分鐘數\n  \"EARLY_MIN\": number,                  //早退分鐘數\n  \"NOT_WORKING_MIN\": number,            //曠職分鐘數\n  \"EMP_ASK_LEAVE_BIZ_IDS\":string,       //已申請的請假IDS\n  \"OVER_ATTEND_STATUS\": number,         //超時出勤比對結果\n  \"OVER_ATTEND_ACTION\": number,         //超時出勤異常處理方式\n  \"OVER_ATTEND_DESC\":string,            //超時出勤回報_說明\n  \"OVER_ATTEND_FILL_TYPE\":string,       //超時出勤回報_填寫人員種類\n  \"OVER_ATTEND_FILL_DATETIME\":date,     //超時出勤回報_填寫日期\n  \"OVER_ATTEND_START\":date,             //超時出勤起始時間\n  \"OVER_ATTEND_END\":date,               //超時出勤結束時間\n  \"OVER_ATTEND_MIN\": number,            //超時出勤分鐘數\n  \"EMP_OVER_TIME_IDS\":string,           //超時出勤已申請的加班資料IDS\n  \"CAL_STATUS\": number,                 //假勤結算狀態\n  \"SALARY_CLOSE_ID\": number,            //薪資結檔主檔_ID\n  \"C_DATETIME\":date,                    //新增_日期\n  \"E_DATETIME\":date,                    //修改_日期\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "WORK_SDATE",
                    "WORK_EDATE",
                    "EMP_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "WORK_SDATE": {
                      "type": [
                        "date"
                      ],
                      "description": "出勤日期起"
                    },
                    "WORK_EDATE": {
                      "type": [
                        "date"
                      ],
                      "description": "出勤日期迄"
                    },
                    "MATCH_STATUS": {
                      "type": [
                        "string"
                      ],
                      "description": "異常條件"
                    },
                    "UNUSUAL_ACTION": {
                      "type": [
                        "string"
                      ],
                      "description": "異常處理方式"
                    },
                    "OVER_ATTEND_STATUS": {
                      "type": [
                        "string"
                      ],
                      "description": "超時出勤條件"
                    },
                    "OVER_ATTEND_ACTION": {
                      "type": [
                        "string"
                      ],
                      "description": "超時出勤異常處理方式"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    }
                  }
                },
                "examples": {
                  "案例1": {
                    "value": {
                      "CO_ID": 13,
                      "WORK_SDATE": "2019/10/10",
                      "WORK_EDATE": "2019/10/10",
                      "MATCH_STATUS": "7",
                      "UNUSUAL_ACTION": "1",
                      "OVER_ATTEND_STATUS": "2",
                      "OVER_ATTEND_ACTION": "1",
                      "EMP_ID": 33351
                    }
                  },
                  "案例2": {
                    "value": {
                      "CO_ID": 13,
                      "WORK_SDATE": "2019/10/10",
                      "WORK_EDATE": "2019/10/10",
                      "MATCH_STATUS": "7",
                      "UNUSUAL_ACTION": "1",
                      "OVER_ATTEND_STATUS": "2",
                      "OVER_ATTEND_ACTION": "1",
                      "LIMIT": 10
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200, \n  data: [emp_cardmatch, emp_cardmatch, ...]\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/am/emp_carddata": {
        "post": {
          "tags": [
            "AM"
          ],
          "summary": "員工打卡明細資料檔資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nemp_carddata = {\n  \"CO_ID\": number,          //公司_ID\n  \"EMP_ID\": number,         //員工_ID\n  \"EMP_NO\":string,          //匯入員工編號\n  \"CARDNO\":string,          //匯入卡號\n  \"CARD_DATETIME\":date,     //打卡時間\n  \"TEMP_UNIT\":string,       //體溫單位\n  \"TEMP_VALUE\": number,     //體溫值\n  \"CARD_TYPE\": number,      //原始打卡別\n  \"CARD_SOURCE\": number,    //資料來源\n  \"IMPORT_TYPE\":string,     //資料匯入方式\n  \"WF_NO\":string,           //WORKFLOW 表單編號\n  \"WF_RESULT\": number,      //表單狀態\n  \"WF_SIGN_TIME\":date,      //簽核完成時間\n  \"C_DATETIME\":date,        //新增_日期\n  \"E_DATETIME\":date,        //修改_日期\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "CARD_SDATETIME",
                    "CARD_EDATETIME",
                    "EMP_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "CARD_SDATETIME": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "打卡時間起"
                    },
                    "CARD_EDATETIME": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "打卡時間迄"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    }
                  }
                },
                "examples": {
                  "案例1": {
                    "value": {
                      "CO_ID": 13,
                      "CARD_SDATETIME": "2022/07/27 09:00",
                      "CARD_EDATETIME": "2022/07/28 18:00",
                      "EMP_ID": 34355
                    }
                  },
                  "案例2": {
                    "value": {
                      "CO_ID": 13,
                      "CARD_SDATETIME": "2022/07/27 09:00",
                      "CARD_EDATETIME": "2022/07/28 18:00",
                      "LIMIT": 10
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200, \n  data: [emp_carddata, emp_carddata, ...]\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/am/over_attend": {
        "post": {
          "tags": [
            "AM"
          ],
          "summary": "取得超時出勤原因代碼",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nover_attend = {\n  \"OVER_ATTEND_ID\": number,//超時出勤原因_ID\n  \"CO_ID\": number,//公司_ID\n  \"OVER_ATTEND_CODE\": string,//超時出勤代碼\n  \"OVER_ATTEND_NAME\": string,//超時出勤原因\n  \"OVER_ATTEND_NAME_JSON\": boject,//超時出勤原因_JSON\n  \"IS_ACT\": number,//使用狀態\n  \"SORT_ORDER\": number,//排序\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 3
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200, \n  data: [over_attend, over_attend, ...]\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/am/emp_biz_main": {
        "post": {
          "tags": [
            "AM"
          ],
          "summary": "取得員工出差主檔資料",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nempBiz = {\n  \"EMP_BIZ_ID\": number,       //員工出差資料檔_ID\n  \"CO_ID\": number,            //公司_ID\n  \"EMP_ID\": number,           //員工_ID\n  \"EMP_NO\": string,           //員工編號\n  \"BIZ_TYPE\": number,         //出差單類型 1:基礎  2:進階\n  \"BIZ_PROPERTY_ID\": number,  //出差性質_ID\n  \"AGENT_ID\": number,         //職務代理人_ID\n  \"BIZ_START\": date,          //出差起始時間\n  \"BIZ_END\": date,            //出差結束時間\n  \"BIZ_VALUE\": number,        //合計出差時數\n  \"UNIT\": string,             //出差時數單位\n  \"REQUEST_TYPE\": number,     //申請類型 1:單點出差  2:多停點出差\n  \"BIZ_TRANS_IDS\": string,    //交通工具_IDS\n  \"BIZ_TODO_IDS\": string,     //委辦事項_IDS\n  \"FILES\": array,             //附件\n  \"BIZ_SOURCE\": number,       //資料來源 1:資料輸入 2:資料匯入 6:電子表單 7:介接\n  \"WF_NO\":string,             //WORKFLOW 表單編號\n  \"WF_RESULT\": number,        //表單狀態 1:在途中 2:已核准\n  \"WF_SIGN_TIME\": date,       //簽核完成時間\n  \"E_EMP_ID\": number,         //修改_員工_ID        \n  \"E_EMP_NO\": string,         //修改_員工編號\n  \"C_DATETIME\": date,         //新增_日期\n  \"E_DATETIME\": date,         //修改_日期\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "BIZ_START",
                    "BIZ_END"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "BIZ_START": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "出差起始時間"
                    },
                    "BIZ_END": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "出差結束時間"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "LIMIT": {
                      "type": "integer",
                      "description": "筆數限制"
                    }
                  }
                },
                "examples": {
                  "案例1": {
                    "value": {
                      "CO_ID": 1,
                      "BIZ_START": "2024-01-01",
                      "BIZ_END": "2024-01-10",
                      "EMP_ID": 31886
                    }
                  },
                  "案例2": {
                    "value": {
                      "CO_ID": 1,
                      "BIZ_START": "2024-01-01",
                      "BIZ_END": "2024-01-10",
                      "LIMIT": 10
                    }
                  },
                  "案例3": {
                    "value": {
                      "CO_ID": 1,
                      "BIZ_START": "2024-01-01",
                      "BIZ_END": "2024-01-10"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: {empBiz},\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/am/emp_biz": {
        "post": {
          "tags": [
            "AM"
          ],
          "summary": "取得員工出差資料",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nempBiz = {\n  \"EMP_BIZ_ID\": number,       //員工出差資料檔_ID\n  \"EMP_BIZ_TRIP_ID\": number,  //員工出差行程明細檔_ID\n  \"CO_ID\": number,            //公司_ID\n  \"EMP_ID\": number,           //員工_ID\n  \"EMP_NO\": string,           //員工編號\n  \"BIZ_TYPE\": number,         //出差單類型 1:基礎  2:進階\n  \"BIZ_PROPERTY_ID\": number,  //出差性質_ID\n  \"AGENT_ID\": number,         //職務代理人_ID\n  \"BIZ_START\": date,          //出差起始時間\n  \"BIZ_END\": date,            //出差結束時間\n  \"BIZ_VALUE\": number,        //合計出差時數\n  \"UNIT\": string,             //出差時數單位\n  \"REQUEST_TYPE\": number,     //申請類型 1:單點出差  2:多停點出差\n  \"BIZ_AREA_ID\": number,      //出差地點_ID\n  \"BIZ_TRANS_IDS\": string,    //交通工具_IDS\n  \"BIZ_TODO_IDS\": string,     //委辦事項_IDS\n  \"REASON\": string,           //出差原因\n  \"FILES\": array,             //附件\n  \"BIZ_SOURCE\": number,       //資料來源 1:資料輸入 2:資料匯入 6:電子表單 7:介接\n  \"WF_NO\":string,             //WORKFLOW 表單編號\n  \"WF_RESULT\": number,        //表單狀態 1:在途中 2:已核准\n  \"WF_SIGN_TIME\": date,       //簽核完成時間\n  \"IS_ALL_CANCEL\": number,    //是否完全銷假 0:否  1:是\n  \"E_EMP_ID\": number,         //修改_員工_ID        \n  \"E_EMP_NO\": string,         //修改_員工編號\n  \"C_DATETIME\": date,         //新增_日期\n  \"E_DATETIME\": date,         //修改_日期\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "BIZ_START",
                    "BIZ_END"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "BIZ_START": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "出差起始時間"
                    },
                    "BIZ_END": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "出差結束時間"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "LIMIT": {
                      "type": "integer",
                      "description": "筆數限制"
                    }
                  }
                },
                "examples": {
                  "案例1": {
                    "value": {
                      "CO_ID": 1,
                      "BIZ_START": "2024-01-01",
                      "BIZ_END": "2024-01-10",
                      "EMP_ID": 31886
                    }
                  },
                  "案例2": {
                    "value": {
                      "CO_ID": 1,
                      "BIZ_START": "2024-01-01",
                      "BIZ_END": "2024-01-10",
                      "LIMIT": 10
                    }
                  },
                  "案例3": {
                    "value": {
                      "CO_ID": 1,
                      "BIZ_START": "2024-01-01",
                      "BIZ_END": "2024-01-10"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: {empBiz},\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/am/biz_area": {
        "post": {
          "tags": [
            "AM"
          ],
          "summary": "取得出差地點代碼",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nbizArea = {\n  \"BIZ_AREA_ID\": number,       //出差地點_ID\n  \"CO_ID\": number,             //公司_ID\n  \"AREA_CODE\": string,         //出差地點代碼\n  \"AREA_NAME\": string,         //出差地點名稱\n  \"AREA_NAME_JSON\": boject,    //出差地點名稱_JSON\n  \"IS_ACT\": number,            //使用狀態\n  \"SORT_ORDER\": number,        //排序\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 1
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [bizArea, bizArea, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/am/biz_property": {
        "post": {
          "tags": [
            "AM"
          ],
          "summary": "取得出差性質代碼",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nbizProperty = {\n  \"BIZ_PROPERTY_ID\": number,       //出差性質_ID\n  \"CO_ID\": number,                 //公司_ID\n  \"PROPERTY_CODE\": string,         //出差性質代碼\n  \"PROPERTY_NAME\": string,         //出差性質名稱\n  \"PROPERTY_NAME_JSON\": boject,    //出差性質名稱_JSON\n  \"IS_ACT\": number,                //使用狀態\n  \"SORT_ORDER\": number,            //排序\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 1
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [bizProperty, bizProperty, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/am/biz_todo": {
        "post": {
          "tags": [
            "AM"
          ],
          "summary": "取得委辦事項代碼",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nbizTodo = {\n  \"BIZ_TODO_ID\": number,           //委辦事項_ID\n  \"CO_ID\": number,                 //公司_ID\n  \"TODO_CODE\": string,             //委辦事項代碼\n  \"TODO_NAME\": string,             //委辦事項名稱\n  \"TODO_NAME_JSON\": boject,        //委辦事項名稱_JSON\n  \"IS_ACT\": number,                //使用狀態\n  \"SORT_ORDER\": number,            //排序\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 1
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [bizTodo, bizTodo, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/am/biz_trans": {
        "post": {
          "tags": [
            "AM"
          ],
          "summary": "取得交通工具代碼",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nbizTrans = {\n  \"BIZ_TRANS_ID\": number,          //交通工具_ID\n  \"CO_ID\": number,                 //公司_ID\n  \"TRANS_CODE\": string,            //交通工具代碼\n  \"TRANS_NAME\": string,            //交通工具名稱\n  \"TRANS_NAME_JSON\": boject,       //交通工具名稱_JSON\n  \"IS_ACT\": number,                //使用狀態\n  \"SORT_ORDER\": number,            //排序\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 1
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [bizTrans, bizTrans, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/am/section/import": {
        "post": {
          "tags": [
            "AM"
          ],
          "summary": "匯入時段排班班表上傳",
          "description": "使用說明： 依 Max 時段排班範本格式產生 excel 後，打這個 API",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "requestBody": {
            "require": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "START_DATE",
                    "END_DATE",
                    "attachment"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "START_DATE": {
                      "type": "string",
                      "description": "班表日期起"
                    },
                    "END_DATE": {
                      "type": "string",
                      "description": "班表日期迄"
                    },
                    "attachment": {
                      "type": "string",
                      "format": "binary",
                      "description": "multipart request 的 field name 必須是 'attachment'"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: integer, msg: string, commitResult?: object,\n  fails?: [\n    {\n      \"empNo\": string,                  //員工編號\n      \"empName\": string,                //中文姓名\n      \"workDate\": string,               //日期\n      \"caleName\": string,               //行事曆別\n      \"error\": string,                  //錯誤資訊\n      \"swork0\": string,                 //班別1開始時間\n      \"ework0\": string,                 //班別1結束時間\n      \"lab0_0\": string,                 //班別1標籤\n      ...\n    }, ...\n  ],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "450": {
              "description": "MulterError `{ code: 450, msg?: string }`"
            },
            "490": {
              "description": "{ code: integer, msg: string }"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/am/clock/insert": {
        "post": {
          "tags": [
            "AM"
          ],
          "summary": "打卡資料寫入",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\ncode,  //回傳訊息代號\nmsg: string,   //回傳訊息\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID",
                    "CARD_DATETIME"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "CARD_DATETIME": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "打卡時間"
                    },
                    "CARD_TYPE": {
                      "type": "integer",
                      "description": "打卡別"
                    },
                    "TEMP_UNIT": {
                      "type": "string",
                      "description": "體溫單位"
                    },
                    "TEMP_VALUE": {
                      "type": "double",
                      "description": "體溫值"
                    }
                  }
                },
                "example": {
                  "CO_ID": 1,
                  "EMP_ID": 31886,
                  "CARD_DATETIME": "2022-08-24 08:00",
                  "CARD_TYPE": 1,
                  "TEMP_UNIT": "C",
                  "TEMP_VALUE": "26.5"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "失敗\n```\n{\n  code: 490,\n  msg: string,   // 失敗原因\n}\n```\n"
            },
            "491": {
              "description": "失敗\n```\n{\n  code: 491,\n  msg: 打卡時間重複\n}\n```\n"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/am/clock/format": {
        "post": {
          "tags": [
            "AM"
          ],
          "summary": "取得打卡匯入範本",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nsalary_item = {\n  \"CO_ID\": number,            //公司_ID\n  \"CLOCK_FORMAT_ID\": number,  //刷卡鐘代號_ID\n  \"FORMAT_NAME\": string,      //格式名稱\n  \"FORMAT_TYPE\": string,      //資料接收格式 1:純文字檔(.txt,.csv,.dat) 2:Office Excel(.xls,.xlsx)\n},\n```\n",
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [clock, clock, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "失敗\n```\n{\n  code: 490,\n  msg: string,   // 失敗原因\n}\n```\n"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/am/clock/import": {
        "post": {
          "tags": [
            "AM"
          ],
          "summary": "批次打卡資料寫入",
          "description": "回傳格式：\n```\n// responses\n{\n  \"code\": number  \n  \"data\": {\n    \"success\": number,  //成功筆數\n    \"fail\": number,     //失敗筆數\n    \"errorData\": [row, row...]   //失敗資料 \n  }\n}\n// 解析資料結果範例  錯誤為object\nrow = {\n  \"rowIndex\": number,    //資料行數\n  \"year\": 2023,          //年\n  \"month\": 8,            //月\n  \"day\": 2,              //日\n  \"hour\": 8,             //時\n  \"min\": 8,              //分\n  \"sec\": 0,              //秒\n  \"date\": \"2023/08/02\",  //日期\n  \"time\": \"08:08:00\",    //時間\n  \"clock\": \"002\",        //卡鐘\n  \"empNo\": {             //員工編號\n    \"key\": \"empNo\",\n    \"value\": \"D001\",\n    \"invalid\": \"無此員工編號\"\n  },\n}\n// 錯誤 object\nerr = {\n  \"key\": string,      //錯誤項目\n  \"value\": string,    //取得值\n  \"invalid\": string   //錯誤訊息\n}\n```\n",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "requestBody": {
            "require": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "CLOCK_FORMAT_ID",
                    "attachment"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "CLOCK_FORMAT_ID": {
                      "type": "integer",
                      "description": "刷卡鐘代號_ID"
                    },
                    "attachment": {
                      "type": "string",
                      "format": "binary",
                      "description": "multipart request 的 field name 必須是 'attachment'"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "450": {
              "description": "MulterError `{ code: 450, msg?: string }`"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/auth/signIn": {
        "post": {
          "tags": [
            "Auth"
          ],
          "summary": "登入系統",
          "description": "```\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "account",
                    "password"
                  ],
                  "properties": {
                    "account": {
                      "type": "string"
                    },
                    "password": {
                      "type": "string"
                    }
                  }
                },
                "examples": {
                  "全集團": {
                    "value": {
                      "USER_ACCOUNT": "openapi001",
                      "USER_PWD": "104104"
                    }
                  },
                  "部分公司+欄位過濾+部分API": {
                    "value": {
                      "USER_ACCOUNT": "openapi002",
                      "USER_PWD": "987654321"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "登入成功\n```\n{\n  code: 200,\n  data: {\n    USER_ID: number,\n    REFRESH_TOKEN: string,\n    ACCESS_TOKEN: string,\n  },\n}\n```\n"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "登入失敗\n```\n{\n  code: 490,\n  msg: string,   // 失敗原因\n}\n```\n"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/auth/signOut": {
        "post": {
          "tags": [
            "Auth"
          ],
          "summary": "登出系統",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "REFRESH_TOKEN"
                  ],
                  "properties": {
                    "REFRESH_TOKEN": {
                      "type": "string",
                      "description": "refresh token"
                    }
                  }
                },
                "example": "{\n  \"REFRESH_TOKEN\": \"eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJiaWQiOjU5LCJ1c2VySWQiOjg0MywiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTY1Mjc3MTcyNCwiZXhwIjoxNjg0MzI5MzI0fQ.IeZ-PI24dUXGgA3W97yQ05J863spZ7GmBSI2HQ5FUJ0a-h9Smi3wmxHtT0FqUWUjmM-qJtDucpUwQBdIaW5olQ\"\n}\n"
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功登出"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/auth/token/refresh": {
        "post": {
          "tags": [
            "Auth"
          ],
          "summary": "更新 access token",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "REFRESH_TOKEN"
                  ],
                  "properties": {
                    "REFRESH_TOKEN": {
                      "type": "string",
                      "description": "refresh token"
                    }
                  }
                },
                "example": "{\n  \"REFRESH_TOKEN\": \"eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJiaWQiOjU5LCJ1c2VySWQiOjg0MywiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTY1Mjc3MTcyNCwiZXhwIjoxNjg0MzI5MzI0fQ.IeZ-PI24dUXGgA3W97yQ05J863spZ7GmBSI2HQ5FUJ0a-h9Smi3wmxHtT0FqUWUjmM-qJtDucpUwQBdIaW5olQ\"\n}\n"
              }
            }
          },
          "responses": {
            "200": {
              "description": "更新成功\n```\n{\n  code: 200,\n  access: string, // 新的 access token\n}\n```\n"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "驗證失敗 `{ code: 490, msg: string }`"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/file/attach": {
        "post": {
          "tags": [
            "FILE"
          ],
          "summary": "附件上傳",
          "description": "使用說明，以表單申請要加入附件舉例：\n- step1. 打這個 API 取得回傳物件\n- step2. 把回傳物件 push 進表單申請的 attachments 陣列\n回傳格式：\n```\n{\n  \"fileUUID\": \"30381c3458faf2d31c38aed42e7c6e17\",\n  \"fileName\": \"1.png\",\n  \"fileSize\": 74506,\n  \"fileMime\": \"image/png\",\n  \"isTmp\": 1\n}\n```\n",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "requestBody": {
            "require": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "required": [
                    "funCode",
                    "attachment"
                  ],
                  "properties": {
                    "funCode": {
                      "type": "string",
                      "description": "約定的功能代碼，例如：請假單=\"wf010\""
                    },
                    "attachment": {
                      "type": "string",
                      "format": "binary",
                      "description": "multipart request 的 field name 必須是 'attachment'"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "450": {
              "description": "MulterError `{ code: 450, msg?: string }`"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/file/detach": {
        "post": {
          "tags": [
            "FILE"
          ],
          "summary": "刪除已上傳的附件",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "uuid"
                  ],
                  "properties": {
                    "uuid": {
                      "type": "string",
                      "description": "FILE UUID"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/file/download": {
        "post": {
          "tags": [
            "FILE"
          ],
          "summary": "下載附件",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "uuid"
                  ],
                  "properties": {
                    "uuid": {
                      "type": "string",
                      "description": "FILE UUID"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/ed/grade": {
        "post": {
          "tags": [
            "ED"
          ],
          "summary": "職等資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\ngrade = {\n  \"GRADE_ID\": number,         //職等_ID\n  \"CO_ID\": number,            //公司_ID\n  \"GRADE_CODE\": string,       //職等代碼\n  \"GRADE_NAME\": string,       //職等名稱\n  \"GRADE_NAME_JSON\": boject,  //職等名稱_JSON\n  \"IS_ACT\": number,           //使用狀態\n  \"SORT_ORDER\": number,       //排序\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 13
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [grade, grade, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/ed/level": {
        "post": {
          "tags": [
            "ED"
          ],
          "summary": "職級資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nlevel = {\n  \"LEVEL_ID\": number,         //職級_ID\n  \"CO_ID\": number,            //公司_ID\n  \"GRADE_ID\": number,         //職等_ID\n  \"GRADE_CODE\": string,       //職等代碼\n  \"GRADE_NAME\": string,       //職等名稱\n  \"GRADE_NAME_JSON\": boject,  //職等名稱_JSON\n  \"LEVEL_CODE\": string,       //職級代碼\n  \"LEVEL_NAME\": string,       //職級名稱\n  \"LEVEL_NAME_JSON\": boject,  //職級名稱_JSON\n  \"IS_ACT\": number,           //使用狀態\n  \"SORT_ORDER\": number,       //排序\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 13
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [level, level, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/ed/job": {
        "post": {
          "tags": [
            "ED"
          ],
          "summary": "職位資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\njob = {\n  \"JOB_ID\": number,         //職位_ID\n  \"CO_ID\": number,          //公司_ID\n  \"JOB_CODE\": string,       //職位代碼\n  \"JOB_NAME\": string,       //職位名稱\n  \"JOB_NAME_JSON\": boject,  //職位名稱_JSON\n  \"IS_ACT\": number,         //使用狀態\n  \"SORT_ORDER\": number,     //排序\n  \"E_EMP_ID\": number,       //修改_員工_ID        \n  \"E_EMP_NO\": string,       //修改_員工編號\n  \"E_DATETIME\": date,       //修改_日期   \n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 13
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [job, job, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/ed/job_cat": {
        "post": {
          "tags": [
            "ED"
          ],
          "summary": "職務類別資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\njob_cat = {\n  \"JOB_CAT_ID\": number,         //職務類別_ID\n  \"CO_ID\": number,              //公司_ID\n  \"JOB_CAT_CODE\": string,       //職務類別代碼\n  \"JOB_CAT_NAME\": string,       //職務類別名稱\n  \"JOB_CAT_NAME_JSON\": boject,  //職務類別名稱_JSON\n  \"IS_ACT\": number,             //使用狀態\n  \"SORT_ORDER\": number,         //排序\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 13
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [job_cat, job_cat, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/ed/job_style": {
        "post": {
          "tags": [
            "ED"
          ],
          "summary": "職種資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\njob_style = {\n  \"JOB_STYLE_ID\": number,         //職種_ID\n  \"CO_ID\": number,                //公司_ID\n  \"JOB_STYLE_CODE\": string,       //職種代碼\n  \"JOB_STYLE_NAME\": string,       //職種名稱\n  \"JOB_STYLE_NAME_JSON\": boject,  //職種名稱_JSON\n  \"IS_ACT\": number,               //使用狀態\n  \"SORT_ORDER\": number,           //排序\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 13
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [job_style, job_style, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/ed/job_desc": {
        "post": {
          "tags": [
            "ED"
          ],
          "summary": "職務說明書資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\njob_desc = {\n  \"JOB_DESC_ID\": number,        //職務說明書_ID\n  \"CO_ID\": number,              //公司_ID\n  \"JOB_DESC_CODE\": string,      //職務說明書代碼\n  \"JOB_DESC_NAME\": string,      //職務說明書名稱\n  \"JOB_DESC_NAME_JSON\": boject, //職務說明書名稱_JSON\n  \"IS_ACT\": number,             //使用狀態\n  \"SORT_ORDER\": number,         //排序\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 13
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [job_desc, job_desc, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/ed/job_biz": {
        "post": {
          "tags": [
            "ED"
          ],
          "summary": "名片職務資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\njob_biz = {\n  \"JOB_BIZ_ID\": number,        //名片職務_ID\n  \"CO_ID\": number,             //公司_ID\n  \"JOB_BIZ_CODE\": string,      //名片職務代碼\n  \"JOB_BIZ_NAME\": string,      //名片職務名稱\n  \"JOB_BIZ_NAME_JSON\": boject, //名片職務名稱_JSON\n  \"IS_ACT\": number,            //使用狀態\n  \"SORT_ORDER\": number,        //排序\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 13
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [job_biz, job_biz, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/ed/identity": {
        "post": {
          "tags": [
            "ED"
          ],
          "summary": "身分類別資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nidentity = {\n  \"IDENTITY_ID\": number,          //身分類別_ID\n  \"CO_ID\": number,                //公司_ID\n  \"IDENTITY_CODE\": string,        //身分類別代碼\n  \"IDENTITY_NAME\": string,        //身分類別名稱\n  \"IDENTITY_NAME_JSON\": boject,   //身分類別名稱_JSON\n  \"IS_ACT\": number,               //使用狀態\n  \"SORT_ORDER\": number,           //排序\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 13
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [identity, identity, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/ed/area": {
        "post": {
          "tags": [
            "ED"
          ],
          "summary": "工作區域資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\narea = {\n  \"AREA_ID\": number,        //工作區域_ID\n  \"CO_ID\": number,          //公司_ID\n  \"AREA_CODE\": string,      //工作區域代碼\n  \"AREA_NAME\": string,      //工作區域名稱\n  \"AREA_NAME_JSON\": boject, //工作區域名稱_JSON\n  \"IS_ACT\": number,         //使用狀態\n  \"SORT_ORDER\": number,     //排序\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 13
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [area, area, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/ed/site": {
        "post": {
          "tags": [
            "ED"
          ],
          "summary": "工作地點資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nsite = {\n  \"SITE_ID\": number,        //工作地點_ID\n  \"CO_ID\": number,          //公司_ID\n  \"AREA_ID\": number,        //工作區域_ID\n  \"AREA_CODE\": string,      //工作區域代碼\n  \"AREA_NAME\": string,      //工作區域名稱\n  \"AREA_NAME_JSON\": boject, //工作區域名稱_JSON\n  \"SITE_CODE\": string,      //工作地點代碼\n  \"SITE_NAME\": string,      //工作地點名稱\n  \"SITE_NAME_JSON\": boject, //工作地點名稱_JSON\n  \"IS_ACT\": number,         //使用狀態\n  \"SORT_ORDER\": number,     //排序\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 13
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [site, site, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/ed/factory": {
        "post": {
          "tags": [
            "ED"
          ],
          "summary": "廠別資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nfactory = {\n  \"FACTORY_ID\": number,        //廠別_ID\n  \"CO_ID\": number,             //公司_ID\n  \"FACTORY_CODE\": string,      //廠別代碼\n  \"FACTORY_NAME\": string,      //廠別名稱\n  \"FACTORY_NAME_JSON\": boject, //廠別名稱_JSON\n  \"IS_ACT\": number,            //使用狀態\n  \"SORT_ORDER\": number,        //排序\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 13
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [factory, factory, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/ed/vars_cause": {
        "post": {
          "tags": [
            "ED"
          ],
          "summary": "異動原因資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nvars_cause = {\n  \"VARS_CAUSE_ID\": number,     //異動原因_ID\n  \"CO_ID\": number,             //公司_ID\n  \"CAUSE_CODE\": string,        //異動原因代碼\n  \"CAUSE_NAME\": string,        //異動原因名稱\n  \"CAUSE_NAME_JSON\": boject,   //異動原因名稱_JSON\n  \"IS_ACT\": number,            //使用狀態\n  \"SORT_ORDER\": number,        //排序\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 13
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [vars_cause, vars_cause, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/ed/quit_cause": {
        "post": {
          "tags": [
            "ED"
          ],
          "summary": "留停離職原因資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nvars_cause = {\n  \"QUIT_CAUSE_ID\": number,     //留停離職原因_ID\n  \"CO_ID\": number,             //公司_ID\n  \"CAUSE_CODE\": string,        //留停離職原因代碼\n  \"CAUSE_NAME\": string,        //留停離職原因名稱\n  \"CAUSE_NAME_JSON\": boject,   //留停離職原因名稱_JSON\n  \"IS_ACT\": number,            //使用狀態\n  \"SORT_ORDER\": number,        //排序\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 13
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [quit_cause, quit_cause, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/ed/course_type": {
        "post": {
          "tags": [
            "ED"
          ],
          "summary": "訓練課程分類資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nvars_cause = {\n  \"COURSE_TYPE_ID\": number,          //訓練課程分類_ID\n  \"CO_ID\": number,                   //公司_ID\n  \"COURSE_TYPE_CODE\": string,        //訓練課程分類代碼\n  \"COURSE_TYPE_NAME\": string,        //訓練課程分類名稱\n  \"COURSE_TYPE_NAME_JSON\": boject,   //訓練課程分類名稱_JSON\n  \"IS_ACT\": number,                  //使用狀態\n  \"SORT_ORDER\": number,              //排序\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 13
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [course_type, course_type, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/ed/reward": {
        "post": {
          "tags": [
            "ED"
          ],
          "summary": "獎懲項目資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nreward = {\n  \"REWARD_ID\": number,          //獎懲項目_ID\n  \"CO_ID\": number,              //公司_ID\n  \"REWARD_CODE\": string,        //獎懲項目代碼\n  \"REWARD_NAME\": string,        //獎懲項目名稱\n  \"REWARD_NAME_JSON\": boject,   //獎懲項目名稱_JSON\n  \"REWARD_TYPE\": string,        //獎懲類別名稱\n  \"REWARD_VALUE\": number,       //獎懲點數\n  \"IS_ACT\": number,             //使用狀態\n  \"SORT_ORDER\": number,         //排序\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 13
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [reward, reward, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/ed/perf_type": {
        "post": {
          "tags": [
            "ED"
          ],
          "summary": "績效種類資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nperf_type = {\n  \"PERF_TYPE_ID\": number,          //績效種類_ID\n  \"CO_ID\": number,                 //公司_ID\n  \"PERF_TYPE_CODE\": string,        //績效種類代碼\n  \"PERF_TYPE_NAME\": string,        //績效種類名稱\n  \"PERF_TYPE_NAME_JSON\": boject,   //績效種類名稱_JSON\n  \"IS_ACT\": number,                //使用狀態\n  \"SORT_ORDER\": number,            //排序\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 13
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [perf_type, perf_type, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/ed/perf_rating": {
        "post": {
          "tags": [
            "ED"
          ],
          "summary": "績效評核等級資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nperf_rating = {\n  \"PERF_RATING_ID\": number,          //評等等級_ID\n  \"CO_ID\": number,                   //公司_ID\n  \"RATING_RULE_CODE\": string,        //評核等級規則代碼\n  \"RATING_RULE_NAME\": string,        //評核等級規則名稱\n  \"RATING_RULE_NAME_JSON\": boject,   //評核等級規則名稱_JSON\n  \"PERF_RATING_CODE\": string,        //評等等級代碼\n  \"PERF_RATING_NAME\": string,        //評等等級名稱\n  \"PERF_RATING_NAME_JSON\": boject,   //評等等級名稱_JSON\n  \"IS_ACT\": number,                  //使用狀態\n  \"SORT_ORDER\": number,              //排序\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 13
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [perf_rating, perf_rating, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/ed/emp": {
        "post": {
          "tags": [
            "ED"
          ],
          "summary": "員工基本資料資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nemp = {\n  \"EMP_ID\": number,                   //員工_ID\n  \"CO_ID\": number,                    //公司_ID\n  \"CO_CODE\": string,                  //公司代號\n  \"CO_NAME\": string,                  //公司名稱\n  \"CO_NAME_JSON\": string,             //公司名稱_JSON\n  \"EMP_NO\": string,                   //員工編號\n  \"EMP_NAME\": string,                 //員工姓名\n  \"EMP_EN_NAME\": string,              //英文姓名\n  \"EMP_ALIAS_NAME\": string,           //別名\n  \"NATIONALITY\": string,              //國籍\n  \"NATIONALITY_NAME\": string,         //國籍名稱\n  \"LIVE_AREA\": string,                //出生地\n  \"IDC_NO\": string,                   //身分證號\n  \"GENDER\": number,                   //性別\n  \"GENDER_NAME\": string,              //性別名稱\n  \"BIRTHDAY\": date,                   //生日\n  \"CONSTELLATION\": number,            //星座\n  \"CONSTELLATION_NAME\": string,       //星座名稱\n  \"BLOOD_TYPE\": string,               //血型\n  \"BLOOD_TYPE_NAME\": string,          //血型名稱\n  \"MARITAL_STATUS\": number,           //婚姻狀況\n  \"MARITAL_STATUS_NAME\": string,      //婚姻狀況名稱\n  \"MILITARY_STATUS\": number,          //兵役狀況\n  \"MILITARY_STATUS_NAME\": string,     //兵役狀況名稱\n  \"VETERANS_ date\": date,             //退伍日期\n  \"HEIGHT\": number,                   //身高\n  \"WEIGHT\": number,                   //體重\n  \"ETHNIC_IDENTITY\": number,          //族群身分\n  \"ETHNIC_IDENTITY_NAME\": string,     //族群身分名稱\n  \"IS_CRIMINAL_REC\": number,          //有無前科\n  \"IS_CRIMINAL_REC_NAME\": number,     //有無前科名稱\n  \"WORK_SRC_NAME\": string,            //就職來源名稱\n  \"CRIPPLES_LEVEL1\": number,          //身障程度1\n  \"CRIPPLES_LEVEL1_NAME\": string,     //身障程度1名稱\n  \"CRIPPLES_CLASS1\": number,          //殘障類別1\n  \"CRIPPLES_CLASS1_NAME\": string,     //殘障類別1名稱\n  \"CRIPPLES_LEVEL2\": number,          //身障程度2\n  \"CRIPPLES_LEVEL2_NAME\": string,     //身障程度2名稱\n  \"CRIPPLES_CLASS2\": number,          //殘障類別2\n  \"CRIPPLES_CLASS2_NAME\": string,     //殘障類別2名稱\n  \"CRIPPLES_LEVEL3\": number,          //身障程度3\n  \"CRIPPLES_LEVEL3_NAME\": string,     //身障程度3名稱\n  \"CRIPPLES_CLASS3\": number,          //殘障類別3\n  \"CRIPPLES_CLASS3_NAME\": string,     //殘障類別3名稱\n  \"ALIEN_IDC_NO\": string,             //外僑統一證號\n  \"AGENT_CODE\": string,               //仲介單位代碼\n  \"AGENT_NAME\": string,               //仲介單位名稱\n  \"PASSPORT_NO\": string,              //護照號碼\n  \"PASSPORT_NAME\": string,            //護照姓名\n  \"ENTER_ date\": date,                //入境日期\n  \"OUTBOUND_ date\": date,             //出境日期\n  \"DUE_ date\": date,                  //居留證到期日\n  \"OFFICE_TEL\": string,               //公司電話\n  \"OFFICE_TEL_EXT\": string,           //公司電話-分機\n  \"HOME_TEL\": string,                 //住家電話\n  \"LIVE_TEL\": string,                 //戶籍電話\n  \"MOBILE_TEL\": string,               //行動電話\n  \"OFFICE_EMAIL\": string,             //公司e-mail\n  \"PERSONAL_EMAIL\": string,           //個人 e-mail\n  \"LIVE_POSTAL_CODE\": string,         //戶籍郵遞區號\n  \"LIVE_POSTAL_CODE_NAME\": string,    //戶籍郵遞區號名稱\n  \"LIVE_ADDRESS\": string,             //戶籍地址\n  \"LIVE_ADDRESS_TW\": string,          //完整戶籍地址\n  \"CONTACT_POSTAL_CODE\": string,      //通訊郵遞區號\n  \"CONTACT_POSTAL_CODE_NAME\": string, //通訊郵遞區號名稱\n  \"CONTACT_ADDRESS\": string,          //通訊地址\n  \"CONTACT_ADDRESS_TW\": string,       //完整通訊地址\n  \"CONTACT_ADDRESS_EN\": string,       //國外地址\n  \"SOCIAL_ACCOUNT1\": string,          //社群帳號(1)\n  \"SOCIAL_ACCOUNT2\": string,          //社群帳號(2)\n  \"URGENCY_CONTACT1\": string,         //緊急聯絡人(1)\n  \"URGENCY_RELATION1\": string,        //緊急聯絡人關係(1)\n  \"URGENCY_RELATION1_NAME\": string,   //緊急聯絡人關係(1)名稱\n  \"URGENCY_TEL1\": string,             //電話(1)\n  \"URGENCY_MOBILE1\": string,          //行動電話(1)\n  \"URGENCY_CONTACT2\": string,         //緊急聯絡人(2)\n  \"URGENCY_RELATION2\": string,        //緊急聯絡人關係(2)\n  \"URGENCY_RELATION2_NAME\": string,   //緊急聯絡人關係(2)名稱\n  \"URGENCY_TEL2\": string,             //電話(2)\n  \"URGENCY_MOBILE2\": string,          //行動電話(2)\n  \"SNO_ID\": number,                   //公司扣繳統編_ID\n  \"TAXID_NO\": string,                 //公司扣繳統編\n  \"SNO_NAME\": string,                 //公司扣繳統編名稱\n  \"DEPT1_ID\": number,                 //部門1_ID\n  \"DEPT1_CODE\": string,               //部門1\n  \"DEPT1_NAME\": string,               //部門1名稱\n  \"DEPT2_ID\": number,                 //部門2_ID\n  \"DEPT2_CODE\": string,               //部門2\n  \"DEPT2_NAME\": string,               //部門2名稱\n  \"DEPT3_ID\": number,                 //部門3_ID\n  \"DEPT3_CODE\": string,               //部門3\n  \"DEPT3_NAME\": string,               //部門3名稱\n  \"DEPT4_ID\": number,                 //部門4_ID\n  \"DEPT4_CODE\": string,               //部門4\n  \"DEPT4_NAME\": string,               //部門4名稱\n  \"DEPT5_ID\": number,                 //部門5_ID\n  \"DEPT5_CODE\": string,               //部門5\n  \"DEPT5_NAME\": string,               //部門5名稱\n  \"JOB_ID\": number,                   //職位\n  \"JOB_CODE\": string,                 //職位\n  \"JOB_NAME\": string,                 //職位名稱\n  \"GRADE_ID\": number,                 //職等_ID\n  \"GRADE_CODE\": string,               //職等\n  \"GRADE_NAME\": string,               //職等名稱\n  \"LEVEL_ID\": number,                 //職級_ID\n  \"LEVEL_CODE\": string,               //職級\n  \"LEVEL_NAME\": string,               //職級名稱\n  \"JOB_CAT_ID\": number,               //職務類別_ID\n  \"JOB_CAT_CODE\": string,             //職務類別\n  \"JOB_CAT_NAME\": string,             //職務類別名稱\n  \"JOB_STYLE_ID\": number,             //職種_ID\n  \"JOB_STYLE_CODE\": string,           //職種\n  \"JOB_STYLE_NAME\": string,           //職種名稱\n  \"JOB_DESC_ID\": number,              //適用職務說明書\n  \"JOB_DESC_CODE\": string,            //適用職務說明書\n  \"JOB_DESC_NAME\": string,            //適用職務說明書名稱\n  \"JOB_BIZ_ID\": number,               //名片職務\n  \"JOB_BIZ_CODE\": string,             //名片職務\n  \"JOB_BIZ_NAME\": string,             //名片職務名稱\n  \"IDENTITY_ID\": number,              //身份類別\n  \"IDENTITY_CODE\": string,            //身份類別\n  \"IDENTITY_NAME\": string,            //身份類別名稱\n  \"EMPLOYEE_TYPE\": number,            //直/間接員工\n  \"EMPLOYEE_TYPE_NAME\": string,       //直/間接員工名稱\n  \"RESPOBILITY\": number,              //責任區分\n  \"RESPOBILITY_NAME\": string,         //責任區分名稱\n  \"HEADCOUNT_STATUS\": number,         //編制狀態\n  \"HEADCOUNT_STATUS_NAME\": string,    //編制狀態名稱\n  \"AREA_ID\": number,                  //工作區域\n  \"AREA_CODE\": string,                //工作區域\n  \"AREA_NAME\": string,                //工作區域名稱\n  \"SITE_ID\": number,                  //工作地點\n  \"SITE_CODE\": string,                //工作地點\n  \"SITE_NAME\": string,                //工作地點名稱\n  \"FACTORY_ID\": string,               //廠別\n  \"FACTORY_CODE\": string,             //廠別\n  \"FACTORY_NAME\": string,             //廠別名稱\n  \"IS_PASS_PROBATION\": number,        //是否已試用期滿\n  \"PP_DAY\": number,                   //試用期天數\n  \"PP_DATE\": date,                    //試用期滿日期\n  \"PP_DESC\": string,                  //試用期說明\n  \"WORK_STATUS\": number,              //在職狀況\n  \"WORK_STATUS_NAME\": string,         //在職狀況名稱\n  \"HIRE_DATE\": date,                  //到職日期\n  \"ORG_HIRE_DATE\": date,              //到企業集團日\n  \"ORG_QUIT_DATE\": date,              //轉出集團日\n  \"QUIT_DATE\": date,                  //最後離職日期\n  \"QUIT_RETURN_DATE\": date,           //最後離職復職日期\n  \"STOP_DATE\": date,                  //最後留職停薪日期\n  \"STOP_RETURN_DATE\": date,           //最後留停復職日期\n  \"WORK_YEAR_START\": date,            //工作年資起始日\n  \"RETIRE_YEAR_START\": date,          //退休年資起始日\n  \"CARDNO\": string,                   //員工生效卡號\n  \"PORTAL_USER_ID\": number,           //員工Portal_ID        \n  \"PORTAL_USER_ACCOUNT\": string,      //員工Portal帳號  \n  \"PORTAL_USER_NAME\": string,         //員工Portal名稱                \n  \"C_DATETIME\": date,                 //新增_日期\n  \"E_EMP_ID\": number,                 //修改_員工_ID          \n  \"E_EMP_NO\": date,                   //修改_員工編號        \n  \"E_DATETIME\": date,                 //修改_日期\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "EMP_IDS": {
                      "type": "string",
                      "description": "員工IDS"
                    },
                    "LIMIT": {
                      "type": "integer",
                      "description": "筆數限制"
                    },
                    "C_SDATETIME": {
                      "type": [
                        "date"
                      ],
                      "description": "新增日期起"
                    },
                    "C_EDATETIME": {
                      "type": [
                        "date"
                      ],
                      "description": "新增日期迄"
                    },
                    "E_SDATETIME": {
                      "type": [
                        "date"
                      ],
                      "description": "修改日期起"
                    },
                    "E_EDATETIME": {
                      "type": [
                        "date"
                      ],
                      "description": "修改日期迄"
                    }
                  }
                },
                "examples": {
                  "案例1": {
                    "value": {
                      "CO_ID": 13,
                      "EMP_ID": "33770"
                    }
                  },
                  "案例2": {
                    "value": {
                      "CO_ID": 13,
                      "LIMIT": 10
                    }
                  },
                  "案例3": {
                    "value": {
                      "CO_ID": 13,
                      "LIMIT": 10,
                      "C_SDATETIME": "2022/07/27 09:00",
                      "C_EDATETIME": "2022/07/28 18:00",
                      "E_SDATETIME": "2022/07/27 09:00",
                      "E_EDATETIME": "2022/07/28 18:00"
                    }
                  },
                  "案例4": {
                    "value": {
                      "CO_ID": 13,
                      "EMP_IDS": "33770,33771"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [emp, emp, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "資料檢查異常 `{ code: 490, msg?: string }`"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/ed/emp_photo": {
        "post": {
          "tags": [
            "ED"
          ],
          "summary": "員工照片檔資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nemp_photo = {\n  \"EMP_ID\": number,   //員工_ID\n  \"PHOTO\": string,    //員工照片\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 13,
                  "EMP_ID": "33762"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [emp_photo, emp_photo, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/ed/emp_training": {
        "post": {
          "tags": [
            "ED"
          ],
          "summary": "員工訓練資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nemp_training = {\n  \"EMP_TRAINING_ID\": number,        //員工訓練_ID\n  \"EMP_ID\": number,                 //員工_ID\n  \"COURSE_NAME\": string,            //課程名稱\n  \"TRAINING_TYPE\": number,          //訓練種類\n  \"COURSE_TYPE_ID\": number,         //課程分類\n  \"COURSE_TYPE_CODE\": string,       //課程分類代碼\n  \"COURSE_TYPE_NAME\": string,       //課程分類名稱\n  \"COURSE_TYPE_NAME_JSON\": boject,  //課程分類名稱_JSON\n  \"COURSE_REQUIRE\": number,         //課程需求\n  \"COURSE_EXEC\": number,            //上課方式\n  \"ORGANIZER\": string,              //主辦單位\n  \"LOCATION\": string,               //訓練地點\n  \"TRAINER\": string,                //講師姓名\n  \"COURSE_START\": date,             //上課時間起\n  \"COURSE_END\": date,               //上課時間迄\n  \"COURSE_HOUR\": number,            //課程時數\n  \"TEST_SCORE\": number,             //測驗分數\n  \"TEST_RESULT\": number,            //測驗結果\n  \"TEST_REASON\": string,            //不合格原因\n  \"CO_FEE_CUR\": string,             //費用分攤(公司)-幣別\n  \"CO_FEE\": number,                 //費用分攤(公司)-金額\n  \"EMP_FEE_CUR\": string,            //費用分攤(員工)-幣別\n  \"EMP_FEE\": number,                //費用分攤(員工)-金額\n  \"WORK_CONTRACT_YEAR\": number,     //工作簽約期限-年\n  \"WORK_CONTRACT_MONTH\": number,    //工作簽約期限-月\n  \"WORK_CONTRACT_DATE\": number,     //工作簽約到期日\n  \"TRAINING_NOTE\": string,          //備註\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "COURSE_START",
                    "COURSE_END"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "COURSE_START": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "訓練時間起"
                    },
                    "COURSE_END": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "訓練時間迄"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "LIMIT": {
                      "type": "integer",
                      "description": "筆數限制"
                    }
                  }
                },
                "examples": {
                  "案例1": {
                    "value": {
                      "CO_ID": 13,
                      "COURSE_START": "2021-10-01",
                      "COURSE_END": "2021-10-02",
                      "EMP_ID": "34526"
                    }
                  },
                  "案例2": {
                    "value": {
                      "CO_ID": 13,
                      "COURSE_START": "2021-10-01",
                      "COURSE_END": "2021-10-02",
                      "LIMIT": 10
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [emp_training, emp_training, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/ed/emp_perf": {
        "post": {
          "tags": [
            "ED"
          ],
          "summary": "員工績效資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nemp_perf = {\n  \"EMP_PERF_ID\": number,            //員工績效_ID\n  \"EMP_ID\": number,                 //員工_ID\n  \"PERF_YEAR\": number,              //考核年度\n  \"PERF_TYPE_ID\": number,           //考核種類\n  \"PERF_NAME\": string,              //績效管理名稱\n  \"PERF_START_DATE\": date,          //績效管理起日\n  \"PERF_END_DATE\": date,            //績效管理迄日\n  \"PERF_SCORE\": string,             //評核分數\n  \"PERF_RATING_ID\": number,         //評核等級_ID\n  \"PERF_RATING_CODE\": string,       //評等等級代碼\n  \"PERF_RATING_NAME\": string,       //評等等級名稱\n  \"PERF_RATING_NAME_JSON\": boject,  //評等等級名稱_JSON\n  \"IS_PASS\": number,                //是否通過\n  \"PERF_COMMENT\": string,           //評語\n  \"PERF_NOTE\": string,              //備註\n  \"DATA_SOURCE\": number,            //資料來源\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "S_YEAR",
                    "E_YEAR"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "S_YEAR": {
                      "type": [
                        "string",
                        "YEAR"
                      ],
                      "description": "考核年度起"
                    },
                    "E_YEAR": {
                      "type": [
                        "string",
                        "YEAR"
                      ],
                      "description": "考核年度迄"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "LIMIT": {
                      "type": "integer",
                      "description": "筆數限制"
                    }
                  }
                },
                "examples": {
                  "案例1": {
                    "value": {
                      "CO_ID": 13,
                      "S_YEAR": "2020",
                      "E_YEAR": "2023",
                      "EMP_ID": "34526"
                    }
                  },
                  "案例2": {
                    "value": {
                      "CO_ID": 13,
                      "S_YEAR": "2020",
                      "E_YEAR": "2023",
                      "LIMIT": 10
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [emp_perf, emp_perf, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/ed/emp_reward": {
        "post": {
          "tags": [
            "ED"
          ],
          "summary": "員工獎懲資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nemp_reward = {\n  \"EMP_REWARD_ID\": number,      //員工獎懲_ID\n  \"EMP_ID\": number,             //員工_ID\n  \"REWARD_DATE\": date,          //獎懲日期\n  \"REWARD_ID\": number,          //獎懲項目\n  \"REWARD_CODE\": string,        //獎懲項目代碼\n  \"REWARD_NAME\": string,        //獎懲項目名稱\n  \"REWARD_NAME_JSON\": boject,   //獎懲項目名稱_JSON\n  \"REWARD_VAL\": number,         //功過數量\n  \"REWARD_LIST\": string,        //獎懲文號\n  \"REWARD_DESC\": string,        //獎懲說明\n  \"REWARD_NOTE\": string,        //備註\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "REWARD_SDATE",
                    "REWARD_EDATE"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "REWARD_SDATE": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "獎懲日期起"
                    },
                    "REWARD_EDATE": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "獎懲日期迄"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "LIMIT": {
                      "type": "integer",
                      "description": "筆數限制"
                    }
                  }
                },
                "examples": {
                  "案例1": {
                    "value": {
                      "CO_ID": 13,
                      "REWARD_SDATE": "2020/01/01",
                      "REWARD_EDATE": "2021/12/31",
                      "EMP_ID": "33770"
                    }
                  },
                  "案例2": {
                    "value": {
                      "CO_ID": 13,
                      "REWARD_SDATE": "2020/01/01",
                      "REWARD_EDATE": "2021/12/31",
                      "LIMIT": 10
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [emp_reward, emp_reward, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/ed/emp_rollback": {
        "post": {
          "tags": [
            "ED"
          ],
          "summary": "員工時光回朔檔",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nemp_rollback = {\n  \"EMP_ID\": number,                 //員工_ID\n  \"EMP_NO\": string,                 //員工編號\n  \"START_DATE\": date,               //開始日\n  \"END_DATE\": date,                 //結束日\n  \"SNO_ID\": number,                 //公司扣繳統編_ID\n  \"TAXID_NO\": string,               //公司扣繳統編\n  \"SNO_NAME\": string,               //公司扣繳統編名稱\n  \"DEPT1_ID\": number,               //部門1_ID\n  \"DEPT1_CODE\": string,             //部門1\n  \"DEPT1_NAME\": string,             //部門1名稱\n  \"DEPT2_ID\": number,               //部門2_ID\n  \"DEPT2_CODE\": string,             //部門2\n  \"DEPT2_NAME\": string,             //部門2名稱\n  \"DEPT3_ID\": number,               //部門3_ID\n  \"DEPT3_CODE\": string,             //部門3\n  \"DEPT3_NAME\": string,             //部門3名稱\n  \"DEPT4_ID\": number,               //部門4_ID\n  \"DEPT4_CODE\": string,             //部門4\n  \"DEPT4_NAME\": string,             //部門4名稱\n  \"DEPT5_ID\": number,               //部門5_ID\n  \"DEPT5_CODE\": string,             //部門5\n  \"DEPT5_NAME\": string,             //部門5名稱\n  \"JOB_ID\": number,                 //職位\n  \"JOB_CODE\": string,               //職位代碼\n  \"JOB_NAME\": string,               //職位名稱\n  \"GRADE_ID\": number,               //職等\n  \"GRADE_CODE\": string,             //職等代碼\n  \"GRADE_NAME\": string,             //職等名稱\n  \"LEVEL_ID\": number,               //職級\n  \"LEVEL_CODE\": string,             //職級代碼\n  \"LEVEL_NAME\": string,             //職級名稱\n  \"JOB_CAT_ID\": number,             //職務類別\n  \"JOB_CAT_CODE\": string,           //職務類別\n  \"JOB_CAT_NAME\": string,           //職務類別名稱\n  \"JOB_STYLE_ID\": number,           //職種\n  \"JOB_STYLE_CODE\": string,         //職種\n  \"JOB_STYLE_NAME\": string,         //職種名稱\n  \"JOB_DESC_ID\": number,            //適用職務說明書\n  \"JOB_DESC_CODE\": string,          //適用職務說明書\n  \"JOB_DESC_NAME\": string,          //適用職務說明書名稱\n  \"JOB_BIZ_ID\": number,             //名片職務\n  \"JOB_BIZ_CODE\": string,           //名片職務\n  \"JOB_BIZ_NAME\": string,           //名片職務名稱\n  \"IDENTITY_ID\": number,            //身份類別\n  \"IDENTITY_CODE\": string,          //身份類別\n  \"IDENTITY_NAME\": string,          //身份類別名稱\n  \"EMPLOYEE_TYPE\": number,          //直/間接員工\n  \"EMPLOYEE_TYPE_NAME\": string,     //直/間接員工名稱\n  \"RESPOBILITY\": number,            //責任區分\n  \"RESPOBILITY_NAME\": string,       //責任區分名稱\n  \"HEADCOUNT_STATUS\": number,       //編制狀態\n  \"HEADCOUNT_STATUS_NAME\": string,  //編制狀態名稱\n  \"AREA_ID\": number,                //工作區域\n  \"AREA_CODE\": string,              //工作區域\n  \"AREA_NAME\": string,              //工作區域名稱\n  \"SITE_ID\": number,                //工作地點\n  \"SITE_CODE\": string,              //工作地點\n  \"SITE_NAME\": string,              //工作地點名稱\n  \"FACTORY_ID\": string,             //廠別\n  \"FACTORY_CODE\": string,           //廠別\n  \"FACTORY_NAME\": string,           //廠別名稱\n  \"WORK_STATUS\": number,            //在職狀況\n  \"WORK_STATUS_NAME\": string,       //在職狀況名稱\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "BASE_DATE",
                    "EMP_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "BASE_DATE": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "基準日"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 13,
                  "BASE_DATE": "2024/01/01",
                  "EMP_ID": "33348"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [emp_rollback, emp_rollback, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/ed/emp_id": {
        "post": {
          "tags": [
            "ED"
          ],
          "summary": "員工ID",
          "description": "回傳格式說明：\n```\n[\n  {\n    CO_CODE, // 公司代號\n    CO_ID,   // 公司 ID\n    EMP_NO,  // 員工編號\n    EMP_ID   // 員工 ID\n  },\n  ...\n]\n```\n",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "requestBody": {
            "require": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_CODE",
                    "EMP_NO"
                  ],
                  "properties": {
                    "CO_CODE": {
                      "type": "string",
                      "description": "公司代號"
                    },
                    "EMP_NO": {
                      "type": "array",
                      "items": {
                        "type": "string",
                        "description": "員工編號 可多組"
                      }
                    }
                  }
                },
                "example": "{\n  \"CO_CODE\": \"84598349\",\n  \"EMP_NO\": \"A001,A002\"\n}\n"
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "資料檢查異常 `{ code: 490, msg?: string }`"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/ed/emp_parttime": {
        "post": {
          "tags": [
            "ED"
          ],
          "summary": "員工兼職資料",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nemp_parttime = {\n  \"EMP_PARTTIME_ID\": number,   //員工兼職資料_ID\n  \"EMP_ID\": number,            //員工_ID\n  \"EMP_NO\": string,            //員工編號\n  \"DATA_AREA\": number,         //資料區域\n  \"START_DATE\": date,          //任職日期\n  \"END_DATE\": date,            //卸離日期\n  \"CO_ID\": number,             //公司_ID\n  \"CO_CODE\": string,           //公司代碼\n  \"ORG_TYPE_CODE\": number,     //組織類別代碼\n  \"DEPT_ID\": number,           //部門_ID\n  \"DEPT_CODE\": string,         //部門代號\n  \"DEPT_NAME\": string,         //部門名稱\n  \"JOB_ID\": number,            //職位_ID\n  \"JOB_CODE\": string,          //職位代號\n  \"JOB_NAME\": string,          //職位名稱    \n  \"JOB_CAT_ID\": number,        //職務類別_ID\n  \"JOB_CAT_CODE\": string,      //職務類別代號\n  \"JOB_CAT_NAME\": string,      //職務類別名稱\n  \"GRADE_ID\": number,          //職等_ID\n  \"GRADE_CODE\": string,        //職等代號\n  \"GRADE_NAME\": string,        //職等名稱             \n  \"LEVEL_ID\": number,          //職級_ID\n  \"LEVEL_CODE\": string,        //職級代號\n  \"LEVEL_NAME\": string,        //職級名稱                 \n  \"NOTE\": string,              //備註\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "LIMIT": {
                      "type": "integer",
                      "description": "筆數限制"
                    }
                  }
                },
                "examples": {
                  "案例1": {
                    "value": {
                      "CO_ID": 13,
                      "EMP_ID": "33770"
                    }
                  },
                  "案例2": {
                    "value": {
                      "CO_ID": 13,
                      "LIMIT": 10
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [emp_parttime, emp_parttime, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/os/company": {
        "post": {
          "tags": [
            "OS"
          ],
          "summary": "公司資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\ncompany = {\n  \"CO_ID\": number,          //公司_ID\n  \"CO_CODE\": string,        //公司代號\n  \"CO_NAME\": string,        //公司名稱\n  \"CO_NAME_JSON\": boject,   //公司名稱_JSON\n  \"SORT_ORDER\": number,     //排序\n  \"BUILD_DATE\": date,       //成立日期\n  \"DEF_LANG\": string,       //預設語系\n  \"TIME_ZONE\": string,      //時區\n  \"IS_ACT\": number,         //使用狀態  \n},\n```\n",
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200, \n  data: [company, company, ...]\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/os/dept": {
        "post": {
          "tags": [
            "OS"
          ],
          "summary": "部門資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\ndept = {\n  \"DEPT_ID\": number,                //部門_ID\n  \"CO_ID\": number,                  //公司_ID\n  \"ORG_TYPE_CODE\": string,          //組織類別代碼\n  \"ORG_TYPE_NAME\": string,          //組織類別名稱\n  \"DEPT_CODE\": string,              //部門代碼\n  \"DEPT_NAME\": string,              //部門名稱\n  \"DEPT_NAME_JSON\": object,         //部門名稱_JSON\n  \"DEPT_ABBR  \": string,            //部門簡稱\n  \"DEPT_ABBR_JSON\": object,         //部門簡稱_JSON\n  \"DEPT_LEVEL_ID\": number,          //部門組織層級_ID\n  \"DEPT_LEVEL_NAME\": string,        //層級名稱\n  \"DEPT_LEVEL_NAME_JSON\": object,   //部門層級名稱_JSON\n  \"DEPT_LEVEL_SORT\": number,        ##部門層級_排序\n  \"LEADER_ID\": number,              //部門主管_ID\n  \"LEADER_EMP_NO\": string,          //部門主管_員工編號\n  \"LEADER_EMP_NAME\": string,        //部門主管_姓名\n  \"LEADER_STATUS\": number,          //部門主管兼職/代理\n  \"DEPUTY_LEADER_ID\": number,       //部門副主管_ID\n  \"DEPUTY_LEADER_EMP_NO\": string,   //部門副主管_員工編號\n  \"DEPUTY_LEADER_EMP_NAME\": string, //部門副主管_姓名\n  \"DEPUTY_LEADER_STATUS\": number,   //部門副主管_兼職/代理\n  \"POSTAL_CODE\": string,            //部門郵遞區號\n  \"ADDRESS\": string,                //部門地址\n  \"ADDRESS_TW\": string,             //中文地址\n  \"ADDRESS_EN\": string,             //英文地址\n  \"TEL\": string,                    //部門電話\n  \"FAX\": string,                    //部門傳真\n  \"NOTE\": string,                   //備註\n  \"IS_ACT\": number,                 //使用狀態\n  \"PARENT_DEPT_ID\": number,         //上層部門_ID\n  \"PARENT_DEPT_CODE\": string,       //上層部門_部門代號\n  \"PARENT_DEPT_NAME\": string,       //上層部門_部門名稱\n  \"DEPT_RELATION\": string,          //部門連結關係(向上的父部門)\n  \"DEPT_RELATION_R\": string,        //部門連結關係(反向：子部門)\n  \"DEPT_SORT\": number,              //組織樹狀排序位置\n  \"SORT_BY_LEVEL\": number,          //同一個層級排序位置\n  \"LEVNUM\": number,                 //組織圖排列層次  \n  \"DEPT_START_DATE\": date,          //部門起始日    \n  \"E_EMP_ID\": number,               //修改_員工_ID           \n  \"E_EMP_NO\": string,               //修改_員工編號\n  \"E_DATETIME\": date,               //修改_日期    \n}\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "BASE_DATE",
                    "ORG_TYPE_CODE"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "BASE_DATE": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "基準日"
                    },
                    "ORG_TYPE_CODE": {
                      "type": [
                        "integer"
                      ],
                      "description": "組織類別代碼  1~5"
                    },
                    "E_SDATETIME": {
                      "type": [
                        "string",
                        "datetime"
                      ],
                      "description": "維護日期起"
                    },
                    "E_EDATETIME": {
                      "type": [
                        "string",
                        "datetime"
                      ],
                      "description": "維護日期迄"
                    }
                  }
                },
                "examples": {
                  "案例1": {
                    "value": "{\n  \"CO_ID\": 13,\n  \"BASE_DATE\": \"2021-07-01\",\n  \"ORG_TYPE_CODE\": 1\n}\n"
                  },
                  "案例2": {
                    "value": {
                      "CO_ID": 13,
                      "BASE_DATE": "2021-07-01",
                      "ORG_TYPE_CODE": 1,
                      "E_SDATETIME": "2021-07-01 09:00",
                      "E_EDATETIME": "2021-07-01 18:00"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n  {\n    code: 200,\n    data: [dept, dept, ...]\n  }\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/os/dept_level": {
        "post": {
          "tags": [
            "OS"
          ],
          "summary": "部門層級資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\ndeptLevel = {\n  \"DEPT_LEVEL_ID\": number,       //組織層級_ID\n  \"CO_ID\": number,               //公司_ID\n  \"ORG_TYPE_CODE\": string,       //組織類別代碼\n  \"ORG_TYPE_NAME\": string,       //組織類別名稱\n  \"LEVEL_NAME\": string,          //層級名稱\n  \"LEVEL_NAME_JSON\": object,     //層級名稱_JSON\n  \"IS_ACT\": number,              //使用狀態\n  \"SORT_ORDER\": number,          //組織樹狀排序位置\n  \"E_EMP_ID\": number,            //修改_員工_ID        \n  \"E_EMP_NO\": string,            //修改_員工編號\n  \"E_DATETIME\": date,            //修改_日期  \n}\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "BASE_DATE",
                    "ORG_TYPE_CODE"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "BASE_DATE": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "基準日"
                    },
                    "ORG_TYPE_CODE": {
                      "type": [
                        "integer"
                      ],
                      "description": "組織類別代碼  1~5"
                    }
                  }
                },
                "example": {
                  "CO_ID": 13,
                  "BASE_DATE": "2021-07-01",
                  "ORG_TYPE_CODE": 1
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n  {\n    code: 200,\n    data: [deptLevel, deptLevel, ...]\n  }\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/os/company_sno": {
        "post": {
          "tags": [
            "OS"
          ],
          "summary": "扣繳單位統編資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\ncompany_sno = {\n  \"SNO_ID\": number,         //公司扣繳統編_ID\n  \"CO_ID\": string,          //公司_ID\n  \"SNO_NAME\": string,       //公司扣繳統編名稱\n  \"SNO_NAME_JSON\": boject,  //公司扣繳統編名稱_JSON\n  \"TAXID_NO\": number,       //統一編號\n  \"IS_WELFARE\": date,       //是否為福委會\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 13
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200, \n  data: [company_sno, company_sno, ...]\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/pb/salaryItem": {
        "post": {
          "tags": [
            "PB"
          ],
          "summary": "薪資科目檔資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nsalaryItem = {\n  \"CO_ID\": number,            //公司_ID\n  \"ITEM_CLASS\": number,       //加扣項別\n  \"DEFAULT_ITEM_CODE\":string, //對照系統科目代號\n  \"ITEM_CODE\":string,         //薪資科目代號\n  \"ITEM_NAME\":string,         //薪資科目名稱\n  \"ITEM_NAME_JSON\":boject,    //薪資科目名稱_JSON\n  \"IS_TAX\": number,           //是否應稅\n  \"TAX_FORMAT\":string,        //所得格式\n  \"TAX_TYPE\": number,         //課稅屬性\n  \"ENV_ITEM_NAME\":boject,     //薪資袋輸出名稱\n  \"IS_ACT\": number,           //是否啟用\n  \"SORT_ORDER\": number,       //排序\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 13
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [salaryItem, salaryItem, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/pb/salaryItem/default": {
        "post": {
          "tags": [
            "PB"
          ],
          "summary": "薪資科目預設檔資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nsalaryItem_default = {\n  \"SALARY_ITEM_DEFAULT_ID\": number, //ID\n  \"ITEM_CLASS\":string,              //加扣項別\n  \"ITEM_CODE\":string,               //薪資科目代號\n  \"ITEM_NAME\":string,               //薪資科目名稱\n},\n```\n",
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [salaryItem_default, salaryItem_default, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/pb/rccc": {
        "post": {
          "tags": [
            "PB"
          ],
          "summary": "成本中心代碼檔資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nrccc = {\n  \"RCCC_ID\": number,        //成本中心_ID\n  \"CO_ID\": number,          //公司_ID\n  \"RCCC_CODE\":string,       //成本中心代碼\n  \"RCCC_NAME\":string,       //成本中心名稱\n  \"RCCC_NAME_JSON\":string,  //成本中心名稱_JSON\n  \"IS_ACT\": number,         //使用狀態\n  \"SORT_ORDER\": number,     //排序\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 13
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [rccc, rccc, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/pb/emp_bank": {
        "post": {
          "tags": [
            "PB"
          ],
          "summary": "員工薪資帳號資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nemp_bank = {\n  \"EMP_ID\": number,       //員工_ID\n  \"BANK_SEQ\": number,     //帳號\n  \"BANK_CODE\":string,     //銀行代碼\n  \"BANK_NAME\":string,     //銀行名稱\n  \"BRANCH_CODE\":string,   //分行代碼\n  \"BRANCH_NAME\":string,   //分行名稱\n  \"BANK_ACCOUNT\":string,  //銀行帳號\n  \"BANK_NOTE\":string,     //銀行備註\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    }
                  }
                },
                "examples": {
                  "案例1": {
                    "value": {
                      "CO_ID": 9,
                      "EMP_ID": "32331"
                    }
                  },
                  "案例2": {
                    "value": {
                      "CO_ID": 9
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [emp_bank, emp_bank, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/pb/emp_basic": {
        "post": {
          "tags": [
            "PB"
          ],
          "summary": "員工薪資基本資料資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nemp_basic = {\n  \"CO_ID\": number,              //公司_ID\n  \"EMP_ID\": number,             //員工_ID\n  \"SALARY_TYPE\":string,         //計薪方式\n  \"IS_HOLIDAY_PAY\": number,     //(日薪)假日是否給薪\n  \"LABOR_NO\":string,            //勞保投保編號\n  \"LABOR_NAME\":string,          //勞保投保單位名稱\n  \"LABOR_NAME_JSON\":object,     //勞保投保單位名稱_JSON\n  \"HEALTH_NO\":string,            //健保投保編號\n  \"HEALTH_NAME\":string,          //健保投保單位名稱\n  \"HEALTH_NAME_JSON\":object,     //健保投保單位名稱_JSON\n  \"LABOR_AMOUNT\": number,       //勞保月投保薪資\n  \"RISK_AMOUNT\": number,        //職災月投保薪資\n  \"HEALTH_AMOUNT\": number,      //健保投保薪資\n  \"RETIRE_AMOUNT\": number,      //勞退提繳工資\n  \"EMP_RATE\": number,           //員工提繳率\n  \"CO_RATE\": number,            //雇主提繳率\n  \"LABOR_NOW_STATUS\": number,   //勞保投保狀況\n  \"HEALTH_NOW_STATUS\": number,  //健保投保狀況\n  \"RETIRE_NOW_STATUS\": number,  //勞退投保狀況\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "BASE_DATE"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "BASE_DATE": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "基準日"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "LIMIT": {
                      "type": "integer",
                      "description": "筆數限制"
                    }
                  }
                },
                "examples": {
                  "案例1": {
                    "value": {
                      "CO_ID": 13,
                      "BASE_DATE": "2022/01/01",
                      "EMP_ID": "33346"
                    }
                  },
                  "案例2": {
                    "value": {
                      "CO_ID": 13,
                      "BASE_DATE": "2022/01/01",
                      "LIMIT": 10
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [emp_basic, emp_basic, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/pb/emp_structure": {
        "post": {
          "tags": [
            "PB"
          ],
          "summary": "員工薪資結構明細資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nemp_structure = {\n  \"CO_ID\": number,            //公司_ID\n  \"EMP_ID\": number,           //員工_ID\n  \"SALARY_ITEM_ID\": number,   //薪資科目_ID\n  \"ITEM_CLASS\": number,       //薪資科目加扣項別\n  \"ITEM_CODE\":string,         //薪資科目代號\n  \"ITEM_NAME\":string,         //薪資科目名稱\n  \"ITEM_NAME_JSON\":string,    //薪資科目名稱_JSON\n  \"ITEM_SALARY_TYPE\":string,  //薪資科目計薪方式\n  \"SALARY_AMOUNT\": number,    //薪資科目金額\n  \"CURRENCY\":string,          //幣別代碼\n  \"IS_PAY\": number,           //是否計薪\n  \"NOTE\":string,              //備註\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "BASE_DATE"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "BASE_DATE": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "基準日"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "LIMIT": {
                      "type": "integer",
                      "description": "筆數限制"
                    }
                  }
                },
                "examples": {
                  "案例1": {
                    "value": {
                      "CO_ID": 13,
                      "BASE_DATE": "2022/01/01",
                      "EMP_ID": 42054
                    }
                  },
                  "案例2": {
                    "value": {
                      "CO_ID": 13,
                      "BASE_DATE": "2022/01/01",
                      "LIMIT": 10
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [emp_structure, emp_structure, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/pb/emp_rccc": {
        "post": {
          "tags": [
            "PB"
          ],
          "summary": "員工薪資異動_成本中心明細資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nemp_rccc = {\n  \"CO_ID\": number,      //公司_ID\n  \"EMP_ID\": number,     //員工_ID\n  \"RCCC_ID\": number,    //成本中心_ID\n  \"PERCENT\": number,    //分攤比例\n  \"SORT_ORDER\": number, //排序\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "BASE_DATE"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "BASE_DATE": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "基準日"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "LIMIT": {
                      "type": "integer",
                      "description": "筆數限制"
                    }
                  }
                },
                "examples": {
                  "案例1": {
                    "value": {
                      "CO_ID": 13,
                      "BASE_DATE": "2022/01/01",
                      "EMP_ID": "33346"
                    }
                  },
                  "案例2": {
                    "value": {
                      "CO_ID": 13,
                      "BASE_DATE": "2022/01/01",
                      "LIMIT": 10
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [emp_rccc, emp_rccc, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/pb/emp_salary": {
        "post": {
          "tags": [
            "PB"
          ],
          "summary": "員工每月計薪結果-主檔資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nemp_salary = {\n  \"SALARY_CLOSE_ID\": number,  //薪資結檔主檔_ID\n  \"CLOSE_NAME\":string,        //結檔名稱\n  \"CO_ID\": number,            //公司_ID\n  \"EMP_ID\": number,           //員工_ID\n  \"SALARY_PAYCAT\": number,    //發放種類\n  \"JOB_MONTH\":date,           //計薪年月\n  \"PAY_DATE\":date,            //發放日期\n  \"TAX_MONTH\":date,           //所得年月\n  \"INC_AMOUNT\": number,       //加項總額\n  \"DEC_AMOUNT\": number,       //扣項總額\n  \"NET_AMOUNT\": number,       //實發金額\n  \"SNO_ID\": number,           //公司扣繳統編_ID\n  \"DEPT1_ID\": number,         //部門1_ID\n  \"DEPT2_ID\": number,         //部門2_ID\n  \"DEPT3_ID\": number,         //部門3_ID\n  \"DEPT4_ID\": number,         //部門4_ID\n  \"DEPT5_ID\": number,         //部門5_ID\n  \"JOB_ID\": number,           //職位\n  \"GRADE_ID\": number,         //職等\n  \"LEVEL_ID\": number,         //職級\n  \"IDENTITY_ID\": number,      //身份類別\n  \"EMPLOYEE_TYPE\": number,    //直/間接員工\n  \"RESPOBILITY\": number,      //責任區分\n  \"HEADCOUNT_STATUS\": number, //編制狀態\n  \"AREA_ID\": number,          //工作區域\n  \"SITE_ID\": number,          //工作地點\n  \"FACTORY_ID\": number,       //廠別\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "TYPE",
                    "S_YM",
                    "E_YM"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "TYPE": {
                      "type": "integer",
                      "description": "抓取條件方式"
                    },
                    "S_YM": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "年月起"
                    },
                    "E_YM": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "年月起"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "LIMIT": {
                      "type": "integer",
                      "description": "筆數限制"
                    }
                  }
                },
                "examples": {
                  "案例1": {
                    "value": {
                      "CO_ID": 13,
                      "TYPE": 1,
                      "S_YM": "2022/01",
                      "E_YM": "2022/02",
                      "EMP_ID": "37137"
                    }
                  },
                  "案例2": {
                    "value": {
                      "CO_ID": 13,
                      "TYPE": 1,
                      "S_YM": "2022/01",
                      "E_YM": "2022/02",
                      "LIMIT": 10
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [emp_salary, emp_salary, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/pb/emp_salary/detail": {
        "post": {
          "tags": [
            "PB"
          ],
          "summary": "員工每月計薪結果-明細資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nemp_salary_detail = {\n  \"CO_ID\": number,              //公司_ID\n  \"EMP_ID\": number,             //員工_ID\n  \"SALARY_CLOSE_ID\": number,    //薪資結檔主檔_ID\n  \"SALARY_PAYCAT\": number,      //發放種類\n  \"CLOSE_NAME\":string,          //結檔名稱\n  \"PAY_DATE\":date,              //發放日期\n  \"JOB_MONTH\":date,             //計薪年月\n  \"TAX_MONTH\":date,             //所得年月\n  \"SALARY_ITEM_ID\": number,     //薪資科目_ID\n  \"SALARY_ITEM_AMOUNT\": number, //金額(台幣)\n  \"NOTE\":string,                //備註\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "TYPE",
                    "S_YM",
                    "E_YM"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "TYPE": {
                      "type": "integer",
                      "description": "抓取條件方式"
                    },
                    "S_YM": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "年月起"
                    },
                    "E_YM": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "年月起"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "LIMIT": {
                      "type": "integer",
                      "description": "筆數限制"
                    }
                  }
                },
                "examples": {
                  "案例1": {
                    "value": {
                      "CO_ID": 13,
                      "TYPE": 1,
                      "S_YM": "2022/01",
                      "E_YM": "2022/02",
                      "EMP_ID": "37137"
                    }
                  },
                  "案例2": {
                    "value": {
                      "CO_ID": 13,
                      "TYPE": 1,
                      "S_YM": "2022/01",
                      "E_YM": "2022/02",
                      "LIMIT": 10
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [emp_salary_detail, emp_salary_detail, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/pb/salary_item/currency": {
        "post": {
          "tags": [
            "PB"
          ],
          "summary": "取得加扣項幣別",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\ncurrency = {\n  \"CO_ID\": number,                //公司_ID\n  \"CURRENCY_CODE\": string,        //幣別代碼\n  \"CURRENCY_NAME\": string,        //幣別名稱\n  \"CURRENCY_NAME_JSON\": boject,   //幣別名稱_JSON\n  \"SORT_ORDER\": number,\t\t\t\t\t  //排序\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 13
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200, \n  data: [CURRENCY_CODE, CURRENCY_NAME, ...]\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/pb/salary_item/list": {
        "post": {
          "tags": [
            "PB"
          ],
          "summary": "取得加扣項薪資科目",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nsalary_item = {\n  \"SALARY_ITEM_ID\": number,   //薪資科目_ID\n  \"CO_ID\": number,            //公司_ID\n  \"ITEM_CODE\":string,         //薪資科目代號\n  \"ITEM_NAME\":string,         //薪資科目名稱\n  \"ITEM_NAME_JSON\":boject,    //薪資科目名稱_JSON\n  \"SORT_ORDER\": number,       //排序\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 13
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [salary_item, salary_item, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/pb/salary_item/check": {
        "post": {
          "tags": [
            "PB"
          ],
          "summary": "加扣項檢查",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\ncheckSalary_item = {\n  \"Code\": number,        //訊息代號\n  \"Description\": string,   //訊息內容\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID",
                    "SALARY_ITEM_ID",
                    "S_DATE",
                    "E_DATE",
                    "IS_NO_END",
                    "INCDEC_AMOUNT",
                    "CURRENCY"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "SALARY_ITEM_ID": {
                      "type": "integer",
                      "description": "薪資科目檔_ID"
                    },
                    "S_DATE": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "加扣日期區間起"
                    },
                    "E_DATE": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "加扣日期區間迄"
                    },
                    "IS_NO_END": {
                      "type": "integer",
                      "description": "是否無截止日(1:是、0:否)"
                    },
                    "INCDEC_AMOUNT": {
                      "type": "number",
                      "description": "加扣金額(依據幣別允許小數點不同)"
                    },
                    "CURRENCY": {
                      "type": "string",
                      "description": "幣別代碼"
                    },
                    "NOTE": {
                      "type": "string",
                      "description": "備註"
                    }
                  }
                },
                "example": {
                  "CO_ID": 9,
                  "EMP_ID": 125424,
                  "SALARY_ITEM_ID": 822,
                  "S_DATE": "2023-06-01",
                  "E_DATE": "2023-06-01",
                  "IS_NO_END": 0,
                  "INCDEC_AMOUNT": 5000,
                  "CURRENCY": "TWD",
                  "NOTE": ""
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: {salary_item},\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "失敗\n```\n{\n  code: 490,\n  msg: string,   // 失敗原因\n}\n```\n"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/pb/salary_item/insert": {
        "post": {
          "tags": [
            "PB"
          ],
          "summary": "加扣項寫入",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\ninsertSalary_item = {\n   \"INCDEC_EMP_ID\": number,         //寫入成功的加扣項主檔ID\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID",
                    "SALARY_ITEM_ID",
                    "S_DATE",
                    "E_DATE",
                    "IS_NO_END",
                    "INCDEC_AMOUNT",
                    "CURRENCY"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "SALARY_ITEM_ID": {
                      "type": "integer",
                      "description": "薪資科目檔_ID"
                    },
                    "S_DATE": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "加扣日期區間起"
                    },
                    "E_DATE": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "加扣日期區間迄"
                    },
                    "IS_NO_END": {
                      "type": "integer",
                      "description": "是否無截止日(1:是、0:否)"
                    },
                    "INCDEC_AMOUNT": {
                      "type": "number",
                      "description": "加扣金額(依據幣別允許小數點不同)"
                    },
                    "CURRENCY": {
                      "type": "string",
                      "description": "幣別代碼"
                    },
                    "NOTE": {
                      "type": "string",
                      "description": "備註"
                    }
                  }
                },
                "example": {
                  "CO_ID": 1,
                  "EMP_ID": 31513,
                  "SALARY_ITEM_ID": 13752,
                  "S_DATE": "2023-06-01",
                  "E_DATE": "2023-06-01",
                  "IS_NO_END": 0,
                  "INCDEC_AMOUNT": 5000,
                  "CURRENCY": "TWD",
                  "NOTE": "堃堃"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: {insertSalary_item},\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "失敗\n```\n{\n  code: 490,\n  msg: string,   // 失敗原因\n}\n```\n"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/sso/aad/redirect_url": {
        "post": {
          "tags": [
            "SSO"
          ],
          "summary": "取得SSO導向URL",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\n取得SSO導向URL\n參數:\nPAGE: 導向頁面，未填寫或是空值則導向首頁\nCO_CODE: 公司代碼(必填)\nLOCALE: 語系(zh_TW / en_US / zh_CN)，未填寫則預設為zh_TW\n\n```\n```\nsso = {\n  \"REDIRECT_URL\": string,            //SSO導向_URL\n},\n```     \n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "PAGE": {
                      "type": "string",
                      "description": "導向頁面"
                    },
                    "CO_CODE": {
                      "type": "string",
                      "description": "公司代碼"
                    },
                    "LOCALE": {
                      "type": "string",
                      "description": "語系"
                    }
                  }
                },
                "example": {
                  "PAGE": "m410040",
                  "CO_CODE": "66345069",
                  "LOCALE": "en_US"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功 `{ code: 200, data: { sso } }`"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "查無公司 `{ code: 490, msg?: string }`"
            },
            "491": {
              "description": "該公司未設定AAD參數 `{ code: 491, msg?: string }`"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/sso/verifyToken": {
        "post": {
          "tags": [
            "SSO"
          ],
          "summary": "驗證SSO Token",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nemp = {\n  \"CO_CODE\": string,             //公司代碼\n  \"EMP_NO\": string,              //員工編號\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "token"
                  ],
                  "properties": {
                    "token": {
                      "type": "string",
                      "description": "104 Token"
                    }
                  }
                },
                "examples": {
                  "案例1": {
                    "value": {
                      "token": "$token"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: emp,\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "無效token(format error) `{ code: 490, msg?: string }`"
            },
            "491": {
              "description": "無效token(expired) `{ code: 491, msg?: string }`"
            },
            "492": {
              "description": "無效token(缺少pid) `{ code: 492, msg?: string }`"
            },
            "493": {
              "description": "無效token(aud不符合) `{ code: 493, msg?: string }`"
            },
            "494": {
              "description": "無此員工資訊 `{ code: 494, msg?: string }`"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/sys/code": {
        "post": {
          "tags": [
            "SYS"
          ],
          "summary": "代碼資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nsysCode = {\n  \"CODE_TYPE\": string,        //代碼類型\n  \"CODE_CODE\": string,        //名稱\n  \"CODE_NAME\": string,        //名稱\n  \"cODE_NAME_JSON\": boject,   //名稱_JSON\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CODE_TYPE"
                  ],
                  "properties": {
                    "CODE_TYPE": {
                      "type": "string",
                      "description": "代碼類型"
                    }
                  }
                },
                "example": {
                  "CODE_TYPE": "global.boolean,global.usedStatus"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200, \n  data: [sysCode, sysCode, ...]\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/getAgentSign": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "取得某員工簽核代理人資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nagentSignItem = {\n  \"AGENT_SIGN_ID\": number,          //簽核代理人設定_ID\n  \"CO_ID\": number,                  //公司_ID\n  \"EMP_ID\": number,                 //員工_ID\n  \"EMP_NO\": string,                 //員工編號\n  \"AGENT_SIGN_EMP_ID\": number,      //代理人員工_ID\n  \"AGENT_SIGN_EMP_NO\": string,      //代理人員工編號\n  \"AGENT_SIGN_EMP_NAME\": string,    //代理人姓名\n  \"AGENT_STIME\": date,              //代理起始時間\n  \"AGENT_ETIME\": date,              //代理迄止時間\n  \"FORM_CODE\": string,              //簽核表單代號\n  \"FORMSET_NAME\": string,           //公司表單名稱\n  \"IS_ACT\": number,                 //使用狀態        \n  \"E_EMP_ID\": number,               //修改_員工_ID                  \n  \"E_EMP_NO\": string,               //修改_員工編號   \n  \"E_DATETIME\": date,               //修改_日期  \n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "LIMIT": {
                      "type": "integer",
                      "description": "筆數限制"
                    }
                  }
                },
                "examples": {
                  "案例1": {
                    "value": {
                      "CO_ID": 13,
                      "EMP_ID": "33770"
                    }
                  },
                  "案例2": {
                    "value": {
                      "CO_ID": 13,
                      "LIMIT": 10
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [agentSignItem, agentSignItem, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/getBatchAgents": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "批次取得員工職務代理人清單",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nagents = {\n  \"EMP_ID\": number,       //員工_ID\n, \"AGENT_EMP_ID\": number, //代理人員工_ID\n, \"CO_ID\": number,        //代理人公司_ID\n, \"EMP_NO\": string,       //代理人員工編號\n, \"EMP_NAME\": string,     //代理人員工姓名\n, \"EMP_EN_NAME\": string,  //代理人英文姓名\n, \"DEPT1_ID\": number,     //代理人部門1_ID\n, \"DEPT1_CODE\": string,   //代理人部門1\n, \"DEPT1_NAME\": string,   //代理人部門1名稱\n, \"DEPT2_ID\": number,     //代理人部門2_ID\n, \"DEPT2_CODE\": string,   //代理人部門2\n, \"DEPT2_NAME\": string,   //代理人部門2名稱\n, \"DEPT3_ID\": number,     //代理人部門3_ID\n, \"DEPT3_CODE\": string,   //代理人部門3\n, \"DEPT3_NAME\": string,   //代理人部門3名稱\n, \"DEPT4_ID\": number,     //代理人部門4_ID\n, \"DEPT4_CODE\": string,   //代理人部門4\n, \"DEPT4_NAME\": string,   //代理人部門4名稱\n, \"DEPT5_ID\": number,     //代理人部門5_ID\n, \"DEPT5_CODE\": string,   //代理人部門5\n, \"DEPT5_NAME\": string,   //代理人部門5名稱\n, \"JOB_ID\": number,       //代理人職位_ID\n, \"JOB_CODE\": string,     //代理人職位\n, \"JOB_NAME\": string,     //代理人職位名稱\n, \"WORK_STATUS\": number,  //代理人在職狀況\n, \"HIRE_DATE\":date,       //代理人到職日期\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "LIMIT": {
                      "type": "integer",
                      "description": "員工資料筆數限制"
                    },
                    "TOP": {
                      "type": "integer",
                      "description": "每個員工最多取幾筆代理人資料"
                    }
                  }
                },
                "examples": {
                  "案例1": {
                    "value": {
                      "CO_ID": 13,
                      "EMP_ID": "33770"
                    }
                  },
                  "案例2": {
                    "value": {
                      "CO_ID": 13,
                      "LIMIT": 10
                    }
                  },
                  "案例3": {
                    "value": {
                      "CO_ID": 13,
                      "LIMIT": 10,
                      "TOP": 3
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [agents, agents, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf010/leaveitems": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "取得某員工適用假勤項目資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nleaveitems = {\n  \"LEAVEITEM_ID\":number,        //假勤項目_ID\n  \"CO_ID\": number,              //公司_ID\n  \"LEAVEITEM_CODE\":string,      //假勤項目代碼\n  \"LEAVEITEM_NAME\":string,      //假勤項目名稱\n  \"LEAVEITEM_NAME_JSON\":boject, //假勤項目名稱_JSON\n  \"LEAVEITEM_DESC\":string,      //假勤項目說明\n  \"LEAVEITEM_DESC_JSON\":boject, //假勤項目說明_JSON\n  \"SPECIFIC_CODE\":string,       //特定代碼\n  \"PERIOD_TYPE\":string,         //計算期間(種類)\n  \"UNIT\":string,                //假勤單位\n  \"UNIT_VALUE\":number,          //假勤單位(數值)\n  \"BASE004\":number,             //職務代理人必填\n  \"BASE005\":number,             //請假原因必填\n  \"BASE006\":number,             //附件必填\n  \"BASE012\":number,             //假勤說明顯示\n  \"SORT_ORDER\":number,          //排序\n  \"IS_ACT\":number,              //使用狀態\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 13,
                  "EMP_ID": 41669
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [leaveitems, leaveitems, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf010/leaveEvent": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "取得某員工某假勤項目事件發生日資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nleaveEvent = {\n  \"EMP_LEAVE_EVENT_ID\":number, //事件發生日_ID\n  \"CO_ID\":number,              //公司_ID\n  \"EMP_ID\":number,             //員工_ID\n  \"LEAVEITEM_ID\":number,       //假勤項目_ID\n  \"EVENT_DATE\":date,            //事件發生日\n  \"EVENT_DESC\":string,          //事件發生日說明\n  \"ALLOW_SDATE\":date,           //可休期間起\n  \"ALLOW_EDATE\":date,           //可休期間迄\n  \"EVENT_FULL_DESC\":string,     //事件發生日組合說明\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "LEAVEITEM_ID",
                    "EMP_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "LEAVEITEM_ID": {
                      "type": "integer",
                      "description": "假勤項目ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "LEAVE_START": {
                      "type": "date",
                      "description": "請假起始日期"
                    },
                    "EMP_LEAVE_ID": {
                      "type": "integer",
                      "description": "員工請假主檔ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 13,
                  "LEAVEITEM_ID": 571,
                  "EMP_ID": 33557,
                  "LEAVE_START": "2023/09/05"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [leaveEvent, leaveEvent, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf010/leaveTime": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "得到請假時數計算資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nleaveTime = {\n  \"CO_ID\":number,        //公司_ID\n  \"EMP_ID\":number,       //員工_ID\n  \"LEAVEITEM_ID\":number, //假勤項目_ID\n  \"LEAVE_START\":date,     //請假起始時間\n  \"LEAVE_END\":date,       //請假結束時間\n  \"LEAVE_VALUE\":number,  //合計扣假請假數\n  \"LEAVE_MINS\":number,   //合計扣假請假分鐘數\n  \"DED_VALUE\":number,    //合計扣除分鐘數\n  \"UNIT\":string,          //請假當時假勤單位\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID",
                    "LEAVEITEM_ID",
                    "LEAVE_START",
                    "LEAVE_END"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "LEAVEITEM_ID": {
                      "type": "integer",
                      "description": "假勤項目ID"
                    },
                    "LEAVE_START": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "請假起始時間"
                    },
                    "LEAVE_END": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "請假結束時間"
                    }
                  }
                },
                "example": {
                  "CO_ID": 13,
                  "EMP_ID": 34461,
                  "LEAVEITEM_ID": 570,
                  "LEAVE_START": "2022/01/01 10:00",
                  "LEAVE_END": "2022/01/31 18:00"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [leaveTime, leaveTime, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf010/getUsed": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "員工假勤剩餘時數資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\ngetUsed = {\n  \"EMP_ID\":number,//員工_ID\n  \"LEAVEITEM_ID\":number,//假勤項目_ID\n  \"UNIT\":string,//假勤單位\n  \"LEAVE_VALUE\":number,//可休\n  \"USE_VALUE\":number,//已休\n  \"REMAIN_VALUE\":number,//剩餘(不含在途)\n  \"ONWAY_REMAIN_VALUE\":number,//剩餘(含在途)\n  \"LIMIT_TIMES\":number,//可休次數\n  \"USE_TIMES\":number,//已休次數\n  \"REMAIN_TIMES\":number,//剩餘次數(不含在途)\n  \"ONWAY_REMAIN_TIMES\":number,//剩餘次數(含在途)\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID",
                    "LEAVEITEM_ID",
                    "LEAVE_START",
                    "LEAVE_END",
                    "EMP_LEAVE_EVENT_ID",
                    "EVENT_DATE",
                    "EMP_LEAVE_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "LEAVEITEM_ID": {
                      "type": "integer",
                      "description": "假勤項目ID"
                    },
                    "LEAVE_START": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "請假起始時間"
                    },
                    "LEAVE_END": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "請假結束時間"
                    },
                    "EMP_LEAVE_EVENT_ID": {
                      "type": "integer",
                      "description": "事件發生日ID"
                    },
                    "EVENT_DATE": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "事件發生日"
                    },
                    "EMP_LEAVE_ID": {
                      "type": "integer",
                      "description": "請假主檔ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 9,
                  "EMP_ID": 43573,
                  "LEAVEITEM_ID": 443,
                  "LEAVE_START": "2022/08/23 09:00",
                  "LEAVE_END": "2022/08/23 18:00",
                  "EMP_LEAVE_EVENT_ID": 0,
                  "EVENT_DATE": "2022/08/22",
                  "EMP_LEAVE_ID": 0
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: {getUsed},\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "失敗\n```\n{\n  code: 490,\n  msg: string,   // 失敗原因\n}\n```\n"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf010/agents": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "取得員工職務代理人清單資訊",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nagents = {\n  \"EMP_ID\": number,       //員工_ID\n, \"AGENT_EMP_ID\": number, //代理人員工_ID\n, \"CO_ID\": number,        //代理人公司_ID\n, \"EMP_NO\": string,       //代理人員工編號\n, \"EMP_NAME\": string,     //代理人員工姓名\n, \"EMP_EN_NAME\": string,  //代理人英文姓名\n, \"DEPT1_ID\": number,     //代理人部門1_ID\n, \"DEPT1_CODE\": string,   //代理人部門1\n, \"DEPT1_NAME\": string,   //代理人部門1名稱\n, \"DEPT2_ID\": number,     //代理人部門2_ID\n, \"DEPT2_CODE\": string,   //代理人部門2\n, \"DEPT2_NAME\": string,   //代理人部門2名稱\n, \"DEPT3_ID\": number,     //代理人部門3_ID\n, \"DEPT3_CODE\": string,   //代理人部門3\n, \"DEPT3_NAME\": string,   //代理人部門3名稱\n, \"DEPT4_ID\": number,     //代理人部門4_ID\n, \"DEPT4_CODE\": string,   //代理人部門4\n, \"DEPT4_NAME\": string,   //代理人部門4名稱\n, \"DEPT5_ID\": number,     //代理人部門5_ID\n, \"DEPT5_CODE\": string,   //代理人部門5\n, \"DEPT5_NAME\": string,   //代理人部門5名稱\n, \"JOB_ID\": number,       //代理人職位_ID\n, \"JOB_CODE\": string,     //代理人職位\n, \"JOB_NAME\": string,     //代理人職位名稱\n, \"WORK_STATUS\": number,  //代理人在職狀況\n, \"HIRE_DATE\":date,       //代理人到職日期\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "LEAVE_START": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "請假起始時間"
                    },
                    "LEAVE_END": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "請假結束時間"
                    }
                  }
                },
                "examples": {
                  "案例1": {
                    "value": {
                      "CO_ID": 13,
                      "EMP_ID": 34461
                    }
                  },
                  "案例2": {
                    "value": {
                      "CO_ID": 13,
                      "EMP_ID": 34461,
                      "LEAVE_START": "2022/07/01 10:00",
                      "LEAVE_END": "2022/07/01 18:00"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [agents, agents, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf010/checkLeave": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "假勤檢查",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\ncheckLeave = {\n  \"LEAVE_VALUE\": number,        //假勤時數\n  \"LEAVE_VALUE_UNIT\": string,   //假勤時數單位\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID",
                    "LEAVEITEM_ID",
                    "LEAVE_START",
                    "LEAVE_END"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "LEAVEITEM_ID": {
                      "type": "integer",
                      "description": "假勤項目ID"
                    },
                    "LEAVE_START": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "請假起始時間"
                    },
                    "LEAVE_END": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "請假結束時間"
                    },
                    "EMP_LEAVE_EVENT_ID": {
                      "type": "integer",
                      "description": "事件發生日ID"
                    },
                    "EVENT_DATE": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "事件發生日"
                    },
                    "EVENT_DESC": {
                      "type": "string",
                      "description": "事件發生日說明"
                    },
                    "AGENT_IDS": {
                      "type": "string",
                      "description": "請假代理人_IDS"
                    },
                    "REASON": {
                      "type": "string",
                      "description": "請假原因"
                    },
                    "FILES": {
                      "type": "array",
                      "description": "附件"
                    },
                    "NOTE": {
                      "type": "string",
                      "description": "備註"
                    },
                    "EMP_LEAVE_ID": {
                      "type": "integer",
                      "description": "請假主檔id"
                    }
                  }
                },
                "example": {
                  "CO_ID": 1,
                  "EMP_ID": 31886,
                  "LEAVEITEM_ID": 28,
                  "LEAVE_START": "2022-08-24 08:00",
                  "LEAVE_END": "2022-08-24 17:00",
                  "EMP_LEAVE_EVENT_ID": 0,
                  "EVENT_DATE": "",
                  "EVENT_DESC": "",
                  "AGENT_IDS": "",
                  "REASON": "",
                  "FILES": [
                    {
                      "fileUUID": "8af4a96fe4cd36309632daae4ec3e38f",
                      "fileName": "API 功能畫面.docx",
                      "fileSize": 319795,
                      "fileMime": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                      "isTmp": 1
                    }
                  ],
                  "EMP_LEAVE_ID": 0
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: {checkLeave},\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "失敗\n```\n{\n  code: 490,\n  msg: string,   // 失敗原因\n}\n```\n"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf010/insertLeave": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "假勤寫入",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\ninsertLeave = {\n  \"EMP_LEAVE_ID\": number,         //寫入成功的假勤主檔ID\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID",
                    "LEAVEITEM_ID",
                    "LEAVE_START",
                    "LEAVE_END",
                    "WF_NO",
                    "WF_RESULT"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "LEAVEITEM_ID": {
                      "type": "integer",
                      "description": "假勤項目ID"
                    },
                    "LEAVE_START": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "請假起始時間"
                    },
                    "LEAVE_END": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "請假結束時間"
                    },
                    "EMP_LEAVE_EVENT_ID": {
                      "type": "integer",
                      "description": "事件發生日ID"
                    },
                    "EVENT_DATE": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "事件發生日"
                    },
                    "EVENT_DESC": {
                      "type": "string",
                      "description": "事件發生日說明"
                    },
                    "AGENT_IDS": {
                      "type": "string",
                      "description": "請假代理人_IDS"
                    },
                    "REASON": {
                      "type": "string",
                      "description": "請假原因"
                    },
                    "FILES": {
                      "type": "array",
                      "description": "附件"
                    },
                    "NOTE": {
                      "type": "string",
                      "description": "備註"
                    },
                    "EMP_LEAVE_ID": {
                      "type": "integer",
                      "description": "請假主檔id"
                    },
                    "WF_NO": {
                      "type": "string",
                      "description": "WORKFLOW 表單編號"
                    },
                    "WF_RESULT": {
                      "type": "integer",
                      "description": "表單狀態"
                    }
                  }
                },
                "example": {
                  "CO_ID": 1,
                  "EMP_ID": 31886,
                  "LEAVEITEM_ID": 28,
                  "LEAVE_START": "2022-08-24 08:00",
                  "LEAVE_END": "2022-08-24 17:00",
                  "EMP_LEAVE_EVENT_ID": 0,
                  "EVENT_DATE": "",
                  "EVENT_DESC": "",
                  "AGENT_IDS": "",
                  "REASON": "這是原因",
                  "FILES": [
                    {
                      "fileUUID": "f6a4f78f687e0ff62329d991b0cc8839",
                      "fileName": "API 功能畫面.docx",
                      "fileSize": 319795,
                      "fileMime": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                      "isTmp": 1
                    }
                  ],
                  "NOTE": "這是備註",
                  "EMP_LEAVE_ID": 0,
                  "WF_NO": "API11223344",
                  "WF_RESULT": 1
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: {insertLeave},\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "失敗\n```\n{\n  code: 490,\n  msg: string,   // 失敗原因\n}\n```\n"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf010/deleteLeaveList": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "假勤刪除列表",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\ndeleteLeaveList = {\n  \"CO_ID\": number,         //公司_ID\n  \"EMP_ID\": number,        //員工_ID\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 1,
                  "EMP_ID": 31886
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: {deleteLeaveList},\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf010/checkDeleteLeave": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "假勤刪除檢查",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\ncheckDeleteLeave = {\n  \"RETURN_CODE\": number,  //回傳訊息代號\n  \"RETURN_MSG\": string,   //回傳訊息\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID",
                    "EMP_LEAVE_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "EMP_LEAVE_ID": {
                      "type": "integer",
                      "description": "請假主檔ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 13,
                  "EMP_ID": 34461,
                  "EMP_LEAVE_ID": 17177
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [checkDeleteLeave, checkDeleteLeave, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "失敗\n```\n{\n  code: 490,\n  msg: string,   // 失敗原因\n}\n```\n"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf010/deleteLeave": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "假勤刪除",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\ndeleteLeave = {\n  \"RETURN_CODE\": number,  //回傳訊息代號\n  \"RETURN_MSG\": string,   //回傳訊息\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID",
                    "EMP_LEAVE_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "EMP_LEAVE_ID": {
                      "type": "integer",
                      "description": "請假主檔ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 1,
                  "EMP_ID": 31885,
                  "EMP_LEAVE_ID": 2322
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [deleteLeave, deleteLeave, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "失敗\n```\n{\n  code: 490,\n  msg: string,   // 失敗原因\n}\n```\n"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf010/getRemainLeave": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "取得員工年度剩餘假勤列表",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nRemain = {\n  \"EMP_ID\": number,         //員工_ID\n  \"LEAVE_KIND\": string,     //假勤類型\n  \"LEAVEITEM_ID\": number,  //假勤項目_ID\n  \"EMP_LEAVE_EVENT_ID\"?: number | null,//事件發生日_ID\n  \"LEAVEITEM_NAME\": string, //假勤名稱\n  \"LEAVE_START\": date,      //可休期間起\n  \"LEAVE_END\": date,        //可休期間迄\n  \"LEAVE_RULE\": string,     //可休規則\n  \"LEAVE_USED\": string,     //已休(不包含在途)\n  \"LEAVE_USED_PLUS_ONWAY\": string, //已休(包含在途)\n  \"LEAVE_REMAIN\": string,   //剩餘(不包含在途)\n  \"LEAVE_ONWAY\": string,    //簽核中\n  \"LEAVE_REST\": string,     //基準日可申請(包含在途)\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID",
                    "LEAVE_YEAR"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "LEAVE_YEAR": {
                      "type": "integer",
                      "description": "年度"
                    },
                    "BASE_DATE": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "基準日"
                    }
                  }
                },
                "example": {
                  "CO_ID": 9,
                  "EMP_ID": 43573,
                  "LEAVE_YEAR": 2023
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功`{ code: 200, data: [Remain, ...] }`"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "沒有符合查詢條件的資料，請放寬條件重新查詢\n```\n{\n  code: 490,\n  msg: string,   // 失敗原因\n}\n```\n"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf011/batchLeaveNew": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "批次請假單新增",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "requestBody": {
            "require": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "SESSION_KEY",
                    "LEAVE_DATA",
                    "WF_NO"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "number",
                      "description": "公司_ID"
                    },
                    "SESSION_KEY": {
                      "type": "string",
                      "description": "執行階段的KEY"
                    },
                    "LEAVE_DATA": {
                      "type": "array",
                      "description": "員工請假資料",
                      "item": {
                        "type": "object",
                        "properties": {
                          "EMP_ID": {
                            "type": "number"
                          },
                          "LEAVEITEM_ID": {
                            "type": "number"
                          },
                          "LEAVE_START": {
                            "type": "datetime"
                          },
                          "LEAVE_END": {
                            "type": "datetime"
                          },
                          "AGENT_IDS": {
                            "type": "string"
                          },
                          "REASON": {
                            "type": "string"
                          }
                        }
                      }
                    },
                    "FILES": {
                      "type": "array",
                      "description": "附件",
                      "items": {
                        "type": "object",
                        "properties": {
                          "fileUUID": {
                            "type": "string",
                            "description": "file uuid"
                          },
                          "fileName": {
                            "type": "string",
                            "description": "file name"
                          },
                          "fileSize": {
                            "type": "number",
                            "description": "file size"
                          },
                          "fileMime": {
                            "type": "string",
                            "description": "file mime"
                          },
                          "isTmp": {
                            "type": "number",
                            "description": "是否暫存"
                          }
                        }
                      }
                    },
                    "WF_NO": {
                      "type": "string",
                      "description": "WORKFLOW 表單編號"
                    },
                    "IS_CHECK": {
                      "type": "integer",
                      "description": "是否單純檢查"
                    }
                  }
                },
                "example": "{\n  \"CO_ID\": 9,\n  \"SESSION_KEY\": \"e61609d0-0e73-11ee-b46d-0050569652a6\",\n  \"LEAVE_DATA\": [\n    {\n      \"EMP_ID\": 125266,\n      \"LEAVEITEM_ID\": 401,\n      \"LEAVE_START\": \"2023/05/02 09:00\",\n      \"LEAVE_END\": \"2023/05/02 18:00\",\n      \"AGENT_IDS\": \"4,124455\",\n      \"REASON\": \"XXXXXXXXXXXXX\"\n    },\n    {\n      \"EMP_ID\": 124460,\n      \"LEAVEITEM_ID\": 401,\n      \"LEAVE_START\": \"2023/05/02 09:00\",\n      \"LEAVE_END\": \"2023/05/02 18:00\",\n      \"AGENT_IDS\": \"30363,125424\",\n      \"REASON\": \"YYYYYYYYYYYYY\"\n    }\n  ],\n  \"FILES\": [\n    {\n      \"fileUUID\": \"e3f5c661c08e29a901a61bd1efceecb2\",\n      \"fileName\": \"1.png\",\n      \"fileSize\": 74506,\n      \"fileMime\": \"image/png\",\n      \"isTmp\": 1\n    }\n  ],\n  \"WF_NO\": \"WF10123456789\"\n}\n"
              }
            }
          },
          "responses": {
            "200": {
              "description": "更新成功"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "SESSION_KEY 不可重複"
            },
            "491": {
              "description": "假勤檢查異常 `{ code: 491, msg?: string }`"
            },
            "492": {
              "description": "附件寫入錯誤"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf011/batchLeaveUpd": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "批次請假單修改",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "requestBody": {
            "require": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "SESSION_KEY",
                    "LEAVE_DATA",
                    "WF_NO"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "number",
                      "description": "公司_ID"
                    },
                    "SESSION_KEY": {
                      "type": "string",
                      "description": "執行階段的KEY"
                    },
                    "LEAVE_DATA": {
                      "type": "array",
                      "description": "員工請假資料",
                      "item": {
                        "type": "object",
                        "properties": {
                          "EMP_ID": {
                            "type": "number"
                          },
                          "LEAVEITEM_ID": {
                            "type": "number"
                          },
                          "LEAVE_START": {
                            "type": "datetime"
                          },
                          "LEAVE_END": {
                            "type": "datetime"
                          },
                          "AGENT_IDS": {
                            "type": "string"
                          },
                          "REASON": {
                            "type": "string"
                          }
                        }
                      }
                    },
                    "FILES": {
                      "type": "array",
                      "description": "附件",
                      "items": {
                        "type": "object",
                        "properties": {
                          "fileUUID": {
                            "type": "string",
                            "description": "file uuid"
                          },
                          "fileName": {
                            "type": "string",
                            "description": "file name"
                          },
                          "fileSize": {
                            "type": "number",
                            "description": "file size"
                          },
                          "fileMime": {
                            "type": "string",
                            "description": "file mime"
                          },
                          "isTmp": {
                            "type": "number",
                            "description": "是否暫存"
                          }
                        }
                      }
                    },
                    "WF_NO": {
                      "type": "string",
                      "description": "WORKFLOW 表單編號"
                    }
                  }
                },
                "example": "{\n  \"CO_ID\": 9,\n  \"SESSION_KEY\": \"e61609d0-0e73-11ee-b46d-0050569652a6\",\n  \"LEAVE_DATA\": [\n    {\n      \"EMP_ID\": 125266,\n      \"LEAVEITEM_ID\": 401,\n      \"LEAVE_START\": \"2023/05/02 09:00\",\n      \"LEAVE_END\": \"2023/05/02 18:00\",\n      \"AGENT_IDS\": \"4,124455\",\n      \"REASON\": \"XXXXXXXXXXXXX\"\n    },\n    {\n      \"EMP_ID\": 124460,\n      \"LEAVEITEM_ID\": 401,\n      \"LEAVE_START\": \"2023/05/02 09:00\",\n      \"LEAVE_END\": \"2023/05/02 18:00\",\n      \"AGENT_IDS\": \"30363,125424\",\n      \"REASON\": \"YYYYYYYYYYYYY\"\n    }\n  ],\n  \"FILES\": [\n    {\n      \"fileUUID\": \"e3f5c661c08e29a901a61bd1efceecb2\",\n      \"fileName\": \"1.png\",\n      \"fileSize\": 74506,\n      \"fileMime\": \"image/png\",\n      \"isTmp\": 1\n    }\n  ],\n  \"WF_NO\": \"WF10123456789\"\n}\n"
              }
            }
          },
          "responses": {
            "200": {
              "description": "更新成功"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "假勤檢查異常 `{ code: 490, msg?: string }`"
            },
            "491": {
              "description": "附件寫入錯誤"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf011/batchLeaveSign": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "批次請假單簽核完成",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "requestBody": {
            "require": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "SESSION_KEY",
                    "WF_NO"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "number",
                      "description": "公司_ID"
                    },
                    "SESSION_KEY": {
                      "type": "string",
                      "description": "執行階段的KEY"
                    },
                    "WF_NO": {
                      "type": "string",
                      "description": "WORKFLOW 表單編號"
                    }
                  }
                },
                "example": "{\n  \"CO_ID\": 9,\n  \"SESSION_KEY\": \"e61609d0-0e73-11ee-b46d-0050569652a6\",\n  \"WF_NO\": \"WF10123456789\"\n}\n"
              }
            }
          },
          "responses": {
            "200": {
              "description": "更新成功"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "假勤檢查異常 `{ code: 490, msg?: string }`"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf011/batchLeaveDelete": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "批次請假單刪除",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "requestBody": {
            "require": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "SESSION_KEY",
                    "WF_NO"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "number",
                      "description": "公司_ID"
                    },
                    "SESSION_KEY": {
                      "type": "string",
                      "description": "執行階段的KEY"
                    },
                    "WF_NO": {
                      "type": "string",
                      "description": "WORKFLOW 表單編號"
                    }
                  }
                },
                "example": "{\n  \"CO_ID\": 9,\n  \"SESSION_KEY\": \"e61609d0-0e73-11ee-b46d-0050569652a6\",\n  \"WF_NO\": \"WF10123456789\"\n}\n"
              }
            }
          },
          "responses": {
            "200": {
              "description": "更新成功"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "批次請假單刪除失敗"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf011/batchLeaveitems": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "取得某員工適用假勤項目(排除事件發生日)",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nleaveitems = {\n  \"LEAVEITEM_ID\":number,        //假勤項目_ID\n  \"CO_ID\": number,              //公司_ID\n  \"LEAVEITEM_CODE\":string,      //假勤項目代碼\n  \"LEAVEITEM_NAME\":string,      //假勤項目名稱\n  \"LEAVEITEM_NAME_JSON\":boject, //假勤項目名稱_JSON\n  \"LEAVEITEM_DESC\":string,      //假勤項目說明\n  \"LEAVEITEM_DESC_JSON\":boject, //假勤項目說明_JSON\n  \"SPECIFIC_CODE\":string,       //特定代碼\n  \"PERIOD_TYPE\":string,         //計算期間(種類)\n  \"UNIT\":string,                //假勤單位\n  \"UNIT_VALUE\":number,          //假勤單位(數值)\n  \"BASE004\":number,             //職務代理人必填\n  \"BASE005\":number,             //請假原因必填\n  \"BASE006\":number,             //附件必填\n  \"BASE012\":number,             //假勤說明顯示\n  \"SORT_ORDER\":number,          //排序\n  \"IS_ACT\":number,              //使用狀態\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 13,
                  "EMP_ID": 41669
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [leaveitems, leaveitems, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf020/checkOt": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "加班檢查",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\ncheckOt = {\n  \"OT_VALUE\": number,        //加班時數\n  \"OT_VALUE_UNIT\": string,   //加班時數單位\n  \"OT_MINS\": integer,        //加班分鐘數\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID",
                    "OT_SDATE",
                    "OT_EDATE"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "OT_SDATE": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "加班起始時間"
                    },
                    "OT_EDATE": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "加班結束時間"
                    },
                    "PAY_TYPE": {
                      "type": "string",
                      "description": "加班支領方式"
                    },
                    "REASON": {
                      "type": "string",
                      "description": "加班原因"
                    },
                    "FILES": {
                      "type": "array",
                      "description": "附件"
                    },
                    "NOTE": {
                      "type": "string",
                      "description": "備註"
                    },
                    "EMP_OT_ID": {
                      "type": "integer",
                      "description": "加班主檔id"
                    },
                    "EMP_PREOT_ID": {
                      "type": "integer",
                      "description": "預先加班主檔id"
                    }
                  }
                },
                "example": {
                  "CO_ID": 1,
                  "EMP_ID": 31886,
                  "OT_SDATE": "2022-08-24 08:00",
                  "OT_EDATE": "2022-08-24 17:00",
                  "PAY_TYPE": "3",
                  "REASON": "",
                  "FILES": [
                    {
                      "fileUUID": "8af4a96fe4cd36309632daae4ec3e38f",
                      "fileName": "API 功能畫面.docx",
                      "fileSize": 319795,
                      "fileMime": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                      "isTmp": 1
                    }
                  ],
                  "EMP_OT_ID": 0,
                  "EMP_PREOT_ID": 0
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: {checkOt},\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "失敗\n```\n{\n  code: 490,\n  msg: string,   // 失敗原因\n}\n```\n"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf020/insertOt": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "加班寫入",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\ninsertOt = {\n  \"EMP_OT_ID\": number,         //寫入成功的加班主檔ID\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID",
                    "OT_SDATE",
                    "OT_EDATE",
                    "WF_NO",
                    "WF_RESULT"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "OT_SDATE": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "加班起始時間"
                    },
                    "OT_EDATE": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "加班結束時間"
                    },
                    "PAY_TYPE": {
                      "type": "string",
                      "description": "加班支領方式"
                    },
                    "REASON": {
                      "type": "string",
                      "description": "加班原因"
                    },
                    "FILES": {
                      "type": "array",
                      "description": "附件"
                    },
                    "NOTE": {
                      "type": "string",
                      "description": "備註"
                    },
                    "EMP_OT_ID": {
                      "type": "integer",
                      "description": "加班主檔id"
                    },
                    "WF_NO": {
                      "type": "string",
                      "description": "WORKFLOW 表單編號"
                    },
                    "WF_RESULT": {
                      "type": "integer",
                      "description": "表單狀態"
                    },
                    "EMP_PREOT_ID": {
                      "type": "integer",
                      "description": "預先加班主檔id"
                    }
                  }
                },
                "example": {
                  "CO_ID": 1,
                  "EMP_ID": 31886,
                  "OT_SDATE": "2022-08-24 08:00",
                  "OT_EDATE": "2022-08-24 17:00",
                  "PAY_TYPE": "2",
                  "REASON": "這是原因",
                  "FILES": [
                    {
                      "fileUUID": "f6a4f78f687e0ff62329d991b0cc8839",
                      "fileName": "API 功能畫面.docx",
                      "fileSize": 319795,
                      "fileMime": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                      "isTmp": 1
                    }
                  ],
                  "NOTE": "這是備註",
                  "EMP_OT_ID": 0,
                  "WF_NO": "API11223344",
                  "WF_RESULT": 1,
                  "EMP_PREOT_ID": 0
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: {insertOt},\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "失敗\n```\n{\n  code: 490,\n  msg: string,   // 失敗原因\n}\n```\n"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf020/deleteOtList": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "加班刪除列表",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\ndeleteOtList = {\n  \"CO_ID\": number,         //公司_ID\n  \"EMP_ID\": number,        //員工_ID\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 1,
                  "EMP_ID": 41884
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: {deleteOtList},\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf020/checkDeleteOt": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "加班刪除檢查",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\ncheckDeleteOt = {\n  \"RETURN_CODE\": number,  //回傳訊息代號\n  \"RETURN_MSG\": string,   //回傳訊息\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID",
                    "EMP_OT_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "EMP_OT_ID": {
                      "type": "integer",
                      "description": "加班主檔id"
                    }
                  }
                },
                "example": {
                  "CO_ID": 1,
                  "EMP_ID": 31886,
                  "EMP_OT_ID": 130555
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [checkDeleteOt, checkDeleteOt, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "失敗\n```\n{\n  code: 490,\n  msg: string,   // 失敗原因\n}\n```\n"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf020/deleteOt": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "加班刪除",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\ndeleteOt = {\n  \"RETURN_CODE\": number,  //回傳訊息代號\n  \"RETURN_MSG\": string,   //回傳訊息\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID",
                    "EMP_OT_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "EMP_OT_ID": {
                      "type": "integer",
                      "description": "加班主檔id"
                    }
                  }
                },
                "example": {
                  "CO_ID": 1,
                  "EMP_ID": 31886,
                  "EMP_OT_ID": 130545
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [deleteOt, deleteOt, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "失敗\n```\n{\n  code: 490,\n  msg: string,   // 失敗原因\n}\n```\n"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf020/otTime": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "取得剩餘加班時數",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\notTime = {\n  \"OT_VALUE\": number,        //加班時數\n  \"OT_VALUE_UNIT\": string,   //加班時數單位\n  \"OT_MINS\": integer,        //加班分鐘數\n  \"OT_REASON\": number,       //加班原因是否必填\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID",
                    "OT_SDATE",
                    "OT_EDATE"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "OT_SDATE": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "加班起始時間"
                    },
                    "OT_EDATE": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "加班結束時間"
                    }
                  }
                },
                "example": {
                  "CO_ID": 1,
                  "EMP_ID": 31886,
                  "OT_SDATE": "2022-08-24 08:00",
                  "OT_EDATE": "2022-08-24 17:00"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: {otTime},\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "失敗\n```\n{\n  code: 490,\n  msg: string,   // 失敗原因\n}\n```\n"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf021/batchOtNew": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "批次加班單新增",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "requestBody": {
            "require": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "SESSION_KEY",
                    "OT_DATA",
                    "WF_NO"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "number",
                      "description": "公司_ID"
                    },
                    "SESSION_KEY": {
                      "type": "string",
                      "description": "執行階段的KEY"
                    },
                    "OT_DATA": {
                      "type": "array",
                      "description": "員工加班資料",
                      "item": {
                        "type": "object",
                        "properties": {
                          "EMP_ID": {
                            "type": "number"
                          },
                          "OT_START": {
                            "type": "datetime"
                          },
                          "OT_END": {
                            "type": "datetime"
                          },
                          "PAY_TYPE": {
                            "type": "number"
                          },
                          "IS_MEAL": {
                            "type": "number"
                          },
                          "IS_CARDMATCH": {
                            "type": "number"
                          },
                          "REASON": {
                            "type": "string"
                          }
                        }
                      }
                    },
                    "FILES": {
                      "type": "array",
                      "description": "附件",
                      "items": {
                        "type": "object",
                        "properties": {
                          "fileUUID": {
                            "type": "string",
                            "description": "file uuid"
                          },
                          "fileName": {
                            "type": "string",
                            "description": "file name"
                          },
                          "fileSize": {
                            "type": "number",
                            "description": "file size"
                          },
                          "fileMime": {
                            "type": "string",
                            "description": "file mime"
                          },
                          "isTmp": {
                            "type": "number",
                            "description": "是否暫存"
                          }
                        }
                      }
                    },
                    "WF_NO": {
                      "type": "string",
                      "description": "WORKFLOW 表單編號"
                    }
                  }
                },
                "example": "{\n  \"CO_ID\": 9,\n  \"SESSION_KEY\": \"e61609d0-0e73-11ee-b46d-0050569652a6\",\n  \"OT_DATA\": [\n    {\n      \"EMP_ID\": 124156,\n      \"OT_START\": \"2023/07/01 18:00\",\n      \"OT_END\": \"2023/07/01 20:00\",\n      \"PAY_TYPE\": \"2\",\n      \"IS_MEAL\": \"0\",\n      \"IS_CARDMATCH\": \"0\",\n      \"REASON\": \"XXXXXXXXXXXXX\"\n    },\n    {\n      \"EMP_ID\": 15078,\n      \"OT_START\": \"2023/07/01 18:00\",\n      \"OT_END\": \"2023/07/01 20:00\",\n      \"PAY_TYPE\": \"2\",\n      \"IS_MEAL\": \"0\",\n      \"IS_CARDMATCH\": \"0\",\n      \"REASON\": \"YYYYYYYYYYYYY\"\n    }\n  ],\n  \"FILES\": [\n    {\n      \"fileUUID\": \"e3f5c661c08e29a901a61bd1efceecb2\",\n      \"fileName\": \"1.png\",\n      \"fileSize\": 74506,\n      \"fileMime\": \"image/png\",\n      \"isTmp\": 1\n    }\n  ],\n  \"WF_NO\": \"WF10123456789\"\n}\n"
              }
            }
          },
          "responses": {
            "200": {
              "description": "更新成功"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "SESSION_KEY 不可重複"
            },
            "491": {
              "description": "加班檢查異常 `{ code: 491, msg?: string }`"
            },
            "492": {
              "description": "附件寫入錯誤"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf021/batchOtUpd": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "批次加班單修改",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "requestBody": {
            "require": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "SESSION_KEY",
                    "OT_DATA",
                    "WF_NO"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "number",
                      "description": "公司_ID"
                    },
                    "SESSION_KEY": {
                      "type": "string",
                      "description": "執行階段的KEY"
                    },
                    "OT_DATA": {
                      "type": "array",
                      "description": "員工加班資料",
                      "item": {
                        "type": "object",
                        "properties": {
                          "EMP_ID": {
                            "type": "number"
                          },
                          "OT_START": {
                            "type": "datetime"
                          },
                          "OT_END": {
                            "type": "datetime"
                          },
                          "PAY_TYPE": {
                            "type": "number"
                          },
                          "IS_MEAL": {
                            "type": "number"
                          },
                          "IS_CARDMATCH": {
                            "type": "number"
                          },
                          "REASON": {
                            "type": "string"
                          }
                        }
                      }
                    },
                    "FILES": {
                      "type": "array",
                      "description": "附件",
                      "items": {
                        "type": "object",
                        "properties": {
                          "fileUUID": {
                            "type": "string",
                            "description": "file uuid"
                          },
                          "fileName": {
                            "type": "string",
                            "description": "file name"
                          },
                          "fileSize": {
                            "type": "number",
                            "description": "file size"
                          },
                          "fileMime": {
                            "type": "string",
                            "description": "file mime"
                          },
                          "isTmp": {
                            "type": "number",
                            "description": "是否暫存"
                          }
                        }
                      }
                    },
                    "WF_NO": {
                      "type": "string",
                      "description": "WORKFLOW 表單編號"
                    }
                  }
                },
                "example": "{\n  \"CO_ID\": 9,\n  \"SESSION_KEY\": \"e61609d0-0e73-11ee-b46d-0050569652a6\",\n  \"OT_DATA\": [\n    {\n      \"EMP_ID\": 124156,\n      \"OT_START\": \"2023/07/01 18:00\",\n      \"OT_END\": \"2023/07/01 20:00\",\n      \"PAY_TYPE\": \"2\",\n      \"IS_MEAL\": \"0\",\n      \"IS_CARDMATCH\": \"0\",\n      \"REASON\": \"XXXXXXXXXXXXX\"\n    },\n    {\n      \"EMP_ID\": 15078,\n      \"OT_START\": \"2023/07/01 18:00\",\n      \"OT_END\": \"2023/07/01 20:00\",\n      \"PAY_TYPE\": \"2\",\n      \"IS_MEAL\": \"0\",\n      \"IS_CARDMATCH\": \"0\",\n      \"REASON\": \"YYYYYYYYYYYYY\"\n    }\n  ],\n  \"FILES\": [\n    {\n      \"fileUUID\": \"e3f5c661c08e29a901a61bd1efceecb2\",\n      \"fileName\": \"1.png\",\n      \"fileSize\": 74506,\n      \"fileMime\": \"image/png\",\n      \"isTmp\": 1\n    }\n  ],\n  \"WF_NO\": \"WF10123456789\"\n}\n"
              }
            }
          },
          "responses": {
            "200": {
              "description": "更新成功"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "加班檢查異常 `{ code: 490, msg?: string }`"
            },
            "491": {
              "description": "附件寫入錯誤"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf021/batchOtSign": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "批次加班單簽核完成",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "requestBody": {
            "require": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "SESSION_KEY",
                    "WF_NO"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "number",
                      "description": "公司_ID"
                    },
                    "SESSION_KEY": {
                      "type": "string",
                      "description": "執行階段的KEY"
                    },
                    "WF_NO": {
                      "type": "string",
                      "description": "WORKFLOW 表單編號"
                    }
                  }
                },
                "example": "{\n  \"CO_ID\": 9,\n  \"SESSION_KEY\": \"e61609d0-0e73-11ee-b46d-0050569652a6\",\n  \"WF_NO\": \"WF10123456789\"\n}\n"
              }
            }
          },
          "responses": {
            "200": {
              "description": "更新成功"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "加班檢查異常 `{ code: 490, msg?: string }`"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf021/batchOtDelete": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "批次加班單刪除",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "requestBody": {
            "require": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "SESSION_KEY",
                    "WF_NO"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "number",
                      "description": "公司_ID"
                    },
                    "SESSION_KEY": {
                      "type": "string",
                      "description": "執行階段的KEY"
                    },
                    "WF_NO": {
                      "type": "string",
                      "description": "WORKFLOW 表單編號"
                    }
                  }
                },
                "example": "{\n  \"CO_ID\": 9,\n  \"SESSION_KEY\": \"e61609d0-0e73-11ee-b46d-0050569652a6\",\n  \"WF_NO\": \"WF10123456789\"\n}\n"
              }
            }
          },
          "responses": {
            "200": {
              "description": "更新成功"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "批次加班單刪除失敗"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf022/import_ot_hour": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "加班時數匯入",
          "description": "使用說明： 依 Max 加班時數-匯入格式產生 excel 後，打這個 API",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "requestBody": {
            "require": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "WORK_SDATE",
                    "WORK_EDATE",
                    "attachment"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "WORK_SDATE": {
                      "type": "string",
                      "description": "班表日期起"
                    },
                    "WORK_EDATE": {
                      "type": "string",
                      "description": "班表日期迄"
                    },
                    "attachment": {
                      "type": "string",
                      "format": "binary",
                      "description": "multipart request 的 field name 必須是 'attachment'"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: integer, msg?: string,\n  fails?: [\n    {\n      seq?: string,                    //序號\n      empNo: string,                   //員工編號\n      otDate: string,                  //加班歸屬日\n      unit: string,                    //加班折換單位\n      type?: string,                   //折換方式\n      otCoef?: string,                 //折換倍率\n      otValue?: string,                //折換時數\n      clStart?: string,                //補休假可休開始時間\n      clEnd?: string,                  //補休假可休結束時間\n      clCoef?: string,                 //折換補休假折現倍率\n      note?: string,                   //備註\n      error: string,                   //錯誤訊息\n    }, ...\n  ],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "450": {
              "description": "MulterError `{ code: 450, msg?: string }`"
            },
            "490": {
              "description": "無資料`{ code: integer, msg: string }`"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf022/checkPreOt": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "預先加班檢查",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\ncheckPreOt = {\n  \"OT_VALUE\": number,        //預先加班時數\n  \"OT_VALUE_UNIT\": string,   //預先加班時數單位\n  \"OT_MINS\": integer,        //預先加班分鐘數\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID",
                    "OT_SDATE",
                    "OT_EDATE"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "OT_SDATE": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "預先加班起始時間"
                    },
                    "OT_EDATE": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "預先加班結束時間"
                    },
                    "PAY_TYPE": {
                      "type": "string",
                      "description": "預先加班支領方式"
                    },
                    "REASON": {
                      "type": "string",
                      "description": "預先加班原因"
                    },
                    "FILES": {
                      "type": "array",
                      "description": "附件"
                    },
                    "NOTE": {
                      "type": "string",
                      "description": "備註"
                    },
                    "EMP_PREOT_ID": {
                      "type": "integer",
                      "description": "預先加班主檔id"
                    }
                  }
                },
                "example": {
                  "CO_ID": 1,
                  "EMP_ID": 31886,
                  "OT_SDATE": "2024-05-04 08:00",
                  "OT_EDATE": "2024-05-04 17:00",
                  "PAY_TYPE": "3",
                  "REASON": "",
                  "FILES": [
                    {
                      "fileUUID": "8af4a96fe4cd36309632daae4ec3e38f",
                      "fileName": "API 功能畫面.docx",
                      "fileSize": 319795,
                      "fileMime": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                      "isTmp": 1
                    }
                  ],
                  "EMP_PREOT_ID": 0
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: {checkPreOt},\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "失敗\n```\n{\n  code: 490,\n  msg: string,   // 失敗原因\n}\n```\n"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf022/insertPreOt": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "預先加班寫入",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\ninsertPreOt = {\n  \"EMP_PREOT_ID\": number,         //寫入成功的預先加班主檔ID\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID",
                    "OT_SDATE",
                    "OT_EDATE",
                    "WF_NO",
                    "WF_RESULT"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "OT_SDATE": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "預先加班起始時間"
                    },
                    "OT_EDATE": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "預先加班結束時間"
                    },
                    "PAY_TYPE": {
                      "type": "string",
                      "description": "預先加班支領方式"
                    },
                    "REASON": {
                      "type": "string",
                      "description": "預先加班原因"
                    },
                    "FILES": {
                      "type": "array",
                      "description": "附件"
                    },
                    "NOTE": {
                      "type": "string",
                      "description": "備註"
                    },
                    "EMP_PREOT_ID": {
                      "type": "integer",
                      "description": "預先加班主檔id"
                    },
                    "WF_NO": {
                      "type": "string",
                      "description": "WORKFLOW 表單編號"
                    },
                    "WF_RESULT": {
                      "type": "integer",
                      "description": "表單狀態"
                    }
                  }
                },
                "example": {
                  "CO_ID": 1,
                  "EMP_ID": 31886,
                  "OT_SDATE": "2024-05-04 08:00",
                  "OT_EDATE": "2024-05-04 17:00",
                  "PAY_TYPE": "2",
                  "REASON": "這是原因",
                  "FILES": [
                    {
                      "fileUUID": "f6a4f78f687e0ff62329d991b0cc8839",
                      "fileName": "API 功能畫面.docx",
                      "fileSize": 319795,
                      "fileMime": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                      "isTmp": 1
                    }
                  ],
                  "NOTE": "這是備註",
                  "EMP_PREOT_ID": 0,
                  "WF_NO": "API11223344",
                  "WF_RESULT": 2
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: {insertPreOt},\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "失敗\n```\n{\n  code: 490,\n  msg: string,   // 失敗原因\n}\n```\n"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf022/deletePreOtList": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "預先加班刪除列表",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\ndeletePreOtList = {\n  \"CO_ID\": number,         //公司_ID\n  \"EMP_ID\": number,        //員工_ID\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 1,
                  "EMP_ID": 31886
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: {deletePreOtList},\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf022/checkDeletePreOt": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "預先加班刪除檢查",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\ncheckDeletePreOt = {\n  \"RETURN_CODE\": number,  //回傳訊息代號\n  \"RETURN_MSG\": string,   //回傳訊息\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID",
                    "EMP_PREOT_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "EMP_PREOT_ID": {
                      "type": "integer",
                      "description": "預先加班主檔id"
                    }
                  }
                },
                "example": {
                  "CO_ID": 1,
                  "EMP_ID": 31886,
                  "EMP_PREOT_ID": 130555
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [checkDeletePreOt, checkDeletePreOt, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "失敗\n```\n{\n  code: 490,\n  msg: string,   // 失敗原因\n}\n```\n"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf022/deletePreOt": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "預先加班刪除",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\ndeletePreOt = {\n  \"RETURN_CODE\": number,  //回傳訊息代號\n  \"RETURN_MSG\": string,   //回傳訊息\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID",
                    "EMP_PREOT_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "EMP_PREOT_ID": {
                      "type": "integer",
                      "description": "預先加班主檔id"
                    }
                  }
                },
                "example": {
                  "CO_ID": 1,
                  "EMP_ID": 31886,
                  "EMP_PREOT_ID": 130545
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [deletePreOt, deletePreOt, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "失敗\n```\n{\n  code: 490,\n  msg: string,   // 失敗原因\n}\n```\n"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf022/preOtList": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "取得預先加班單列表",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\npreOtList = {\n  \"EM_PPREOT_ID\": number, //預先加班ID\n  \"CO_ID\": number, //公司_ID\n  \"EMP_ID\": number, //員工_ID\n  \"OT_START\": string,     //加班開始\n  \"OT_END\": string,       //加班結束\n  \"UNIT\": string,         //單位\n  \"OT_VALUE\": number,     //加班時數\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 1,
                  "EMP_ID": 31886
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: {preOtList},\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "失敗\n```\n{\n  code: 490,\n  msg: string,   // 失敗原因\n}\n```\n"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf022/preOtTime": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "取得剩餘加班時數",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\notTime = {\n  \"OT_VALUE\": number,        //加班時數\n  \"OT_VALUE_UNIT\": string,   //加班時數單位\n  \"OT_MINS\": integer,        //加班分鐘數\n  \"OT_REASON\": number,       //加班原因是否必填\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID",
                    "OT_SDATE",
                    "OT_EDATE"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "OT_SDATE": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "加班起始時間"
                    },
                    "OT_EDATE": {
                      "type": [
                        "string",
                        "date"
                      ],
                      "description": "加班結束時間"
                    }
                  }
                },
                "example": {
                  "CO_ID": 1,
                  "EMP_ID": 31886,
                  "OT_SDATE": "2022-08-24 08:00",
                  "OT_EDATE": "2022-08-24 17:00"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: {otTime},\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "失敗\n```\n{\n  code: 490,\n  msg: string,   // 失敗原因\n}\n```\n"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf030/checkCard": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "忘刷時間檢查",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": null,
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID",
                    "CARD_DATETIME"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "CARD_DATETIME": {
                      "type": [
                        "array",
                        "string",
                        "date"
                      ],
                      "description": "忘刷時間(多組)"
                    },
                    "REASON": {
                      "type": "string",
                      "description": "忘刷說明"
                    }
                  }
                },
                "example": {
                  "CO_ID": 1,
                  "EMP_ID": 31886,
                  "CARD_DATETIME": [
                    {
                      "cardTime": "2022/06/02 08:00"
                    },
                    {
                      "cardTime": "2022/06/02 17:00"
                    }
                  ],
                  "REASON": ""
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "失敗\n```\n{\n  code: 490,\n  msg: string,   // 失敗原因\n}\n```\n"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf030/insertCard": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "忘刷時間寫入",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": null,
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID",
                    "CARD_DATETIME",
                    "WF_NO"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "CARD_DATETIME": {
                      "type": [
                        "array",
                        "string",
                        "date"
                      ],
                      "description": "忘刷時間(多組)"
                    },
                    "REASON": {
                      "type": "string",
                      "description": "忘刷說明"
                    },
                    "WF_NO": {
                      "type": "string",
                      "description": "WORKFLOW 表單編號"
                    }
                  }
                },
                "example": {
                  "CO_ID": 1,
                  "EMP_ID": 31886,
                  "CARD_DATETIME": [
                    {
                      "cardTime": "2022/06/02 08:00"
                    },
                    {
                      "cardTime": "2022/06/02 17:00"
                    }
                  ],
                  "REASON": "",
                  "WF_NO": "API11223344"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "失敗\n```\n{\n  code: 490,\n  msg: string,   // 失敗原因\n}\n```\n"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf030/checkDeleteCard": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "忘刷時間刪除檢查",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": null,
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID",
                    "WF_NO"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "WF_NO": {
                      "type": "string",
                      "description": "WORKFLOW 表單編號"
                    }
                  }
                },
                "example": {
                  "CO_ID": 1,
                  "EMP_ID": 31886,
                  "WF_NO": "AA12345678"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "失敗\n```\n{\n  code: 490,\n  msg: string,   // 失敗原因\n}\n```\n"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf030/deleteCard": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "忘刷時間刪除",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": null,
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID",
                    "WF_NO"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "WF_NO": {
                      "type": "string",
                      "description": "WORKFLOW 表單編號"
                    }
                  }
                },
                "example": {
                  "CO_ID": 1,
                  "EMP_ID": 31886,
                  "WF_NO": "AA12345678"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "失敗\n```\n{\n  code: 490,\n  msg: string,   // 失敗原因\n}\n```\n"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf031/UpdOverAttend": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "更新超時出勤原因",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "requestBody": {
            "require": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID",
                    "EMP_CARDMATCH_ID",
                    "OVER_ATTEND_ID",
                    "WF_NO"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "number",
                      "description": "公司_ID"
                    },
                    "EMP_ID": {
                      "type": "number",
                      "description": "員工_ID"
                    },
                    "EMP_CARDMATCH_ID": {
                      "type": "string",
                      "description": "ID可以傳入多筆, 以逗號分隔 ,如 1,50,200,300"
                    },
                    "OVER_ATTEND_ID": {
                      "type": "number",
                      "description": "超時出勤回報_原因ID"
                    },
                    "OVER_ATTEND_DESC": {
                      "type": "string",
                      "description": "超時出勤回報_說明"
                    },
                    "WF_NO": {
                      "type": "string",
                      "description": "WORKFLOW 表單編號"
                    }
                  }
                },
                "example": "{\n  \"CO_ID\": 9,\n  \"EMP_ID\": 15078,\n  \"EMP_CARDMATCH_ID\": \"58828028,58828029\",\n  \"OVER_ATTEND_ID\": 25,\n  \"OVER_ATTEND_DESC\": \"12345\",\n  \"WF_NO\": \"WF10123456789\"\n}\n"
              }
            }
          },
          "responses": {
            "200": {
              "description": "更新成功"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "檢查異常 `{ code: 490, msg?: string }`"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf100/businessTrip": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "取得職務代理人是否必填",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nbusinessTrip = {\n  \"BASE004\": number,        // 職務代理人是否必填 { 0:非必填 1:必填 }\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 475
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: { businessTrip },\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf100/leaveTime": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "取得出差合計單位數",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nleaveTime = {\n  CO_ID: number,               //公司_ID\n  EMP_ID: number,              //員工_ID\n  LEAVE_VALUE: number,         //合計出差單位數\n  LEAVE_MINS: number,          //合計出差分鐘數\n  DED_VALUE: number,           //合計扣除分鐘數\n  UNIT: string,                //出差單位\n  RULE: string,                //規則\n  MSG: string,                 //錯誤訊息(RULE為，warning時顯示提示訊息, error時則顯示錯誤訊息)\n}\n\n檢查代理期間可請假\nRULE: 'warning' (提示訊息)\nMSG: '部分或全部的出差時間已擔任其他同仁的職務代理人'\n\nRULE: 'error' (錯誤訊息)\nMSG: '部分或全部的出差時間已擔任其他同仁的職務代理人'\n\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID",
                    "BIZ_START",
                    "BIZ_END"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "BIZ_START": {
                      "type": "string",
                      "description": "出差起始時間字串 YYYY/MM/DD HH:mm"
                    },
                    "BIZ_END": {
                      "type": "string",
                      "description": "出差結束時間字串 YYYY/MM/DD HH:mm"
                    }
                  }
                },
                "example": "{\n  \"CO_ID\": 475,\n  \"EMP_ID\": 125468,\n  \"BIZ_START\": \"2024/04/08 08:00\",\n  \"BIZ_END\": \"2024/04/12 18:25\"\n}\n"
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: { leaveTime },\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "失敗\n```\n{\n  code: 490,\n  msg: string,   // 失敗原因\n}\n```      \n"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf100/checkBiz": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "出差單檢查",
          "description": "requestBody 的 REQUEST_TYPE 說明\n```\n1、若REQUEST_TYPE為1(整體出差行程)，bizTrips為[]，需求欄位:\n  BIZ_PROPERTY_ID、AGENT_ID、BIZ_DATETIME、BIZ_TRANS_IDS、\n  BIZ_TODO_IDS、BIZ_AREA_ID、REASON、REQUEST_TYPE\n\n2、若REQUEST_TYPE為2(詳細出差行程)，需求欄位:\n  BIZ_PROPERTY_ID、AGENT_ID、BIZ_DATETIME、BIZ_TRANS_IDS、\n  BIZ_TODO_IDS、REQUEST_TYPE、BIZ_TRIPS  \n\nEMP_BIZ_ID 編輯模式為必填\n```\n",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "requestBody": {
            "require": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID",
                    "BIZ_PROPERTY_ID",
                    "BIZ_DATETIME",
                    "BIZ_TRANS_IDS",
                    "BIZ_TODO_IDS",
                    "REQUEST_TYPE",
                    "WF_NO",
                    "WF_RESULT"
                  ],
                  "properties": {
                    "BIZ_PROPERTY_ID": {
                      "type": "number",
                      "description": "出差性質 ID"
                    },
                    "BIZ_DATETIME": {
                      "type": "array",
                      "minLength": "2,",
                      "maxLength": "2,",
                      "items": {
                        "type": "string",
                        "description": "出差申請日期時間起迄的字串 YYYY/MM/DD HH:mm"
                      }
                    },
                    "AGENT_ID": {
                      "type": "number",
                      "description": "職務代理人 ID"
                    },
                    "BIZ_TRANS_IDS": {
                      "type": "string",
                      "description": "交通工具 IDS"
                    },
                    "BIZ_TODO_IDS": {
                      "type": "string",
                      "description": "委辦事項 IDS"
                    },
                    "REQUEST_TYPE": {
                      "type": "integer",
                      "description": "申請類型 { 1:整體出差行程 2:詳細出差行程 }"
                    },
                    "BIZ_AREA_ID": {
                      "type": "number",
                      "description": "出差地點 ID"
                    },
                    "REASON": {
                      "type": "string",
                      "maxLength": 300,
                      "description": "出差原因"
                    },
                    "BIZ_TRIPS": {
                      "type": "array",
                      "description": "詳細出差行程",
                      "items": {
                        "type": "object",
                        "properties": {
                          "TRIP_AREA_ID": {
                            "type": "number",
                            "description": "該行程出差地點 ID"
                          },
                          "TRIP_DATETIME": {
                            "type": "array",
                            "minLength": "2,",
                            "maxLength": "2,",
                            "items": {
                              "type": "string",
                              "description": "該行程出差申請日期時間起迄的字串 YYYY/MM/DD HH:mm"
                            }
                          },
                          "TRIP_REASON": {
                            "type": "string",
                            "maxLength": 300,
                            "description": "該行程出差原因"
                          },
                          "SEQ": {
                            "type": "integer",
                            "description": "第幾段行程"
                          }
                        }
                      }
                    },
                    "FILES": {
                      "type": "array",
                      "description": "附件，塞入 /api/file/attach 取得的物件(funCode為wf100)",
                      "items": {
                        "type": "object",
                        "properties": {
                          "fileUUID": {
                            "type": "string"
                          },
                          "fileName": {
                            "type": "string"
                          },
                          "fileSize": {
                            "type": "number"
                          },
                          "fileMime": {
                            "type": "string"
                          },
                          "isTmp": {
                            "type": "integer"
                          }
                        }
                      }
                    },
                    "EMP_BIZ_ID": {
                      "type": "integer",
                      "description": "出差主檔id"
                    },
                    "WF_NO": {
                      "type": "string",
                      "description": "WORKFLOW 表單編號"
                    },
                    "WF_RESULT": {
                      "type": "integer",
                      "description": "表單狀態 { 1:在途中 2:已核准 }"
                    }
                  }
                },
                "examples": {
                  "整體出差行程": {
                    "value": {
                      "CO_ID": 475,
                      "EMP_ID": 125468,
                      "AGENT_ID": 125473,
                      "BIZ_PROPERTY_ID": 4374,
                      "BIZ_DATETIME": [
                        "2024/04/11 08:00",
                        "2024/04/11 17:00"
                      ],
                      "BIZ_TRANS_IDS": "4362,4364",
                      "BIZ_TODO_IDS": "3618,3619",
                      "BIZ_AREA_ID": 11799,
                      "REASON": "業務推廣",
                      "FILES": [
                        {
                          "fileUUID": "71e20a8cd4a814fdf84b82f8aa019e32",
                          "fileName": "業務推廣明細.xlsx",
                          "fileSize": 15934,
                          "fileMime": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                          "isTmp": 1
                        }
                      ],
                      "REQUEST_TYPE": 1,
                      "WF_NO": "WF00001",
                      "WF_RESULT": 1
                    }
                  },
                  "詳細出差行程": {
                    "value": {
                      "CO_ID": 475,
                      "EMP_ID": 125468,
                      "BIZ_PROPERTY_ID": 4374,
                      "AGENT_ID": 125473,
                      "BIZ_DATETIME": [
                        "2024/04/08 08:00",
                        "2024/04/10 18:00"
                      ],
                      "BIZ_TRANS_IDS": "4362,4364",
                      "BIZ_TODO_IDS": "3619,3620",
                      "FILES": [
                        {
                          "fileUUID": "4fc471c7a408a1d5ea94a8e2beeb4b9d",
                          "fileName": "出差明細.xlsx",
                          "fileSize": 15934,
                          "fileMime": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                          "isTmp": 1
                        },
                        {
                          "fileUUID": "f021ae5d1ecba4917f9eceaa4aaf3bfd",
                          "fileName": "票證.png",
                          "fileSize": 68925,
                          "fileMime": "image/png",
                          "isTmp": 1
                        }
                      ],
                      "REQUEST_TYPE": 2,
                      "BIZ_TRIPS": [
                        {
                          "TRIP_AREA_ID": 11801,
                          "TRIP_REASON": "培訓",
                          "TRIP_DATETIME": [
                            "2024/04/08 08:00",
                            "2024/04/09 18:00"
                          ],
                          "SEQ": 0
                        },
                        {
                          "TRIP_AREA_ID": 11806,
                          "TRIP_REASON": "教育訓練",
                          "TRIP_DATETIME": [
                            "2024/04/10 08:00",
                            "2024/04/10 18:00"
                          ],
                          "SEQ": 1
                        }
                      ],
                      "WF_NO": "WF00002",
                      "WF_RESULT": 1
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "失敗\n```\n{\n  code: 490,\n  msg: string,   // 失敗原因\n}\n```                                                   \n"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf100/insertBiz": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "出差單申請",
          "description": "requestBody 的 REQUEST_TYPE 說明\n```\n1、若REQUEST_TYPE為1(整體出差行程)，bizTrips為[]，需求欄位:\n  BIZ_PROPERTY_ID、AGENT_ID、BIZ_DATETIME、BIZ_TRANS_IDS、\n  BIZ_TODO_IDS、BIZ_AREA_ID、REASON、REQUEST_TYPE、WF_NO、WF_RESULT\n\n2、若REQUEST_TYPE為2(詳細出差行程)，需求欄位:\n  BIZ_PROPERTY_ID、AGENT_ID、BIZ_DATETIME、BIZ_TRANS_IDS、\n  BIZ_TODO_IDS、REQUEST_TYPE、BIZ_TRIPS、WF_NO、WF_RESULT\n\nEMP_BIZ_ID 編輯模式為必填        \n```\n",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "requestBody": {
            "require": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID",
                    "BIZ_PROPERTY_ID",
                    "BIZ_DATETIME",
                    "BIZ_TRANS_IDS",
                    "BIZ_TODO_IDS",
                    "REQUEST_TYPE",
                    "WF_NO",
                    "WF_RESULT"
                  ],
                  "properties": {
                    "BIZ_PROPERTY_ID": {
                      "type": "number",
                      "description": "出差性質 ID"
                    },
                    "BIZ_DATETIME": {
                      "type": "array",
                      "minLength": "2,",
                      "maxLength": "2,",
                      "items": {
                        "type": "string",
                        "description": "出差申請日期時間起迄的字串 YYYY/MM/DD HH:mm"
                      }
                    },
                    "AGENT_ID": {
                      "type": "number",
                      "description": "職務代理人 ID"
                    },
                    "BIZ_TRANS_IDS": {
                      "type": "string",
                      "description": "交通工具 IDS"
                    },
                    "BIZ_TODO_IDS": {
                      "type": "string",
                      "description": "委辦事項 IDS"
                    },
                    "REQUEST_TYPE": {
                      "type": "integer",
                      "description": "申請類型 { 1:整體出差行程 2:詳細出差行程 }"
                    },
                    "BIZ_AREA_ID": {
                      "type": "number",
                      "description": "出差地點 ID"
                    },
                    "REASON": {
                      "type": "string",
                      "maxLength": 300,
                      "description": "出差原因"
                    },
                    "BIZ_TRIPS": {
                      "type": "array",
                      "description": "詳細出差行程",
                      "items": {
                        "type": "object",
                        "properties": {
                          "TRIP_AREA_ID": {
                            "type": "number",
                            "description": "該行程出差地點 ID"
                          },
                          "TRIP_DATETIME": {
                            "type": "array",
                            "minLength": "2,",
                            "maxLength": "2,",
                            "items": {
                              "type": "string",
                              "description": "該行程出差申請日期時間起迄的字串 YYYY/MM/DD HH:mm"
                            }
                          },
                          "TRIP_REASON": {
                            "type": "string",
                            "maxLength": 300,
                            "description": "該行程出差原因"
                          },
                          "SEQ": {
                            "type": "integer",
                            "description": "第幾段行程"
                          }
                        }
                      }
                    },
                    "FILES": {
                      "type": "array",
                      "description": "附件，塞入 /api/file/attach 取得的物件(funCode為wf100)",
                      "items": {
                        "type": "object",
                        "properties": {
                          "fileUUID": {
                            "type": "string"
                          },
                          "fileName": {
                            "type": "string"
                          },
                          "fileSize": {
                            "type": "number"
                          },
                          "fileMime": {
                            "type": "string"
                          },
                          "isTmp": {
                            "type": "integer"
                          }
                        }
                      }
                    },
                    "EMP_BIZ_ID": {
                      "type": "integer",
                      "description": "出差主檔id"
                    },
                    "WF_NO": {
                      "type": "string",
                      "description": "WORKFLOW 表單編號"
                    },
                    "WF_RESULT": {
                      "type": "integer",
                      "description": "表單狀態 { 1:在途中 2:已核准 }"
                    }
                  }
                },
                "examples": {
                  "整體出差行程": {
                    "value": {
                      "CO_ID": 475,
                      "EMP_ID": 125468,
                      "BIZ_PROPERTY_ID": 4374,
                      "AGENT_ID": 125473,
                      "BIZ_DATETIME": [
                        "2024/04/11 08:00",
                        "2024/04/11 17:00"
                      ],
                      "BIZ_TRANS_IDS": "4362,4364",
                      "BIZ_TODO_IDS": "3618,3619,3620",
                      "BIZ_AREA_ID": 11799,
                      "REASON": "業務推廣",
                      "FILES": [
                        {
                          "fileUUID": "71e20a8cd4a814fdf84b82f8aa019e32",
                          "fileName": "業務推廣明細.xlsx",
                          "fileSize": 15934,
                          "fileMime": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                          "isTmp": 1
                        }
                      ],
                      "REQUEST_TYPE": 1,
                      "WF_NO": "WF00001",
                      "WF_RESULT": 1
                    }
                  },
                  "詳細出差行程": {
                    "value": {
                      "CO_ID": 475,
                      "EMP_ID": 125468,
                      "BIZ_PROPERTY_ID": 4374,
                      "AGENT_ID": 125473,
                      "BIZ_DATETIME": [
                        "2024/04/08 08:00",
                        "2024/04/10 18:00"
                      ],
                      "BIZ_TRANS_IDS": "4362,4364",
                      "BIZ_TODO_IDS": "3619,3620",
                      "FILES": [
                        {
                          "fileUUID": "4fc471c7a408a1d5ea94a8e2beeb4b9d",
                          "fileName": "出差明細.xlsx",
                          "fileSize": 15934,
                          "fileMime": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                          "isTmp": 1
                        },
                        {
                          "fileUUID": "f021ae5d1ecba4917f9eceaa4aaf3bfd",
                          "fileName": "票證.png",
                          "fileSize": 68925,
                          "fileMime": "image/png",
                          "isTmp": 1
                        }
                      ],
                      "REQUEST_TYPE": 2,
                      "BIZ_TRIPS": [
                        {
                          "TRIP_AREA_ID": 11801,
                          "TRIP_REASON": "培訓",
                          "TRIP_DATETIME": [
                            "2024/04/08 08:00",
                            "2024/04/09 18:00"
                          ],
                          "SEQ": 0
                        },
                        {
                          "TRIP_AREA_ID": 11806,
                          "TRIP_REASON": "教育訓練",
                          "TRIP_DATETIME": [
                            "2024/04/10 08:00",
                            "2024/04/10 18:00"
                          ],
                          "SEQ": 1
                        }
                      ],
                      "WF_NO": "WF00002",
                      "WF_RESULT": 1
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "申請成功 (等待人員簽核中...)"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "失敗\n```\n{\n  code: 490,\n  msg: string,   // 失敗原因\n}\n```\n"
            },
            "498": {
              "description": "`{ code: 498, msg: '伺服器錯誤' }`"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf100/checkDeleteBiz": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "出差刪除檢查",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\ndeleteLeave = {\n  \"RETURN_CODE\": number,  //回傳訊息代號\n  \"RETURN_MSG\": string,   //回傳訊息\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID",
                    "EMP_BIZ_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "EMP_BIZ_ID": {
                      "type": "integer",
                      "description": "出差主檔ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 475,
                  "EMP_ID": 125468,
                  "EMP_BIZ_ID": 233
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "失敗\n```\n{\n  code: 490,\n  msg: string,   // 失敗原因\n}\n```\n"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wf100/deleteBiz": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "出差刪除",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\ndeleteLeave = {\n  \"RETURN_CODE\": number,  //回傳訊息代號\n  \"RETURN_MSG\": string,   //回傳訊息\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "EMP_ID",
                    "EMP_BIZ_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "EMP_BIZ_ID": {
                      "type": "integer",
                      "description": "出差主檔ID"
                    }
                  }
                },
                "example": {
                  "CO_ID": 475,
                  "EMP_ID": 125468,
                  "EMP_BIZ_ID": 233
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "失敗\n```\n{\n  code: 490,\n  msg: string,   // 失敗原因\n}\n```\n"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wfcust/form": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "表單類別API",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "requestBody": {
            "require": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "number",
                      "description": "公司_ID"
                    }
                  }
                },
                "example": "{\n  \"CO_ID\": 3\n}\n"
              }
            }
          },
          "responses": {
            "200": {
              "description": "更新成功"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "SESSION_KEY 不可重複"
            },
            "491": {
              "description": "假勤檢查異常 `{ code: 491, msg?: string }`"
            },
            "492": {
              "description": "附件寫入錯誤"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wfcust/component": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "元件資料API",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "requestBody": {
            "require": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "WF_CUST_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "number",
                      "description": "公司_ID"
                    },
                    "WF_CUST_ID": {
                      "type": "number",
                      "description": "自訂表單_ID"
                    }
                  }
                },
                "example": "{\n  \"CO_ID\": 3,\n  \"WF_CUST_ID\": 33\n}\n"
              }
            }
          },
          "responses": {
            "200": {
              "description": "更新成功"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "假勤檢查異常 `{ code: 490, msg?: string }`"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/wf/wfcust/request": {
        "post": {
          "tags": [
            "WF"
          ],
          "summary": "簽核完成資料API",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "requestBody": {
            "require": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID",
                    "WF_CUST_ID",
                    "WF_SIGN_SDATE",
                    "WF_SIGN_EDATE"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "number",
                      "description": "公司_ID"
                    },
                    "WF_CUST_ID": {
                      "type": "number",
                      "description": "自訂表單_ID"
                    },
                    "WF_SIGN_SDATE": {
                      "type": "date",
                      "description": "簽核完成日期時間起"
                    },
                    "WF_SIGN_EDATE": {
                      "type": "date",
                      "description": "簽核完成日期時間迄"
                    }
                  }
                },
                "example": "{\n  \"CO_ID\": 3,\n  \"WF_CUST_ID\": 23,\n  \"WF_SIGN_SDATE\": \"2025-02-01\",\n  \"WF_SIGN_EDATE\": \"2025-02-28\"\n}\n"
              }
            }
          },
          "responses": {
            "200": {
              "description": "更新成功"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "490": {
              "description": "批次請假單刪除失敗"
            },
            "499": {
              "$ref": "#/components/responses/499"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      },
      "/api/zz/standard/benefit/emp": {
        "post": {
          "tags": [
            "ZZ"
          ],
          "summary": "取得有福企系統員工須同步資料",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "description": "```\nemp = {\n  \"CO_ID\": number,                    //公司_ID\n  \"EMP_ID\": number,                   //員工_ID\n  \"enterprise_id\": string,            //公司代碼\n  \"user_email\": string,               //公司e-mail\n  \"user_name\": string,                //員工姓名\n  \"employee_no\": string,              //員工編號\n  \"employee_id\": string,              //身分證號\n  \"birthday\": date,                   //生日\n  \"grade_id\": string,                 //職等名稱\n  \"position_name\": string,            //職稱名稱\n  \"effective\": string,                //員工狀態\n  \"PAR_CODE\": string,                 //員工類型\n  \"cellphone\": string,                //手機\n  \"E_DATETIME\": date,                 //修改_日期\n},\n```\n",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "CO_ID"
                  ],
                  "properties": {
                    "CO_ID": {
                      "type": "integer",
                      "description": "公司ID"
                    },
                    "Limit": {
                      "type": "integer",
                      "description": "筆數限制"
                    },
                    "EMP_ID": {
                      "type": "integer",
                      "description": "員工ID"
                    },
                    "E_SDATETIME": {
                      "type": [
                        "date"
                      ],
                      "description": "修改日期起"
                    },
                    "E_EDATETIME": {
                      "type": [
                        "date"
                      ],
                      "description": "修改日期迄"
                    }
                  }
                },
                "examples": {
                  "案例1": {
                    "value": {
                      "CO_ID": 13,
                      "EMP_ID": "33770"
                    }
                  },
                  "案例2": {
                    "value": {
                      "CO_ID": 13,
                      "LIMIT": 10
                    }
                  },
                  "案例3": {
                    "value": {
                      "CO_ID": 13,
                      "LIMIT": 10,
                      "E_SDATETIME": "2022/07/27 09:00",
                      "E_EDATETIME": "2022/07/28 18:00"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "成功\n```\n{\n  code: 200,\n  data: [emp, emp, ...],\n}\n```\n"
            },
            "401": {
              "$ref": "#/components/responses/401"
            },
            "403": {
              "$ref": "#/components/responses/403"
            },
            "440": {
              "$ref": "#/components/responses/440"
            },
            "500": {
              "$ref": "#/components/responses/500"
            }
          }
        }
      }
    },
    "components": {
      "securitySchemes": {
        "bearerAuth": {
          "type": "http",
          "scheme": "bearer",
          "bearerFormat": "JWT"
        }
      },
      "responses": {
        "401": {
          "description": "認證失敗 (請更新 accessToken 再試一次)"
        },
        "403": {
          "description": "權限不足"
        },
        "440": {
          "description": "參數錯誤 (請檢查 parameters 或 request body 的欄位、格式是否完整及正確)"
        },
        "499": {
          "description": "DB錯誤 `{ code: 499, msg: string }`"
        },
        "500": {
          "description": "系統異常 `{ code: 500, msg: string }`"
        }
      }
    },
    "tags": []
  },
  "customOptions": {}
};
  url = options.swaggerUrl || url
  var urls = options.swaggerUrls
  var customOptions = options.customOptions
  var spec1 = options.swaggerDoc
  var swaggerOptions = {
    spec: spec1,
    url: url,
    urls: urls,
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  }
  for (var attrname in customOptions) {
    swaggerOptions[attrname] = customOptions[attrname];
  }
  var ui = SwaggerUIBundle(swaggerOptions)

  if (customOptions.oauth) {
    ui.initOAuth(customOptions.oauth)
  }

  if (customOptions.authAction) {
    ui.authActions.authorize(customOptions.authAction)
  }

  window.ui = ui
}
