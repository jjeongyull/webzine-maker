$(document).on('click', '.toggle', function(){
  $('.sidebar-nav').toggleClass('close');
});
$(document).on('click', '.toggle-switch', function(){
  $('body').toggleClass('dark');
  let body = $('body')[0];
  if(body.classList.contains("dark")){
    $('.mode-text').text("Light Mode");
    setCookie("darkMode", "true", 30);
  }else{
    $('.mode-text').text("Dark Mode");
    setCookie("darkMode", "", -1);
  }
});
// Alert Click
/**
 * confirm일때 let result = await view_modal(modal_object);
 * alert일때 view_modal(modal_object);
 */
$(document).on('click', '#btn_sign', async function(){
  // 모달 세팅
  modal_object.icon = "error";
  let mem_name = $('#user_name').val();
  let mem_id = $('#user_id').val();
  let mem_email = $('#user_email').val();
  let mem_password = $('#user_password').val();
  let mem_password_chk = $('#user_password_check').val();

  // 공백확인
  if(isEmpty(mem_name)){
    modal_object.main_text = "이름을 입력하세요.";
    view_alert(modal_object, '#user_name');
    return false;
  }
  if(isEmpty(mem_id)){
    modal_object.main_text = "아이디를 입력하세요.";
    view_alert(modal_object, '#user_id');
    return false;
  }
  if(isEmpty(mem_email)){
    modal_object.main_text = "이메일을 입력하세요.";
    view_alert(modal_object, '#user_email');
    return false;
  }
  if(isEmpty(mem_password)){
    modal_object.main_text = "비밀번호를 입력하세요.";
    view_alert(modal_object, '#user_password');
    return false;
  }
  if(isEmpty(mem_password_chk)){
    modal_object.main_text = "비밀번호 확인을 입력하세요.";
    view_alert(modal_object, '#user_password_check');
    return false;
  }

  // 이메일 형식 체크
  if (!validateEmail(mem_email)){
    modal_object.main_text = "올바른 이메일 형식을 입력하세요.";
    view_alert(modal_object, '#user_email');
    return false;
  }

  // 비밀번호 와 비밀번호 확인 체크
  if(mem_password != mem_password_chk){
    modal_object.main_text = "비밀번호 확인이 일치하지 않습니다.";
    view_alert(modal_object, '#user_password_check');
    return false;
  }

  let resultJSON = {};
  resultJSON.mem_id = mem_id;
  resultJSON.mem_password = mem_password;
  resultJSON.mem_name = mem_name;
  resultJSON.mem_email = mem_email;
  resultJSON.cmd = "insert_member";

  await call_ajax(resultJSON);
});

// 로그인
$(document).on('click', '#btn_login', async function(){
  let mem_id = $('#mem_id').val();
  let mem_password = $('#mem_password').val();

  modal_object.icon = "error";
  if(isEmpty(mem_id)){
    modal_object.main_text = "아이디를 입력하세요.";
    view_alert(modal_object, '#mem_id');
    return false;
  }
  if(isEmpty(mem_password)){
    modal_object.main_text = "비밀번호를 입력하세요.";
    view_alert(modal_object, '#mem_password');
    return false;
  }

  let resultJSON = {};
  resultJSON.mem_id = mem_id;
  resultJSON.mem_password = mem_password;
  resultJSON.cmd = "login";
  login(mem_id, mem_password);
});

$(document).on('keydown', '#mem_id', function(e){
  if (e.key === "Enter" || e.keyCode === 13) {
    $('#btn_login').trigger('click');
  }
});
$(document).on('keydown', '#mem_password', function(e){
  if (e.key === "Enter" || e.keyCode === 13) {
    $('#btn_login').trigger('click');
  }
});


// 로그아웃 버튼 클릭
$(document).on('click', '#btn_logout', async function(event){
  event.preventDefault();
  modal_object.type = "confirm";
  modal_object.icon = "info";
  modal_object.main_text = "로그아웃 하시겠습니까?";
  modal_object.sub_text = "로그인 페이지로 이동됩니다.";
  let result = await view_modal(modal_object);
  if (!result) {return false};

  param = {};
  param.cmd = "logout";

  call_ajax(param,  false);
  g_login = {};
}); 

