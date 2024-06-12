// 회원가입팝업 버튼 클릭시
$(document).on('click', '#btn_sign_popup', function(){


  popupObj.title = "가입신청";
  popupObj.subtitle = "";
  popupObj.contentHtml = PagesContent.sign_in_modal;
  popupObj.focusid = getID('mem_id');
  popupObj.orgfocusid = getID('mem_id');
  popupObj.width = 600;
  popupObj.showfs = false;
  popupObj.showclose = true;

  showPopup(popupObj);
});

// 회원가입팝업 버튼 클릭시
$(document).on('click', '#btn_sign_admin_popup', function(){
  popupObj.title = "회원추가";
  popupObj.subtitle = "";
  popupObj.contentHtml = PagesContent.sign_in_modal;
  popupObj.focusid = getID('mem_id');
  popupObj.orgfocusid = getID('mem_id');
  popupObj.width = 600;
  popupObj.showfs = false;
  popupObj.showclose = true;

  showPopup(popupObj);
  $('#member_admin_view').css('display', 'block');
});

// 회원 테이블 클릭시 수정 팝업
$(document).on('click', '.btn_update_member', function(){
  let idx = $(this).parent().data('idx');
  let tempJSON = g_member_list.filter((items) => {
    return Number(items.idx) === Number(idx);
  });
  tempJSON = tempJSON[0];
  popupObj.title = "회원정보 수정";
  popupObj.subtitle = "";
  popupObj.contentHtml = PagesContent.sign_in_modal;
  popupObj.focusid = getID('mem_id');
  popupObj.orgfocusid = getID('mem_id');
  popupObj.width = 600;
  popupObj.showfs = false;
  popupObj.showclose = true;

  showPopup(popupObj);

  $('#member_admin_view').css('display', 'block');
  $('#btn_regen_pw_popup').css('display', 'inline-block');
  $('#btn_del_member').css('display', 'inline-block');
  $('#pw_div').css('display', 'none');
  $('#pw_div_2').css('display', 'none');
  $('.update-none').css('display', 'none');
  $('#idx').val(idx);
  $('#mem_id').val(tempJSON.mem_id);
  $('#mem_name').val(tempJSON.mem_name);
  $('#customer_name_val').val(tempJSON.customer_name);
  $(`input[name="chk_member_active"][value=${tempJSON.member_active}]`).prop('checked', true);
  $('#btn_sign_in').text('수정');
});

// 비밀번호 재발행 팝업 클릭시
$(document).on('click', '#btn_regen_pw_popup', function(){
  // alert('준비중입니다.');
  let idx = $('#idx').val();

  popupObj.title = "비밀번호 재발행";
  popupObj.subtitle = "";
  popupObj.contentHtml = PagesContent.regen_pw;
  popupObj.focusid = getID('mem_email');
  popupObj.orgfocusid = getID('mem_email');
  popupObj.width = 600;
  popupObj.showfs = false;
  popupObj.showclose = true;
  showPopup(popupObj);
  $('#idx').val(idx);
});

// 멤버삭제 클릭 시
$(document).on('click', '#btn_del_member', async function(){
  let bconfirm = false;
  await greenModal({
    type: "confirm",
    messageText: '회원정보를 삭제하시겠습니까?',
    headerText : '회원정보 삭제',
    alertType: "info"
  }).done(function (event) {
    bconfirm = event;
    return true;
  });
  if (!bconfirm) {return false};

  let idx = $('#idx').val();

  await delete_data(idx, 'webzine_member');
  $('#btn_modal_close').trigger('click');
  let param = {};
  param.cmd = "load_member";
  param.tbl_name = "webzine_member";
  await call_ajax(param,  true);
  draw_member_list(g_member_list);
});

// 멤버 선택삭제 클릭 시
$(document).on('click', '#btn_check_del_member', async function(){
  let bconfirm = false;
  await greenModal({
    type: "confirm",
    messageText: '선택한 회원정보를 삭제하시겠습니까?',
    headerText : '회원정보 삭제',
    alertType: "info"
  }).done(function (event) {
    bconfirm = event;
    return true;
  });
  if (!bconfirm) {return false};

  let member_idx_arr = [];
  $('.dt-checkboxes').each(function(){
    var isChecked = $(this).prop('checked');
    if (isChecked) {
        var idx = $(this).closest('tr').data('idx');
        if(!isEmpty(idx)){
          member_idx_arr.push(idx)
        }
    }
  });
  if(member_idx_arr.length === 0){
    msgboxObj.message = '선택된 항목이 없습니다.';
    showiziModal(msgboxObj, getID('btn_check_del_member'));
    return false;
  }
  for(let i = 0; i < member_idx_arr.length; i++){
    await delete_data(member_idx_arr[i], 'webzine_member');
  }
  let param = {};
  param.cmd = "load_member";
  param.tbl_name = "webzine_member";
  await call_ajax(param,  true);
  draw_member_list(g_member_list);
});

// 고객사 선택삭제 클릭 시
$(document).on('click', '#btn_check_del_customer', async function(){
  let bconfirm = false;
  await greenModal({
    type: "confirm",
    messageText: '선택한 고객사 정보를 삭제하시겠습니까?',
    headerText : '고객사 정보 삭제',
    alertType: "info"
  }).done(function (event) {
    bconfirm = event;
    return true;
  });
  if (!bconfirm) {return false};

  let member_idx_arr = [];
  $('.dt-checkboxes').each(function(){
    var isChecked = $(this).prop('checked');
    if (isChecked) {
        var idx = $(this).closest('tr').data('idx');
        if(!isEmpty(idx)){
          member_idx_arr.push(idx)
        }
    }
  });
  if(member_idx_arr.length === 0){
    msgboxObj.message = '선택된 항목이 없습니다.';
    showiziModal(msgboxObj, getID('btn_check_del_member'));
    return false;
  }
  for(let i = 0; i < member_idx_arr.length; i++){
    await delete_data(member_idx_arr[i], 'customer');
  }
  let param = {};
  param.cmd = "load_customer";
  param.tbl_name = "customer";
  await call_ajax(param,  true);
  draw_customer_list(g_customer_list);
});

// 비밀번호 재발행 클릭시
$(document).on('click', '#btn_regen_pw', async function(){
  let bconfirm = false;
  await greenModal({
    type: "confirm",
    messageText: '해당 아이디의 비밀번호를 재발행 하시겠습니까?',
    headerText : '비밀번호 재발행',
    alertType: "info"
  }).done(function (event) {
    bconfirm = event;
    return true;
  });
  if (!bconfirm) {return false};
  let idx = $('#idx').val();
  let tempJSON = json_filter_json(g_member_list, idx, 'idx');
  let email = $('#mem_email').val();

  if(isEmpty(email)){
    msgboxObj.message = '이메일을 입력하세요.';
    showiziModal(msgboxObj, getID('mem_email'));
    return false;
  }

  /* 이메일 정합성 체크 */
  if (!validateEmail(email)){
    msgboxObj.message = '올바른 이메일 형식으로 작성해주세요.';
    showiziModal(msgboxObj, getID('mem_email'));
    return true;
  }

  let sendJSON = {};
  sendJSON.idx = idx;
  sendJSON.mem_id = tempJSON.mem_id;
  sendJSON.mem_email = email;
  sendJSON.cmd = "regen_password";

  console.log(sendJSON);

  await call_ajax(sendJSON);
});

// 회원가입 버튼 클릭시
$(document).on('click', '#btn_sign_in', async function(){
  let idx = $('#idx').val();
  let mem_id = $('#mem_id').val();
  let mem_password_check = $('#mem_password_check').val();
  let mem_password = $('#mem_password').val();
  let mem_name = $('#mem_name').val();
  let customer_name = $("#customer_name_val").val();
  let member_active = $("input[name='chk_member_active']:checked").val();


  if(isEmpty(mem_id)){
    msgboxObj.message = '아이디를 입력하세요.';
    showiziModal(msgboxObj, getID('mem_id'));
    return false;
  }
  if(isEmpty(idx)){
    if(isEmpty(mem_password)){
      msgboxObj.message = '비밀번호를 입력하세요.';
      showiziModal(msgboxObj, getID('mem_password'));
      return false;
    }
    if(isEmpty(mem_password_check)){
      msgboxObj.message = '비밀번호확인을 입력하세요.';
      showiziModal(msgboxObj, getID('mem_password_check'));
      return false;
    }
    if(mem_password != mem_password_check){
      msgboxObj.message = '비밀번호와 비밀번호 확인이 일치하지 않습니다.';
      showiziModal(msgboxObj, getID('mem_password_check'));
      return false;
    }
  }

  if(isEmpty(mem_name)){
    msgboxObj.message = '이름을 입력하세요.';
    showiziModal(msgboxObj, getID('mem_name'));
    return false;
  }
  if(isEmpty(customer_name)){
    msgboxObj.message = '회사명을 입력하세요.';
    showiziModal(msgboxObj, getID('customer_name_val'));
    return false;
  }

  let bconfirm = false;
  await greenModal({
    type: "confirm",
    messageText: '회원가입을 진행하시겠습니까?',
    headerText : '회원가입',
    alertType: "info"
  }).done(function (event) {
    bconfirm = event;
    return true;
  });
  if (!bconfirm) {return false};

  

  // 고객사를 먼저 추가
  let param = {};
  param.name = customer_name;
  param.cmd = 'insert_customer_sign';
  await call_ajax(param);


  param = {};

  param.mem_id = mem_id;
  param.mem_name = mem_name;
  param.member_active = member_active;
  param.customer_idx = sign_customer_info.idx;
  param.customer_name = sign_customer_info.name;
  param.uuid = sign_customer_info.uuid;
  if(isEmpty(idx)){
    param.mem_password = mem_password;
    param.cmd = "insert_member";
  }else{
    param.idx = idx;
    param.cmd = "update_member";
  }


  await call_ajax(param);


  if(Number(g_login.level) === 5){
    param = {};
    param.cmd = "load_member";
    param.tbl_name = "webzine_member";
    await call_ajax(param,  true);
    draw_member_list(g_member_list);
  }
});

// 로그인
// 엔터키를 누르면 자동으로 로그인이 되도록 처리해야 함.
$(document).on('click', '#btn_login', function(){
   
  var user_id = TrimData(rtnIDString('user_id'));
  var user_password = TrimData(rtnIDString('user_pw'));

  if (isEmptyToFocus(user_id, "아이디를 입력하세요.",
          rtnIDString('user_id'), 0)) {  return false }
  if (isEmptyToFocus(user_password, "비밀번호를 입력하세요.", 
          rtnIDString('user_pw'), 0)) { return false }

  login(user_id, user_password);
});

// Enter 인터페이스 처리
$(document).on('keydown', '#user_id', function(event){
  var keyCode = (event.keyCode ? event.keyCode : event.which);   
  if (keyCode == 13) {
      $('#btn_login').trigger('click');
      return;
  }
}); 

$(document).on('keydown', '#user_pw', function(event){
  var keyCode = (event.keyCode ? event.keyCode : event.which);   
  if (keyCode == 13) {
      $('#btn_login').trigger('click');
      return;
  }
}); 

// 기본정보 관리 페이지 버큰 클릭시
$(document).on('click', '#btn_customer_page', function(){
  let page = $(this).data('page');
  view_page(page);
});

// 회원관리 버튼 클릭시
$(document).on('click', '#btn_member_page', function(){
  let page = $(this).data('page');
  view_page(page);
});

// 로그아웃
$(document).on('click', '#btn_logout', async function(){
  let bconfirm = false;
  await greenModal({
    type: "confirm",
    messageText: '로그아웃을 하시겠습니까?',
    headerText : '로그아웃',
    alertType: "info"
  }).done(function (event) {
    bconfirm = event;
    return true;
  });
  if (!bconfirm) {return false};

  param = {};
  param.cmd = "logout";

  call_ajax(param,  false);
  g_login = {};
});

// 고객사명 클릭시 메인화면 이동
$(document).on('click', '#customer_name', function(){
  view_page("index")
});

// 메뉴 버튼 클릭 시 액티브
$(document).on('click', '.nav-link', function(){
  $('.nav-link').removeClass('active');
  $(this).addClass('active');
});
// 관리자 홈버튼 클릭 시
$(document).on('click', '#btn_admin', function(){
  view_page('index');
}); 

