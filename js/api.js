


/* @brief ajax 호출 전 popup-insert class를 가진 버튼의 text를 처리중... 으로 변경
*  @date 2023/08/25
*  @return 
*  @param param : 전송할 파라미터
*   async : 비동기 처리를 위해, 프로젝트 생성 시 칼럼 업데이트 등 작업량이 많을 경우
          화면이 정지 상태로 있는 것을 방지하기 위해, 이 경우 ajax 호출 결과, done 처리에 
          이후 처리 프로세스를 추가한다. (프로젝트 화면 그리기 등)
          로딩 대기 알림을 위해 버튼 메시지 변경 및 popup-btn 클래스 버튼 활성화 방지
*/
async function call_ajax(param, async=false){
  

  try {
    headers = {};
    headers.Authorization = "Bearer " + g_access_token;
    return await xhr_palin("../server/api_new.php", JSON.stringify(param), 
           "json", "json", "POST", async, headers);  
  }
  catch(e){
    alert(e.message);
  }
}

async function call_ajax_customer(param, async=false){
  

  try {
    headers = {};
    headers.Authorization = "Bearer " + g_access_token;
    return await xhr_palin("server/api_new.php", JSON.stringify(param), 
           "json", "json", "POST", async, headers);  
  }
  catch(e){
    alert(e.message);
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
        data : data,            // 전달될 데이터
        //type: type,           // jquery 1.9.0 이전 버전 사용 시      
        async: async,           // sync 처리
        method : method,        // 전달 방법 : POST, GET, PUT
        dataType: returnType,   // 서버 리턴 타입  (json, text, xml 등)    
        headers: headers,     
  //      timeout: 20000,         // 타임 아웃 설정 (1000 = 1초)
        contentType : contentType
        //beforeSend: showLoadingButton(true, '.popup-insert')      // async가 false일 때는 적용되지 않는다.
      })
      .done(function(res){

        if ((res.status == 200) || (res.status == 201) || (res.status == 203)){
          g_access_token = res.token;
        } 
        if ( (res.status == 600) || (res.status == 500) || (res.status == 501)
        || (res.status == 502) || (res.status == 503)){
          open_izModal(res.cmd + '\n' + res.message, false);
          resolve(true);
          return false;
        }

        switch (res.cmd){
          case "insert_member" :
            if (res.status == 200){
              open_izModal("가입신청이 완료되었습니다.\n관리자 승인 후 이용 가능합니다.", true);

            }
            break;
          case "load_main_webzine" :
          case "load_main_webzine_uuid" :
            g_webzine_main_list = res.data.tabledata;
            break;
          case "load_webzine_option" :
          case "load_webzine_option_uuid" :
            g_webzine_option = res.data.tabledata;
            break;
          case "load_webzine_category" :
          case "load_webzine_category_uuid" :
            g_category_list = res.data.tabledata;
            break;
          case "load_webzine_sub_category" :
          case "load_webzine_sub_category_uuid" :
            g_sub_category_list = res.data.tabledata;
            break;
          case "load_webzine_list" :
          case "load_webzine_contents_uuid" :
            g_webzine_content_list = res.data.tabledata;
            break;
          case "load_customer" :
            g_customer_list = res.data.tabledata;
            break;
          case "load_member" :
            g_member_list = res.data.tabledata;
            break;
        case "logout" :
            if (res.status == 200){
              open_izModal("로그인 아웃 되었습니다.", true);
              draw_login();
            }
            break;
          case "login" :
          case "login_token" :
            if (checkLogin(res))
            {
              $('#login_div').empty();
              $('#login_div').css('display', 'none');
              view_page('index');
            }
            else{
              draw_login();
            }
            break;
          case "insert_category" :
          case "insert_sub_category" :
            if (res.status == 200){
              open_izModal("카테고리 등록 되었습니다.", true);
            }
            break;
          case "del_data" :
            if (res.status == 200){
              open_izModal("삭제가 완료되었습니다.", true);
            }
            break;
          case "insert_customer_name" :
            if (res.status == 200){
              open_izModal("고객사가 등록 되었습니다.", true);
            }
            break;
          case "insert_customer_sign" :
            if (res.status == 200){
              sign_customer_info = res.data.tabledata[0];
            }
            break;
          case "update_customer_name" :
            if (res.status == 200){
              open_izModal("고객사가 수정 되었습니다.", true);
            }
            break;
          case "update_member" :
            if (res.status == 200){
              open_izModal("회원정보가 수정 되었습니다.", true);
              $('button[data-bs-dismiss="modal"]').trigger('click');
            }
            break;
          case "update_sub_category" :
          case "update_category" :
            if (res.status == 200){
              open_izModal("카테고리 수정이 완료 되었습니다.", true);
            }
            break;
          default :
            break;
        }
        resolve(true);
      })
      .fail(function(xhr, textStatus, errorThrown) { 
        resolve(true);
        console.log(textStatus);          // http_response_code 데이터
        console.log(xhr.responseText);    // http_response_code 데이터
      })
      // 항상 실행
      .always(function(xhr, textStatus, errorThrown) { 

        console.log(textStatus);
      });
    }
    catch(e) {
      alert(e.message);
    }
  });
}