// 고객사 추가 버튼 클릭
$(document).on('click', '#btn_insert_customer', async function(){
  let idx = $('#idx').val();

  modal_object.icon = "error";
  let cs_name = $('#customer_name').val();
  if(isEmpty(cs_name)){
    modal_object.main_text = "고객사명을 입력하세요.";
    view_alert(modal_object, '#customer_name');
    return false;
  }

  param = {};
  param.cs_name = urlencode(cs_name);
  if(!isEmpty(idx)){
    modal_object.type = "confirm";
    modal_object.icon = "info";
    modal_object.main_text = "고객사를 수정하시겠습니까?";
    modal_object.sub_text = "고객사 수정";
    let result = await view_modal(modal_object);
    if (!result) {return false};
    param.cmd = "update_customer";
    param.idx = idx;
  }else{
    param.cmd = "insert_customer";
  }

  await call_ajax(param,  false);

  // 고객사 로드
  let page = getUrlValue('page');
  if(isEmpty(page)){
    page = 1;
  }

  param = {};
  param.page = Number(page);
  param.cmd = "load_customer_table_data";
  await call_ajax(param,  false);

  draw_customer_table(g_customer_table_data);
});

// 고객사 테이블 클릭시
$(document).on('click', '.btn-sel-customer', async function(){
  let idx = $(this).data('idx');

  let tempJSON = g_customer_table_data.table_data;
  tempJSON = tempJSON.filter((items) => {
    return Number(idx) === Number(items.idx);
  });
  tempJSON = tempJSON[0];

  $('#btn_del_customer').css('display', 'block');
  $('#customer_refresh').css('display', 'block');
  $('#btn_insert_customer').text('고객사 수정');
  $('#customer_name').val(DecodingUC(tempJSON.cs_name));
  $('#idx').val(idx);
});
// 고객사 추가 새로고침 버튼 클릭시
$(document).on('click', '#customer_refresh', async function(){
  $('#idx').val("");
  $('#customer_name').val("");

  $('#btn_del_customer').css('display', 'none');
  $('#customer_refresh').css('display', 'none');
  $('#btn_insert_customer').text('고객사 추가');
});
// 고객사 삭제시
$(document).on('click', '#btn_del_customer', async function(){
  modal_object.type = "confirm";
  modal_object.icon = "info";
  modal_object.main_text = "고객사를 삭제하시겠습니까?";
  modal_object.sub_text = "고객사 삭제";
  let result = await view_modal(modal_object);
  if (!result) {return false};
  let idx = $("#idx").val();
  await delete_data(idx, 'customer_list');

  let page = getUrlValue('page');
  if(isEmpty(page)){
    page = 1;
  }

  param = {};
  param.page = Number(page);
  param.cmd = "load_customer_table_data";
  await call_ajax(param,  false);

  draw_customer_table(g_customer_table_data);
  $('#customer_refresh').trigger('click');
});

/**======================= 사용자 관리 ========================= */
$(document).on('change', 'input[name="mem_level"]', function(){
  let value = $(this).val();
  if(Number(value) === 3){
    $('#ad_sel_div').removeClass('display-none');
  }else{
    $('#ad_sel_div').addClass('display-none');
  }
});

$(document).on('click', '#ad_sel_box', function(){
  $('#ad_ul').toggleClass('active');
});

$(document).on('change', '.sel-ad-list', function(){
  let value = $(this).val();
  let boolean = this.checked;
  let textVal = $('#mem_admin_list').val();
  if(boolean){
    textVal += value + ',';
    $('#mem_admin_list').val(textVal);
  }else{
    textVal = textVal.replace(value + ',', '');
    $('#mem_admin_list').val(textVal);
  }
});

