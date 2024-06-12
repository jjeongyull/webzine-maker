$(async function(){
  let param = {};
  param.cmd = "load_webzine_option_uuid";
  param.tbl_name = "webzine_option";
  param.uuid = UUID;
  await call_ajax(param, true); 

  param = {};
  param.cmd = 'load_main_webzine_uuid';
  param.uuid = UUID;
  param.tbl_name = 'webzine_main';
  await call_ajax(param,  true);

  param = {};
  param.cmd = 'load_webzine_contents_uuid';
  param.tbl_name = 'webzine_contents';
  param.uuid = UUID;
  await call_ajax(param,  true);

  param = {};
  param.cmd = 'load_webzine_sub_category_uuid';
  param.tbl_name = 'webzine_sub_category';
  param.uuid = UUID;
  await call_ajax(param,  true);

  param = {};
  param.cmd = 'load_webzine_category_uuid';
  param.tbl_name = 'webzine_category';
  param.uuid = UUID;
  await call_ajax(param,  true);



  draw_header();
  draw_sub_banner();
  draw_sub_content();
  draw_tab_btn();
  draw_other_page_view();
  draw_footer();
  draw_floating();
});