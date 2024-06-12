$(async function(){
  if (isEmpty(g_access_token)){
    login_token("server/api_main.php");
  }
  let darkMode = getCookie("darkMode");
  if(darkMode === "true"){
    $('body').addClass('dark');
    $('.mode-text').text("Light Mode");
  }
  
  $('#side_bar').html(SIDEBAR_HTML);

  if(Number(g_login.mem_level) != 5){
    $('#user_page_li').remove();
    $('#customer_li').remove();
  }

  let param = {};
  let page = getUrlValue('page');
  let uuid = getUrlValue('cs_uuid');
  let idx = getUrlValue('idx');
  let search = getUrlValue('search');
  if(isEmpty(page)){
    page = 1;
  }
  if(isEmpty(uuid)){
    uuid = "";
  }

  // 메인페이지 일때
  if (window.location.href.indexOf("index.html") !== -1) {
    $('#mainPage').addClass('active');

    param = {};
    param.cmd = "load_customer_all_data";
    await call_ajax(param,  false);
    if(Number(g_login.mem_level) === 5){
      draw_customer_btn_list(g_customer_all_data);
    }else if(Number(g_login.mem_level) === 3){
      let ad_list = g_login.ad_list;
      ad_list = ad_list.split(',');

      let tempJSON = g_customer_all_data.filter((items) => {
        let boolean = false;
        for(let i = 0; i < ad_list.length; i++){
          if(String(items.uuid) === String(ad_list[i])){
            boolean = true;
          }
        }
        if(boolean){
          return items;
        }
      });
      draw_customer_btn_list(tempJSON);
    }else{
      let tempJSON = g_customer_all_data.filter((items) => {
        return String(g_login.mem_uuid) === String(items.uuid);
      });
      draw_customer_btn_list(tempJSON);
    }

    if(!isEmpty(uuid)){
      $(`#btn_${uuid}`).addClass('active');
      $(`#btn_write_notice`).css('display', 'block');
      $('#search_notice_div').removeClass('display-none');

      if(isEmpty(search)){
        param = {};
        param.cmd = "load_notice";
        param.uuid = uuid;
        param.page = page;
        await call_ajax(param,  false);
        draw_notice_table(g_notice_data);
      }else{
        param = {};
        param.cmd = "load_search_notice";
        param.uuid = uuid;
        param.page = page;
        param.search = urlencode(search);
        await call_ajax(param,  false);
        draw_notice_table(g_notice_data);
        $('#search_notice').val(search);
      }
      if(Number(g_login.mem_level) != 5){
        if(Number(g_login.mem_level) != 3){
          $('.admin-box').remove();
          $('#btn_check_del_main').remove();
        }
      }

    }
  }

  // 게시판보기페이지 일때
  if (window.location.href.indexOf("notice_view.html") !== -1) {
    $('#mainPage').addClass('active');
    param = {};
    param.cmd = "load_view_notice";
    param.idx = idx;
    param.uuid = uuid;

    await call_ajax(param,  false);
    draw_notice_view_page(g_notice_one_data, page);

    param = {};
    param.cmd = "load_reple";
    param.idx = idx;
    param.uuid = uuid;
    await call_ajax(param,  false);
    draw_reple(g_reple_data);

    param = {};
    param.cmd = "update_hit";
    param.idx = idx;
    param.uuid = uuid;

    await call_ajax(param,  false);
 
  }

  // 게시판 작성 일때
  if (window.location.href.indexOf("write_notice.html") !== -1) {
    let idx = getUrlValue('idx');
    $('#mainPage').addClass('active');
    $(`#btn_${uuid}`).addClass('active');
    if(!isEmpty(idx)){
      param = {};
      param.cmd = "load_view_notice";
      param.idx = idx;
      param.uuid = uuid;
  
      await call_ajax(param,  false);
      draw_update_page(g_notice_one_data);
    }else{
      createEditor2('editor');
    }
  }

  // 고객사 페이지 일때
  if (window.location.href.indexOf("customer.html") !== -1) {
    $('#customer').addClass('active');

  
    param = {};
    param.page = Number(page);
    param.cmd = "load_customer_table_data";
    await call_ajax(param,  false);

    draw_customer_table(g_customer_table_data);
  }

  // 사용자 페이지 일때
  if (window.location.href.indexOf("user.html") !== -1) {
    $('#user_page').addClass('active');
    param = {};
    param.cmd = "load_customer_all_data";
    await call_ajax(param,  false);

    param = {};
    param.page = Number(page);
    param.cmd = "load_user_table_data";
    await call_ajax(param,  false);

    draw_user_cs_select(g_customer_all_data);
    draw_user_cs_select2(g_customer_all_data);
    draw_user_table(g_user_table_data);
  }
});