// 관리자가 사용자 추가 시
$(document).on('click', '#btn_admin_user_insert', async function(){
  // 모달 세팅
  let idx = $('#idx').val();
  modal_object.icon = "error";
  let mem_name = $('#mem_name').val();
  let mem_id = $('#mem_id').val();
  let mem_email = $('#mem_email').val();
  let mem_password = $('#mem_password').val();
  let mem_password_chk = $('#mem_password_check').val();
  let mem_uuid = $('#sel_user_customer').val();
  let mem_active = $('input[name="mem_active"]:checked').val();
  let mem_level = $('input[name="mem_level"]:checked').val();
  let ad_list = "";
 

  // 공백확인
  if(isEmpty(mem_name)){
    modal_object.main_text = "이름을 입력하세요.";
    view_alert(modal_object, '#mem_name');
    return false;
  }
  if(isEmpty(mem_id)){
    modal_object.main_text = "아이디를 입력하세요.";
    view_alert(modal_object, '#user_id');
    return false;
  }
  if(isEmpty(mem_email)){
    modal_object.main_text = "이메일을 입력하세요.";
    view_alert(modal_object, '#user_email');
    return false;
  }

  if(isEmpty(idx)){
    if(isEmpty(mem_password)){
      modal_object.main_text = "비밀번호를 입력하세요.";
      view_alert(modal_object, '#user_password');
      return false;
    }
    if(isEmpty(mem_password_chk)){
      modal_object.main_text = "비밀번호 확인을 입력하세요.";
      view_alert(modal_object, '#user_password_check');
      return false;
    }
  }

  if(isEmpty(mem_uuid)){
    modal_object.main_text = "고객사를 선택하세요.";
    view_alert(modal_object, '#sel_user_customer');
    return false;
  }
  if(isEmpty(mem_active)){
    modal_object.main_text = "계정의 활성화 여부를 선택하세요.";
    view_alert(modal_object, '#mem_active_1');
    return false;
  }
  if(isEmpty(mem_level)){
    modal_object.main_text = "계정의 권한을 선택하세요.";
    view_alert(modal_object, '#mem_level_1');
    return false;
  }


  // 이메일 형식 체크
  if (!validateEmail(mem_email)){
    modal_object.main_text = "올바른 이메일 형식을 입력하세요.";
    view_alert(modal_object, '#user_email');
    return false;
  }
  if(isEmpty(idx)){
    // 비밀번호 와 비밀번호 확인 체크
    if(mem_password != mem_password_chk){
      modal_object.main_text = "비밀번호 확인이 일치하지 않습니다.";
      view_alert(modal_object, '#user_password_check');
      return false;
    }
  }

  if(Number(mem_level) === 3){
    ad_list = $('#mem_admin_list').val();
    if(isEmpty(ad_list)){
      modal_object.main_text = "관리할 고객사를 선택하세요.";
      view_alert(modal_object, '#mem_admin_list');
      return false;
    }
    if (ad_list.endsWith(',')) {
      ad_list = ad_list.slice(0, -1);
  }
  }

  let resultJSON = {};
  resultJSON.mem_id = mem_id;
  resultJSON.mem_name = mem_name;
  resultJSON.mem_email = mem_email;
  resultJSON.mem_uuid = mem_uuid;
  resultJSON.mem_active = mem_active;
  resultJSON.mem_level = mem_level;
  resultJSON.ad_list = ad_list;

  if(!isEmpty(idx)){
    modal_object.type = "confirm";
    modal_object.icon = "info";
    modal_object.main_text = "사용자를 수정하시겠습니까?";
    modal_object.sub_text = "사용자 수정";
    let result = await view_modal(modal_object);
    if (!result) {return false};
    resultJSON.cmd = "update_admin_member";
    resultJSON.idx = idx;
  }else{
    resultJSON.cmd = "insert_admin_member";
    resultJSON.mem_password = mem_password;
  }

  await call_ajax(resultJSON);

  // 사용자 로드
  let page = getUrlValue('page');
  if(isEmpty(page)){
    page = 1;
  }

  param = {};
  param.page = Number(page);
  param.cmd = "load_user_table_data";
  await call_ajax(param,  false);

  draw_user_table(g_user_table_data);

});

