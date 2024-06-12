function draw_customer_table(pData){
  let table_data = pData.table_data;
  let total_count  = pData.total_count ;
  let now_page  = pData.now_page ;

  let target = $('#customer_list');

  let tempHTML = "";
  $.each(table_data, function(key, items){
    tempHTML += `<tr class="s-tr">
            <td class="s-td text-center"><input type='checkbox' class='cus_notice_chk' name='cus_content_chk' value='${items.idx}'></td>
            <td class="s-td text-center">${items.idx}</td>
            <td class="s-td btn-sel-customer cursor-pointer" data-idx=${items.idx}>${urldecode(items.cs_name)}</td>
            <td class="s-td text-center">${items.uuid}</td>
          </tr>`;
  });
  target.html(tempHTML);

  draw_pagination(total_count, now_page, "customer.html");
}

function draw_user_table(pData){
  let table_data = pData.table_data;
  let total_count  = pData.total_count ;
  let now_page  = pData.now_page ;

  let target = $('#user_table');

  let tempHTML = "";
  $.each(table_data, function(key, items){
    let status = items.mem_active;
    if(Number(status) === 1){
      status = "활성화";
    }else{
      status = "비활성화";
    }

    tempHTML += `<tr class="s-tr">
            <td class="s-td text-center"><input type='checkbox' class='user_notice_chk' name='user_content_chk' value='${items.idx}'></td>
            <td class="s-td text-center">${items.idx}</td>
            <td class="s-td text-center btn-sel-user cursor-pointer" data-idx=${items.idx}>${items.mem_id}</td>
            <td class="s-td text-center">${urldecode(items.mem_name)}</td>
            <td class="s-td text-center">${items.mem_email}</td>
            <td class="s-td text-center">${status}</td>
            <td class="s-td text-center">${items.mem_login_date ? items.mem_login_date : "로그인 기록 없음"}</td>
          </tr>`;
  });
  target.html(tempHTML);

  draw_pagination(total_count, now_page, "user.html");
}

function draw_notice_table(pData){
  let table_data = pData.table_data;
  let total_count  = pData.total_count ;
  let now_page  = pData.now_page ;
  let uuid = getUrlValue('cs_uuid');

  let target = $('#notice_list');
  let tempHTML = "";
  if(total_count != 0){
    $.each(table_data, function(key, items){
      let file = items.files;
      if(isEmpty(file)){
        file = "";
      }else{
        file = `<i class='bx bx-file' ></i>`
      }

  
      tempHTML += `<tr class="s-tr">
              <td class="s-td text-center admin-box"><input type='checkbox' class='main_notice_chk' name='main_content_chk' value='${items.idx}'></td>
              <td class="s-td text-center">${items.idx}</td>
              <td class="s-td btn-sel-notice cursor-pointer"
                 data-idx=${items.idx}>${urldecode(items.title)}</td>
              <td class="s-td text-center">${file}</td>
              <td class="s-td text-center">${items.write_date}</td>
              <td class="s-td text-center">${items.writer}</td>
              <td class="s-td text-center">${items.hit}</td>
            </tr>`;
    });
  }else{
    tempHTML = `<tr class="s-tr">
    <td class="s-td text-center" colspan="6">게시물이 없습니다.</td>
    
  </tr>`;
  }
  target.html(tempHTML);
  

  draw_main_pagination(total_count, now_page, `index.html?cs_uuid=${uuid}`);
}

function draw_pagination(total_count, now_page, page) {
  if (total_count <= TABLE_VIEW_COUNT) {
    $('#pagenation_div').empty();
    return;
  }

  let total_pages = Math.ceil(total_count / TABLE_VIEW_COUNT);
  let start_page = now_page - Math.floor(PAGE_NATION_COUNT / 2);
  start_page = Math.max(1, start_page);
  let end_page = Math.min(total_pages, start_page + PAGE_NATION_COUNT - 1);

  var pagination_html = '<ul>';
   

    // 이전 페이지로 이동하는 화살표
    if (now_page > 1) {
        pagination_html += `<li><a class="pagenation-a" href="${page}?page=${now_page - 1}" data-page="${now_page - 1}"><i class="bx bx-chevron-left"></i></a></li>`;
    }

    for (var i = start_page; i <= end_page; i++) {
        if (i == now_page) {
            pagination_html += `<li><a class="pagenation-a active" href="#">${i}</a></li>`;
        } else {
            pagination_html += `<li><a class="pagenation-a" href="${page}?page=${i}" data-page="${i}">${i}</a></li>`;
        }
    }

    // 다음 페이지로 이동하는 화살표
    if (now_page < total_pages) {
        pagination_html += `<li><a class="pagenation-a" href="${page}?page=${now_page + 1}" data-page="${now_page + 1}"><i class="bx bx-chevron-right"></i></a></li>`;
    }

   
    pagination_html += '</ul>';

    // 페이징을 해당 DOM에 추가
    $('#pagenation_div').html(pagination_html);
}