// 고객사 추가하기 클릭 시
// 웹진 메인 작성하기 클릭시
$(document).on('click', '#btn_write_customer', async function(){
  popupObj.title = "고객사 추가";
  popupObj.subtitle = "";
  popupObj.contentHtml = PagesContent.customer_write;
  popupObj.focusid = getID('mem_id');
  popupObj.orgfocusid = getID('mem_id');
  popupObj.width = 600;
  popupObj.showfs = false;
  popupObj.showclose = true;

  showPopup(popupObj);
});

// 고객사 수정 클릭 시
// 웹진 메인 작성하기 클릭시
$(document).on('click', '.btn_update_customer', async function(){
  let idx = $(this).parent().data('idx');
  popupObj.title = "고객사 수정";
  popupObj.subtitle = "";
  popupObj.contentHtml = PagesContent.customer_write;
  popupObj.focusid = getID('mem_id');
  popupObj.orgfocusid = getID('mem_id');
  popupObj.width = 600;
  popupObj.showfs = false;
  popupObj.showclose = true;

  showPopup(popupObj);


  $('#idx').val(idx);
  let tempJSON = json_filter_json(g_customer_list, idx, 'idx');
  $('#webzine_customer_name').val(tempJSON.name);
  $('#btn_insert_webzine_customer').text('수정');
  $('#btn_del_webzine_customer').css('display', 'inline-block');
});

// 고객사 삭제 버튼 클릭 시
$(document).on('click', '#btn_del_webzine_customer', async function(){
  let bconfirm = false;
  await greenModal({
    type: "confirm",
    messageText: '고객사를 삭제하시겠습니까?',
    headerText : '고객사 삭제',
    alertType: "info"
  }).done(function (event) {
    bconfirm = event;
    return true;
  });
  if (!bconfirm) {return false};

  let idx = $('#idx').val();
  await delete_data(idx, 'customer'); 
  $('#btn_modal_close').trigger('click');
  let param = {};
  param.cmd = "load_customer";
  param.tbl_name = "customer";
  await call_ajax(param,  true);

  draw_customer_list(g_customer_list);
});

// 고객사 등록 시
$(document).on('click', '#btn_insert_webzine_customer', async function(){
  let idx = $('#idx').val();

  let customer_name = $('#webzine_customer_name').val();

  if(isEmpty(customer_name)){
    msgboxObj.message = '고객사명을 입력하세요.';
    showiziModal(msgboxObj, getID('webzine_customer_name'));
    return false;
  }

  let param = {};
  param.name = customer_name;
  if(!isEmpty(idx)){
    param.idx = idx;
    param.cmd = "update_customer_name";
  }else{
    param.cmd = "insert_customer_name";
  }
  await call_ajax(param,  true);

  $('#offcanvas').removeClass('show');
  $('.offcanvas-backdrop').remove();


  param = {};
  param.cmd = "load_customer";
  param.tbl_name = "customer";
  await call_ajax(param,  true);

  draw_customer_list(g_customer_list);
});

// 웹진 옵션설정하기 버튼 클릭 시
$(document).on('click', '#btn_option_write_page', function(){
  $('#content_body').html(PagesContent.write_option_page);
  $('#menu_color').spectrum();
  swiper = new Swiper(".mySwiper", {
    cssMode: true,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
      renderBullet: function (index, className) {
        return '<span class="' + className + '">' + (index + 1) + "</span>";
      },
    },
    mousewheel: true,
    keyboard: true,
    allowSlideNext: false
  });
});

// 헤더넓이 설정 시 직접입력일때 아닐때
$(document).on('change', 'input[name="chk_header_width"]', function(){
  let value = $(this).val();
  if(value != "100%"){
    $('#header_width').prop('disabled', false);
  }else{
    $('#header_width').prop('disabled', true);
  }
});

// 헤더 로고 체크 시 직접입력 여부
$(document).on('change', 'input[name="chk_logo_link"]', function(){
  let value = $(this).val();
  if(Number(value) === 2){
    $('#logo_link').prop('disabled', false);
  }else{
    $('#logo_link').prop('disabled', true);
  }
});

// 하단 로고 체크 시 직접입력 여부
$(document).on('change', 'input[name="chk_f_logo_link"]', function(){
  let value = $(this).val();
  if(Number(value) === 2){
    $('#f_logo_link').prop('disabled', false);
  }else{
    $('#f_logo_link').prop('disabled', true);
  }
});

// 메인넓이 설정 시 직접입력일때 아닐때
$(document).on('change', 'input[name="chk_main_width"]', function(){
  let value = $(this).val();
  if(value != "100%"){
    $('#main_width').prop('disabled', false);
  }else{
    $('#main_width').prop('disabled', true);
  }
});

// 하단넓이 설정 시 직접입력일때 아닐때
$(document).on('change', 'input[name="chk_footer_width"]', function(){
  let value = $(this).val();
  if(value != "100%"){
    $('#footer_width').prop('disabled', false);
  }else{
    $('#footer_width').prop('disabled', true);
  }
});

// 검색기능 사용 및 미사용 체크 시
$(document).on('change', 'input[name="chk_search_active"]', function(){
  let value = $(this).val();
  if(Number(value) === 1){
    $('input[name="chk_search_tem"]').prop('disabled', false);
    $('input[name="chk_search_position"]').prop('disabled', false);
  }else{
    $('input[name="chk_search_tem"]').prop('disabled', true);
    $('input[name="chk_search_position"]').prop('disabled', true);
  }
});

$(document).on('click', '.btn_sub_ca_view', function(){
  let idx = $(this).data('idx');
  g_main_category_idx = idx;
  $(`#sub_category_area_${idx}`).toggleClass('active');
});

// 웹진 옵션 작성시 슬라이드 다음 및 이전 버튼 클릭 시
$(document).on('click', '#btn_slide_next', function(){
  let slideIndex = swiper.activeIndex;

  if(Number(slideIndex) === 0){
    let header_style = $('input[name="chk_header_style"]:checked').val();
    let header_width = $('input[name="chk_header_width"]:checked').val();
    let header_height = $('#header_height').val();
    let header_logo = $('#header_logo')[0].files[0];
    let logo_link = $('input[name="chk_logo_link"]:checked').val();
    let logo_width = $('#header_logo_width').val();
    let logo_position = $('input[name="chk_logo_position"]:checked').val();
    let search_active = $('input[name="chk_search_active"]:checked').val();
    let search_tem = $('input[name="chk_search_tem"]:checked').val();
    let search_position = $('input[name="chk_search_position"]:checked').val();
    let menu_position = $('input[name="chk_menu_position"]:checked').val();
    let menu_color = $('#menu_color').val();
    let menu_font_size = $('#menu_font_size').val();
    let menu_font_weight = $('input[name="chk_menu_weight"]:checked').val();
    if (isEmptyToFocus(header_style, "헤더 스타일을 선택하세요.",rtnIDString('chk_header_style_1'), 0)){return false}
    if (isEmptyToFocus(header_width, "헤더 넓이를 선택하세요.",rtnIDString('chk_header_width_1'), 0)){return false}
    if(String(header_width) != "100%"){
      let header_write_width = $('#header_width').val();
      if (isEmptyToFocus(header_write_width, "헤더 넓이를 입력하세요.",rtnIDString('header_width'), 0)){return false}
    }
    if (isEmptyToFocus(header_height, "헤더 높이를 입력하세요.",rtnIDString('header_height'), 0)){return false}
    if(header_logo === undefined){
      if(isEmpty(h_logo)){
        if (isEmptyToFocus(header_logo, "헤더 로고를 삽입하세요.",rtnIDString('header_logo'), 0)){return false}
      }
    }
    if (isEmptyToFocus(logo_link, "로고의 링크를 선택하세요.",rtnIDString('chk_logo_link_1'), 0)){return false}
    if(Number(logo_link) === 2){
      let logo_link_write = $('#logo_link').val();
      if (isEmptyToFocus(logo_link_write, "로고의 링크를 입력하세요.",rtnIDString('logo_link'), 0)){return false}
    }
    if (isEmptyToFocus(logo_width, "로고의 넓이를 입력하세요.",rtnIDString('header_logo_width'), 0)){return false}
    if (isEmptyToFocus(logo_position, "로고의 위치를 선택해주세요.",rtnIDString('chk_logo_position_1'), 0)){return false}
    if (isEmptyToFocus(search_active, "검색기능 사용여부 선택해주세요.",rtnIDString('chk_search_active_1'), 0)){return false}

    if(Number(search_active) === 1){
      if (isEmptyToFocus(search_tem, "검색 탬플릿을 선택하세요.",rtnIDString('chk_search_tem_1'), 0)){return false}
      if (isEmptyToFocus(search_position, "검색기능 위치를 선택해주세요.",rtnIDString('chk_search_position_1'), 0)){return false}
    }

    if (isEmptyToFocus(menu_position, "메뉴 위치를 선택해주세요.",rtnIDString('chk_menu_position_1'), 0)){return false}
    if (isEmptyToFocus(menu_color, "메뉴의 텍스트 컬러를 선택해주세요.",rtnIDString('menu_color'), 0)){return false}
    if (isEmptyToFocus(menu_font_size, "메뉴의 폰트 사이즈를 선택해주세요.",rtnIDString('menu_font_size'), 0)){return false}
    if (isEmptyToFocus(menu_font_weight, "메뉴의 폰트 굵기를 선택해주세요.",rtnIDString('chk_menu_weight_1'), 0)){return false}


    swiper.allowSlideNext = true;
    swiper.slideNext();
    swiper.allowSlideNext = false;

  }else if(Number(slideIndex) === 1){
    let main_width = $('input[name="chk_main_width"]:checked').val();
    let footer_visible = $('input[name="chk_footer_active"]:checked').val();
    let footer_width = $('input[name="chk_footer_width"]:checked').val();
    let footer_position = $('input[name="chk_footer_position"]:checked').val();
    let footer_align = $('input[name="chk_footer_align"]:checked').val();
    let footer_inner_align = $('input[name="chk_footer_inner_align"]:checked').val();
    let footer_logo = $('#footer_logo')[0].files[0];
    let footer_logo_description = $('#footer_logo_description').val();
    let footer_logo_link = $('input[name="chk_f_logo_link"]:checked').val();
    let footer_logo_width = $('#footer_logo_width').val();


    if (isEmptyToFocus(main_width, "프레임의 넓이를 선택하세요.",rtnIDString('chk_main_width_1'), 0)){return false}
    if(String(main_width) != "100%"){
      let width_write = $('#main_width').val();
      if (isEmptyToFocus(width_write, "프레임의 넓이를 입력하세요.",rtnIDString('main_width'), 0)){return false}
    }
    if (isEmptyToFocus(footer_visible, "하단정보 노출 여부를 선택하세요.",rtnIDString('chk_footer_active_1'), 0)){return false}
    if (isEmptyToFocus(footer_width, "하단넓이를 선택하세요.",rtnIDString('chk_footer_active_1'), 0)){return false}
    if(String(footer_width) != "100%"){
      let f_width_write = $('#footer_width').val();
      if (isEmptyToFocus(f_width_write, "하단 넓이를 입력하세요.",rtnIDString('footer_width'), 0)){return false}
    }
    if (isEmptyToFocus(footer_position, "하단정보 위치를 선택하세요.",rtnIDString('chk_footer_position_1'), 0)){return false}
    if (isEmptyToFocus(footer_align, "하단정보 정렬을 선택하세요.",rtnIDString('chk_footer_align_1'), 0)){return false}
    if (isEmptyToFocus(footer_inner_align, "하단정보 내부 정렬을 선택하세요.",rtnIDString('chk_footer_inner_align_1'), 0)){return false}
    if(footer_logo === undefined){
      if(isEmpty(f_logo)){
        if (isEmptyToFocus(footer_logo, "하단로고를 등록하세요.",rtnIDString('footer_logo'), 0)){return false}
      }
    }
    
    if (isEmptyToFocus(footer_logo_description, "하단로고 설명을 입력하세요.",rtnIDString('footer_logo_description'), 0)){return false}
    if (isEmptyToFocus(footer_logo_link, "하단로고 링크연결 여부를 선택하세요.",rtnIDString('chk_f_logo_link_1'), 0)){return false}
    if(Number(footer_logo_link) === 2){
      let f_link_write = $('#f_logo_link').val();
      if (isEmptyToFocus(f_link_write, "하단 로고 링크를 입력하세요.",rtnIDString('f_logo_link'), 0)){return false}
    }
    if (isEmptyToFocus(footer_logo_width, "하단 로고 넓이를 입력하세요.",rtnIDString('footer_logo_width'), 0)){return false}

    swiper.allowSlideNext = true;
    swiper.slideNext();
    swiper.allowSlideNext = false;
    $('#btn_insert_option').css('display', 'inline-block');
  }
});

