<?php

declare(strict_types=1);

// 쿠키에 저장된 refresh token을 구한다. (rtoken)
function getCookieFromHeader($cookieName){
  try{
    $rtnValue = "";
    // 헤더에 cookie 및 Cookie로 대/소문자를 모두 구분해줘야 한다. 
    if (isset(getallheaders()['cookie'])){
      $headerCookies = explode('; ', getallheaders()['cookie']);
      foreach($headerCookies as $itm) {
        list($key, $val) = explode('=', $itm, 2);
        if ($key === $cookieName){
          $rtnValue = $val;
          break;
        }
      }
    }
    else{
      if (isset(getallheaders()['Cookie'])){
        $headerCookies = explode('; ', getallheaders()['Cookie']);
        foreach($headerCookies as $itm) {
          list($key, $val) = explode('=', $itm, 2);
          if ($key === $cookieName){
            $rtnValue = $val;
            break;
          }
        }
      }
    }
    return $rtnValue;
  }
  catch(Exception $e){
    echo ($e->message);
  }
}

// 전송 받은 데이터를 JSON 구조로 리턴한다.
function genJsonData($data){
  // html 특수 문자를 처리한다.
  $tmp = htmlspecialchars_decode($data);
  // escape 문자 처리
  $tmp = stripslashes($tmp);
  return json_decode($tmp, true);
}

function file_get_contents_curl($url) {
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_AUTOREFERER, TRUE);
  curl_setopt($ch, CURLOPT_HEADER, 0);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE);       

  $data = curl_exec($ch);
  curl_close($ch);

  return $data;
}

function getRequstContentType($sType){
  if(strpos($sType, 'json') !== false) {
    return "json";
  }
  elseif(strpos($sType, 'x-www-form-urlencoded') !== false) {
    return "urlencoded";
  }
  elseif(strpos($sType, 'text') !== false) {
    return "text";
  }
}

function fn_EscapeString($param, $mysqli){
  $param = htmlentities($param, ENT_QUOTES); 
  $param = mysqli_real_escape_string($mysqli, $param);               
  return $param;
}

function fn_URIString($param, $ptype, $pdefault){
  if ($ptype == "string"){
      $tmpStr = isset($_POST[$param]) ? $_POST[$param] : $pdefault;           
      if ($tmpStr == ""){
          $tmpStr = isset($_GET[$param]) ? $_GET[$param] : $pdefault;         
      }     
  }   
  elseif ($ptype == "int"){
      $tmpStr = isset($_POST[$param]) ? $_POST[$param] : $pdefault;           
      if ($tmpStr == ""){
          $tmpStr = isset($_GET[$param]) ? $_GET[$param] : $pdefault;         
      }        
  }
  return$tmpStr;
}

// requestbody로 부터 데이터를 받을 경우 처리하기 위해
function fn_URIString2($param, $ptype, $pdefault){
  if ($ptype == "string"){
    if (isset($param)){
      $tmpStr = htmlentities($param, ENT_QUOTES); 
      $tmpStr = trim($param); 
      if ($tmpStr == ""){
          $tmpStr = $pdefault;         
      }     
    }
  }elseif ($ptype == "int"){
    if (isset($param)){
      if (is_numeric($param)){
        $tmpStr = $param;
      }else{
        $tmpStr = -1;
      }
    }
    else{
      $tmpStr = $pdefault;           
    }
  }
  return$tmpStr;
}   
// PDO 디버깅 값을 스트링으로 출력하기 위해
function pdo_debugStrParams($stmt, $isDebug) {
  if ($isDebug){
    ob_start();
    $stmt->debugDumpParams();
    $r = ob_get_contents();
    ob_end_clean();
    return $r;
  }
}

function passwordGenerator( $length=6 ){

  $counter = ceil($length/4);
  // 0보다 작으면 안된다.
  $counter = $counter > 0 ? $counter : 1;            

  $charList = array( 
                  array("0", "1", "2", "3", "4", "5","6", "7", "8", "9", "0"),
                  array("a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"),
                  array("!", "@", "#", "%", "^", "&", "*") 
              );
  $password = "";
  for($i = 0; $i < $counter; $i++)
  {
      $strArr = array();
      for($j = 0; $j < count($charList); $j++)
      {
          $list = $charList[$j];

          $char = $list[array_rand($list)];
          $pattern = '/^[a-z]$/';
          // a-z 일 경우에는 새로운 문자를 하나 선택 후 배열에 넣는다.
          if( preg_match($pattern, $char) ) array_push($strArr, strtoupper($list[array_rand($list)]));
          array_push($strArr, $char);
      } 
      // 배열의 순서를 바꿔준다.
      shuffle( $strArr );

      // password에 붙인다.
      for($j = 0; $j < count($strArr); $j++) $password .= $strArr[$j];
  }
  // 길이 조정
  return substr($password, 0, $length);
}