// 사용자 테이블 클릭시
$(document).on('click', '.btn-sel-user', async function(){
  let idx = $(this).data('idx');

  let tempJSON = g_user_table_data.table_data;
  tempJSON = tempJSON.filter((items) => {
    return Number(idx) === Number(items.idx);
  });
  tempJSON = tempJSON[0];

  $('#mem_password').css('display', 'none');
  $('#mem_id').prop('disabled', true);
  $('#mem_password_check').css('display', 'none');

  $('#btn_del_user').css('display', 'block');
  $('#user_refresh').css('display', 'block');
  $('#btn_admin_user_insert').text('사용자 수정');


  $('#mem_name').val(tempJSON.mem_name);
  $('#mem_id').val(tempJSON.mem_id);
  $('#mem_email').val(tempJSON.mem_email);
  if(isEmpty(tempJSON.mem_uuid)){
    $('#sel_user_customer').val('');
  }else{
    $('#sel_user_customer').val(tempJSON.mem_uuid);
  }
  $(`input[name="mem_active"][value="${tempJSON.mem_active}"]`).prop('checked', true);
  $(`input[name="mem_level"][value="${tempJSON.mem_level}"]`).prop('checked', true);
  $('#idx').val(idx);

  if(Number(tempJSON.mem_level) === 3){
    $('#ad_sel_div').removeClass('display-none');
    let ad_list = tempJSON.ad_list;
    $('#mem_admin_list').val(ad_list + ',');
    ad_list = ad_list.split(',');
    for(let i = 0; i < ad_list.length; i++){
      $(`input[name="sel_ad_list"][value="${ad_list[i]}"]`).prop('checked', true);
    }
   
  }else{
    $('#ad_sel_div').addClass('display-none');
    $('#mem_admin_list').val('');
    $('.sel-ad-list').prop('checked', false);
  }
});

// 사용자 추가 새로고침 버튼 클릭시
$(document).on('click', '#user_refresh', async function(){
  $('#idx').val("");
  $('#mem_name').val("");
  $('#mem_id').val("");
  $('#mem_email').val("");
  $('#mem_password').val("");
  $('#mem_password_check').val("");
  $('#sel_user_customer').val("");
  $('input[type="radio"]').prop('checked', false);

  $('#mem_id').prop('disabled', false);
  $('#mem_password').css('display', 'block');
  $('#mem_password_check').css('display', 'block');
  $('#btn_del_user').css('display', 'none');
  $('#user_refresh').css('display', 'none');
  $('#btn_admin_user_insert').text('사용자 추가');
  $('#ad_sel_div').addClass('display-none');
  $('#mem_admin_list').val('');
  $('.sel-ad-list').prop('checked', false);
});

// 사용자 삭제시
$(document).on('click', '#btn_del_user', async function(){
  modal_object.type = "confirm";
  modal_object.icon = "info";
  modal_object.main_text = "사용자를 삭제하시겠습니까?";
  modal_object.sub_text = "사용자 삭제";
  let result = await view_modal(modal_object);
  if (!result) {return false};
  let idx = $("#idx").val();
  await delete_data(idx, 'member');

  // 사용자 로드
  let page = getUrlValue('page');
  if(isEmpty(page)){
    page = 1;
  }

  param = {};
  param.page = Number(page);
  param.cmd = "load_user_table_data";
  await call_ajax(param,  false);

  draw_user_table(g_user_table_data);
  $('#user_refresh').trigger('click');
});

// 고객사 게시판 메인 페이지
$(document).on('click', '#btn_write_notice', async function(){
  let uuid = getUrlValue('cs_uuid');
  gotoPage(`write_notice.html?cs_uuid=${uuid}`, '');
});

