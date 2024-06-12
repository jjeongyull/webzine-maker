<?php
    $host = 'additdev.iptime.org'; // 호스트명
    $username = 'root'; // 사용자명
    $password = '!doemdlt2020#'; // 비밀번호
    $database = 'webzine_admin'; // 데이터베이스명

    // 데이터베이스 연결 설정
    $conn = new mysqli($host, $username, $password, $database);

    // 연결 확인
    if ($conn->connect_error) {
        die('데이터베이스 연결 실패: ' . $conn->connect_error);
    }


    if (isset($_GET['idx'])) {
        $idx = $_GET['idx'];
    } else {
        echo "파라미터가 존재하지 않습니다.";
    }

    $sql = "SELECT * FROM webzine_contents WHERE idx = $idx";

    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        // 데이터가 존재하는 경우
        $row = $result->fetch_assoc();
    
        // 데이터 처리
        $page_title = $row['page_title'];
        $main_page_thumnail = $row['main_page_thumnail'];
        $webzine_month = $row['webzine_month'];
        $category_idx = $row['category_idx'];
        $c_idx = $row['c_idx'];

        $mainImg = 'http://additdev.iptime.org:8000/webzine_make/img/'. $c_idx . '/' . $webzine_month . '/' . $category_idx . '/' . $main_page_thumnail

?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <meta name="apple-mobile-web-app-title" content="">
  <link rel="apple-touch-icon" href="#">
  <meta name="apple-mobile-web-app-status-bar-style" content="black">
  <link rel="apple-touch-startup-image" href="#">
  <meta name="apple-mobile-web-app-capable" content="yes">

  <meta property="og:title" content="<?php echo mb_convert_encoding($page_title, 'UTF-8'); ?>"> <!-- SNS에서 공유 시 보여주는 타이틀-->
  <meta name="og:type" content="website">
  <meta property="og:image" content="<?php echo mb_convert_encoding($mainImg, 'UTF-8'); ?>"> <!-- SNS에서 공유 시 보여주는 이미지 -->
  <meta property="og:url" content=""> <!-- SNS에서 공유 시 보여주는 이미지-->
  <meta property="og:description" content="<?php echo mb_convert_encoding($page_title, 'UTF-8'); ?>"> <!-- SNS에서 공유 시 보여주는 설명문구 -->
  <meta property="og:locale" content="kr-KR"> <!-- SNS에서 공유 시 언어-지역, en-US 등 두개 이상 둘 수 있음 -->
  <meta property="og:site-name" content="">


  <title><?php echo mb_convert_encoding($page_title, 'UTF-8'); ?></title>

  <!-- JQuery -->
  <script src="https://code.jquery.com/jquery-3.7.0.js"></script>

  <script src="https://cdn.tailwindcss.com"></script>

  <!-- swiper -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"/>
  <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>

  <!-- css -->
  <link rel="stylesheet" href="css/reset.css">
  <link rel="stylesheet" href="css/customer_style.css">

  <!-- js -->
  <script src="customer_js/template.js"></script>
  <script src="customer_js/const.js"></script>
  <script src="customer_js/api.js"></script>
  <script src="customer_js/ck_dev_event.js"></script>
  <script src="customer_js/draw.js"></script>
  <script src="customer_js/utill.js"></script>
</head>
<body>
  <header id='header'></header>

  <main id="sub_banner"></main>

  <section class='w-1200 mx-auto px-5 md:px-0' id='tab_btn'></section>

  <section class='mb-20 md:mb-40 w-1200 mx-auto px-5 md:px-0 sub-content' id='content'></section>

  <section class='bg-gray-200' id='prev_list'></section>

  <footer class='bg-gray-300' id='footer'></footer>
  
  <script src="customer_js/sub_load.js"></script>
</body>
</html>
<?php
} else {
    echo "데이터가 존재하지 않습니다.";
}

// 연결 종료
$conn->close();
?>