// 메인페이지용
function draw_main_pagination(total_count, now_page, page) {
  if (total_count <= TABLE_VIEW_COUNT) {
    $('#pagenation_div').empty();
    return;
  }

  let total_pages = Math.ceil(total_count / TABLE_VIEW_COUNT);
  let start_page = now_page - Math.floor(PAGE_NATION_COUNT / 2);
  start_page = Math.max(1, start_page);
  let end_page = Math.min(total_pages, start_page + PAGE_NATION_COUNT - 1);

  var pagination_html = '<ul>';
   

    // 이전 페이지로 이동하는 화살표
    if (now_page > 1) {
        pagination_html += `<li><a class="pagenation-a" href="${page}&page=${now_page - 1}" data-page="${now_page - 1}"><i class="bx bx-chevron-left"></i></a></li>`;
    }

    for (var i = start_page; i <= end_page; i++) {
        if (i == now_page) {
            pagination_html += `<li><a class="pagenation-a active" href="#">${i}</a></li>`;
        } else {
            pagination_html += `<li><a class="pagenation-a" href="${page}&page=${i}" data-page="${i}">${i}</a></li>`;
        }
    }

    // 다음 페이지로 이동하는 화살표
    if (now_page < total_pages) {
        pagination_html += `<li><a class="pagenation-a" href="${page}&page=${now_page + 1}" data-page="${now_page + 1}"><i class="bx bx-chevron-right"></i></a></li>`;
    }

   
    pagination_html += '</ul>';

    // 페이징을 해당 DOM에 추가
    $('#pagenation_div').html(pagination_html);
}

// 사용자 추가시 셀렉박스
function draw_user_cs_select(pData){
  let target = $('#sel_user_customer')
  let tempHTML = "<option value=''>고객사를 선택하세요</option>";

  $.each(pData, function(key, items){
    tempHTML += `<option value="${items.uuid}">${urldecode(items.cs_name)}</option>`;
  });

  target.html(tempHTML);
}
function draw_user_cs_select2(pData){
  let target = $('#ad_ul')
  let tempHTML = "";

  $.each(pData, function(key, items){
    tempHTML += `<li class="ad-li"><input type="checkbox" 
    class='sel-ad-list' name='sel_ad_list'
    id='sel_ad_list_${items.idx}' value="${items.uuid}">
    <label for="sel_ad_list_${items.idx}">${urldecode(items.cs_name)}</label></li>`;
  });

  target.html(tempHTML);
}

// 메인페이지 고객사 버튼 그리기
function draw_customer_btn_list(pData){
  let target = $('#cs_list')

  let tempHTML = "";
  $.each(pData, function(key, items){
    tempHTML += `<li class="c-list-li"><a class="c-list-a btn-select-customer" id='btn_${items.uuid}' href="index.html?cs_uuid=${items.uuid}">${urldecode(items.cs_name)}</a></li>`;
  });

  target.html(tempHTML);
}

// 게시판 보기 페이지
function draw_notice_view_page(pData, page){
  let data = pData.current_data;
  let next_data = pData.next_data;
  let prev_data = pData.previous_data;

  let tempURL = 'tempUpload';
  let realURL = `notice_file/${data.uuid}`;

  $('#title').text(urldecode(data.title));
  $('#writer').text(data.writer);
  $('#hit').text(data.hit);
  $('#write_date').text(data.write_date);
  let content = urldecode(data.content);
  if (content.includes(tempURL)) {
    content = content.replaceAll(tempURL, realURL);
  }
  $('#content').html(content);

  let f_list = data.files;
  f_list = f_list.split(',');
  let f_html = "";
  if(f_list.length != 0 && !isEmpty(f_list)){
    for(let i = 0; i < f_list.length; i++){
      f_html += `<li><a class="view-file-a" 
      download 
      href="notice_file/${data.uuid}/${f_list[i]}">${f_list[i]}</a></li>`;
    }
    $('#f_list').html(f_html);
  }

  let npHTML = "";
  if(!isEmpty(prev_data)){
    npHTML  = npHTML + `<div class="n-div">
    <p class="np-head">이전글</p>
    <a class="view-file-a" href="notice_view.html?idx=${prev_data.idx}&cs_uuid=${prev_data.uuid}&page=${page}">${urldecode(prev_data.title)}</a>
  </div>`
  }
  if(!isEmpty(next_data)){
    npHTML  = npHTML + `<div class="n-div">
    <p class="np-head">다음글</p>
    <a class="view-file-a" href="notice_view.html?idx=${next_data.idx}&cs_uuid=${next_data.uuid}&page=${page}">${urldecode(next_data.title)}</a>
  </div>`
  }

  $('#np_div').html(npHTML);
  if(Number(g_login.mem_level) != 5){
    if(Number(g_login.mem_level) != 3){
      if(String(g_login.mem_name) != String(data.writer)){
        $('#btn_go_upPage').remove();
        $('#btn_del_notice').remove();
      }
    }
  }

}

