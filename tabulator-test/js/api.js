async function call_ajax(param, async=false){
  // ajax 호출 전 버튼 중복 클릭 방지 설정 및 버튼 메시지 변경
  //toogleTargetText('처리중', true);

  try {
    headers = {};
    return await xhr_palin("server/api_new.php", param, 
           "json", "json", "POST", async, headers);  
  }
  catch(e){
    // await showiziModal(msgboxObj);
    alert(e.message)
  }
}

async function xhr_palin(url, data, contentType="json", returnType="json", method="POST", 
              async=false, headers=null) {
  return new Promise(function(resolve, reject){ // promise 정의                                
    
    switch (contentType) {
      case "text" : pcontentType = 'text/html; charset=utf-8'; break;
      case "json" : pcontentType = 'application/json; charset=utf-8'; break;
      case "encode" : pcontentType = 'application/x-www-form-urlencoded; charset=utf-8'; break;
      default : contentType = 'text/html; charset=utf-8'; 
    }
  
    try {
      return $.ajax({
        url: url,
        data : JSON.stringify(data),            // 전달될 데이터
        //type: type,           // jquery 1.9.0 이전 버전 사용 시      
        async: async,           // sync 처리
        method : method,        // 전달 방법 : POST, GET, PUT
        dataType: returnType,   // 서버 리턴 타입  (json, text, xml 등)    
        headers: headers,     
  //      timeout: 20000,         // 타임 아웃 설정 (1000 = 1초)
        contentType : contentType,
       
      })
      .done(function(res){
        var status = res.status;
        var cmd = res.cmd;
        // $.inArray, es6(array.includes)
        if (!status_sucess_code.includes(status)){
          alert(status);
          resolve(false);
          return false;
        }
        switch (cmd){
          case "load_list" :
            test_list = res.data.tabledata;
            break;
          default :
            break;
        }
      })
      .fail(function(xhr) { 
        alert(xhr.responseText);
        resolve(true);
      })
      // 항상 실행
      .always(function(xhr) { 
        if (bdebug){
          url = "";
        }
        if (xhr.status == '404'){
          alert(xhr.statusText + ' (' + url + ')');
        }
        resolve(true);
      });
    }
    catch(e) {
      alert(e.message);
    }
  });
}