// $(document).on('click', '#btn_slide_prev', function(){
//   let slideIndex = swiper.activeIndex;
//   if(Number(slideIndex) === 2){
//     let main_header_template = $('input[name="chk_header_template"]:checked').val();
//     let main_banner_template = $('input[name="chk_banner_template"]:checked').val();
//     let main_contents_template_1 = $('input[name="chk_contents_template"]:checked').val();
//     let main_contents_template_2 = $('input[name="chk_contents_bt_template"]:checked').val();
//     let main_footer_template = $('input[name="chk_footer_template"]:checked').val();
//     if(!isEmpty(main_header_template) && !isEmpty(main_banner_template) && !isEmpty(main_contents_template_1)
//     && !isEmpty(main_contents_template_2) && !isEmpty(main_footer_template)){
//       $('#header_preview').load(`template/header_template_${main_header_template}.html`);
//       $('#banner_preview').load(`template/banner_template_${main_banner_template}.html`);
//       $('#section_preview').load(`template/section_template_${main_contents_template_1}.html`);
//       $('#section_2_preview').load(`template/section_2_template_${main_contents_template_2}.html`);
//       $('#footer_preview').load(`template/footer_template_${main_footer_template}.html`);
//     }
//   }else if(Number(slideIndex) === 1){
//     let main_template = $('input[name="chk_template"]:checked').val();
//     let target = $('#preview_div');
//     if(!isEmpty(main_template)){
//       let tempHTML = `<img class='block w-full' src='../admin/assets/images/main_template_img/template_${main_template}.png' alt='탬플릿 ${main_template}번'>`;
//       target.html(tempHTML);
//     }
//   }else if(Number(slideIndex) === 3){
//     let sub_template = $('input[name="chk_sub_template"]:checked').val();
//     let target = $('#preview_div');
//     if(!isEmpty(sub_template)){
//       let tempHTML = `<img class='block w-full' src='../admin/assets/images/sub_template_img/template_${sub_template}.png' alt='탬플릿 ${sub_template}번'>`;
//       target.html(tempHTML);
//     }
//   }
// });


// 메인탬플릿 상세설정 체크 클릭시 
// 헤더 -> 배너 -> 콘텐츠 1 -> 콘텐츠 2 -> 하단(푸터)
// $(document).on('change', 'input[name="chk_header_template"]', function(){
//   let template = $(this).val();
//   $('#header_preview').empty();
//   $('#header_preview').load(`template/header_template_${template}.html`);
// });
// $(document).on('change', 'input[name="chk_banner_template"]', function(){
//   let template = $(this).val();
//   $('#banner_preview').empty();
//   $('#banner_preview').load(`template/banner_template_${template}.html`);
// });
// $(document).on('change', 'input[name="chk_contents_template"]', function(){
//   let template = $(this).val();
//   $('#section_preview').empty();
//   $('#section_preview').load(`template/section_template_${template}.html`);
// });
// $(document).on('change', 'input[name="chk_contents_bt_template"]', function(){
//   let template = $(this).val();
//   $('#section_2_preview').empty();
//   $('#section_2_preview').load(`template/section_2_template_${template}.html`);
// });
// $(document).on('change', 'input[name="chk_footer_template"]', function(){
//   let template = $(this).val();
//   $('#footer_preview').empty();
//   $('#footer_preview').load(`template/footer_template_${template}.html`);
// });

// 로고 파일 삽입시 미리보기
$(document).on('change', '#header_logo', function(e){
  let target = $('#header_logo_preview');
  let file = e.target.files[0];
  if (file) {
    let reader = new FileReader();
    reader.onload = function(e) {
      // 읽은 이미지를 div에 표시
      target.html(`<img class='block' style="width: 90px;" src="${e.target.result}" alt="Uploaded Image">`);
    };
    reader.readAsDataURL(file);
  }
});
$(document).on('change', '#footer_logo', function(e){
  let target = $('#footer_logo_preview');
  let file = e.target.files[0];
  if (file) {
    let reader = new FileReader();
    reader.onload = function(e) {
      // 읽은 이미지를 div에 표시
      target.html(`<img class='block' style="width: 90px;" src="${e.target.result}" alt="Uploaded Image">`);
    };
    reader.readAsDataURL(file);
  }
});

// 플로팅 메뉴 사용 여부
$(document).on('change', 'input[name="chk_floating_menu_active"]', function(){
  let value = $(this).val();
  if(Number(value) === 1){
    $('#floating_menu_option_area').css('display', 'block');
  }else{
    $('#floating_menu_option_area').css('display', 'none');
  }
});

// 스크롤형식 체크 시 유형에따라 보이는 화면
$(document).on('change', 'input[name="chk_scroll_mode"]', function(){
  let value = $(this).val();
  if(Number(value) === 1){
    $('#scroll_option_area').css('display', 'block');
    $('#nomal_scroll_option_area').css('display', 'none');
  }else{
    $('#scroll_option_area').css('display', 'none');
    $('#nomal_scroll_option_area').css('display', 'block');
  }
});

// 콘텐츠 갯수 정의 -> 일반 스크롤
$(document).on('change', '#content_count', function(){
  let count = $(this).val();
  con_count = count;
  let tempHTML = "";
  let target = $('#content_template_area');
  target.empty();

  for(let i = 0; i < count; i++){
    tempHTML = tempHTML + `<div class="row items-center mb-4">
                            <label class="col-12 col-md-2 col-form-label
                                form-label text-muted">콘텐츠 탬플릿 ${i + 1}</label>
                            <div class="col-12 col-md-10 flex items-center gap-2">
                              <div class="form-check">
                                <input class="form-check-input" type="radio" name="chk_contents_template_${i}" id="chk_contents_template_${i}_1" value="1">
                                <label class="form-check-label" for="chk_contents_template_${i}_1">
                                  콘텐츠 1번
                                </label>
                              </div>
                              <div class="form-check">
                                <input class="form-check-input" type="radio" name="chk_contents_template_${i}" id="chk_contents_template_${i}_2" value="2">
                                <label class="form-check-label" for="chk_contents_template_${i}_2">
                                  콘텐츠 2번
                                </label>
                              </div>
                            </div>
                          </div>`;
  }

  target.html(tempHTML);
});
// 콘텐츠 갯수 정의 -> 풀페이지
$(document).on('change', '#scroll_count', function(){
  let count = $(this).val();
  count = count - 1;
  con_count = count;
  let tempHTML = "";
  let target = $('#content_template_area');
  target.empty();

  for(let i = 0; i < count; i++){
    tempHTML = tempHTML + `<div class="row items-center mb-4">
                            <label class="col-12 col-md-2 col-form-label
                                form-label text-muted">콘텐츠 탬플릿 ${i + 1}</label>
                            <div class="col-12 col-md-10 flex items-center gap-2">
                              <div class="form-check">
                                <input class="form-check-input" type="radio" name="chk_contents_template_${i}" id="chk_contents_template_${i}_1" value="1">
                                <label class="form-check-label" for="chk_contents_template_${i}_1">
                                  콘텐츠 1번
                                </label>
                              </div>
                              <div class="form-check">
                                <input class="form-check-input" type="radio" name="chk_contents_template_${i}" id="chk_contents_template_${i}_2" value="2">
                                <label class="form-check-label" for="chk_contents_template_${i}_2">
                                  콘텐츠 2번
                                </label>
                              </div>
                            </div>
                          </div>`;
  }

  target.html(tempHTML);
});

// 웹진 옵션 등록버튼 클릭 시 
$(document).on('click', '#btn_insert_option', async function(){
  let idx = $('#idx').val();
  let sendJSON = {};
  let header_file_list = [];
  let footer_file_list = [];

  // ----------- 첫번째 슬라이드 값
  let header = {};
  // 헤더 스타일
  let header_style = $('input[name="chk_header_style"]:checked').val();
  header.style = header_style;

  // 헤더 넓이
  let header_width = $('input[name="chk_header_width"]:checked').val();
  if(String(header_width) != "100%"){
    header_width = $('#header_width').val();
  }
  header.width = header_width;

  // 헤더 높이
  let header_height = $('#header_height').val();
  header.height = header_height;

  // 헤더 로고
  let tempJSON = {};
  let header_logo = $('#header_logo')[0].files[0];
  if(header_logo){
    header_file_list.push(header_logo);
  }
  let header_file_name = header_logo ? header_logo.name : h_logo;
  tempJSON.src = header_file_name;
  // 로고 링크
  let logo_link = $('input[name="chk_logo_link"]:checked').val();
  if(Number(logo_link) === 2){
    logo_link = $('#logo_link').val();
  }
  tempJSON.link = logo_link;

  // 로고 설명
  let header_logo_description = $('#header_logo_description').val();
  tempJSON.description = header_logo_description;

  // 로고 크기
  let header_logo_width = $('#header_logo_width').val();
  tempJSON.width = header_logo_width;

  // 로고 위치
  let h_logo_position = $('input[name="chk_logo_position"]:checked').val();
  tempJSON.position = h_logo_position;

  header.logo = tempJSON;

  // 검색 사용
  tempJSON = {};
  let search_active = $('input[name="chk_search_active"]:checked').val();
  tempJSON.visible = search_active;
  if(Number(search_active) === 1){
    let search_tem = $('input[name="chk_search_tem"]:checked').val();
    let search_position = $('input[name="chk_search_position"]:checked').val();
    tempJSON.template = search_tem;
    tempJSON.position = search_position;
  }
  header.search = tempJSON;

  // 메뉴 위치
  tempJSON = {};
  let menu_position = $('input[name="chk_menu_position"]:checked').val();
  tempJSON.position = menu_position;

  // 메뉴 색상
  let menu_color = $('#menu_color').val();
  tempJSON.color = menu_color;

  // 메뉴 폰트 사이즈
  let menu_size = $('#menu_font_size').val();
  tempJSON.size = menu_size;

  // 메뉴 폰트 굴기
  let menu_weight = $('input[name="chk_menu_weight"]:checked').val();
  tempJSON.weight = menu_weight;

  header.menu = tempJSON;

  sendJSON.header = header;
  // ----------- 두번째 슬라이드 값
  // 화면 넓이
  let frame_width = $('input[name="chk_main_width"]:checked').val();
  if(String(frame_width) != "100%"){
    frame_width = $('#main_width').val();
  }
  sendJSON.width = frame_width;

  // 하단 정보 노출
  tempJSON = {};
  let footer_active = $('input[name="chk_footer_active"]:checked').val();
  tempJSON.visible = footer_active;
  // 하단 넓이
  let footer_width = $('input[name="chk_footer_width"]:checked').val();
  if(String(footer_width) != "100%"){
    footer_width = $('#footer_width').val();
  }
  tempJSON.width = footer_width;

  // 하단 전체 묶음 위치
  let footer_position = $('input[name="chk_footer_position"]:checked').val();
  tempJSON.position = footer_position;

  // 하단 정보 정렬
  let footer_align = $('input[name="chk_footer_align"]:checked').val();
  tempJSON.align = footer_align;

  // 하단 내부 정렬
  let footer_inner_align = $('input[name="chk_footer_inner_align"]:checked').val();
  tempJSON.inner_align = footer_inner_align;

  // 푸터 로고
  let footer_logo = $('#footer_logo')[0].files[0];
  if(footer_logo){
    footer_file_list.push(footer_logo);
  }
  let footer_file_name = footer_logo ? footer_logo.name : f_logo;
  tempJSON.src = footer_file_name;

  // 하단 로고 설명
  let f_logo_description = $('#footer_logo_description').val();
  tempJSON.description = f_logo_description;

  // 하단 로고 링크 연결
  let f_logo_link = $('input[name="chk_f_logo_link"]:checked').val();
  if(Number(f_logo_link) === 2){
    f_logo_link = $('#f_logo_link').val();
  }
  tempJSON.link = f_logo_link;

  // 하단 로고 넓이
  let f_logo_width = $('#footer_logo_width').val();
  tempJSON.logo_width = f_logo_width;

  // 하단 설명들
  let f_customer_name = $('#footer_customer_name').val();
  let f_address = $('#footer_address').val();
  let f_copyright = $('#footer_copyright').val();
  tempJSON.customer_name = f_customer_name;
  tempJSON.address = f_address;
  tempJSON.copyright = f_copyright;

  sendJSON.footer = tempJSON;


  // ----------- 세번째 슬라이드 값
  // 플로팅 사용 여부
  let last_vol_active = $('input[name="chk_last_vol_active"]:checked').val();
  if (isEmptyToFocus(last_vol_active, "지난호 보기 사용여부를 선택하세요.",rtnIDString('chk_last_vol_active_1'), 0)){return false}
  sendJSON.last_vol_active = last_vol_active;

  tempJSON = {};
  let floating_active = $('input[name="chk_floating_menu_active"]:checked').val();
  if (isEmptyToFocus(floating_active, "플로팅메뉴 사용여부를 선택하세요.",rtnIDString('chk_floating_menu_none_active_1'), 0)){return false}
  tempJSON.visible = floating_active;
  if(Number(floating_active) === 1){
    let floating_tem = $('input[name="chk_floating_tem"]:checked').val();
    let floating_list = $('input[name="chk_floating_sns"]:checked').map(function(){
      return this.value;
    }).get();
    if (isEmptyToFocus(floating_tem, "플로팅메뉴 탬플릿을 선택하세요.",rtnIDString('chk_floating_tem_1'), 0)){return false}
    if(floating_list.length === 0){
      alert('플로팅 기능을 선택하세요.');
      return;
    }
    tempJSON.template = floating_tem;
    tempJSON.list = floating_list;
  }

  // 웹진구독버튼
  let gudok_active = $('input[name="chk_gudok"]:checked').val();
  let gu_url = "";
  if(Number(gudok_active) != 0){
    gu_url = $('#chk_gudok_url').val();
    if (isEmptyToFocus(gu_url, "구독주소를 입력하세요.",rtnIDString('chk_gudok_url'), 0)){return false}
  }
  sendJSON.floating = tempJSON;
  sendJSON.gudok_active = gudok_active;
  sendJSON.gu_url = gu_url;

  console.log(sendJSON);

  sendJSON = JSON.stringify(sendJSON);
  sendJSON = urlencode(sendJSON);

  let formData = new FormData();
  for (var i = 0; i < header_file_list.length; i++) {
    // 삭제되지 않은 파일만 폼데이터에 담기
      formData.append(`header_logo[]`, header_file_list[i]);
  }
  for (var i = 0; i < footer_file_list.length; i++) {
    // 삭제되지 않은 파일만 폼데이터에 담기
      formData.append(`footer_logo[]`, footer_file_list[i]);
  }
  formData.append('c_idx', g_login.customer_idx);
  formData.append('uuid', g_login.uuid);
  formData.append('template_info', sendJSON);

  
  if(isEmpty(idx)){
    formData.append('cmd', "insert_webzine_option");
  }else{
    formData.append('cmd', "update_webzine_option");
    formData.append('idx', idx);
  }

  headers = {};
  headers.Authorization = "Bearer " + g_access_token;
  await xhr_multipart("../server/api_new.php", formData, "", "", true);

  view_page('index');
});