function _crypt( $string, $action = 'e' ) {
  // 아래값을 임의로 수정해주세요.
  $secret_key = pack("H*", "4a0c605da26c413f0304188615da9139");
  $secret_iv = pack("H*", "3c4909a6557fc2b9855351afaca45e54");

  $output = false;
  $encrypt_method = "AES-256-CBC";
  $key = hash( 'sha256', $secret_key );
  $iv = substr( hash( 'sha256', $secret_iv ), 0, 16 );

  if( $action == 'e' ) {
      $output = base64_encode( openssl_encrypt( $string, $encrypt_method, $key, 0, $iv ) );
  }
  else if( $action == 'd' ){
      $output = openssl_decrypt( base64_decode( $string ), $encrypt_method, $key, 0, $iv );
  }

  return $output;
}


function createIndexFile($json_data){
  // /** tailwind */
  // define('c_tailwind', '<script src="https://cdn.tailwindcss.com"></script>');

  // /** jquery */
  // define('c_jquery', '<script src="https://code.jquery.com/jquery-3.7.0.js"></script>');
  // define('reset_css', '<link rel="stylesheet" href="http://additdev.iptime.org:8000/webzine_make/css/reset.css">');

  $data = json_decode($json_data, true);
  /** index.html 생성 순서
   * (head) encoding -> viewport -> title -> meta -> css -> js
   * (body)
  **/
  $stringData = "";
  $stringData = $stringData . "<html>";
  $stringData = $stringData . "<head>";
  $stringData = $stringData . '<meta charset="UTF-8">';
  $stringData = $stringData . '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
  $stringData = $stringData . '<meta name="apple-mobile-web-app-title" content="한국표준협회웹진">';
  $stringData = $stringData . '<link rel="apple-touch-icon" href="#">';
  $stringData = $stringData . '<meta name="apple-mobile-web-app-status-bar-style" content="black">';
  $stringData = $stringData . '<link rel="apple-touch-startup-image" href="#">';
  $stringData = $stringData . '<meta name="apple-mobile-web-app-capable" content="yes">';
 
 
  
  
  
  $stringData .= '<meta property="og:title" content="' . $data['page_title'] . '">';
  $stringData .= '<meta property="og:type" content="website">';
  $stringData .= '<meta property="og:image" content="img/' . $data['thumnail_name_file'] . '">';
  $stringData .= '<meta property="og:site-name" content="한국표준협회웹진">';
  $stringData .= '<meta property="og:description" content="' . $data['page_description'] . '">';

  // $stringData .= '<script src="http://additdev.iptime.org:8000/webzine_make/webzine_js/click.js"></script>';
  $stringData .= '<script src="https://cdn.tailwindcss.com"></script>';
  $stringData .= '<script src="https://code.jquery.com/jquery-3.7.0.js"></script>';
  $stringData .= '<script src="https://t1.kakaocdn.net/kakao_js_sdk/2.1.0/kakao.min.js" integrity="sha384-dpu02ieKC6NUeKFoGMOKz6102CLEWi9+5RQjWSV0ikYSFFd8M3Wp2reIcquJOemx" crossorigin="anonymous"></script>';
  $stringData .= '<title>' . $data['page_title'] . '</title>';
  // $stringData .= '<meta property="og:url" content="' . $data['meta_url'] . '">';
  
  // 메타태그 관련 (부가 속성)
  // $tempstr =  str_replace("@og:description@", meta.description, meta_description);
  // $stringData = $stringData . $tempstr;
  // $tempstr =  str_replace("@og:locale@", meta.locale, meta_locale);
  // $stringData = $stringData . $tempstr;
  // $tempstr =  str_replace("@site-name@", meta.site_name, meta_site_name);
  // $stringData = $stringData . $tempstr;
  // $tempstr =  str_replace("@og:image:width@", meta.imagewidth, meta_image_width);
  // $stringData = $stringData . $tempstr;
  // $tempstr =  str_replace("@og:image:height@", meta.imageheight, meta_image_height);
  // $stringData = $stringData . $tempstr;
  
  
  $stringData .= '<script>';
  $stringData .= 'const WEZINE_MONTH = "' . $data['webzine_month'] . '";';
  $stringData .= 'const UUID = "' . $data['uuid'] . '";';
  $stringData .= '</script>';
  $stringData .= '<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>';
  $stringData .= '<script src="https://webzine.menteimo.com/webzine_js/api.js"></script>';
  $stringData .= '<script src="https://webzine.menteimo.com/webzine_js/const.js"></script>';
  $stringData .= '<script src="https://webzine.menteimo.com/webzine_js/draw.js"></script>';
  $stringData .= '<script src="https://webzine.menteimo.com/webzine_js/click.js"></script>';
  $stringData .= '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"/>';
  $stringData .= '<link rel="stylesheet" href="https://webzine.menteimo.com/css/reset.css">';
  $stringData .= '<link rel="stylesheet" href="https://webzine.menteimo.com/customer_css/style.css">';
  $stringData .= '<script>Kakao.init("1999f1e12378237fc4cb44334c9d3404");</script>';




  
  
  // 구글 애널리틱스 처리
  // $tempstr =  str_replace("@GTAG@", "g-abcdefg", c_gtag);
  // $stringData = $stringData . $tempstr;
  $stringData = $stringData . "</head><body></body> <div id='floating'></div><header id='header'></header>";
  $stringData = $stringData . "<main class='mb-10 md:mb-20' id='banner'></main><article id='content'></article><footer id='footer'></footer>";


  $stringData .= '<script src="https://webzine.menteimo.com/webzine_js/load.js"></script>';
  $stringData = $stringData . "</body></html>";
  $filePath = "../webzine_folder/" . $data['uuid'] . "/" . $data['webzine_month'] . "/index.html";
  
  try {
      // file_put_contents 함수를 사용하여 파일에 문자열 쓰기 시도
      $result = @file_put_contents($filePath, $stringData);
      
      // file_put_contents가 false를 반환하면 쓰기 작업 실패
      if ($result === false) {
          // 사용자 정의 예외를 던짐
          throw new Exception("파일 '$filePath'에 데이터를 쓸 수 없습니다. 쓰기 권한을 확인하세요.");
      }
      
      return "파일 저장 성공";
  } catch (Exception $e) {
      // 예외 처리
      return "오류 발생: " . $e->getMessage();
  }
}