/* @메시지 처리
*  @pstatus : ajax 결과로 넘어오는 status 값
*  @psmessage : 성공할 경우 출력하는 메시지 값
*  @returnsmessage : ajax 결과로 넘어오는 message 값
*  입력 팝업 창 숨김 처리 추가 필요
*/
function ShowMessageBox(pstatus, psmessage, returnsmessage="")
{
  if (isEmpty(psmessage)){
    return true;
  }
  // 결과가 성공이나 메시지를 출력해줄 필요가 있을 경우
  if ((pstatus == 200) || (pstatus == 201)){
    if (!isEmpty(psmessage)){
      open_izModal(psmessage, true);
    }
    return true;
  }
  if (isEmpty(returnsmessage)){
    returnsmessage = "명령 처리 실패";
  }

  // 서버 쿼리 결과 결과값이 없을 경우, 메시지 처리를 할건지 결정 필요
  if (pstatus == 203){
    return true;
  }

  open_izModal('(상태코드 : ' + pstatus + ')\n' + returnsmessage, false);
  return true;
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
  .done(function(res){
    console.log(res);
    let response = JSON.parse(res);
    switch (response.cmd){
      case "insert_webzine_main":
        ShowMessageBox(response.status, "웹진 메인페이지가 등록되었습니다.", response.message, true);
        break;
      case "update_webzine_main":
        ShowMessageBox(response.status, "웹진 메인페이지가 수정되었습니다.", response.message, true);
        break;
      case "insert_webzine_list":
        ShowMessageBox(response.status, "페이지가 정상적으로 등록되었습니다.", response.message, true);
        break;
      case "update_webzine_list":
        ShowMessageBox(response.status, "페이지가 정상적으로 수정되었습니다.", response.message, true);
        break;
      case "insert_webzine_option":
        ShowMessageBox(response.status, "옵션이 정상적으로 등록되었습니다.", response.message, true);
        break;
      case "update_webzine_option":
        ShowMessageBox(response.status, "옵션이 정상적으로 수정되었습니다.", response.message, true);
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

/* @brief 버튼 클릭 시 처리를 위한 토글 함수 (부트스트랩 5.0 사용)
*  @date 2023/03/02
*  @return 
*  @param bToggle : true/false, bTarget : 엘리먼트 ID
*/
function showLoadingButton(bToggle, textTarget, diabledTarget){
  // 부트스트랩 스피너 정의
  if (bToggle){
    // 로딩 DIV로 인해 입력 불가 상태만 처리
    //$(textTarget).text('처리중...');
    $(diabledTarget).attr('disabled', true);
  }
  else{
      $(textTarget).text(toggle_org_text);
      $(diabledTarget).attr('disabled', false);
  }
}

function open_izModal(message, bmode=false){
  $("#modal-alert2").iziModal({
    title: "알림",
    subtitle: message,
    icon: 'fas-solid fas-user',
    //headerColor: '#BD5B5B',
    width: 500,
    // timeout: 1000,
    timeoutProgressbar: false,
    transitionIn: 'fadeInDown',
    transitionOut: 'fadeOutDown',
    pauseOnHover: true
  });
  // iziModal.js 내에 변경 함수 있음 :아이콘 변경 -> setIcon 등등
  if (bmode){
    $("#modal-alert2").iziModal('setHeaderColor', '#1aa163');
    $("#modal-alert2").iziModal('setTimeout', 1000);
  }
  else{
    $("#modal-alert2").iziModal('setHeaderColor', '#BD5B5B');
    $("#modal-alert2").iziModal('setTimeout', false);
  }
  //$("#modal-alert2").iziModal('setWidth ',500);
  $("#modal-alert2").iziModal('setSubtitle',"<br>" + message);
  $('#modal-alert2').iziModal('open');
}

function login(pUserID, pUserPasswod){
  param = {};
  param.mem_id = pUserID;
  param.mem_password = pUserPasswod;
  param.cmd = "login";

  headers = {};
  headers.Authorization = "Bearer " + g_access_token;
  xhr_palin("../server/api_new.php", JSON.stringify(param), "json", "json", "POST", false, headers);
}

function login_token(){
  param = {};
  param.cmd = "login_token";

  headers = {};
  headers.Authorization = "Bearer " + g_access_token;
  xhr_palin("../server/api_new.php", JSON.stringify(param), "json", "json", "POST", false, headers);
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

function checkLogin(res){
  var status = res.status;
  if (status == 400){
    return false;
  }
  else if (status == 201 || status == 200){
    if (res.cmd != "login_token"){
      open_izModal("로그인이 정상적으로 완료되었습니다.", true);
    }
    g_login.idx = res.data.idx;
    g_login.id = res.data.user_id;
    g_login.name = res.data.user_name;
    g_login.level = res.data.user_level;
    g_login.customer_idx = res.data.customer_idx;
    g_login.customer_name = res.data.customer_name;
    g_login.uuid = res.data.uuid;
    return true;
  }
  else{
    return false;
  }
}

function fetchData(url) {
  // try{
  //   const response = await fetch(url)
  //   .then(response=>{
  //     if (!response.ok) {
  //       // 응답이 성공적이지 않은 경우
  //       return response.status;
  //     }
  //     else{
  //     // 성공적인 경우 응답
  //       return response;
  //     }
  //   })
  // }
  // catch(error){
  //   console.error("error:",  error)
  // }
  // return response;
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