// 웹진 옵션 수정버튼 클릭 시
$(document).on('click', '#btn_option_update_page', function(){
  let idx = $('#idx').val();
  h_logo = "";
  f_logo = "";
  $('#content_body').html(PagesContent.write_option_page);
  $('#menu_color').spectrum();
  $('#idx').val(idx);
  let tempJSON = g_webzine_option[0];
  tempJSON = urldecode(tempJSON.template_info);
  tempJSON = JSON.parse(tempJSON);
  draw_option_data(tempJSON);
  console.log(tempJSON);
  swiper = new Swiper(".mySwiper", {
    cssMode: true,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
      renderBullet: function (index, className) {
        return '<span class="' + className + '">' + (index + 1) + "</span>";
      },
    },
    mousewheel: true,
    keyboard: true,
    allowSlideNext: false
  });
});

// 웹진옵션 삭제 클릭 시
$(document).on('click', '#btn_del_option', async function(){
  let bconfirm = false;
  await greenModal({
    type: "confirm",
    messageText: '옵션을 삭제하시겠습니까?',
    headerText : '옵션 삭제',
    alertType: "info"
  }).done(function (event) {
    bconfirm = event;
    return true;
  });
  if (!bconfirm) {return false};
  let idx = $('#idx').val();
  await delete_data(idx, 'webzine_option');
  draw_index();
  
});


// 웹진관리 버튼 클릭 시
$(document).on('click', '#btn_webzine_list_page', async function(event){
  let page = $(this).data('page');
  view_page(page);


  let param = {};
  param.cmd = 'load_main_webzine_uuid';
  param.uuid = g_login.uuid;
  param.tbl_name = 'webzine_main';

  await call_ajax(param,  true);

  param = {};
  param.cmd = 'load_webzine_category_uuid';
  param.tbl_name = 'webzine_category';
  param.uuid = g_login.uuid;
  await call_ajax(param,  true);

  
  param = {};
  param.cmd = 'load_webzine_sub_category_uuid';
  param.tbl_name = 'webzine_sub_category';
  param.uuid = g_login.uuid;
  await call_ajax(param,  true);
  



  draw_main_webzine_list();
  draw_webzine_category_list();

  if(!isEmpty(g_main_idx)){
    param = {};
    param.cmd = 'load_webzine_contents_uuid';
    param.tbl_name = 'webzine_contents';
    param.uuid = g_login.uuid;
    await call_ajax(param,  true);

    let tempJSON = g_webzine_content_list.filter((items) => {
      return Number(items.parent_idx) === Number(g_main_idx);
    });
    
    draw_webzine_content_list(tempJSON);
    $(`.btn_view_webzine_list_${g_main_idx}`).addClass('active');
  }

});

// 웹진 메인 작성 관련 -----------------------------------------------------------------
// 배너를 직접 첨부하는지 카테고리를 이용하는지 구분
$(document).on('change', 'input[name="chk_banner_link"]', function(){
  let value = $(this).val();
  if(Number(value) === 0){
    $('#webzine_main_banner').prop('disabled', false);
    $('input[name="chk_banner_link_sel"]').prop('disabled', true);
    $('#category_select_div').css('display', 'none');
  }else{
    $('#webzine_main_banner').prop('disabled', true);
    $('input[name="chk_banner_link_sel"]').prop('disabled', false);
  }
});

// 배너 링크내용 체크시 체크박스, 라디오 중 알맞은 인풋 그리기
$(document).on('change', 'input[name="chk_banner_link_sel"]', function(){
  $('#category_select_div').css('display', 'flex');
  let value = $(this).val();
  draw_category_banner_type(value);
});

// 웹진 메인버튼 클릭시 맞는페이지들 불러오기
$(document).on('click', '.btn_view_webzine_list', async function(){
  let idx = $(this).data('idx');
  $('.btn_view_webzine_list').removeClass('active');
  $(this).addClass('active');
  g_main_idx = idx;

  param = {};
  param.cmd = 'load_webzine_contents_uuid';
  param.tbl_name = 'webzine_contents';
  param.uuid = g_login.uuid;
  await call_ajax(param,  true);


  let tempJSON = g_webzine_content_list.filter((items) => {
    return Number(items.parent_idx) === Number(g_main_idx);
  });

  draw_webzine_content_list(tempJSON);
});

// 배너별 타이틀 사용시
$(document).on('change', 'input[name="chk_banner_title_active"]', function(){
  let value = $(this).val();
  let target = $('#banner_title_div');
  let tempHTML = "";
  if(Number(value) === 1){
    for(let i = 0; i < main_result_file.length; i++){
      tempHTML = tempHTML + `
      <div id='banner_title_area_${i}'>
        <div class="row mb-2 items-center mb-4">
          <label for="banner_title_${i}" class="col-12 col-md-2 col-form-label
              form-label text-muted"><span class="text-red-700">* </span>배너 타이틀${i + 1}</label>
          <div class="col-12 col-md-10">
            <input type="text" id="banner_title_${i}" maxlength="300" class="form-control" placeholder="배너의 타이틀을 입력하세요.">
          </div>
        </div>
        <div class="row mb-2 items-center mb-4">
          <label for="banner_sub_title_${i}" class="col-12 col-md-2 col-form-label
              form-label text-muted"><span class="text-red-700">* </span>배너 서브타이틀${i + 1}</label>
          <div class="col-12 col-md-10">
            <input type="text" id="banner_sub_title_${i}" maxlength="300" class="form-control" placeholder="배너의 서브타이틀을 입력하세요.">
          </div>
        </div>
      </div>
      `
    }
    target.html(tempHTML);
  }else{
    target.empty();
  }
});

// 페이지 섹션 추가 클릭
$(document).on('click', '#btn_section_plus', function(){
  draw_section_list(section_start_number);
  section_list.push(section_start_number);
  section_start_number = Number(section_start_number) + 1;
});

// 섹션리스트 삭제 클릭
$(document).on('click', '.btn_section_list_del', function(){
  let idx = $(this).data('idx');
  $(`#section_list_div_${idx}`).remove();
  section_list = section_list.filter((items) => Number(items) != Number(idx));
});

// 배너 넓이 지정
$(document).on('change', 'input[name=chk_banner_width]', function(){
  let value = $(this).val();

  if(String(value) != "100%"){
    $(`#banner_width`).prop('disabled', false);
  }else{
    $(`#banner_width`).prop('disabled', true);
  }
});

// 페이지 섹션별 넓이 지정
$(document).on('change', 'input[name*=chk_section_width_]', function(){
  let idx = $(this).data('idx');
  let value = $(this).val();

  if(String(value) != "100%"){
    $(`#section_width_${idx}`).prop('disabled', false);
  }else{
    $(`#section_width_${idx}`).prop('disabled', true);
  }
});

// 웹진 메인 작성하기 클릭시
$(document).on('click', '#btn_write_webzine_main', async function(event){
  section_list = [];
  section_start_number = 1;
  var bsOffcanvas = $('#offcanvas');
  var offcanvas = new bootstrap.Offcanvas(bsOffcanvas); 
  offcanvas.toggle(); 
  $('#canvas_title').text('메인페이지 작성');
  $('#canvas_body').empty();
  $('#canvas_body').html(PagesContent.webzine_main_write);
  $('#type').val('main');
  $("#webzine_month").datepicker({
    format: "yyyy-mm",
    startView: "months",
    language: "ko",
    minViewMode: "months",
    autoclose: true
  });
  thumnail_file = []; // 썸네일 파일 관련
  thumnail_name_file = []; // 썸네일 파일명 관련

  pdf_file = []; // pdf파일 관련
  pdf_name_file = []; // pdf파일명 관련

  main_result_file = [];   // 파일업로드 시 기존 등록된 메인 파일 리스트
  main_files = [];      // 메인 파일 관련
  delete_main_data = []; // 파일 삭제를 위한 메인이미지 변수
  if(g_webzine_main_list.length != 0){
    draw_before_setting(g_webzine_main_list[0]);
  }
});

// 타이틀 폰트사이즈 조절시 벨류값 보이게
$(document).on('change', '#title_font_size', function(){
  let size = $(this).val();
  $('#font_size_output').text(size);
  $('#font_size_output').css('font-size', `${size}px`);
}); 
$(document).on('change', '#sub_title_font_size', function(){
  let size = $(this).val();
  $('#sub_font_size_output').text(size);
  $('#sub_font_size_output').css('font-size', `${size}px`);
}); 
$(document).on('change', '#menu_font_size', function(){
  let size = $(this).val();
  $('#menu_font_size_output').text(size);
  $('#menu_font_size_output').css('font-size', `${size}px`);
}); 
$(document).on('change', '#title_font_size', function(){
  let size = $(this).val();
  $('#title_font_size_output').text(size);
  $('#title_font_size_output').css('font-size', `${size}px`);
}); 
$(document).on('change', '#sub_title_font_size', function(){
  let size = $(this).val();
  $('#sub_title_font_size_output').text(size);
  $('#sub_title_font_size_output').css('font-size', `${size}px`);
}); 