function deleteFile($deleteFileDirectory){
  if (file_exists($deleteFileDirectory)) {
    if (unlink($deleteFileDirectory)) {
      return '파일 삭제 성공';
    } else {
      return '파일 삭제 실패';
    }
  } else {
    return '파일이 존재하지 않습니다.';
  }
}

// 에디터 파일 함수
function editorFileUpload($editor_file_name, $uploadDirectory){
  $result = "";
  $tempDirectory = '../tempUpload';
  $editor_file_array = explode(",", $editor_file_name);

  foreach ($editor_file_array as $filename) {
    $sourcePath = $tempDirectory . '/' . $filename;
    $destinationPath = $uploadDirectory . '/' . $filename;

    // 소스 폴더에 파일이 있는지 확인
    if (file_exists($sourcePath)) {
        // 파일 이동
        if (rename($sourcePath, $destinationPath)) {
            $result = $result . "File '$filename' moved successfully.\n";
        } else {
            $result = $result . "Error moving file '$filename'.\n";
        }
    } else {
        $result = $result . "File '$filename' does not exist in the source directory.\n";
    }
  }

  // 임시 디렉터리의 모든 파일 삭제
  $files = glob($tempDirectory . '/*');
  foreach ($files as $file) {
      if (unlink($file)) {
        $result = $result . "File '$file' deleted successfully.\n";
      } else {
        $result = $result ."Error deleting file '$file'.\n";
      }
  }
  return $result;
}

