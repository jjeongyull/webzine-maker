$(async function(){
  let sendJSON = {};
  sendJSON.cmd = 'load_list';
  await call_ajax(sendJSON);
  let table = new Tabulator("#table", {
    data:test_list, 
    autoColumns:false, 
    columns: [
      {
        title: "번호", 
        field: "e_idx", 
        sorter:"number",
        headerFilter:true
      },
      {
        title: "이벤트 제목", 
        field: "e_title", 
        sorter:"string",
        mutator: function(value){
          return decodeURIComponent(value);
        },
        cellClick: function(e, cell){
          let data = cell.getRow().getData();
          alert(`이 이벤트는 ${data.e_idx}번 이벤트 입니다.`);
        },
        headerFilter:true
      },
      {
        title: "이벤트 시작일", 
        field: "e_startdate", 
        sorter:"string",
        mutator: function(value){
          let s_date = value.substring(0, 10);
          return s_date;
        },
        headerFilter:true
      },
      {
        title: "이벤트 종료일", 
        field: "e_enddate", 
        sorter:"string",
        mutator: function(value){
          let s_date = value.substring(0, 10);
          return s_date;
        },
        headerFilter:true
      },
    ]
  });
});