// 메인배너 파일 관리
$(document).on('change', '#webzine_main_banner', function(){
  let maxFileCnt = 5;   // 첨부파일 최대 개수
  let attFileCnt = $('#main_file_list li').length;    // 기존 추가된 첨부파일 개수
  let remainFileCnt = maxFileCnt - attFileCnt;    // 추가로 첨부가능한 개수
  let curFileCnt = $(this)[0].files.length;  // 현재 선택된 첨부파일 개수
  let fileNo = 0;
  let files = $(this)[0].files;

  // 첨부파일 개수 확인
  if (curFileCnt > remainFileCnt) {
    alert("메인파일은 최대 " + maxFileCnt + "개 까지 첨부 가능합니다.");
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
            <li class="p-2 bg-gray-200 rounded flex items-center justify-between mt-1" id="main_${fileNo}">
            ${file.name} <button class="btn btn-danger btn-sm text-xs btn_main_del"
             data-idx="${fileNo}" data-file_name="${file.name}">취소</button></li>`;

            $('#main_file_list').append(htmlData);
            fileNo++;
        } else {
            continue;
        }
      }
    }
  }
});

// pdf 파일 관리
$(document).on('change', '#webzine_pdf_file', function(){
  let maxFileCnt = 1;   // 첨부파일 최대 개수
  let attFileCnt = $('#pdf_file_list li').length;    // 기존 추가된 첨부파일 개수
  let remainFileCnt = maxFileCnt - attFileCnt;    // 추가로 첨부가능한 개수
  let curFileCnt = $(this)[0].files.length;  // 현재 선택된 첨부파일 개수
  let fileNo = 0;
  let files = $(this)[0].files;

  // 첨부파일 개수 확인
  if (curFileCnt > remainFileCnt) {
    alert("메인파일은 최대 " + maxFileCnt + "개 까지 첨부 가능합니다.");
    return;
  } else {
    for (const file of files) {
      let bExists = false;
      if (!isEmpty(pdf_file)){
        pdf_file.some(function(items, index){
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
              pdf_file.push(file);
            };
            reader.readAsDataURL(file);
            pdf_name_file.push(file.name);
            // 목록 추가
            let htmlData = `
            <li class="p-2 bg-gray-200 rounded flex items-center justify-between mt-1" id="pdf_${fileNo}">
            ${file.name} <button class="btn btn-danger btn-sm text-xs btn_pdf_del"
             data-idx="${fileNo}" data-file_name="${file.name}">취소</button></li>`;

            $('#pdf_file_list').append(htmlData);
            fileNo++;
        } else {
            continue;
        }
      }
    }
  }
});

// pdf 파일 삭제
$(document).on('click', '.btn_pdf_del', function(){
  let idx = $(this).data('idx');
  let name = $(this).data('file_name');
  $(`#pdf_${idx}`).remove();

  if(pdf_file.length != 0){
    pdf_file[idx].is_delete = true;
  }
  if(!isEmpty(name)){
    pdf_name_file = pdf_name_file.filter((item) => {
      return item != name;
    });
  }
});

// 메인 파일 삭제
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

// 썸네일 파일 관리
$(document).on('change', '#webzine_main_thumnail', function(){
  let maxFileCnt = 1;   // 첨부파일 최대 개수
  let attFileCnt = $('#thumnail_file_list li').length;    // 기존 추가된 첨부파일 개수
  let remainFileCnt = maxFileCnt - attFileCnt;    // 추가로 첨부가능한 개수
  let curFileCnt = $(this)[0].files.length;  // 현재 선택된 첨부파일 개수
  let fileNo = 0;
  let files = $(this)[0].files;

  // 첨부파일 개수 확인
  if (curFileCnt > remainFileCnt) {
    alert("썸네일파일은 최대 " + maxFileCnt + "개 까지 첨부 가능합니다.");
    return;
  } else {
    for (const file of files) {
      let bExists = false;
      if (!isEmpty(thumnail_file)){
        thumnail_file.some(function(items, index){
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
              thumnail_file.push(file);
            };
            reader.readAsDataURL(file);
            thumnail_name_file.push(file.name);
            // 목록 추가
            let htmlData = `
            <li class="p-2 bg-gray-200 rounded flex items-center justify-between mt-1" id="thum_${fileNo}">
            ${file.name} <button class="btn btn-danger btn-sm text-xs btn_thum_del"
             data-idx="${fileNo}" data-file_name="${file.name}">취소</button></li>`;

            $('#thumnail_file_list').append(htmlData);
            fileNo++;
        } else {
            continue;
        }
      }
    }
  }
});
// 썸네일 파일 삭제
$(document).on('click', '.btn_thum_del', function(){
  let idx = $(this).data('idx');
  $(`#thum_${idx}`).remove();
  // 파일배열 초기화
  // 썸네일은 하나만 추가할 수 있기 때문
  thumnail_file =[];
  thumnail_name_file = [];
});

// 웹진메인 등록
$(document).on('click', '#btn_insert_webzine_main', async function(){
  let idx = $('#idx').val();

  let main_json = {};

  let webzine_month = $('#webzine_month').val(); // 월
  if (isEmptyToFocus(webzine_month, "웹진 월을 선택해주세요.",rtnIDString('webzine_month'), 0)){return false}

  // 배너 관련
  let tempJSON = {};
  let banner_width = $('input[name="chk_banner_width"]:checked').val(); // 배너 넓이
  let banner_height = $('input[name="chk_banner_height"]:checked').val(); // 배너 높이
  if (isEmptyToFocus(banner_width, "배너 넓이를 선택해주세요.",rtnIDString('chk_banner_width_1'), 0)){return false}
  if (isEmptyToFocus(banner_height, "배너 높이를 선택해주세요.",rtnIDString('chk_banner_height_1'), 0)){return false}
  if(String(banner_width) != "100%"){
    banner_width = $('#banner_width').val();
    if (isEmptyToFocus(banner_width, "배너 넓이를 입력해주세요.",rtnIDString('banner_width'), 0)){return false}
  }
  tempJSON.width = banner_width;
  tempJSON.height = banner_height;


  let banner_type = $('input[name="chk_banner_type"]:checked').val(); // 배너 유형
  if (isEmptyToFocus(banner_type, "배너 유형을 선택해주세요..",rtnIDString('chk_banner_default'), 0)){return false}

  let banner_link = $('input[name="chk_banner_link"]:checked').val(); // 배너 링크여부
  if (isEmptyToFocus(banner_link, "배너 링크를 선택해주세요..",rtnIDString('chk_banner_link_1'), 0)){return false}

  tempJSON.type = banner_type;
  tempJSON.link_active = banner_link;
  if(Number(banner_link) === 1){
    let category_select_type = $('input[name="chk_banner_link_sel"]:checked').val(); // 카테고리 셀렉
    if (isEmptyToFocus(category_select_type, "배너 링크 내용을 선택해주세요..",rtnIDString('chk_banner_link_sel_1'), 0)){return false}

    let link = "";
    if(Number(category_select_type) === 0){ // 단일선택
      link = $('input[name="chk_banner_category"]:checked').val();
      if (isEmptyToFocus(link, "링크로 사용할 카테고리를 선택해주세요..",rtnIDString('chk_banner_link_sel_1'), 0)){return false}
    } else{ // 다중선택(배열)
      link = $('input[name="chk_banner_category"]:checked').map(function(){
        return this.value;
      }).get();
      if(link.length === 0){
        alert('링크로 사용할 카테고리들을 선택해주세요.')
      }
    }
    tempJSON.category_type = category_select_type;
    tempJSON.link = link;
  }else{
    let img_list = main_result_file;
    if(img_list.length === 0 || isEmpty(img_list)){
      alert('웹 배너를 등록해주세요.');
      return;
    }
    tempJSON.src = img_list;
  }

  let banner_title_visible = $('input[name="chk_banner_title_visible"]:checked').val(); // 배너 타이틀 노출여부
  let page_description = $('#webzine_main_description').val(); // 페이지설명
  let page_title = $('#webzine_main_title').val(); // 배너 타이틀
  let page_title_size = $('#title_font_size').val(); // 배너 타이틀 사이즈
  let page_title_weight = $('input[name="chk_font_weight"]:checked').val(); // 배너 타이틀 굵기
  let page_sub_title = $('#webzine_main_sub_title').val(); // 배너 서브타이틀
  let page_sub_title_size = $('#sub_title_font_size').val(); // 배너 서브타이틀 크기
  let page_sub_title_weight = $('input[name="chk_sub_font_weight"]:checked').val(); // 배너 서브타이틀 굵기
  let banner_title_align = $('input[name="chk_title_align"]:checked').val(); // 배너 타이틀 정렬
  let banner_title_position = $('input[name="chk_title_position"]:checked').val(); // 배너 타이틀 정렬
  let title_logo_view = $('input[name="chk_title_logo_view"]:checked').val(); // 타이틀 로고 옆 노출
  let page_type = $('input[name="chk_page_type"]:checked').val(); // 페이지 타입(풀페이지, 일반)
  let b_title_active = $('input[name="chk_banner_title_active"]:checked').val(); // 배너별 타이틀 사용 여부

  if (isEmptyToFocus(banner_title_visible, "타이틀 노출 여부를 선택하세요.",rtnIDString('chk_banner_title_active_1'), 0)){return false}
  if (isEmptyToFocus(page_description, "페이지 설명을 입력하세요.",rtnIDString('webzine_main_description'), 0)){return false}
  if (isEmptyToFocus(page_title, "타이틀을 입력하세요.",rtnIDString('webzine_main_title'), 0)){return false}
  if (isEmptyToFocus(page_title_size, "타이틀 폰트사이즈를 선택하세요.",rtnIDString('title_font_size'), 0)){return false}
  if (isEmptyToFocus(page_title_weight, "타이틀 폰트굵기를 선택하세요.",rtnIDString('chk_font_slim'), 0)){return false}
  if (isEmptyToFocus(page_sub_title, "서브타이틀을 입력하세요.",rtnIDString('webzine_main_sub_title'), 0)){return false}
  if (isEmptyToFocus(page_sub_title_size, "서브타이틀의 폰트사이즈를 선택하세요.",rtnIDString('sub_title_font_size'), 0)){return false}
  if (isEmptyToFocus(page_sub_title_weight, "서브타이틀의 폰트 굵기를 선택하세요.",rtnIDString('chk_sub_font_slim'), 0)){return false}
  if (isEmptyToFocus(banner_title_align, "타이틀의 정렬을 선택하세요.",rtnIDString('chk_title_left'), 0)){return false}
  if (isEmptyToFocus(banner_title_position, "타이틀의 위치을 선택하세요.",rtnIDString('chk_title_left_top'), 0)){return false}
  if (isEmptyToFocus(title_logo_view, "타이틀의 로고옆 노출 여부를 선택하세요.",rtnIDString('chk_title_logo_view_1'), 0)){return false}
  if (isEmptyToFocus(page_type, "페이지의 타입을 선택하세요.",rtnIDString('chk_page_type_1'), 0)){return false}
  if (isEmptyToFocus(b_title_active, "배너별 타이틀 사용 여부를 선택하세요.",rtnIDString('chk_banner_title_active_1'), 0)){return false}

  if(Number(b_title_active) === 1){
    let tempArr = [];
    for(let i = 0; i < main_result_file.length; i++){
      let testJSON = {};
      let b_title = $(`#banner_title_${i}`).val();
      let b_sub_title = $(`#banner_sub_title_${i}`).val();
      if (isEmptyToFocus(b_title, "배너별 타이틀을 입력하세요.",rtnIDString(`banner_title_${i}`), 0)){return false}
      if (isEmptyToFocus(b_sub_title, "배너별 서브타이틀을 입력하세요.",rtnIDString(`banner_sub_title_${i}`), 0)){return false}
      testJSON.title = b_title;
      testJSON.sub_title = b_sub_title;

      tempArr.push(testJSON);
    }
    tempJSON.banner_titles = tempArr;
  }


  tempJSON.title_visible = banner_title_visible;
  tempJSON.description = page_description;
  tempJSON.title = page_title;
  tempJSON.title_size = page_title_size;
  tempJSON.title_weight = page_title_weight;
  tempJSON.sub_title = page_sub_title;
  tempJSON.sub_title_size = page_sub_title_size;
  tempJSON.sub_title_weight = page_sub_title_weight;
  tempJSON.title_align = banner_title_align;
  tempJSON.title_position = banner_title_position;
  tempJSON.title_logo_view = title_logo_view;
  tempJSON.b_title_active = b_title_active;

  main_json.page_title = page_title;
  main_json.page_description = page_description;
  main_json.banner = tempJSON;
  main_json.page_type = page_type;

  // 콘텐츠 설정
  

  let section = [];

  for(let i = 0; i < section_list.length; i++){
    tempJSON = {};
    let section_width = $(`input[name="chk_section_width_${section_list[i]}"]:checked`).val();
    if (isEmptyToFocus(section_width, "섹션 넓이를 선택하세요.",rtnIDString(`chk_section_width_${i}_1`), 0)){return false}
    if(String(section_width) != "100%"){
      section_width = $(`#section_width_${section_list[i]}`).val();
      if (isEmptyToFocus(section_width, "섹션 넓이를 입력하세요.",rtnIDString(`section_width_${section_list[i]}`), 0)){return false}
    }
    let category_idx = $(`#section_category_${section_list[i]}`).val();
    let section_category_view = $(`input[name="chk_category_view_${section_list[i]}"]:checked`).val();
    let section_category_align = $(`input[name="chk_category_align_${section_list[i]}"]:checked`).val();
    let category_description = $(`#category_description_${section_list[i]}`).val();
    let section_template = $(`input[name="chk_section_tem_${section_list[i]}"]:checked`).val();

    if (isEmptyToFocus(category_idx, "섹션의 카테고리를 선택하세요.",rtnIDString(`section_category_${section_list[i]}`), 0)){return false}
    if (isEmptyToFocus(section_category_view, "섹션의 카테고리명 노출 여부를 선택하세요.",rtnIDString(`chk_category_view_${section_list[i]}_1`), 0)){return false}
    if (isEmptyToFocus(section_category_align, "섹션의 카테고리명 정렬을 선택하세요.",rtnIDString(`chk_category_align_${section_list[i]}_1`), 0)){return false}
    if (isEmptyToFocus(section_template, "섹션의 탬플릿을 선택하세요.",rtnIDString(`chk_section_tem_${section_list[i]}_1`), 0)){return false}

    tempJSON.idx = section_list[i];
    tempJSON.width = section_width;
    tempJSON.category_idx = category_idx;
    tempJSON.section_category_view = section_category_view;
    tempJSON.section_category_align = section_category_align;
    tempJSON.category_description = category_description;
    tempJSON.section_template = section_template;

    section.push(tempJSON);
  }
  main_json.section = section;

  let webzine_active = $(`input[name="chk_active"]:checked`).val();
  if(isEmpty(webzine_active)){
    webzine_active = 0;
  }
  main_json.webzine_active = webzine_active;

  if(isEmpty(webzine_month)){
    alert('웹진 월을 선택하세요.');
    $('#webzine_month').focus();
    return;
  }
  if(isEmpty(webzine_active)){
    alert('발행여부를 선택하세요.');
    return;
  }

  main_json = JSON.stringify(main_json);
  main_json = urlencode(main_json);

  let formData = new FormData();

  for (var i = 0; i < thumnail_file.length; i++) {
    // 삭제되지 않은 파일만 폼데이터에 담기
    if (!thumnail_file[i].is_delete) {
      formData.append(`thumnail_file[]`, thumnail_file[i]);
    }
  }


  // pdf
  for (var i = 0; i < pdf_file.length; i++) {
    // 삭제되지 않은 파일만 폼데이터에 담기
    if (!pdf_file[i].is_delete) {
      formData.append(`pdf_file[]`, pdf_file[i]);
    }
  }

  // 메인 파일
  for (var i = 0; i < main_files.length; i++) {
    // 삭제되지 않은 파일만 폼데이터에 담기
    if (!main_files[i].is_delete) {
      formData.append(`main_files[]`, main_files[i]);
    }
  }

  formData.append("webzine_month", webzine_month);
  formData.append("page_title", page_title);
  formData.append("page_description", page_description);
  formData.append("webzine_active", webzine_active);
  formData.append("thumnail_name_file", thumnail_name_file);
  formData.append("main_pdf_file", pdf_name_file);
  formData.append("main_result_file", main_result_file);
  formData.append("c_idx", g_login.customer_idx);
  formData.append("uuid", g_login.uuid);
  formData.append("main_info", main_json);

  if(isEmpty(idx)){
    formData.append("cmd", "insert_webzine_main");
  }else{
    formData.append("cmd", "update_webzine_main");
    formData.append("idx", idx);
  }
  headers = {};
  headers.Authorization = "Bearer " + g_access_token;
  await xhr_multipart("../server/api_new.php", formData, "", "", true);


  let param = {};
  param.cmd = 'load_main_webzine_uuid';
  param.uuid = g_login.uuid;
  param.tbl_name = 'webzine_main';

  await call_ajax(param,  true);
  draw_main_webzine_list();
  draw_webzine_category_list();




});

// 웹진 메인 수정버튼 클릭 시
$(document).on('click', '.btn_main_update', function(){
  let idx = $(this).parent().data('idx');
  let tempJSON = g_webzine_main_list.filter((items) => {
    return Number(idx) === Number(items.idx);
  });
  tempJSON = tempJSON[0];
  console.log(tempJSON);
  section_list =[];

  var bsOffcanvas = $('#offcanvas');
  var offcanvas = new bootstrap.Offcanvas(bsOffcanvas); 
  offcanvas.toggle(); 
  $('#canvas_title').text('메인페이지 수정');
  $('#canvas_body').empty();
  $('#canvas_body').html(PagesContent.webzine_main_write);
  $('#type').val('main');
  thumnail_file = []; // 썸네일 파일 관련
  thumnail_name_file = []; // 썸네일 파일명 관련

  pdf_file = [];
  pdf_name_file = [];

  main_result_file = [];   // 파일업로드 시 기존 등록된 메인 파일 리스트
  main_files = [];      // 메인 파일 관련
  $("#webzine_month").datepicker({
    format: "yyyy-mm",
    startView: "months",
    language: "ko",
    minViewMode: "months",
    autoclose: true
  });
  let main_info = urldecode(tempJSON.main_info);
  main_info = JSON.parse(main_info);
  console.log(main_info);
  $('#idx').val(idx);

  $("#webzine_month").val(tempJSON.webzine_month);
  // 배너
  let banner_option = main_info.banner;
  let banner_width = banner_option.width;
  let banner_height = banner_option.height;
  if(!isEmpty(banner_width)){
    if(String(banner_width) != "100%"){
      $('#chk_banner_width_2').prop('checked', true);
      $('#banner_width').prop('disabled', false);
      $('#banner_width').val(banner_width);
    }else{
      $('#chk_banner_width_1').prop('checked', true);
    }
  }
  $(`input[name="chk_banner_height"][value=${banner_height}]`).prop('checked', true);
  $(`input[name="chk_banner_type"][value=${banner_option.type}]`).prop('checked', true);
  $(`input[name="chk_banner_link"][value=${banner_option.link_active}]`).prop('checked', true);
  if(Number(banner_option.link_active) === 0){
    $('#webzine_main_banner').prop('disabled', false);
    $('input[name="chk_banner_link_sel"]').prop('disabled', true);
  }else{
    $('#webzine_main_banner').prop('disabled', true);
    $('input[name="chk_banner_link_sel"]').prop('disabled', false);
    $(`input[name="chk_banner_link_sel"][value=${banner_option.category_type}]`).prop('checked', true);
    $('#category_select_div').css('display', 'flex');
    draw_category_banner_type(banner_option.category_type);
    if(Number(banner_option.category_type) === 0){
      $(`input[name="chk_banner_category"][value=${banner_option.link}]`).prop('checked', true);
    }else{
      for(let i = 0; i < banner_option.link.length; i++){
        $(`#chk_banner_category_${banner_option.link[i]}`).prop('checked', true);
      }
    }
  }
  $(`input[name="chk_banner_title_visible"][value=${banner_option.title_visible}]`).prop('checked', true);
  if(!isEmpty(tempJSON.webzime_main_file_name)){
    main_result_file = tempJSON.webzime_main_file_name.split(',');
    $.each(main_result_file, function(key, items){
      let htmlData = `
      <li class="p-2 bg-gray-200 rounded flex items-center justify-between mt-1" id="main_${key}">
      ${items} <button class="btn btn-danger btn-sm text-xs btn_main_del"
        data-idx="${key}" data-file_name="${items}">취소</button></li>`;

      $('#main_file_list').append(htmlData);
    });
  }
  $('#webzine_main_description').val(banner_option.description);
  $('#webzine_main_title').val(banner_option.title);
  $('#title_font_size').val(banner_option.title_size);
  $('#font_size_output').css('font-size',`${banner_option.title_size}px`);
  $('#font_size_output').text(banner_option.title_size);
  $(`input[name="chk_font_weight"][value=${banner_option.title_weight}]`).prop('checked', true);
  $('#webzine_main_sub_title').val(banner_option.sub_title);
  $('#sub_title_font_size').val(banner_option.sub_title_size);
  $('#sub_title_font_size').css('font-size',`${banner_option.sub_title_size}px`);
  $('#sub_title_font_size').text(banner_option.sub_title_size);
  $(`input[name="chk_sub_font_weight"][value=${banner_option.sub_title_weight}]`).prop('checked', true);
  $(`input[name="chk_title_align"][value=${banner_option.title_align}]`).prop('checked', true);
  $(`input[name="chk_title_position"][value=${banner_option.title_position}]`).prop('checked', true);
  $(`input[name="chk_title_logo_view"][value=${banner_option.title_logo_view}]`).prop('checked', true);
  $(`input[name="chk_banner_title_active"][value=${banner_option.b_title_active}]`).prop('checked', true);
  if(Number(banner_option.b_title_active) === 1){
    let b_target = $('#banner_title_div');
    let b_html = "";
    for(let i = 0; i < banner_option.banner_titles.length; i++){
      b_html = b_html + `
      <div id='banner_title_area_${i}'>
        <div class="row mb-2 items-center mb-4">
          <label for="banner_title_${i}" class="col-12 col-md-2 col-form-label
              form-label text-muted"><span class="text-red-700">* </span>배너 타이틀${i + 1}</label>
          <div class="col-12 col-md-10">
            <input type="text" id="banner_title_${i}" value="${banner_option.banner_titles[i].title}" maxlength="300" class="form-control" placeholder="배너의 타이틀을 입력하세요.">
          </div>
        </div>
        <div class="row mb-2 items-center mb-4">
          <label for="banner_sub_title_${i}" class="col-12 col-md-2 col-form-label
              form-label text-muted"><span class="text-red-700">* </span>배너 서브타이틀${i + 1}</label>
          <div class="col-12 col-md-10">
            <input type="text" id="banner_sub_title_${i}" value="${banner_option.banner_titles[i].sub_title}" maxlength="300" class="form-control" placeholder="배너의 서브타이틀을 입력하세요.">
          </div>
        </div>
      </div>
      `
    }
    b_target.html(b_html);
  }

  // 페이지 타입
  $(`input[name="chk_page_type"][value=${main_info.page_type}]`).prop('checked', true);

  // 콘텐츠 설정
  let section = main_info.section;
  for(let i = 0; i < section.length; i++){
    let idx = section[i].idx
    section_list.push(idx);
    draw_section_list(idx);

    let section_width = section[i].width;
    if(!isEmpty(section_width)){
      if(String(section_width) != "100%"){
        $(`#chk_section_width_${idx}_2`).prop('checked', true);
        $(`#section_width_${idx}`).prop('disabled', false);
        $(`#section_width_${idx}`).val(section_width);
      }else{
        $(`#chk_section_width_${idx}_1`).prop('checked', true);
      }
    }
    $(`#section_category_${idx}`).val(section[i].category_idx);
    $(`input[name="chk_category_view_${idx}"][value=${section[i].section_category_view}]`).prop('checked', true);
    $(`input[name="chk_category_align_${idx}"][value=${section[i].section_category_align}]`).prop('checked', true);
    $(`#category_description_${idx}`).val(section[i].category_description);
    $(`input[name="chk_section_tem_${idx}"][value=${section[i].section_template}]`).prop('checked', true);
    if (i === section.length - 1) {
      section_start_number = Number(idx) + 1;
    }
  }

  if(!isEmpty(tempJSON.webzine_thumnail)){
    thumnail_name_file = tempJSON.webzine_thumnail.split(',');
    $.each(thumnail_name_file, function(key, items){
      let htmlData = `
      <li class="p-2 bg-gray-200 rounded flex items-center justify-between mt-1" id="thum_${key}">
      ${items} <button class="btn btn-danger btn-sm text-xs btn_thum_del"
        data-idx="${key}" data-file_name="${items}">취소</button></li>`;
        $('#thumnail_file_list').append(htmlData);
    });
  }

  if(!isEmpty(tempJSON.main_pdf_file)){
    pdf_name_file = tempJSON.main_pdf_file.split(',');
    $.each(pdf_name_file, function(key, items){
      let htmlData = `
      <li class="p-2 bg-gray-200 rounded flex items-center justify-between mt-1" id="pdf_${key}">
      ${items} <button class="btn btn-danger btn-sm text-xs btn_pdf_del"
        data-idx="${key}" data-file_name="${items}">취소</button></li>`;
        $('#pdf_file_list').append(htmlData);
    });
  }

  $(`input[name="chk_active"][value=${tempJSON.webzine_active}]`).prop('checked', true);
  $('#btn_insert_webzine_main').text('수정');
});

// 웹진메인 삭제버튼 클릭 시
$(document).on('click', '.btn_main_web_del', async function(){
  let bconfirm = false;
  await greenModal({
    type: "confirm",
    messageText: '웹진 메인페이지를 삭제하시겠습니까?',
    headerText : '웹진메인 삭제',
    alertType: "info"
  }).done(function (event) {
    bconfirm = event;
    return true;
  });
  if (!bconfirm) {return false};
  let idx = $(this).parent().data('idx');
  await delete_data(idx, 'webzine_main');

  let param = {};
  param.cmd = 'load_main_webzine_uuid';
  param.uuid = g_login.uuid;
  param.tbl_name = 'webzine_main';

  await call_ajax(param,  true);
  draw_main_webzine_list();
});



// 웹진 메인 작성 관련 끝 -----------------------------------------------------------------





// 카테고리 작성 시 메인인지 하위인지 구분하는 체크박스
$(document).on('click', 'input[name="chk_category_type"]', function(){
  let value = $('input[name="chk_category_type"]:checked').val();

  if(String(value) === "1"){
    if(isEmpty(g_category_list)){
      alert('현재 메인 카테고리가 존재하지 않습니다. \n 메인카테고리 등록 후 하위 카테고리를 등록해주세요.');
      $(this).prop('checked', false);
      return;
    }
    $('#child_select_div').css('display', 'flex');
  }else{
    $('#child_select_div').css('display', 'none');
  }
});

// 웹진카테고리 삭제 버튼 클릭 시
$(document).on('click', '.btn_category_del', async function(){
  let bconfirm = false;
  await greenModal({
    type: "confirm",
    messageText: '카테고리를 삭제하시겠습니까?',
    headerText : '카테고리 삭제',
    alertType: "info"
  }).done(function (event) {
    bconfirm = event;
    return true;
  });
  if (!bconfirm) {return false};
  let idx = $(this).data('idx');
  await delete_data(idx, 'webzine_category'); 

  let param = {};
  param.cmd = 'load_webzine_category_uuid';
  param.uuid = g_login.uuid;
  param.tbl_name = 'webzine_category';

  await call_ajax(param,  true);
  draw_webzine_category_list();
});
$(document).on('click', '.btn_sub_category_del', async function(){
  let bconfirm = false;
  await greenModal({
    type: "confirm",
    messageText: '카테고리를 삭제하시겠습니까?',
    headerText : '서브카테고리 삭제',
    alertType: "info"
  }).done(function (event) {
    bconfirm = event;
    return true;
  });
  if (!bconfirm) {return false};
  let idx = $(this).data('idx');
  await delete_data(idx, 'webzine_sub_category'); 

  let param = {};
  param.cmd = 'load_webzine_category_uuid';
  param.uuid = g_login.uuid;
  param.tbl_name = 'webzine_category';
  await call_ajax(param,  true);
  param = {};
  param.cmd = 'load_webzine_sub_category_uuid';
  param.uuid = g_login.uuid;
  param.tbl_name = 'webzine_sub_category';

  await call_ajax(param,  true);
  draw_webzine_category_list();
});

// 카테고리 작성하기
$(document).on('click', '#btn_insert_webzine_category', async function(){
  let idx = $('#idx').val();
  let type = $('input[name="chk_category_type"]:checked').val();
  if(isEmpty(type)){
    msgboxObj.message = '카테고리 유형을 선택하세요.';
    showiziModal(msgboxObj, getID('btn_insert_webzine_category'));
    return false;
  }

  let name = $('#webzine_category_name').val();
  let view_order = $('#webzine_category_view_order').val();
  let parent_idx = $('#parent_select').val();
  if(Number(type) === 1){
    if(isEmpty(parent_idx)){
      msgboxObj.message = '상위 카테고리를 선택하세요.';
      showiziModal(msgboxObj, getID('parent_select'));
      return false;
    }
  }
  
  if(isEmpty(name)){
    msgboxObj.message = '카테고리명을 작성하세요.';
    showiziModal(msgboxObj, getID('webzine_category_name'));
    return false;
  }
  if(isEmpty(view_order)){
    msgboxObj.message = '카테고리 순서를 작성하세요.';
    showiziModal(msgboxObj, getID('webzine_category_view_order'));
    return false;
  }

  if(isEmpty(idx)){
    if(Number(type) === 0){
      let nameChk = g_category_list.filter((items) => {
        return String(items.name) === String(name);
      });
      if(nameChk.length > 0){
        msgboxObj.message = '동일한 이름의 카테고리가 존재합니다.\n카테고리명을 다시 입력해주세요.';
        showiziModal(msgboxObj, getID('webzine_category_name'));
        return false;
      }
    
      let view_order_chk = g_category_list.filter((items) => {
        return Number(items.view_order) === Number(view_order);
      });
      if(view_order_chk.length > 0){
        msgboxObj.message = '동일한 카테고리 순서가 존재합니다.\n카테고리 순서를 다시 입력해주세요.';
        showiziModal(msgboxObj, getID('webzine_category_view_order'));
        return false;
      }
    }
  }
 
  let param = {};
  param.name = name;
  param.view_order = view_order;
  param.c_idx = g_login.customer_idx;
  param.uuid = g_login.uuid;


  if(isEmpty(idx)){
    if(Number(type) === 0){
      param.tbl_name = "webzine_category";
      param.cmd = "insert_category";
    }else{
      param.tbl_name = "webzine_sub_category";
      param.parent_idx = parent_idx;
      param.cmd = "insert_sub_category";
    }
  }else{
    if(Number(type) === 0){
      param.tbl_name = "webzine_category";
      param.cmd = "update_category";
    }else{
      param.tbl_name = "webzine_sub_category";
      param.parent_idx = parent_idx;
      param.cmd = "update_sub_category";
    }
    param.idx = idx;
  }

  await call_ajax(param,  true);

  param = {};
  param.cmd = 'load_webzine_category_uuid';
  param.tbl_name = 'webzine_category';
  param.uuid = g_login.uuid;

  await call_ajax(param,  true);

  param = {};
  param.cmd = 'load_webzine_sub_category_uuid';
  param.tbl_name = 'webzine_sub_category';
  param.uuid = g_login.uuid;
  await call_ajax(param,  true);

  // let target = $('#parent_select');
  // draw_select_box(g_category_list, target);
  draw_webzine_category_list();

  if(!isEmpty(g_main_category_idx)){
    $(`#sub_category_area_${g_main_category_idx}`).toggleClass('active');
  }
});

// // 카테고리 클릭 시 하위 카테고리 노출
// $(document).on('click', '.btn-main-category', function(){
//   let idx = $(this).parent().data('idx');
//   let target = $(`#sub_category_area_${idx}`);
//   target.toggleClass('none-view');
// });

// 카테고리 수정 클릭 시
$(document).on('click', '.btn_category_update', function(){
  let type = $(this).data('type');
  let idx = $(this).data('idx');


  var bsOffcanvas = $('#offcanvas');
  var offcanvas = new bootstrap.Offcanvas(bsOffcanvas); 
  offcanvas.toggle(); 
  $('#canvas_title').text('카테고리 수정');
  $('#canvas_body').empty();
  $('#canvas_body').html(PagesContent.webzine_category_write);
  let target = $('#parent_select');
  draw_select_box(g_category_list, target);
  if(type === "main"){
    let tempJSON = [...g_category_list];
    tempJSON = tempJSON.filter((items) => {
      return Number(items.idx) === Number(idx);
    });
    tempJSON = tempJSON[0];
    $('#chk_category_type_main').prop('checked', true);
    $('#webzine_category_name').val(tempJSON.name);
    $('#webzine_category_view_order').val(tempJSON.view_order);
    $('#idx').val(tempJSON.idx);
    $('#type').val(type);
  }else{
    let tempJSON = [...g_sub_category_list];
    tempJSON = tempJSON.filter((items) => {
      return Number(items.idx) === Number(idx);
    });
    tempJSON = tempJSON[0];
    $('#chk_category_type_sub').prop('checked', true);
    $('#child_select_div').css('display', 'flex');
    $('#webzine_category_name').val(tempJSON.name);
    $('#webzine_category_view_order').val(tempJSON.view_order);
    $('.sub-view').css('display', 'flex');
    $('#parent_select').val(Number(tempJSON.parent_idx));
    $('#idx').val(tempJSON.idx);
    $('#type').val(type);
  }
  $('#btn_insert_webzine_category').text('수정');
});





// 웹진 페이지 추가 -----------------------------------------------------------------

// 웹진 카테고리 작성하기 클릭시
$(document).on('click', '#btn_write_webzine_category', async function(event){
  var bsOffcanvas = $('#offcanvas');
  var offcanvas = new bootstrap.Offcanvas(bsOffcanvas); 
  offcanvas.toggle(); 
  $('#canvas_title').text('카테고리 작성');
  $('#canvas_body').empty();
  $('#canvas_body').html(PagesContent.webzine_category_write);

    let ca_target = $('#parent_select');
    draw_select_box(g_category_list, ca_target, 'ok');
});


// 웹진 작성하기 클릭시
$(document).on('click', '#btn_write_webzine', async function(event){
  if(isEmpty(g_main_idx)){
    alert('메인페이지를 클릭해서 작성할 웹진 월호를 선택해주세요.');
    return;
  }
  $('#content_body').html(PagesContent.webzine_list_write);
  thumnail_file = []; // 썸네일 파일 관련
  thumnail_name_file = []; // 썸네일 파일명 관련

  main_result_file = [];   // 파일업로드 시 기존 등록된 메인 파일 리스트
  main_files = [];      // 메인 파일 관련

  content_list_array = [];
  let month_target = $('#month_select');
  draw_select_box(g_webzine_main_list, month_target, 'main');
  $('#month_select').val(g_main_idx);
  $('#month_select').prop('disabled', true);

  let ca_target = $('#category_select');
  draw_select_box(g_category_list, ca_target, 'ok');

  $('#title').text('웹진 내용 작성하기');
  $('#title_color').spectrum();

  createEditor2('editor');
  if(g_webzine_content_list.length != 0){
    draw_content_before_setting(g_webzine_content_list[0]);
  }
});

// 웹진 작성시 메인 카테고리 선택 시
$(document).on('change', '#category_select', function(){
  let idx = $(this).val();
  let target = $('#sub_category_select');
  let tempJSON = g_sub_category_list.filter((items) => {
    return Number(items.	parent_idx) === Number(idx);
  });
  draw_select_box(tempJSON, target, 'ok');
});

// 웹진페이지 추가 클릭 시
$(document).on('click', '#btn_insert_webzine', async function(){
  let idx = $('#idx').val();
  let title = {};
  let parent_idx = $('#month_select').val();  // 부모 월 번호
  let webzine_month = getSelectBoxText('#month_select'); // 웹진월 텍스트
  let category_idx = $('#category_select').val(); // 카테고리 분류 번호
  let sub_category_idx = $('#sub_category_select').val(); // 카테고리 분류 번호
  let page_title = $('#webzine_name').val(); // 페이지 제목
  let page_sub_title = $('#webzine_sub_name').val(); // 페이지 부제목
  let title_banner_visible = $('input[name="chk_title_visible"]:checked').val(); // 타이틀 위치(배너)
  let title_align = $('input[name="chk_title_align"]:checked').val(); // 타이틀 정렬
  let title_position = $('input[name="chk_title_position"]:checked').val(); // 타이틀 포지션
  let title_color = $('#title_color').val(); // 타이틀 컬러
  let title_size = $('#title_font_size').val(); // 타이틀 사이즈
  let sub_title_size = $('#sub_title_font_size').val(); // 부제목 사이즈
  let description = $('#webzine_sub_description').val(); // 페이지 설명
  let webzine_writer = $('#webzine_writer').val();// 기사 작성자
  let writer_visible = $('input[name="chk_writer_visible"]:checked').val(); // 작성자 노출 여부
  let banner_height = $('input[name="chk_banner_height"]:checked').val(); // 배너 높이
  let word_break = $('input[name="chk_word_break"]:checked').val(); // 본문내용 줄바꿈관련
  let view_order = $('#webzine_page_view_order').val(); // 페이지 순서

  if (isEmptyToFocus(category_idx, "카테고리를를 선택하세요.",rtnIDString('category_select'), 0)){return false}
  //if (isEmptyToFocus(page_title, "페이지의 제목을 입력하세요.",rtnIDString('webzine_name'), 0)){return false}
  if (isEmptyToFocus(title_banner_visible, "제목 위치설정을 선택하세요.",rtnIDString('chk_title_visible_1'), 0)){return false}
  if (isEmptyToFocus(title_align, "제목 정렬을 선택하세요.",rtnIDString('chk_title_align_1'), 0)){return false}
  if (isEmptyToFocus(title_position, "제목 위치를 선택하세요.",rtnIDString('chk_title_position_1'), 0)){return false}
  if (isEmptyToFocus(title_color, "제목 색상을 선택하세요.",rtnIDString('title_color'), 0)){return false}
  if (isEmptyToFocus(title_size, "제목 폰트사이즈를 선택하세요.",rtnIDString('title_font_size'), 0)){return false}
  if (isEmptyToFocus(description, "페이지 설명을 입력하세요.",rtnIDString('webzine_sub_description'), 0)){return false}
  //if (isEmptyToFocus(writer_visible, "페이지 작성자 노출 여부를 선택하세요.",rtnIDString('chk_writer_visible_1'), 0)){return false}
  if (isEmptyToFocus(word_break, "본문내용 줄바꿈 옵션을 선택하세요.",rtnIDString('chk_word_break_1'), 0)){return false}
  if(Number(writer_visible) === 1){
    if (isEmptyToFocus(webzine_writer, "페이지 작성자를 입력하세요.",rtnIDString('webzine_writer'), 0)){return false}
  }
  if (isEmptyToFocus(banner_height, "배너 높이를 선택하세요.",rtnIDString('chk_banner_height_1'), 0)){return false}
  
  let real_url = `../webzine_folder/${g_login.uuid}/${webzine_month}/${category_idx}`;
  let temp_url = `../tempUpload`;

  // 타이틀 객체
  title.title = page_title;
  title.sub_title = page_sub_title;
  title.title_banner_position = title_banner_visible;
  title.title_align = title_align;
  title.title_position = title_position;
  title.title_color = title_color;
  title.title_size = title_size;
  title.sub_title_size = sub_title_size;
  title.banner_height = banner_height;
  title.word_break = word_break;

  title = JSON.stringify(title);
  title = urlencode(title);


  let content = editor2.getData();
  if(isEmpty(content)){
    alert('페이지 내용을 작성하세요.');
    return;
  }

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

  // console.log(editor_file_name);
  if(editor_file_name.length === 0){
    editor_file_name = "";
  }

  let formData = new FormData();
  // 썸네일
  for (var i = 0; i < thumnail_file.length; i++) {
    // 삭제되지 않은 파일만 폼데이터에 담기
    if (!thumnail_file[i].is_delete) {
      formData.append(`thumnail_file[]`, thumnail_file[i]);
    }
  }
  // 배너
  for (var i = 0; i < main_files.length; i++) {
    // 삭제되지 않은 파일만 폼데이터에 담기
    if (!main_files[i].is_delete) {
      formData.append(`main_files[]`, main_files[i]);
    }
  }

  if (content.includes(real_url)) {
    content = content.replaceAll(real_url, temp_url);
  }

  /**
   * 현재 에디터에서 이미지를 업로드 하면 tempUpload파일로 전송된다
   * 최종적으로 웹진리스트를 업로드할때 getData()에 남아있는 파일명만 따로 빼서 전송한 뒤에
   * tempUpload폴더 내에 있는 파일중에 editor_file_name에 있는 이름과 동일한 파일을 메인 폴더로 이동 시킨 후
   * tempUpload폴더에 있는 파일은 전부 삭제하는 로직을 구현해야함 -> 완료
   */

  formData.append("parent_idx", parent_idx); // 메인페이지 번호
  formData.append("view_order", view_order); // 페이지 순서
  formData.append("category_idx", category_idx); // 서브페이지 번호
  formData.append("sub_category_idx", sub_category_idx); // 서브카테고리 번호
  formData.append("description", description); // 페이지 설명
  formData.append("title_info", title); // 페이지 서브타이틀
  formData.append("page_title", page_title); // 페이지 타이틀
  formData.append("page_sub_title", page_sub_title); // 페이지 서브타이틀
  formData.append("webzine_writer", webzine_writer); // 페이지 작성자
  formData.append("writer_visible", writer_visible); // 작성자 보일지 말지
  formData.append("page_banner", main_result_file); // 배너 파일명
  formData.append("main_page_thumnail", thumnail_name_file); // 메인페이지에 보일 썸네일 파일 명
  formData.append("content", urlencode(content)); // 에디터로 작성한 html구조
  formData.append("editor_file_name", editor_file_name); // tempUpload폴더내에서 실제 웹진 리스트 폴더로 이동시킬 이미지파일
  formData.append("webzine_month", webzine_month); // tempUpload폴더내에서 실제 웹진 리스트 폴더로 이동시킬 이미지파일
  formData.append("uuid", g_login.uuid); // tempUpload폴더내에서 실제 웹진 리스트 폴더로 이동시킬 이미지파일
  formData.append("c_idx", g_login.customer_idx); // tempUpload폴더내에서 실제 웹진 리스트 폴더로 이동시킬 이미지파일
  
  if(isEmpty(idx)){
    formData.append("cmd", "insert_webzine_list");
  }else{
    formData.append("cmd", "update_webzine_list");
    formData.append("idx", idx);
  }

  headers = {};
  headers.Authorization = "Bearer " + g_access_token;
  await xhr_multipart("../server/api_new.php", formData, "", "", true);


  $('#btn_webzine_list_page').trigger('click');
});

// 웹진 수정클릭 시
$(document).on('click', '.btn_content_update', function(){
  let idx = $(this).parent().data('idx');
  g_make_main_idx = g_main_idx;
  let tempJSON = g_webzine_content_list.filter((items) => {
    return Number(idx) === Number(items.idx);
  });
  tempJSON = tempJSON[0];
  console.log(tempJSON);

  $('#content_body').html(PagesContent.webzine_list_write);
  thumnail_file = []; // 썸네일 파일 관련btn_write_webzine
  thumnail_name_file = []; // 썸네일 파일명 관련

  main_result_file = [];   // 파일업로드 시 기존 등록된 메인 파일 리스트
  main_files = [];      // 메인 파일 관련

  $('#title').text('웹진 내용 수정하기');

  let month_target = $('#month_select');
  draw_select_box(g_webzine_main_list, month_target, 'main');

  let ca_target = $('#category_select');
  draw_select_box(g_category_list, ca_target, 'ok');

  let ca_sub_target = $('#sub_category_select');
  let sub_list = g_sub_category_list.filter((items) => {
    return Number(items.parent_idx) === Number(tempJSON.category_idx);
  });
  draw_select_box(sub_list, ca_sub_target, 'ok');

  let title_info = tempJSON.title_info;
  title_info = urldecode(title_info);
  title_info = JSON.parse(title_info);
  console.log(title_info);

  $('#idx').val(idx);
  $('#month_select').val(tempJSON.parent_idx).prop("selected", true);
  $('#month_select').prop("disabled", true);
  $('#category_select').val(tempJSON.category_idx).prop("selected", true);
  $('#sub_category_select').val(tempJSON.sub_category_idx).prop("selected", true);
  $('#webzine_name').val(tempJSON.page_title);
  $('#webzine_sub_name').val(tempJSON.page_sub_title);

  $(`input[name="chk_banner_height"][value=${title_info.banner_height}]`).prop('checked', true);
  $(`input[name="chk_title_visible"][value=${title_info.title_banner_position}]`).prop('checked', true);
  $(`input[name="chk_title_align"][value=${title_info.title_align}]`).prop('checked', true);
  $(`input[name="chk_title_position"][value=${title_info.title_position}]`).prop('checked', true);
  $(`input[name="chk_title_position"][value=${title_info.title_position}]`).prop('checked', true);
  $('#title_color').val(title_info.title_color);
  $('#title_font_size').val(title_info.title_size);
  $('#title_font_size_output').css('font-size', `${title_info.title_size}px`);
  $('#title_font_size_output').text(title_info.title_size);
  $('#sub_title_font_size').val(title_info.sub_title_size);
  $('#sub_title_font_size_output').css('font-size', `${title_info.sub_title_size}px`);
  $('#sub_title_font_size_output').text(title_info.sub_title_size);
  $(`input[name="chk_title_position"][value=${title_info.title_position}]`).prop('checked', true);

  $('#webzine_sub_description').val(tempJSON.description);
  $('#webzine_writer').val(tempJSON.webzine_writer);
  $(`input[name="chk_writer_visible"][value=${tempJSON.writer_visible}]`).prop('checked', true);
  $(`input[name="chk_word_break"][value=${title_info.word_break}]`).prop('checked', true);

  main_result_file = tempJSON.page_banner.split(',');
  $.each(main_result_file, function(key, items){
    let htmlData = `
    <li class="p-2 bg-gray-200 rounded flex items-center justify-between mt-1" id="main_${key}">
    ${items} <button class="btn btn-danger btn-sm text-xs btn_main_del"
      data-idx="${key}" data-file_name="${items}">취소</button></li>`;
    $('#main_file_list').append(htmlData);
  });

  thumnail_name_file = tempJSON.main_page_thumnail.split(',');
  $.each(thumnail_name_file, function(key, items){
    let htmlData = `
    <li class="p-2 bg-gray-200 rounded flex items-center justify-between mt-1" id="thum_${key}">
    ${items} <button class="btn btn-danger btn-sm text-xs btn_thum_del"
      data-idx="${key}" data-file_name="${items}">취소</button></li>`;
      $('#thumnail_file_list').append(htmlData);
  });

  let real_url = `../webzine_folder/${g_login.uuid}/${tempJSON.webzine_month}/img/${tempJSON.category_idx}`;
  let temp_url = `../tempUpload`;
  let content = urldecode(tempJSON.contents);
  content = content.replaceAll(temp_url, real_url);
  createEditor2('editor', content);

  $('#webzine_page_view_order').val(tempJSON.view_order);

  $('#btn_insert_webzine').text('수정');
  $('#btn_del_webzine_list').css('display', 'inline-block');
});


// 웹진 페이지 삭제 시
$(document).on('click', '#btn_del_webzine_list', async function(){
  let bconfirm = false;
  await greenModal({
    type: "confirm",
    messageText: '콘텐츠를 삭제하시겠습니까?',
    headerText : '콘텐츠 삭제',
    alertType: "info"
  }).done(function (event) {
    bconfirm = event;
    return true;
  });
  if (!bconfirm) {return false};
  let idx = $('#idx').val();
  await delete_data(idx, 'webzine_contents'); 
  $('#btn_webzine_list_page').trigger('click');
});




// 웹진 페이지 추가 끝 -----------------------------------------------------------------

/* 첨부파일 검증 */
function validation(obj){
  const fileTypes = ['application/pdf', 'image/gif', 'image/jpeg', 'image/png', 'image/bmp', 'image/tif', 'application/haansofthwp', 'application/x-hwp'];
  if (obj.name.length > 100) {
      alert("파일명이 100자 이상인 파일은 제외되었습니다.");
      return false;
  } else if (obj.size > (100 * 1024 * 1024)) {
      alert("최대 파일 용량인 100MB를 초과한 파일은 제외되었습니다.");
      return false;
  } else if (obj.name.lastIndexOf('.') == -1) {
      alert("확장자가 없는 파일은 제외되었습니다.");
      return false;
  } else if (!fileTypes.includes(obj.type)) {
      alert("첨부가 불가능한 파일은 제외되었습니다.");
      return false;
  } else {
      return true;
  }
}

// 웹진 미리보기
$(document).on('click', '.btn_preview', function(){
  let idx = $(this).parent().data('idx');
  let tempJSON = g_webzine_main_list.filter((items) => {
    return Number(items.idx) === Number(idx);
  });
  tempJSON = tempJSON[0];
  window.open(`https://webzine.menteimo.com/webzine_folder/${g_login.uuid}/${tempJSON.webzine_month}/index.html`);
});


