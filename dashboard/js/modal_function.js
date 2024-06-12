function view_modal(object){
  return new Promise((resolve, reject) => {
    let type = object.type;
    let main_text = object.main_text;
    let sub_text = object.sub_text;
    let icon = object.icon;
  
    $('#alert_modal').html(ALERT_HTML);
    $('#alert_icon_div').html(MODAL_ICON_OBJ[icon]);
    $('#alert_main_text').text(main_text);
    $('#alert_sub_text').text(sub_text);
    if(type === "confirm"){
      $('#btn_alert_true').on('click', function() {
        $('#alert_modal').removeClass('view');
        // $('#alert_modal').empty();
        resolve(true); // 확인 버튼 클릭시 true 반환
      });
      $('#btn_alert_false').on('click', function() {
        $('#alert_modal').removeClass('view');
        // $('#alert_modal').empty();
        resolve(false); // 취소 버튼 클릭시 false 반환
      });
    }else if(type === "alert"){
      $('#btn_alert_false').text('닫기');
      $('#btn_alert_true').remove();
      $('#btn_alert_false').on('click', function() {
        $('#alert_modal').removeClass('view');
        // $('#alert_modal').empty();
        resolve(true); // 닫기 버튼 클릭시 false 반환
      });
    }
    $('#alert_modal').addClass('view');
  });
}

function view_alert(object, focus_id=""){
  let main_text = object.main_text;
  let icon = object.icon;

  $('#alert_modal').html(ALERT_HTML);
  $('#alert_icon_div').html(MODAL_ICON_OBJ[icon]);
  $('#alert_main_text').text(main_text);
  $('#btn_group').remove();
  $('#alert_modal').addClass('view');
  if(!isEmpty(focus_id)){
    $(focus_id).focus();
  }
  setTimeout(function() {
    $('#alert_modal').removeClass('view');
  }, 1000);
}