/**======================== 게시판 작성시 =============================*/
// 파일 첨부
// 메인배너 파일 관리
$(document).on('change', '#n_file', function(){
  let attFileCnt = $('#file_area li').length;    // 기존 추가된 첨부파일 개수
  let remainFileCnt = FILE_COUNT - attFileCnt;    // 추가로 첨부가능한 개수
  let curFileCnt = $(this)[0].files.length;  // 현재 선택된 첨부파일 개수
  let fileNo = 0;
  let files = $(this)[0].files;

  // 첨부파일 개수 확인
  if (curFileCnt > remainFileCnt) {
    alert("메인파일은 최대 " + FILE_COUNT + "개 까지 첨부 가능합니다.");
    return;
  } else {
    for (const file of files) {
      let bExists = false;
      if (!isEmpty(main_files)){
        main_files.some(function(items, index){
          if (items == file.name){
            bExists = true;
            return true;
          }
        });
      }
      if (!bExists){
        // 첨부파일 검증
        if (validation(file)) {
            // 파일 배열에 담기
            var reader = new FileReader();
            reader.onload = function () {
              main_files.push(file);
            };
            reader.readAsDataURL(file);
            main_result_file.push(file.name);
            // 목록 추가
            let htmlData = `
            <li class="file-li" id="main_${fileNo}">
              <p class="file-p">${file.name}</p>
              <button class="file-btn btn_main_del"
              data-idx="${fileNo}" data-file_name="${file.name}">
              <i class='bx bx-x'></i></button>
             </li>`;

            $('#file_area').append(htmlData);
            fileNo++;
        } else {
            continue;
        }
      }
    }
  }
});

// 첨부 파일 삭제
$(document).on('click', '.btn_main_del', function(){
  let idx = $(this).data('idx');
  let name = $(this).data('file_name');
  $(`#main_${idx}`).remove();

  if(main_files.length != 0){
    main_files[idx].is_delete = true;
  }
  if(!isEmpty(name)){
    delete_main_data.push(name);
    main_result_file = main_result_file.filter((item) => {
      return item != name;
    });
  }
});

// 게시파 작성
$(document).on('click', '#btn_insert_notice', async function(){
  // 수정인지 작성인지
  let idx = getUrlValue('idx');

  let uuid = getUrlValue('cs_uuid');
  let title = $('#n_title').val();
  let content = editor2.getData();

  modal_object.icon = "error";
  if(isEmpty(title)){
    modal_object.main_text = "제목을 입력하세요.";
    view_alert(modal_object, '#n_title');
    return false;
  }
  if(isEmpty(content)){
    modal_object.main_text = "내용을 입력하세요.";
    view_alert(modal_object, '#editor');
    return false;
  }

  let real_url = `notice_file/${uuid}`;
  let temp_url = `tempUpload`;

  let imageFileNames = getImageFileNames(content);
  let editor_file_name = [];
  if(!isEmpty(imageFileNames) || imageFileNames.length != 0){
    $.each(imageFileNames, function(key, items){
      if (!items.includes(real_url)) {
        let tempResult = items.split('/').pop();
        editor_file_name.push(tempResult);
      }
    });
  }
  if(editor_file_name.length === 0){
    editor_file_name = "";
  }else{
    editor_file_name = editor_file_name.join(',');
  }
  if (content.includes(real_url)) {
    content = content.replaceAll(real_url, temp_url);
  }

  let formData = new FormData();
  for (var i = 0; i < main_files.length; i++) {
    // 삭제되지 않은 파일만 폼데이터에 담기
    if (!main_files[i].is_delete) {
      formData.append(`main_files[]`, main_files[i]);
    }
  }

  if(main_result_file.length === 0){
    main_result_file = "";
  }
  formData.append("title", urlencode(title));
  formData.append("uuid", uuid);
  formData.append("content", urlencode(content));
  formData.append("editor_file_name", editor_file_name);
  formData.append("main_result_file", main_result_file);
  formData.append("writer", g_login.mem_name);
  if(isEmpty(idx)){
    formData.append("cmd", 'insert_notice');
  }else{
    formData.append("cmd", 'update_notice');
    formData.append("idx", idx);
  }

  headers = {};
  headers.Authorization = "Bearer " + g_access_token;
  await xhr_multipart("server/api_main.php", formData, "", "", true);
});

