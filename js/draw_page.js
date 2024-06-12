async function draw_index(){
  $('#db_wrapper').html(PagesContent.template);
  $('#nav_aside').html(PagesContent.nav_aside);
  $('#customer_name').text(g_login.customer_name);
  let level = g_login.level;
  if(Number(level) === 5){
    $('#btn_template_page').css('display', 'block');
    $('#btn_customer_page').css('display', 'block');
    $('#btn_member_page').css('display', 'block');
  }else{
    $('#btn_template_page').css('display', 'none');
    $('#btn_customer_page').css('display', 'none');
    $('#btn_member_page').css('display', 'none');
  }

    $('#content_header').html(PagesContent.nav_top);
    feather.replace();
    $('#user_name').text(g_login.name);

    let param = {};
    param.cmd = "load_webzine_option_uuid";
    param.tbl_name = "webzine_option";
    param.uuid = g_login.uuid;
    await call_ajax(param, true); 

    
    param = {};
    param.cmd = "load_customer";
    param.tbl_name = "customer";
    await call_ajax(param,  true);

    console.log(g_webzine_option);

    if(g_webzine_option.length === 0){ // 옵션 설정이 안되어 있을때
      $('#content_body').html(PagesContent.none_option_page);
    }else{ // 옵션이 설정 되었을때
      $('#content_body').html(PagesContent.option_page);
      let options = g_webzine_option[0].template_info;
      $('#idx').val(g_webzine_option[0].idx);
      options = urldecode(options);
      options = JSON.parse(options);

      let header_option = options.header;
      let search_option = options.header.search;
      let menu_option = options.header.search;
      let frame_width = options.width;
      let footer_option = options.footer;
      let floating_option = options.floating;


      let h_img = `<img class='block' style="width:120px;" src="../webzine_folder/${g_login.uuid}/${header_option.logo.src}">`;
      let f_img = `<img class='block' style="width:120px;" src="../webzine_folder/${g_login.uuid}/${footer_option.src}">`;

      $("#header_logo").html(h_img);
      $("#footer_logo").html(f_img);

      if(Number(floating_option.visible) === 0){
        $('#floating_active').text('미사용');
      }else{
        $('#floating_active').text('사용');
      }

      $('#footer_info').html(footer_option.customer_name + '<br>' + footer_option.address + '<br>' + footer_option.copyright);
    }
}

async function draw_login(){
  $('#db_wrapper').empty();
  $('#login_div').css('display', 'block'); 
  $('#login_div').html(PagesContent.login);  

  
  param = {};
  param.cmd = "load_customer";
  param.tbl_name = "customer";
  await call_ajax(param,  true);
}

function draw_webzine_list_page(){
  $('#content_body').empty();
  $('#content_body').html(PagesContent.webzine_list);
}

// 기본정보 관리 페이지 그리기
async function draw_customer_page(){
  $('#content_body').empty();
  $('#content_body').html(PagesContent.customer_list);
  let param = {};
  param.cmd = "load_customer";
  param.tbl_name = "customer";
  await call_ajax(param,  true);

  draw_customer_list(g_customer_list);
}

// 회원관리 페이지 그리기
async function draw_member_page(){
  $('#content_body').empty();
  $('#content_body').html(PagesContent.member_list);
  let param = {};
  param.cmd = "load_member";
  param.tbl_name = "webzine_member";
  await call_ajax(param,  true);

  draw_member_list(g_member_list);
}




function view_page(page){
  switch (page){
    case "index" :
      draw_index();
      break;
    case "webzine_list" :
      draw_webzine_list_page();
      break;
    case "customer_page" :
      draw_customer_page();
      break;
    case "member_page" :
      draw_member_page();
      break;
    default : 
      break;
  }  
}