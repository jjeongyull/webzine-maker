$(async function(){
  let sendJSON = {};
  sendJSON.cmd = 'load_list';

  await call_ajax(sendJSON);
  table = new Tabulator("#table", {
    data:test_list,
    pagination:"local",
    paginationSize:7,
    paginationCounter:"rows",
    layout:"fitDataFill",
    placeholder:"데이터가 존재하지 않습니다.",
    responsiveLayout:"collapse",
    columns: [
      {formatter: "responsiveCollapse", width:30, minWidth:30, hozAlign:"center", resizable:false , headerSort:false },
      {
        title: "번호", 
        field: "e_idx", 
        sorter:"number"
      },
      {
        title: "이벤트 제목", 
        field: "e_title", 
        sorter:"string",
        mutator: function(value){
          return decodeURIComponent(value);
        }
      },
      {
        title: "이벤트 설명", 
        field: "e_description", 
        sorter:"string",
        mutator: function(value){
          return decodeURIComponent(value);
        }
      },
      {
        title: "이벤트 시작일", 
        field: "e_startdate", 
        sorter:"string",
        mutator: function(value){
          let s_date = value.substring(0, 10);
          return s_date;
        },
        responsive: 2,
      },
      {
        title: "이벤트 종료일", 
        field: "e_enddate", 
        sorter:"string",
        responsive: 2,
        mutator: function(value){
          let s_date = value.substring(0, 10);
          return s_date;
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
    ],

  });
});