// 게시판 보기 페이지 이동
$(document).on('click', '.btn-sel-notice', function(){
  let idx = $(this).data('idx');
  let uuid = getUrlValue('cs_uuid');
  let page = getUrlValue('page');
  let search = getUrlValue('search');
  if(isEmpty(page)){
    page = 1;
  }
  let url = `notice_view.html?idx=${idx}&cs_uuid=${uuid}&page=${page}`;
  if(!isEmpty(search)){
    url = url + `&search=${search}`;
  }
  gotoPage(url, '');
});

// 목록버튼 클릭 시
$(document).on('click', '#btn_back', function(){
  let uuid = getUrlValue('cs_uuid');
  let page = getUrlValue('page');
  let search = getUrlValue('search');
  let url = `index.html?cs_uuid=${uuid}&page=${page}`;
  if(!isEmpty(search)){
    url = url + `&search=${search}`;
  }
  gotoPage(url);
});

// 수정버튼 클릭 시
$(document).on('click', '#btn_go_upPage', function(){
  let uuid = getUrlValue('cs_uuid');
  let idx = getUrlValue('idx');

  gotoPage(`write_notice.html?cs_uuid=${uuid}&idx=${idx}`);
});

// 댓글관련
// 댓글 등록
$(document).on('click', '#insert_re', async function(){
  let content = $('#reple').val();
  let idx = getUrlValue('idx');
  let uuid = getUrlValue('cs_uuid');

  let sendJSON = {};
  sendJSON.content = content;
  sendJSON.parent_idx = idx;
  sendJSON.uuid = uuid;
  sendJSON.writer = g_login.mem_name;
  sendJSON.writer_id = g_login.mem_id;
  sendJSON.cmd = 'insert_reple';
  await call_ajax(sendJSON);

  sendJSON = {};
  sendJSON.idx = idx;
  sendJSON.uuid = uuid;
  sendJSON.cmd = "load_reple";
  await call_ajax(sendJSON,  false);
  draw_reple(g_reple_data);

  $('#reple').empty('');
});

// 댓글 수정창
$(document).on('click', '.btn_re_update_mode', function(){
  let idx = $(this).data('idx');
  $(`#update_box_${idx}`).removeClass('display-none');
  $(`#re_content_${idx}`).css('display', 'none');
});
// 댓글 수정창 닫기
$(document).on('click', '.update_close', function(){
  let idx = $(this).data('idx');
  $(`#update_box_${idx}`).addClass('display-none');
  $(`#re_content_${idx}`).css('display', 'block');
});

// 댓글 수정
$(document).on('click', '.btn_update_re', async function(){
  modal_object.type = "confirm";
  modal_object.icon = "info";
  modal_object.main_text = "댓글을 수정 하시겠습니까?";
  modal_object.sub_text = "댓글 수정";
  let result = await view_modal(modal_object);
  if (!result) {return false};

  let idx = $(this).data('idx');
  let parent_idx = getUrlValue('idx');
  let uuid = getUrlValue('cs_uuid');
  let content = $(`#reple_${idx}`).val();

  let sendJSON = {};
  sendJSON.content = content;
  sendJSON.parent_idx = parent_idx;
  sendJSON.uuid = uuid;
  sendJSON.idx = idx;
  sendJSON.cmd = 'update_reple';
  await call_ajax(sendJSON);
  
  sendJSON = {};
  sendJSON.idx = parent_idx;
  sendJSON.uuid = uuid;
  sendJSON.cmd = "load_reple";
  await call_ajax(sendJSON,  false);
  draw_reple(g_reple_data);
});

