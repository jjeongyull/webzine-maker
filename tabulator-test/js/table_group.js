$(async function(){
  let sendJSON = {};
  sendJSON.cmd = 'load_list';
  await call_ajax(sendJSON);
  let table = new Tabulator("#table", {
    columnHeaderVertAlign:"bottom",
    data:test_list, 
    autoColumns:false, 
    columns: [
      {title:"번호", field:"e_idx"},
      { title: "이벤트 기본정보",
        columns: [
          {
            title: "이벤트 제목", 
            field: "e_title", 
            sorter:"string",
            mutator: function(value){
              return decodeURIComponent(value);
            }
          },
          {
            title: "이벤트 시작일", 
            field: "e_startdate", 
            sorter:"string",
            hozAlign:"center",
            mutator: function(value){
              let s_date = value.substring(0, 10);
              return s_date;
            }
          },
          {
            title: "이벤트 종료일", 
            field: "e_enddate", 
            sorter:"string",
            hozAlign:"center",
            mutator: function(value){
              let s_date = value.substring(0, 10);
              return s_date;
            }
          }
        ]
      },
      { title: "이벤트 상세정보",
        columns: [
          {
            title: "이벤트 설명", 
            field: "e_description", 
            sorter:"string",
            mutator: function(value){
              return decodeURIComponent(value);
            }
          },
          {
            title: "이벤트 이미지 파일명", 
            field: "e_mainimage", 
            sorter:"string",
            mutator: function(value){
              let s_date = value.substring(0, 10);
              return s_date;
            }
          },
          {
            title: "고객사 번호", 
            field: "e_customer_idx", 
            sorter:"number",
            hozAlign:"center",
          }
        ]
      },
    ]
  });
});
