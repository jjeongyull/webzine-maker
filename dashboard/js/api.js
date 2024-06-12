
/* @brief ajax 전처리 (팝업 출력 및 header 설정 등)
*  @date 2023/08/25
*  @return 
*  @param param : 전송할 파라미터
*   async : 비동기 처리를 위해, 프로젝트 생성 시 칼럼 업데이트 등 작업량이 많을 경우
          화면이 정지 상태로 있는 것을 방지하기 위해, 이 경우 ajax 호출 결과, done 처리에 
          이후 처리 프로세스를 추가한다. (프로젝트 화면 그리기 등)
          로딩 대기 알림을 위해 버튼 메시지 변경 및 popup-btn 클래스 버튼 활성화 방지
*/
async function call_ajax(param, async=false){
  // ajax 호출 전 버튼 중복 클릭 방지 설정 및 버튼 메시지 변경
  //toogleTargetText('처리중', true);

  try {
    headers = {};
    return await xhr_palin("server/api_main.php", param, 
           "json", "json", "POST", async, headers);  
  }
  catch(e){
    modal_object.type = 'alert';
    modal_object.main_text = e.message;
    modal_object.sub_text = "오류";
    modal_object.icon = "error";
    await view_modal(modal_object);
  }
}



/* @brief Ajax 처리 (plain data)
*  @date 2023/03/02
*  @return 
*  @param url : server url, headers : header(json), data : 전송 데이터
*/
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
        contentType : contentType
      })
      .done(function(res){
        g_access_token = "";
        if (!isEmpty(res.token)){
          g_access_token = res.token;
        } 
        var status = res.status;
        var cmd  = res.cmd;

        // $.inArray, es6(array.includes)
        if (!status_sucess_code.includes(status)){
          modal_object.type = 'alert';
          modal_object.main_text = res.statusText;
          modal_object.sub_text = "오류";
          modal_object.icon = "error";
          view_modal(modal_object);
          return false;
        }
        switch (cmd){
          case "login" :
            console.log(res)
            if (checkLogin(res)){
              console.log(res);
              gotoPage('index.html', '')
            }else{
              if (window.location.href.indexOf("login.html") === -1) {
                gotoPage('login.html', '');
              }
            }
            break;
          case "login_token":
            if (checkLogin(res)){
              if (window.location.href.indexOf("login.html") !== -1) {
                gotoPage('index.html', '');
              }
            }else{
              if (window.location.href.indexOf("login.html") === -1) {
                gotoPage('login.html', '');
              } 
            }
            break;
          case "logout":
              gotoPage('login.html', '');
            break;
          case "insert_member":
              modal_object.type = "alert";
              modal_object.main_text = "회원가입 완료";
              modal_object.sub_text = "관리자의 승인 후 이용 가능합니다.";
              modal_object.icon = "success";
              view_modal(modal_object);
              $('#user_name').val('');
              $('#user_id').val('');
              $('#user_email').val('');
              $('#user_password').val('');
              $('#user_password_check').val('');
            break;
          case "insert_admin_member":
              modal_object.type = "alert";
              modal_object.main_text = "사용자 추가 완료";
              modal_object.sub_text = "사용자가 정상적으로 추가되었습니다.";
              modal_object.icon = "success";
              view_modal(modal_object);
              
            break;
          case "update_admin_member":
              modal_object.type = "alert";
              modal_object.main_text = "사용자 수정 완료";
              modal_object.sub_text = "사용자가 정상적으로 수정되었습니다.";
              modal_object.icon = "success";
              view_modal(modal_object);
              $('#user_refresh').trigger('click');
              
            break;
          case "insert_customer":
              modal_object.type = "alert";
              modal_object.main_text = "고객사 등록";
              modal_object.sub_text = "고객사 등록이 완료되었습니다.";
              modal_object.icon = "success";
              view_modal(modal_object);
              $('#customer_name').val('');
            break;
          case "insert_reple":
              modal_object.type = "alert";
              modal_object.main_text = "댓글 등록";
              modal_object.sub_text = "댓글 등록이 완료되었습니다.";
              modal_object.icon = "success";
              view_modal(modal_object);
              $('#customer_name').val('');
            break;
          case "update_customer":
              modal_object.type = "alert";
              modal_object.main_text = "고객사 수정";
              modal_object.sub_text = "고객사 수정이 완료되었습니다.";
              modal_object.icon = "success";
              view_modal(modal_object);
              
            break;
          case "update_reple":
              modal_object.type = "alert";
              modal_object.main_text = "댓글 수정";
              modal_object.sub_text = "댓글 수정이 완료되었습니다.";
              modal_object.icon = "success";
              view_modal(modal_object);
              
            break;
          case "load_customer_table_data":
              g_customer_table_data = res.data;
            break;
          case "load_notice":
          case "load_search_notice":
              g_notice_data = res.data;
            break;
          case "load_view_notice":
              g_notice_one_data = res.data;
            break;
          case "load_reple":
              g_reple_data = res.data.table_data;
            break;
          case "load_customer_all_data":
              g_customer_all_data = res.data.table_data;
            break;
          case "load_user_table_data":
              g_user_table_data = res.data;
            break;
          case "del_data" :
              if (res.status == 200){
                modal_object.type = "alert";
                modal_object.main_text = "데이터 삭제";
                modal_object.sub_text = "삭제가 완료되었습니다.";
                modal_object.icon = "success";
                view_modal(modal_object);
              }
            break;
          default :
            break;
        }
      })
      .fail(function(xhr) { 
        modal_object.type = 'alert';
        modal_object.main_text = "서버 오류";
        modal_object.sub_text = xhr.responseText;
        modal_object.icon = "error";
        view_modal(modal_object);
        resolve(true);
      })
      // 항상 실행
      .always(function(xhr) { 
        
        resolve(true);
      });
    }
    catch(e) {

    }
  });
}