// 서브페이지 파일 만드는 함수
function createSubFile($json_data){
  // /** tailwind */
  // define('c_tailwind', '<script src="https://cdn.tailwindcss.com"></script>');

  // /** jquery */
  // define('c_jquery', '<script src="https://code.jquery.com/jquery-3.7.0.js"></script>');
  // define('reset_css', '<link rel="stylesheet" href="http://additdev.iptime.org:8000/webzine_make/css/reset.css">');

  $data = json_decode($json_data, true);
  /** index.html 생성 순서
   * (head) encoding -> viewport -> title -> meta -> css -> js
   * (body)
  **/
  $stringData = "";
  $stringData = $stringData . "<html>";
  $stringData = $stringData . "<head>";
  $stringData = $stringData . '<meta charset="UTF-8">';
  $stringData = $stringData . '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
  $stringData = $stringData . '<meta name="apple-mobile-web-app-title" content="한국표준협회웹진">';
  $stringData = $stringData . '<link rel="apple-touch-icon" href="#">';
  $stringData = $stringData . '<meta name="apple-mobile-web-app-status-bar-style" content="black">';
  $stringData = $stringData . '<link rel="apple-touch-startup-image" href="#">';
  $stringData = $stringData . '<meta name="apple-mobile-web-app-capable" content="yes">';
 
 
  
  
  
  $stringData .= '<meta property="og:title" content="' . $data['page_title'] . '">';
  $stringData .= '<meta property="og:type" content="website">';
  $stringData .= '<meta property="og:image" content="img/' . $data['thumnail_name_file'] . '">';
  $stringData .= '<meta property="og:site-name" content="한국표준협회웹진">';
  $stringData .= '<meta property="og:description" content="' . $data['description'] . '">';

  $stringData .= '<script src="https://webzine.menteimo.com/webzine_js/click.js"></script>';
  $stringData .= '<script src="https://cdn.tailwindcss.com"></script>';
  $stringData .= '<script src="https://code.jquery.com/jquery-3.7.0.js"></script>';
  $stringData .= '<script src="https://t1.kakaocdn.net/kakao_js_sdk/2.1.0/kakao.min.js" integrity="sha384-dpu02ieKC6NUeKFoGMOKz6102CLEWi9+5RQjWSV0ikYSFFd8M3Wp2reIcquJOemx" crossorigin="anonymous"></script>';

  $stringData .= '<title>' . $data['page_title'] . '</title>';
  // $stringData .= '<meta property="og:url" content="' . $data['meta_url'] . '">';
  
  // 메타태그 관련 (부가 속성)
  // $tempstr =  str_replace("@og:description@", meta.description, meta_description);
  // $stringData = $stringData . $tempstr;
  // $tempstr =  str_replace("@og:locale@", meta.locale, meta_locale);
  // $stringData = $stringData . $tempstr;
  // $tempstr =  str_replace("@site-name@", meta.site_name, meta_site_name);
  // $stringData = $stringData . $tempstr;
  // $tempstr =  str_replace("@og:image:width@", meta.imagewidth, meta_image_width);
  // $stringData = $stringData . $tempstr;
  // $tempstr =  str_replace("@og:image:height@", meta.imageheight, meta_image_height);
  // $stringData = $stringData . $tempstr;
  
  
  $stringData .= '<script>';
  $stringData .= 'const WEZINE_MONTH = "' . $data['webzine_month'] . '";';
  $stringData .= 'const UUID = "' . $data['uuid'] . '";';
  $stringData .= 'const PAGE_IDX = "' . $data['page_idx'] . '";';
  $stringData .= '</script>';
  $stringData .= '<script src="https://webzine.menteimo.com/webzine_js/api.js"></script>';
  $stringData .= '<script src="https://webzine.menteimo.com/webzine_js/const.js"></script>';
  $stringData .= '<script src="https://webzine.menteimo.com/webzine_js/draw.js"></script>';
  $stringData .= '<script src="https://webzine.menteimo.com/webzine_js/click.js"></script>';
  $stringData .= '<link rel="stylesheet"href="https://webzine.menteimo.com/css/reset.css">';
  $stringData .= '<link rel="stylesheet" href="https://webzine.menteimo.com/customer_css/style.css">';
  $stringData .= '<script>Kakao.init("1999f1e12378237fc4cb44334c9d3404");</script>';




  
  
  // 구글 애널리틱스 처리
  // $tempstr =  str_replace("@GTAG@", "g-abcdefg", c_gtag);
  // $stringData = $stringData . $tempstr;
  $stringData = $stringData . "</head><body></body> <div id='floating'></div><header id='header'></header>";
  $stringData = $stringData . "<main class='mb-10 md:mb-20' id='banner'></main><article id='content'></article><footer id='footer'></footer>";


  $stringData .= '<script src="https://webzine.menteimo.com/webzine_js/sub_load.js"></script>';
  $stringData = $stringData . "</body></html>";
  $filePath = "../webzine_folder/" . $data['uuid'] . "/" . $data['webzine_month'] . "/sub_" . $data['page_idx'] . ".html";
  
  try {
      // file_put_contents 함수를 사용하여 파일에 문자열 쓰기 시도
      $result = @file_put_contents($filePath, $stringData);
      
      // file_put_contents가 false를 반환하면 쓰기 작업 실패
      if ($result === false) {
          // 사용자 정의 예외를 던짐
          throw new Exception("파일 '$filePath'에 데이터를 쓸 수 없습니다. 쓰기 권한을 확인하세요.");
      }
      
      return "파일 저장 성공";
  } catch (Exception $e) {
      // 예외 처리
      return "오류 발생: " . $e->getMessage();
  }
}


?>