// 댓글 삭제
$(document).on('click', '.btn_re_del', async function(){
  modal_object.type = "confirm";
  modal_object.icon = "info";
  modal_object.main_text = "댓글을 삭제 하시겠습니까?";
  modal_object.sub_text = "댓글 삭제";
  let result = await view_modal(modal_object);
  if (!result) {return false};

  let idx = $(this).data('idx');
  let parent_idx = getUrlValue('idx');
  let uuid = getUrlValue('cs_uuid');
  await delete_data(idx, 'reple_data');

  let sendJSON = {};
  sendJSON.idx = parent_idx;
  sendJSON.uuid = uuid;
  sendJSON.cmd = "load_reple";
  await call_ajax(sendJSON,  false);
  draw_reple(g_reple_data);
});

// 게시판 검색 시
$(document).on('keydown', '#search_notice', function(e){
  if (e.key === "Enter" || e.keyCode === 13) {
    let uuid = getUrlValue('cs_uuid');
    let page = getUrlValue('page');
    let search = $('#search_notice').val();
    let url = `index.html?cs_uuid=${uuid}`;
    if(!isEmpty(page)){
      url = url + `&page=${page}`;
    }
    if(!isEmpty(search)){
      url = url + `&search=${search}`;
    }
    gotoPage(url, '');
  }
});


// 메인 고객사 게시판 리스트 체크 시
$(document).on('change', '#main_all_check', function(){
  let boolean = this.checked;
  if(boolean){
    $(`input[name='main_content_chk']`).prop('checked', true);
  }else{
    $(`input[name='main_content_chk']`).prop('checked', false);
  }
});

$(document).on('change', '.main_notice_chk', function(){
  let boolean = this.checked;
  let list_active = true;
  if(boolean){
    $('.main_notice_chk').each(function() {
      var isChecked = $(this).prop('checked');
      if (!isChecked) {
        list_active = false;
      }
    });
    if(list_active){
      $(`input[name='main_all_check']`).prop('checked', true);
    }
  }else{
    $(`input[name='main_all_check']`).prop('checked', false);
  }
});

// 메인 고객사 게시판 선택 삭제
$(document).on('click', '#btn_check_del_main', async function(){
  modal_object.type = "confirm";
  modal_object.icon = "info";
  modal_object.main_text = "선택된 내용을 삭제하시겠습니까?";
  modal_object.sub_text = "게시판 선택 삭제";
  let result = await view_modal(modal_object);
  if (!result) {return false};
  let uuid = getUrlValue('cs_uuid');
  let page = getUrlValue('page');
  if(isEmpty(page)){
    page = 1;
  }

  let idx_arr = [];
  $('.main_notice_chk').each(function() {
    var isChecked = $(this).prop('checked');
    if (isChecked) {
        var idx = $(this).val();
        if(!isEmpty(idx)){
          idx_arr.push(idx)
        }
    }
  });

  if(idx_arr.length === 0){
    modal_object.icon = "error";
    modal_object.main_text = "선택된 내용이 없습니다.";
    view_alert(modal_object);
    return false;
  }else{
    for(let i = 0; i < idx_arr.length; i++){
      await delete_data(idx_arr[i], 'notice_list');
    }
  }
  param = {};
  param.cmd = "load_notice";
  param.uuid = uuid;
  param.page = page;
  await call_ajax(param,  false);
  draw_notice_table(g_notice_data);
});

// 메인게시판 개별 삭제 시
$(document).on('click', '#btn_del_notice', async function(){
  modal_object.type = "confirm";
  modal_object.icon = "info";
  modal_object.main_text = "게시판 내용을 삭제하시겠습니까?";
  modal_object.sub_text = "게시판 삭제";
  let result = await view_modal(modal_object);
  if (!result) {return false};
  let uuid = getUrlValue('cs_uuid');
  let page = getUrlValue('page');
  let idx = getUrlValue('idx');
  if(isEmpty(page)){
    page = 1;
  }

  await delete_data(idx, 'notice_list');

  setTimeout(function() {
    gotoPage(`index.html?idx=${idx}&cs_uuid=${uuid}&page=${page}`, '');
  }, 1000);
});