/* @brief Ajax 처리 - Multipart data (image, binary 등)
  *  @date 2023/03/02
  *  @return 
  *  @param url : server url, header(json), data : 전송 데이터(formdata), type = post(default)/get
  *  @header = {"Authorization": "Bearer token"}
  */
function xhr_multipart(url, formdata, headers=null, dataType="text", async=true) {
  return $.ajax({
    url: url,
    data : formdata,
    type: "POST",           
    async: async,
    headers: headers,      // json
    enctype: "multipart/form-data", //form data 설정,
    processData: false, //프로세스 데이터 설정 : false 값을 해야 form data로 인식합니다
    contentType: false, //헤더의 Content-Type을 설정 : false 값을 해야 form data로 인식합니다
    //beforeSend: showLoadingButton(true, '#btnSetCookie')
  })
  .done(async function(res){
    console.log(res);
    let response = JSON.parse(res);
    switch (response.cmd){
      case "upload_file":
        console.log(response);
        break;
      case "insert_notice":
        modal_object.type = "alert";
        modal_object.main_text = "게시판 작성 완료";
        modal_object.sub_text = "작성된 게시판으로 이동합니다.";
        modal_object.icon = "success";

        let resData = JSON.parse(response.data);
        let resIdx = resData.page_idx;
        let resUuid = resData.uuid;
        let boolean = await view_modal(modal_object);
        if(boolean){
          gotoPage(`notice_view.html?idx=${resIdx}&cs_uuid=${resUuid}&page=1`, '');
        }
      break;
      case "update_notice":
        modal_object.type = "alert";
        modal_object.main_text = "게시판 수정 완료";
        modal_object.sub_text = "수정된 게시판으로 이동합니다.";
        modal_object.icon = "success";

        let resData2 = JSON.parse(response.data);
        let resIdx2 = resData2.page_idx;
        let resUuid2 = resData2.uuid;
        let boolean2 = await view_modal(modal_object);
        if(boolean2){
          gotoPage(`notice_view.html?idx=${resIdx2}&cs_uuid=${resUuid2}&page=1`, '');
        }
      break;
      default :
      break;
    }
  })
  .fail(function(xhr, textStatus, errorThrown) { 
    // delay(3000);
    console.log(xhr);
    console.log(textStatus);
    console.log(errorThrown);

  })
  .always(function(xhr, textStatus, errorThrown) { 

  });
}

// 바닐라 JS Fetch 사용 (Internet Explorer에서는 fetch 함수가 제공되지 않음)
function fetchData(url) {
  return new Promise((resolve, reject) => {
    $.get(url, function(data) {
      resolve(data);
    }).fail(function(error) {
      reject(error);
    });
  });
}

async function fetchAllPagesContent(PList) {
  for (const [key, value] of Object.entries(PList)) {
    try {
      const data = await fetchData(value);
      PagesContent[key] = data;
    } catch (error) {
      PagesContent[key] = error.status; // error.statusText
    }
  }
}

// access_token을 이용한 로그인 처리
async function login_token(url){
  param = {};
  param.cmd = "login_token";

  headers = {};
  headers.Authorization = "Bearer " + g_access_token;
  await xhr_palin(url, param, 
      "json", "json", "POST", false, headers);
}

/**
 * 관리자 로그인
 * @param {*} id : 관리자 아이디
 * @param {*} password  : 관리자 비밀번호
 */
async function login(id, password){
  param = {};
  param.mem_id = id;
  param.mem_password = password;
  param.cmd = "login";

  headers = {};
  headers.Authorization = "Bearer " + g_access_token;
  await xhr_palin("server/api_main.php", param, 
    "json", "json", "POST", true, headers);
}

function checkLogin(res){
  var status = res.status;
  if (status == 400){
    return false;
  }
  else if (status == 200){
    if (res.cmd != "login_token"){
      modal_object.type = 'alert';
      modal_object.main_text = "로그인 되었습니다.";
      modal_object.sub_text = "메인페이지로 이동합니다.";
      modal_object.icon = "success";
      view_modal(modal_object);
    }
    g_login.mem_id = res.data.mem_id;
    g_login.mem_name = res.data.mem_name;
    g_login.mem_level = res.data.mem_level;
    g_login.mem_uuid = res.data.mem_uuid;
    g_login.ad_list = res.data.ad_list;
    return true;
  }
  else{
    modal_object.type = 'alert';
    modal_object.main_text = "오류";
    modal_object.sub_text = res.statusText;
    modal_object.icon = "error";
    view_modal(modal_object);
    return false;
  }
}

async function delete_data(pidx, tblname, pidxname="", pdropdata=""){
  param = {};
  param.idx = pidx;
  param.idxname = pidxname;
  param.tblname = tblname;
  param.cmd = "del_data";
  param.dropdata = String(pdropdata);

  headers = {};
  headers.Authorization = "Bearer " + g_access_token;
  
  try{
    await call_ajax(param, true);
  }
  catch(e){
    ShowMessageBox('delete_data()', e.message, "");
  }
}