// 게시판 수정 페이지
function draw_update_page(pData){
  let data = pData.current_data;

  
  let tempURL = 'tempUpload';
  let realURL = `notice_file/${data.uuid}`;

  $('#n_title').val(urldecode(data.title));
  let content = urldecode(data.content);
  if (content.includes(tempURL)) {
    content = content.replaceAll(tempURL, realURL);
  }
  createEditor2('editor', content);

  let f_list = data.files;
  main_result_file = f_list.split(',');
  $.each(main_result_file, function(key, items){
    let htmlData = `
    <li class="file-li" id="main_${key}">
              <p class="file-p">${items}</p>
              <button class="file-btn btn_main_del"
              data-idx="${key}" data-file_name="${items}">
              <i class='bx bx-x'></i></button>
             </li>`;
    $('#file_area').append(htmlData);
  });
  $('#btn_insert_notice').text('수정');
}

function draw_reple(pData){
  let target = $("#reple_div");
  let tempHTML = "";

  $.each(pData, function(key, items){
    if(Number(g_login.mem_level) === 5 || Number(g_login.mem_level) === 3){
      tempHTML += `<div class="reple-body">
      <div class="re-head">
        <h5 class="reple-h5">${items.writer}</h5>
        <p class="re-date" id="re_date_${items.idx}">${items.write_date}</p>
      </div>
      <p class="re-content" id="re_content_${items.idx}">${items.content}</p>
      <div class='update-re-box display-none' id='update_box_${items.idx}'>
        <textarea class="re-text" name="reple" id="reple_${items.idx}" cols="30" rows="10">${items.content}</textarea>
        <div class='update-re-box-btns'>
          <button class='btn_update_re' data-idx='${items.idx}'>수정</button>
          <button class='update_close' data-idx='${items.idx}'>닫기</button>
        </div>
      </div>
      <div class="re-btn-group">
        <button class="btn-icon-mode btn_re_update_mode" data-idx='${items.idx}'><i class='bx bx-edit-alt'></i></button>
        <button class="btn-icon-mode btn_re_del" data-idx='${items.idx}'><i class='bx bx-trash'></i></button>
      </div>
    </div>`;
    }else{
      if(String(items.writer_id) === String(g_login.mem_id)){
        tempHTML += `<div class="reple-body">
        <div class="re-head">
          <h5 class="reple-h5">${items.writer}</h5>
          <p class="re-date" id="re_date_${items.idx}">${items.write_date}</p>
        </div>
        <p class="re-content" id="re_content_${items.idx}">${items.content}</p>
        <div class='update-re-box display-none' id='update_box_${items.idx}'>
          <textarea class="re-text" name="reple" id="reple_${items.idx}" cols="30" rows="10">${items.content}</textarea>
          <div class='update-re-box-btns'>
            <button class='btn_update_re' data-idx='${items.idx}'>수정</button>
            <button class='update_close' data-idx='${items.idx}'>닫기</button>
          </div>
        </div>
        <div class="re-btn-group">
          <button class="btn-icon-mode btn_re_update_mode" data-idx='${items.idx}'><i class='bx bx-edit-alt'></i></button>
          <button class="btn-icon-mode btn_re_del" data-idx='${items.idx}'><i class='bx bx-trash'></i></button>
        </div>
      </div>`;
      }else{
        tempHTML += `<div class="reple-body">
        <div class="re-head">
          <h5 class="reple-h5">${items.writer}</h5>
          <p class="re-date" id="re_date_${items.idx}">${items.write_date}</p>
        </div>
        <p class="re-content" id="re_conten_${items.idx}t">${items.content}</p>
      </div>`;
      }
    }
  });

  target.html(tempHTML);
}