// 고객사 리스트 체크 관련
$(document).on('change', '#cus_all_check', function(){
  let boolean = this.checked;
  if(boolean){
    $(`input[name='cus_content_chk']`).prop('checked', true);
  }else{
    $(`input[name='cus_content_chk']`).prop('checked', false);
  }
});

$(document).on('change', '.cus_notice_chk', function(){
  let boolean = this.checked;
  let list_active = true;
  if(boolean){
    $('.cus_notice_chk').each(function() {
      var isChecked = $(this).prop('checked');
      if (!isChecked) {
        list_active = false;
      }
    });
    if(list_active){
      $(`input[name='cus_all_check']`).prop('checked', true);
    }
  }else{
    $(`input[name='cus_all_check']`).prop('checked', false);
  }
});

// 고객사 리스트 선택 삭제
$(document).on('click', '#btn_check_del_cus', async function(){
  modal_object.type = "confirm";
  modal_object.icon = "info";
  modal_object.main_text = "선택된 고객사를 삭제하시겠습니까?";
  modal_object.sub_text = "고객사 선택 삭제";
  let result = await view_modal(modal_object);
  if (!result) {return false};
  let page = getUrlValue('page');
  if(isEmpty(page)){
    page = 1;
  }

  let idx_arr = [];
  $('.cus_notice_chk').each(function() {
    var isChecked = $(this).prop('checked');
    if (isChecked) {
        var idx = $(this).val();
        if(!isEmpty(idx)){
          idx_arr.push(idx)
        }
    }
  });

  if(idx_arr.length === 0){
    modal_object.icon = "error";
    modal_object.main_text = "선택된 내용이 없습니다.";
    view_alert(modal_object);
    return false;
  }else{
    for(let i = 0; i < idx_arr.length; i++){
      await delete_data(idx_arr[i], 'customer_list');
    }
  }
  param = {};
  param.cmd = "load_customer_table_data";
  param.page = Number(page);
  await call_ajax(param,  false);
  draw_customer_table(g_customer_table_data);
  $('#customer_refresh').trigger('click');
});

// 사용자 리스트 체크 관련
$(document).on('change', '#user_all_check', function(){
  let boolean = this.checked;
  if(boolean){
    $(`input[name='user_content_chk']`).prop('checked', true);
  }else{
    $(`input[name='user_content_chk']`).prop('checked', false);
  }
});

$(document).on('change', '.user_notice_chk', function(){
  let boolean = this.checked;
  let list_active = true;
  if(boolean){
    $('.user_notice_chk').each(function() {
      var isChecked = $(this).prop('checked');
      if (!isChecked) {
        list_active = false;
      }
    });
    if(list_active){
      $(`input[name='user_all_check']`).prop('checked', true);
    }
  }else{
    $(`input[name='user_all_check']`).prop('checked', false);
  }
});

// 사용자 리스트 선택 삭제
$(document).on('click', '#btn_check_del_user', async function(){
  modal_object.type = "confirm";
  modal_object.icon = "info";
  modal_object.main_text = "선택된 사용자를 삭제하시겠습니까?";
  modal_object.sub_text = "사용자 선택 삭제";
  let result = await view_modal(modal_object);
  if (!result) {return false};
  let page = getUrlValue('page');
  if(isEmpty(page)){
    page = 1;
  }

  let idx_arr = [];
  $('.user_notice_chk').each(function() {
    var isChecked = $(this).prop('checked');
    if (isChecked) {
        var idx = $(this).val();
        if(!isEmpty(idx)){
          idx_arr.push(idx)
        }
    }
  });

  if(idx_arr.length === 0){
    modal_object.icon = "error";
    modal_object.main_text = "선택된 내용이 없습니다.";
    view_alert(modal_object);
    return false;
  }else{
    for(let i = 0; i < idx_arr.length; i++){
      await delete_data(idx_arr[i], 'member');
    }
  }
  param = {};
  param.cmd = "load_user_table_data";
  param.page = Number(page);
  await call_ajax(param,  false);
  draw_user_table(g_user_table_data);
  $('#user_refresh').trigger('click');
});