let swiper;
let editor2;
let g_access_token = "";

/** 메시지 상자 */
const title_default = "Notice";
const title_alert = 'Alert';
const title_success = 'Success';
const title_result = 'Result';
const msg_close_delay = 2000;

const exception_error_code = -1;
const no_delay = 0;

const t_error = 1;
const t_sucess = 0;

const status_sucess_code = [200, 201, 202, 400];

// 메시지 상자 객체
const msgboxObj = {"status" : "", "message" : "", "closetime" : "0", "type" : "1", "title" : title_default}
// 팝업 상자 객체
const popupObj = {};

let g_login = new Object();

let gpage = "";

// 웹진 옵션 콘텐츠 갯수 카운트 전역변수
let con_count = 0;

// 고객사 전역 변수
let g_customer_list = new Object();


// 메인 인덱스 전역변수
let g_webzine_main_list = new Object();

// 멤버 리스트
let g_member_list = new Object();

// 카테고리 전역변수
let g_category_list = new Object();

// 하위 카테고리 전역변수
let g_sub_category_list = new Object();

// 웹진 페이지 전역변수
let g_webzine_content_list = new Object();

// 웹진 옵션 정의
let g_webzine_option = new Object();

// 웹진 옵션 로고 헤더, 푸터 파일명 저장
let h_logo = "";
let f_logo = "";


let thumnail_file = []; // 썸네일 파일 관련
let thumnail_name_file = []; // 썸네일 파일명 관련

let pdf_file = [];
let pdf_name_file = [];

let main_result_file = [];   // 파일업로드 시 기존 등록된 메인 파일 리스트
let main_files = [];      // 메인 파일 관련
let delete_main_data = []; // 파일 삭제를 위한 메인이미지 변수

let detail_result_file = [];   // 파일업로드 시 기존 등록된 상세이미지 파일 리스트
let detail_files = [];      // 상세이미지 파일 관련
let delete_detail_data = []; // 파일 삭제를 위한 상세이미지 변수

let content_file = []; // 콘텐츠 작성시 파일
let content_file_name = []; // 콘텐츠 작성시 파일 네임



// 콘텐츠 입력 시 id값 배열
let content_list_array = [];

// 섹션 배열 리스트
let section_list = [];
let section_start_number = 1;

// 메인 작성을 위한 전역변수
let g_main_idx = "";

// 메인 카테고리 번호 저장
let g_main_category_idx = "";

// 웹진리스트를 만들었을때 
let g_make_main_idx = "";

const allToolbarOptions = [
  "selectAll",
  "undo",
  "align",
  "redo",
  "bold",
  "italic",
  "blockQuote",
  "blockQuote",
  "blockQuote",
  "link",
  'underline',
  "ckfinder",
  'alignment:left',
  'alignment:right',
  'alignment:center',
  'alignment:justify',
  'fontSize',
  // 'highlight:yellowMarker',
  // 'highlight:greenMarker',
  // 'highlight:pinkMarker',
  // 'highlight:blueMarker',
  // 'highlight:redPen',
  // 'highlight:greenPen',
  "uploadImage",
  "imageUpload",
  "heading",
  "imageTextAlternative",
  "insertImage",
  "imageInsert",
  "toggleImageCaption",
  "imageStyle:inline",
  "imageStyle:alignLeft",
  "imageStyle:alignRight",
  "imageStyle:alignCenter",
  "imageStyle:alignBlockLeft",
  "imageStyle:alignBlockRight",
  "imageStyle:block",
  "imageStyle:side",
  "imageStyle:wrapText",
  "imageStyle:breakText",
  "indent",
  'fontsize',
  'fontColor',
  'fontBackgroundColor',
  "outdent",
  "numberedList",
  "bulletedList",
  "mediaEmbed",
  "insertTable",
  "tableColumn",
  "tableRow",
  "mergeTableCells"
];

const EditorConfig = {
  toolbar: allToolbarOptions,
  heading: {
    options: [
        { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
        { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
        { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
        { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
        { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
        { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
        { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' }
    ]
  },
  fontSize: {
    options: [18, 21, 25, 30, 35, 40, 45, 50, 55, 60, 65]
  },
  fontColor: {
    colors: ['#000', '#333', '#666', '#999', '#ccc', '#fff']
  },
  fontBackgroundColor: {
    colors: ['#000', '#333', '#666', '#999', '#ccc', '#fff']
  },
  ckfinder: {
    uploadUrl: '../server/EditorUpload.php' // url
  },
  alignment: {
    options: ['left', 'center', 'right', 'justify']
  },
  table: {
    contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
  },
  blockQuote: {}
};

let editor;




//Webzine policy
const webzinepolicy = `
    본 웹진의 콘텐츠는 공공누리의 <strong>‘출처표시-상업적이용금지-변경금지’ 조건</strong>에 따라 이용할 수 있습니다.
    콘텐츠를 이용하실 경우 <strong>&lt;노인장기요양보험 웹진 2023년 12월호&gt;라고 출처를 표기</strong>하고 이미지와 함께 활용할 경우 기사를 캡쳐한 뒤 사용해주시기
    바랍니다. 출처를 표기하지 않거나 기사와 이미지를 따로 다운받아 사용하실 경우 저작권법에 따라 불이익을 받을 수 있습니다.
    <div class="lg">
        <img src="img/common/banner_left_text.png" alt="장기요양보험 행복한동행">
    </div>`;

let g_main_template = {
  main_template: "",
  header_template: "",
  main_header_fix: "",
  main_banner_template: "",
  scroll_info: "",
} 
let PagesContent = {};

const AdminList = {
  "template" : "component/template.html", 
  "login" : "login.html", 
  "nav_aside" : "component/nav_aside.html", 
  "nav_top" : "component/nav_top.html", 
  "none_option_page" : "component/none_option_page.html", 
  "option_page" : "component/option_page.html", 
  "sign_in_modal" : "component/sign_in_modal.html", 
  "regen_pw" : "component/regen_pw.html", 
  "webzine_list" : "component/webzine_list.html", 
  "customer_list" : "component/customer_list.html", 
  "member_list" : "component/member_list.html", 
  "customer_write" : "component/customer_write.html", 
  "write_option_page" : "component/write_option_page.html", 
  "webzine_main_write" : "component/webzine_main_write.html", 
  "webzine_category_write" : "component/webzine_category_write.html",
  "webzine_list_write" : "component/webzine_list_write.html"
}

// 회원가입 시 고객사정보
let sign_customer_info = {};