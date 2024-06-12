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

async function getPageList(PList){
  try{
    await fetchAllPagesContent(PList)
  }
  catch(e){
    alert(e.message);
  }
}

//익스플로러 버전 체크
function get_version_of_IE() { 

  var word; 
  var version = "N/A"; 

  var agent = navigator.userAgent.toLowerCase(); 
  var name = navigator.appName; 

  // IE old version ( IE 10 or Lower ) 
  if ( name == "Microsoft Internet Explorer" ) word = "msie "; 

  else { 
    // IE 11 
    if ( agent.search("trident") > -1 ) word = "trident/.*rv:"; 

    // Microsoft Edge  
    else if ( agent.search("edge/") > -1 ) word = "edge/"; 
  } 

  var reg = new RegExp( word + "([0-9]{1,})(\\.{0,}[0-9]{0,1})" ); 

  if (  reg.exec( agent ) != null  ) version = RegExp.$1 + RegExp.$2; 

  //return version;
  version = parseInt(version);
  return version;
}

//스크린 줌 인/아웃
function zoomIn() {
 var version = get_version_of_IE();
 if(version <= 9){
    alert("해당 기능은 [Internet Explorer 9] 이하 버전에서는 지원하고 있지 않습니다. 안전하고 쾌적한 인터넷 환경을 위해 상위 버전의 브라우저로 업데이트 해주세요.");
    return false;
 }
 var zoomControlTag = $("#zoomControlTag").val();
 var zoomInValue = parseInt(zoomControlTag) + 10;
 $("#zoomControlTag").val(zoomInValue);
 zoomInValue = zoomInValue.toString();
 zoomInValue = zoomInValue+"%";
 $("body").css("zoom", zoomInValue);
}
function zoomOut() {
 var version = get_version_of_IE();
 if(version <= 9){
    alert("해당 기능은 [Internet Explorer 9] 이하 버전에서는 지원하고 있지 않습니다. 안전하고 쾌적한 인터넷 환경을 위해 상위 버전의 브라우저로 업데이트 해주세요.");
    return false;
 }
 var zoomControlTag = $("#zoomControlTag").val();
 var zoomOutValue = parseInt(zoomControlTag) - 10;
 $("#zoomControlTag").val(zoomOutValue);
 zoomOutValue = zoomOutValue.toString();
 zoomOutValue = zoomOutValue+"%";
 $("body").css("zoom", zoomOutValue);
}
function reset_zoom() {
 var version = get_version_of_IE();
 if(version <= 9){
    alert("해당 기능은 [Internet Explorer 9] 이하 버전에서는 지원하고 있지 않습니다. 안전하고 쾌적한 인터넷 환경을 위해 상위 버전의 브라우저로 업데이트 해주세요.");
    return false;
 }
 $("#zoomControlTag").val("100");
 $("body").css("zoom", "100%");
}

$(document).ready(function(){
 $('.gnbBt').on('click',function(){
   $(this).hide();
   $('.gnb').show();
   $('body').append('<div class="dimm"></div>')
   return false;
 })
 $('.closeGnb').on('click',function(){
   $('.gnb').hide();
   $('.gnbBt').show();
   $('.dimm').remove();
   return false;
 })
})

//URL복사
function clip(){
     var IE=(document.all)?true:false;
     if (IE) {
         window.clipboardData.setData("Text", location.href);
     } else {
         temp = prompt("컴퓨터 사용 시 Ctrl+C를 눌러 복사, 스마트폰 등의 모바일 기기에서는 꾹 눌러서 복사하세요", location.href);
     }
}

















