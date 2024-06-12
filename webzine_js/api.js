


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
    return await xhr_palin("https://webzine.menteimo.com/user_server/api_new.php", JSON.stringify(param), 
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
              alert('가입신청이 완료되었습니다.\n관리자 승인 후 이용 가능합니다.')
            }
            break;
          case "load_main_webzine_uuid" :
            g_webzine_main_list = res.data.tabledata;
            break;
          case "load_webzine_option_uuid" :
            g_webzine_option = res.data.tabledata;
            break;
          case "load_webzine_category_uuid" :
            g_category_list = res.data.tabledata;
            break;
          case "load_webzine_sub_category_uuid" :
            g_sub_category_list = res.data.tabledata;
            break;
          case "load_webzine_contents_uuid" :
            g_webzine_content_list = res.data.tabledata;
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

// sns 공유버튼 함수
function facebook() {
  var url = location.href;
  var title = $('meta[property="og:title"]').attr('content');
  var imageUrl = $('meta[property="og:image"]').attr('content')
  window.open('http://www.facebook.com/sharer/sharer.php?u=' + url + '&t=' + title + "&imageUrl=" + imageUrl, "", "width=500,height=500,left=0,top=0");
}

// 네이버 블로그 공유 : https://developers.naver.com/docs/share/navershare/
function blog() {
  var url = encodeURI(encodeURIComponent(location.href));
  var title = encodeURI($('meta[property="og:title"]').attr('content'));
  var imageUrl = $('meta[property="og:image"]').attr('content')
  var shareURL = "https://share.naver.com/web/shareView?url=" + url + "&title=" + title + "&imageUrl=" + imageUrl;
  window.open(shareURL, "네이버 공유하기", "width=500,height=500,left=0,top=0");
}

// 밴드 공유 : https://developers.band.us/develop/guide/share
function band(){
  //var url = encodeURI(encodeURIComponent(location.href));
  //var title = encodeURI($('meta[property="og:title"]').attr('content'));
  var url = location.href;
  var title = $('meta[property="og:title"]').attr('content');
  // 밴드 공유 버튼을 사용하는 서비스의 도메인
  var route = window.location.href;
  // 밴드에 게시할 내용(문자셋: UTF-8, 인코딩 방식: URL 인코딩)
  var body = encodeURIComponent(title+'\r\n'+url+'&route='+route);
  var shareURL = "https://band.us/plugin/share?body=" + body;
  window.open(shareURL, "", "width=500,height=650,left=0,top=0");
}

// 카카오 공유 : https://developers.kakao.com/docs/latest/ko/message/js-link
function kakao() {
  Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
          title: $('meta[property="og:title"]').attr('content'),
          description: $('meta[property="og:description"]').attr('content'),
          // 이미지는 반드시 들어가야 된다.
          imageUrl: $('meta[property="og:image"]').attr('content'),
          link: {
              mobileWebUrl: location.href,
              webUrl: location.href
          }
      },
      social: {
          likeCount: 286,
          commentCount: 45,
          sharedCount: 845
      },
      buttons: [
          {
              title: '웹으로 보기',
              link: {
                  webUrl: window.location.href
              }
          }
      ]
  });
}