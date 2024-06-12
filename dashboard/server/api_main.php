<?php
  // ini_set('session.cookie_httponly',1);
  // ini_set('session.cookie_samesite','Lax');
  if (session_status() == PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly',1);
    ini_set('session.cookie_samesite','Lax');
    session_start();
  }


  include_once 'config.php';
  include_once 'database.php';
  include_once "function.php";
  include_once "jwt_func.php";
  include_once "api_login.php"; 

  header("Access-Control-Allow-credentials: true");
  header("Access-Control-Allow-Origin: " . DOMAIN);
  header("Access-Control-Allow-Methods: POST, GET");
  header("Access-Control-Max-Age: 3600");
  // X-Requested-With : 요청이 Ajax라는 것을 의미
  header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

  // 리턴 변수 선언
  $rtn_access_token = "";     // 리턴될 Access Token
  $rtnmessage = "";
  $data_array = array();      // 임시 배열 선언
  $bregen = false;            // 엑세스 토큰 재발행 여부 확인
  $resultdata = array();      // 결과 JSON 저장 배열
  $tokendata = array();       // 토큰에 포함된 데이터를 저장하기 위한 변수

  // Request Content Type를 구한다.
  $requestContentType = getRequstContentType($_SERVER['CONTENT_TYPE']);
  $request_body = file_get_contents('php://input');

  switch ($requestContentType) {
    case "json" :
      $request_body = json_decode($request_body);
      $cmd = $request_body->cmd;
      break;
    case "urlencoded" : // 텍스트 파싱
      $cmd = fn_URIString("cmd", "string", "");
      break;
    case "text" :
      $paramdata = $request_body;
      break;
    default :
      $cmd = "";
      break;
  }

  if ($cmd == ""){
    $cmd = isset($_POST['cmd']) ? $_POST['cmd'] : "";
    if ($cmd == ""){
      ReturnData(500, "error", "명령 파라미터 전달 오류", "", "", NULL);
      die();
    }
  
  }else if ($cmd == "logout"){
    // 쿠키를 초기화한다.
    setcookie('addit_notice_rtoken', "", time() - 3600,'/', DOMAIN, false, true);
    // 쿠키를 저장한 테이블이 존재할 경우 삭제한다.
    $resultdata["status"] = 200;
    ReturnData($resultdata["status"], $cmd, "", "", "", NULL);
    die();
  }

  // 데이터베이스 연결
  $databaseService = new DatabaseService(DB_SERVER_NAME, 
    DB_USER_NAME, DB_USER_PASSWORD, DB_NAME, DB_PORT);
  $conn = $databaseService->getConnection();
  if ($conn === NULL)
  {
  http_response_code(500);  
  ReturnData(500, "dbcon", "데이터베이스 연결 오류", "", "", NULL);
  die();
  }
  // PDO 실행 에러를 처리 하기 위해 
  $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

  // 로그인 없이 처리되어야하는 정보
  $param = new stdClass();
  switch ($cmd){
    case "load_class_list" :
      try{
        $sql = "SELECT * FROM class_info ORDER BY idx";
        $stmt = $conn->prepare($sql);
        //$stmt->debugDumpParams();
        $stmt->execute();
        //$stmt->debugDumpParams();

        $row = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if ($row){
          $data_array = $row;
          $result_data["tabledata"] = $data_array;
          ReturnData(200, $cmd, $rtnmessage, "", $result_data, $conn);
        }else{
          $result_data["message"] = "Not exists class info";
          ReturnData(500, $cmd, $rtnmessage, "", $result_data, $conn);
        }
      }
      catch(PDOException $e){
          ReturnData(600, $cmd, $e->getMessage(), "", "", $conn);
      }
      die();
    break;
    case "insert_member" :
      if ( isset($request_body->mem_id) && isset($request_body->mem_password) 
      && isset($request_body->mem_name) && isset($request_body->mem_email)
      ){
        $mem_id = $request_body->mem_id;
        $mem_password = $request_body->mem_password;
        $mem_name = $request_body->mem_name;
        $mem_email = $request_body->mem_email;
      }
      else{
          ReturnData(500, $cmd, "파라미터 오류", "", "", $conn);
          die();
      }

      try{
        // 동일한 정보가 존재하는지 확인한다.
        $sql = "SELECT COUNT(mem_id) as cnt FROM member WHERE mem_id = '" . $mem_id . "'";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $resultcount = $stmt->fetchColumn();
        if ($resultcount > 0){
            ReturnData(500, $cmd, "해당 아이디는 이미 사용중입니다.", "", "", $conn);
            die();    
        }

        $cryptdata = "";
        $cryptdata = _crypt($mem_email);

        $sql = "SELECT COUNT(mem_email) as cnt FROM member WHERE mem_email = '" . $cryptdata . "'";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $resultcount = $stmt->fetchColumn();
        if ($resultcount > 0){
            ReturnData(500, $cmd, "해당 이메일은 이미 사용중입니다.", "", "", $conn);
            die();    
        }

        if ($mem_id == 'admin'){
          ReturnData(500, $param->cmd, "허용되지 않는 아이디입니다.", "", "", $dbcon);
          die();   
        }

        // 주의 : PDO를 사용할 경우 Update가 일어나지 않을 경우 rowCount는 0을 반환 (mysql에서 동일한 값이 있을 경우 0을 반환한다.)
        $sql = "INSERT INTO member (mem_id, mem_password, mem_name, mem_email)";
        $sql = $sql .  " VALUES (:mem_id, :mem_password, :mem_name, :mem_email)";
        // PDO 준비
        //$conn->beginTransaction();
        $stmt = $conn->prepare($sql);

        // 파라미터 바인딩, ?로 할 경우 bindValue로 
        $stmt->bindValue(":mem_id", $mem_id, PDO::PARAM_STR);

        $change_password = hash("sha256", iso8859_1_to_utf8($mem_password));
        $stmt->bindValue(":mem_password", $change_password, PDO::PARAM_STR);

        $stmt->bindValue(":mem_name", $mem_name, PDO::PARAM_STR);
        
        $cryptdata = "";
        $cryptdata = _crypt($mem_email);
        $stmt->bindValue(":mem_email", $cryptdata, PDO::PARAM_STR);

        $stmt->execute();
        $count = $stmt->rowCount();
        if ($count == 1){
            //$conn->commit();
            ReturnData(200, $cmd, "", "", "", $conn);
        }
        else{
            // $stmt->debugDumpParams();
            ReturnData(500, $cmd, $sql, "", "", $conn);
        }
      }catch(PDOException $e){
          //$conn->rollback();
          ReturnData(600, $cmd, $e->getMessage(), "", "", $conn);
      }
  die();
  break;

  default:
  break;
  }
  $limit = 15;
  // JWT LOGIN 체크
  if (!jwt_login($conn, "member", $request_body, $rtn_access_token, $rtnmessage, $tokendata))
  {
    die();
  }


  switch ($cmd){
    case "login" :
    case "login_token" :
      $memdata["mem_id"] = $tokendata["mem_id"];
      $memdata["mem_name"] = $tokendata["mem_name"];
      $memdata["mem_level"] = $tokendata["mem_level"];
      $memdata["mem_uuid"] = $tokendata["mem_uuid"];
      $memdata["ad_list"] = $tokendata["ad_list"];
      ReturnData(200, $cmd, $rtnmessage, $rtn_access_token, $memdata, $conn);
      die();
      break;
    case "insert_admin_member" :
      if ( isset($request_body->mem_id) && isset($request_body->mem_password) 
      && isset($request_body->mem_name) && isset($request_body->mem_email)
      && isset($request_body->mem_uuid) && isset($request_body->mem_active)
      && isset($request_body->mem_level) && isset($request_body->ad_list)
      ){
        $mem_id = $request_body->mem_id;
        $mem_password = $request_body->mem_password;
        $mem_name = $request_body->mem_name;
        $mem_email = $request_body->mem_email;
        $mem_uuid = $request_body->mem_uuid;
        $mem_active = $request_body->mem_active;
        $mem_level = $request_body->mem_level;
        $ad_list = $request_body->ad_list;
      }
      else{
          ReturnData(500, $cmd, "파라미터 오류", "", "", $conn);
          die();
      }

      try{
        // 동일한 정보가 존재하는지 확인한다.
        $sql = "SELECT COUNT(mem_id) as cnt FROM member WHERE mem_id = '" . $mem_id . "'";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $resultcount = $stmt->fetchColumn();
        if ($resultcount > 0){
            ReturnData(500, $cmd, "해당 아이디는 이미 사용중입니다.", "", "", $conn);
            die();    
        }

        $cryptdata = "";
        $cryptdata = _crypt($mem_email);

        $sql = "SELECT COUNT(mem_email) as cnt FROM member WHERE mem_email = '" . $cryptdata . "'";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $resultcount = $stmt->fetchColumn();
        if ($resultcount > 0){
            ReturnData(500, $cmd, "해당 이메일은 이미 사용중입니다.", "", "", $conn);
            die();    
        }

        if ($mem_id == 'admin'){
          ReturnData(500, $param->cmd, "허용되지 않는 아이디입니다.", "", "", $dbcon);
          die();   
        }

        // 주의 : PDO를 사용할 경우 Update가 일어나지 않을 경우 rowCount는 0을 반환 (mysql에서 동일한 값이 있을 경우 0을 반환한다.)
        $sql = "INSERT INTO member (mem_id, mem_password, mem_name, mem_email, mem_uuid, mem_active, mem_level, ad_list)";
        $sql = $sql .  " VALUES (:mem_id, :mem_password, :mem_name, :mem_email, :mem_uuid, :mem_active, :mem_level, :ad_list)";
        // PDO 준비
        //$conn->beginTransaction();
        $stmt = $conn->prepare($sql);

        // 파라미터 바인딩, ?로 할 경우 bindValue로 
        $stmt->bindValue(":mem_id", $mem_id, PDO::PARAM_STR);

        $change_password = hash("sha256", iso8859_1_to_utf8($mem_password));
        $stmt->bindValue(":mem_password", $change_password, PDO::PARAM_STR);

        $stmt->bindValue(":mem_name", $mem_name, PDO::PARAM_STR);
        
        $cryptdata = "";
        $cryptdata = _crypt($mem_email);
        $stmt->bindValue(":mem_email", $cryptdata, PDO::PARAM_STR);

        $stmt->bindValue(":mem_uuid", $mem_uuid, PDO::PARAM_STR);
        $stmt->bindValue(":mem_active", $mem_active, PDO::PARAM_INT);
        $stmt->bindValue(":mem_level", $mem_level, PDO::PARAM_INT);
        $stmt->bindValue(":ad_list", $ad_list, PDO::PARAM_STR);

        $stmt->execute();
        $count = $stmt->rowCount();
        if ($count == 1){
            //$conn->commit();
            ReturnData(200, $cmd, "", $rtn_access_token, "", $conn);
        }
        else{
            // $stmt->debugDumpParams();
            ReturnData(500, $cmd, $sql, $rtn_access_token, "", $conn);
        }
      }catch(PDOException $e){
          //$conn->rollback();
          ReturnData(600, $cmd, $e->getMessage(), $rtn_access_token, "", $conn);
      }
  die();
  break;
    case "update_admin_member" :
      if ( isset($request_body->mem_id) && isset($request_body->mem_name)
      && isset($request_body->mem_email) && isset($request_body->mem_uuid) 
      && isset($request_body->mem_active) && isset($request_body->mem_level)
      && isset($request_body->idx) && isset($request_body->ad_list)
      ){
        $idx = $request_body->idx;
        $mem_id = $request_body->mem_id;
        $mem_name = $request_body->mem_name;
        $mem_email = $request_body->mem_email;
        $mem_uuid = $request_body->mem_uuid;
        $mem_active = $request_body->mem_active;
        $mem_level = $request_body->mem_level;
        $ad_list = $request_body->ad_list;
      }
      else{
          ReturnData(500, $cmd, "파라미터 오류", "", "", $conn);
          die();
      }

      try{
        // 주의 : PDO를 사용할 경우 Update가 일어나지 않을 경우 rowCount는 0을 반환 (mysql에서 동일한 값이 있을 경우 0을 반환한다.)
        $sql = "UPDATE member SET mem_id = :mem_id,";
        $sql = $sql . " mem_name = :mem_name,";
        $sql = $sql . " mem_email = :mem_email,";
        $sql = $sql . " mem_uuid = :mem_uuid,";
        $sql = $sql . " ad_list = :ad_list,";
        $sql = $sql . " mem_active = :mem_active,";
        $sql = $sql . " mem_level = :mem_level WHERE idx = :idx";
        // PDO 준비
        //$conn->beginTransaction();
        $stmt = $conn->prepare($sql);

        // 파라미터 바인딩, ?로 할 경우 bindValue로 
        $stmt->bindValue(":mem_id", $mem_id, PDO::PARAM_STR);

        $stmt->bindValue(":mem_name", $mem_name, PDO::PARAM_STR);
        
        $cryptdata = "";
        $cryptdata = _crypt($mem_email);
        $stmt->bindValue(":mem_email", $cryptdata, PDO::PARAM_STR);

        $stmt->bindValue(":mem_uuid", $mem_uuid, PDO::PARAM_STR);
        $stmt->bindValue(":ad_list", $ad_list, PDO::PARAM_STR);
        $stmt->bindValue(":mem_active", $mem_active, PDO::PARAM_INT);
        $stmt->bindValue(":mem_level", $mem_level, PDO::PARAM_INT);
        $stmt->bindValue(":idx", $idx, PDO::PARAM_INT);

        $stmt->execute();
        $count = $stmt->rowCount();
        if ($count == 1){
            //$conn->commit();
            ReturnData(200, $cmd, "", $rtn_access_token, "", $conn);
        }
        else{
            // $stmt->debugDumpParams();
            ReturnData(500, $cmd, $sql, $rtn_access_token, "", $conn);
        }
      }catch(PDOException $e){
          //$conn->rollback();
          ReturnData(600, $cmd, $e->getMessage(), $rtn_access_token, "", $conn);
      }
  die();
  break;
    case "insert_customer" :
      if ( isset($request_body->cs_name)){
        $cs_name = $request_body->cs_name;
      }
      else{
          ReturnData(500, $cmd, "파라미터 오류", $rtn_access_token, "", $conn);
          die();
      }

      try{
        $uuid = uniqid();
        // 주의 : PDO를 사용할 경우 Update가 일어나지 않을 경우 rowCount는 0을 반환 (mysql에서 동일한 값이 있을 경우 0을 반환한다.)
        $sql = "INSERT INTO customer_list (cs_name, uuid)";
        $sql = $sql .  " VALUES (:cs_name, :uuid)";
        // PDO 준비
        //$conn->beginTransaction();
        $stmt = $conn->prepare($sql);

        // 파라미터 바인딩, ?로 할 경우 bindValue로 
        $stmt->bindValue(":cs_name", $cs_name, PDO::PARAM_STR);
        $stmt->bindValue(":uuid", $uuid, PDO::PARAM_STR);

        $stmt->execute();
        $count = $stmt->rowCount();
        if ($count == 1){
            //$conn->commit();
            ReturnData(200, $cmd, "", $rtn_access_token, "", $conn);
        }
        else{
            // $stmt->debugDumpParams();
            ReturnData(500, $cmd, $sql, $rtn_access_token, "", $conn);
        }
      }catch(PDOException $e){
          //$conn->rollback();
          ReturnData(600, $cmd, $e->getMessage(), $rtn_access_token, "", $conn);
      }
  die();
    case "insert_reple" :
      if (isset($request_body->content) && isset($request_body->parent_idx)
      && isset($request_body->uuid) && isset($request_body->writer)
      && isset($request_body->writer_id)){
        $content = $request_body->content;
        $parent_idx = $request_body->parent_idx;
        $uuid = $request_body->uuid;
        $writer = $request_body->writer;
        $writer_id = $request_body->writer_id;
      }
      else{
          ReturnData(500, $cmd, "파라미터 오류", $rtn_access_token, "", $conn);
          die();
      }

      try{
        // 주의 : PDO를 사용할 경우 Update가 일어나지 않을 경우 rowCount는 0을 반환 (mysql에서 동일한 값이 있을 경우 0을 반환한다.)
        $sql = "INSERT INTO reple_data (content, parent_idx, uuid, write_date, writer, writer_id)";
        $sql = $sql .  " VALUES (:content, :parent_idx, :uuid, now(), :writer, :writer_id)";
        // PDO 준비
        //$conn->beginTransaction();
        $stmt = $conn->prepare($sql);

        // 파라미터 바인딩, ?로 할 경우 bindValue로 
        $stmt->bindValue(":content", $content, PDO::PARAM_STR);
        $stmt->bindValue(":parent_idx", $parent_idx, PDO::PARAM_INT);
        $stmt->bindValue(":uuid", $uuid, PDO::PARAM_STR);
        $stmt->bindValue(":writer", $writer, PDO::PARAM_STR);
        $stmt->bindValue(":writer_id", $writer_id, PDO::PARAM_STR);

        $stmt->execute();
        $count = $stmt->rowCount();
        if ($count == 1){
            //$conn->commit();
            ReturnData(200, $cmd, "", $rtn_access_token, "", $conn);
        }
        else{
            // $stmt->debugDumpParams();
            ReturnData(500, $cmd, $sql, $rtn_access_token, "", $conn);
        }
      }catch(PDOException $e){
          //$conn->rollback();
          ReturnData(600, $cmd, $e->getMessage(), $rtn_access_token, "", $conn);
      }
  die();
  break;  
    case "update_reple" :
      if (isset($request_body->content) && isset($request_body->parent_idx)
      && isset($request_body->uuid) && isset($request_body->idx)){
        $content = $request_body->content;
        $parent_idx = $request_body->parent_idx;
        $uuid = $request_body->uuid;
        $idx = $request_body->idx;
      }
      else{
          ReturnData(500, $cmd, "파라미터 오류", "", "", $conn);
          die();
      }

      try{
        // 주의 : PDO를 사용할 경우 Update가 일어나지 않을 경우 rowCount는 0을 반환 (mysql에서 동일한 값이 있을 경우 0을 반환한다.)
        $sql = "UPDATE reple_data SET content = :content, write_date = now() WHERE idx = :idx AND uuid = :uuid AND parent_idx = :parent_idx";
        // PDO 준비
        //$conn->beginTransaction();
        $stmt = $conn->prepare($sql);

        // 파라미터 바인딩, ?로 할 경우 bindValue로 
        $stmt->bindValue(":content", $content, PDO::PARAM_STR);
        $stmt->bindValue(":uuid", $uuid, PDO::PARAM_STR);
        $stmt->bindValue(":idx", $idx, PDO::PARAM_INT);
        $stmt->bindValue(":parent_idx", $parent_idx, PDO::PARAM_INT);

        $stmt->execute();
        $count = $stmt->rowCount();
        if ($count == 1){
            //$conn->commit();
            ReturnData(200, $cmd, "", $rtn_access_token, "", $conn);
        }
        else{
            // $stmt->debugDumpParams();
            ReturnData(500, $cmd, $sql, $rtn_access_token, "", $conn);
        }
      }catch(PDOException $e){
          //$conn->rollback();
          ReturnData(600, $cmd, $e->getMessage(), $rtn_access_token, "", $conn);
      }
  die();
  break;  
    case "update_customer" :
      if (isset($request_body->cs_name) && isset($request_body->idx)){
        $cs_name = $request_body->cs_name;
        $idx = $request_body->idx;
      }
      else{
          ReturnData(500, $cmd, "파라미터 오류", "", "", $conn);
          die();
      }

      try{
        // 주의 : PDO를 사용할 경우 Update가 일어나지 않을 경우 rowCount는 0을 반환 (mysql에서 동일한 값이 있을 경우 0을 반환한다.)
        $sql = "UPDATE customer_list SET cs_name = :cs_name WHERE idx = :idx";
        // PDO 준비
        //$conn->beginTransaction();
        $stmt = $conn->prepare($sql);

        // 파라미터 바인딩, ?로 할 경우 bindValue로 
        $stmt->bindValue(":cs_name", $cs_name, PDO::PARAM_STR);
        $stmt->bindValue(":idx", $idx, PDO::PARAM_INT);

        $stmt->execute();
        $count = $stmt->rowCount();
        if ($count == 1){
            //$conn->commit();
            ReturnData(200, $cmd, "", $rtn_access_token, "", $conn);
        }
        else{
            // $stmt->debugDumpParams();
            ReturnData(500, $cmd, $sql, $rtn_access_token, "", $conn);
        }
      }catch(PDOException $e){
          //$conn->rollback();
          ReturnData(600, $cmd, $e->getMessage(), $rtn_access_token, "", $conn);
      }
  die();
  break;  
  case "load_user_table_data" :
    if ( isset($request_body->page)){
      $page = $request_body->page;
    }else{
      ReturnData(500, $cmd, "파라미터 오류", "", "", $conn);
      die();
    }
    try{
      // 전체 데이터 개수 가져오기
      $count_sql = "SELECT COUNT(*) as count FROM member";
      $count_stmt = $conn->query($count_sql);
      $total_count = $count_stmt->fetchColumn();

      // 전체 페이지 수 계산
      $total_pages = ceil($total_count / $limit);

      $offset = ($page - 1) * $limit;
      $sql = "SELECT * FROM member LIMIT :limit OFFSET :offset";
      $stmt = $conn->prepare($sql);
      $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
      $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

      $stmt->execute();
      $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
      if ($result) {
        $data_array = $result;
        foreach ($data_array as &$value) {
            // Decrypting encrypted values
            $emaildecode = $value['mem_email'];
            $temEmailRtn = _crypt($emaildecode, 'd');
            $value['mem_email'] = $temEmailRtn;
        }
      }
      $result_data["table_data"] = $data_array;
      $result_data["total_count"] = $total_count;
      $result_data["now_page"] = $page;
      ReturnData(200, $cmd, "데이터 로드 성공", $rtn_access_token, $result_data, $conn);


    }catch(ePDOException $e){
      ReturnData(600, $cmd, $e->getMessage(), $rtn_access_token, "", $conn);
    }
    die();
    break;
  case "load_customer_table_data" :
    if ( isset($request_body->page)){
      $page = $request_body->page;
    }else{
      ReturnData(500, $cmd, "파라미터 오류", "", "", $conn);
      die();
    }
    try{
      // 전체 데이터 개수 가져오기
      $count_sql = "SELECT COUNT(*) as count FROM customer_list";
      $count_stmt = $conn->query($count_sql);
      $total_count = $count_stmt->fetchColumn();

      // 전체 페이지 수 계산
      $total_pages = ceil($total_count / $limit);

      $offset = ($page - 1) * $limit;
      $sql = "SELECT * FROM customer_list LIMIT :limit OFFSET :offset";
      $stmt = $conn->prepare($sql);
      $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
      $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

      $stmt->execute();
      $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
      $data_array = $result;

      $result_data["table_data"] = $data_array;
      $result_data["total_count"] = $total_count;
      $result_data["now_page"] = $page;
      ReturnData(200, $cmd, "데이터 로드 성공", $rtn_access_token, $result_data, $conn);
    }catch(ePDOException $e){
      ReturnData(600, $cmd, $e->getMessage(), $rtn_access_token, "", $conn);
    }
    die();
    break;
  case "load_notice" :
    if (isset($request_body->page) && isset($request_body->uuid)){
      $page = $request_body->page;
      $uuid = $request_body->uuid;
    }else{
      ReturnData(500, $cmd, "파라미터 오류", "", "", $conn);
      die();
    }
    try{
      // 전체 데이터 개수 가져오기
      $count_sql = "SELECT COUNT(*) as count FROM notice_list WHERE uuid = :uuid";
      $count_stmt = $conn->prepare($count_sql);
      $count_stmt->bindValue(':uuid', $uuid, PDO::PARAM_STR);
      $count_stmt->execute();
      $total_count = $count_stmt->fetchColumn();

      // 전체 페이지 수 계산
      $total_pages = ceil($total_count / $limit);

      $offset = ($page - 1) * $limit;
      $sql = "SELECT * FROM notice_list WHERE uuid = :uuid ORDER BY write_date DESC LIMIT :limit OFFSET :offset";
      $stmt = $conn->prepare($sql);
      $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
      $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
      $stmt->bindValue(':uuid', $uuid, PDO::PARAM_STR);

      $stmt->execute();
      $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
      $data_array = $result;

      $result_data["table_data"] = $data_array;
      $result_data["total_count"] = $total_count;
      $result_data["now_page"] = $page;
      ReturnData(200, $cmd, "데이터 로드 성공", $rtn_access_token, $result_data, $conn);
    }catch(ePDOException $e){
      ReturnData(600, $cmd, $e->getMessage(), $rtn_access_token, "", $conn);
    }
    die();
    break;
  case "load_search_notice" :
    if ( isset($request_body->page) && isset($request_body->uuid)
    && isset($request_body->search)){
      $page = $request_body->page;
      $uuid = $request_body->uuid;
      $search = $request_body->search;
    }else{
      ReturnData(500, $cmd, "파라미터 오류", "", "", $conn);
      die();
    }
    try{
      // 전체 데이터 개수 가져오기
      $count_sql = "SELECT COUNT(*) as count FROM notice_list WHERE uuid = :uuid AND title LIKE :search";
      $count_stmt = $conn->prepare($count_sql);
      $count_stmt->bindValue(':uuid', $uuid, PDO::PARAM_STR);
      $count_stmt->bindValue(':search', '%' . $search . '%', PDO::PARAM_STR);
      $count_stmt->execute();
      $total_count = $count_stmt->fetchColumn();

      // 전체 페이지 수 계산
      $total_pages = ceil($total_count / $limit);

      $offset = ($page - 1) * $limit;
      $sql = "SELECT * FROM notice_list WHERE uuid = :uuid AND title LIKE :search ORDER BY write_date DESC LIMIT :limit OFFSET :offset";
      $stmt = $conn->prepare($sql);
      $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
      $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
      $stmt->bindValue(':uuid', $uuid, PDO::PARAM_STR);
      $stmt->bindValue(':search', '%' . $search . '%', PDO::PARAM_STR);

      $stmt->execute();
      $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
      $data_array = $result;

      $result_data["table_data"] = $data_array;
      $result_data["total_count"] = $total_count;
      $result_data["now_page"] = $page;
      ReturnData(200, $cmd, "데이터 로드 성공", $rtn_access_token, $result_data, $conn);
    }catch(ePDOException $e){
      ReturnData(600, $cmd, $e->getMessage(), $rtn_access_token, "", $conn);
    }
    die();
    break;
  case "load_view_notice" :
    if ( isset($request_body->idx)){
      $idx = $request_body->idx;
      $uuid = $request_body->uuid;
    }else{
      ReturnData(500, $cmd, "파라미터 오류", "", "", $conn);
      die();
    }
    try{
      $sql = "SELECT * FROM notice_list WHERE idx = :idx AND uuid = :uuid";
      $stmt = $conn->prepare($sql);
      $stmt->bindValue(':idx', $idx, PDO::PARAM_INT);
      $stmt->bindValue(':uuid', $uuid, PDO::PARAM_STR);
      $stmt->execute();
      $result = $stmt->fetch(PDO::FETCH_ASSOC);

      // 이전 데이터 가져오기
      $sql_previous = "SELECT * FROM notice_list WHERE idx < :idx AND uuid = :uuid ORDER BY idx DESC LIMIT 1";
      $stmt_previous = $conn->prepare($sql_previous);
      $stmt_previous->bindValue(':idx', $idx, PDO::PARAM_INT);
      $stmt_previous->bindValue(':uuid', $uuid, PDO::PARAM_STR);
      $stmt_previous->execute();
      $previous_data = $stmt_previous->fetch(PDO::FETCH_ASSOC);

      // 다음 데이터 가져오기
      $sql_next = "SELECT * FROM notice_list WHERE idx > :idx AND uuid = :uuid ORDER BY idx ASC LIMIT 1";
      $stmt_next = $conn->prepare($sql_next);
      $stmt_next->bindValue(':idx', $idx, PDO::PARAM_INT);
      $stmt_next->bindValue(':uuid', $uuid, PDO::PARAM_STR);
      $stmt_next->execute();
      $next_data = $stmt_next->fetch(PDO::FETCH_ASSOC);

      $result_data = array(
        "current_data" => $result,
        "previous_data" => $previous_data,
        "next_data" => $next_data
      );
      ReturnData(200, $cmd, "데이터 로드 성공", $rtn_access_token, $result_data, $conn);
    }catch(ePDOException $e){
      ReturnData(600, $cmd, $e->getMessage(), $rtn_access_token, "", $conn);
    }
    die();
    break;
  case "load_reple" :
    if ( isset($request_body->idx)){
      $idx = $request_body->idx;
      $uuid = $request_body->uuid;
    }else{
      ReturnData(500, $cmd, "파라미터 오류", "", "", $conn);
      die();
    }
    try{
      $sql = "SELECT * FROM reple_data WHERE parent_idx = :idx AND uuid = :uuid";
      $stmt = $conn->prepare($sql);
      $stmt->bindValue(':idx', $idx, PDO::PARAM_INT);
      $stmt->bindValue(':uuid', $uuid, PDO::PARAM_STR);
      $stmt->execute();
      $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
      $data_array = $result;

      $result_data["table_data"] = $data_array;

      ReturnData(200, $cmd, "데이터 로드 성공", $rtn_access_token, $result_data, $conn);
    }catch(ePDOException $e){
      ReturnData(600, $cmd, $e->getMessage(), $rtn_access_token, "", $conn);
    }
    die();
    break;
  case "update_hit" :
    if ( isset($request_body->idx)){
      $idx = $request_body->idx;
      $uuid = $request_body->uuid;
    }else{
      ReturnData(500, $cmd, "파라미터 오류", "", "", $conn);
      die();
    }
    try{
      $sql = "UPDATE notice_list SET hit = hit + 1 WHERE idx = :idx AND uuid = :uuid";
      $stmt = $conn->prepare($sql);
      $stmt->bindValue(':idx', $idx, PDO::PARAM_INT);
      $stmt->bindValue(':uuid', $uuid, PDO::PARAM_STR);
      $stmt->execute();
      $result = $stmt->fetch(PDO::FETCH_ASSOC);

      ReturnData(200, $cmd, "업데이트 성공", $rtn_access_token, $result, $conn);
    }catch(ePDOException $e){
      ReturnData(600, $cmd, $e->getMessage(), $rtn_access_token, "", $conn);
    }
    die();
    break;
  case "load_customer_all_data" :
    try{

      $sql = "SELECT * FROM customer_list";
      $stmt = $conn->prepare($sql);

      $stmt->execute();
      $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
      $data_array = $result;

      $result_data["table_data"] = $data_array;
      ReturnData(200, $cmd, "데이터 로드 성공", $rtn_access_token, $result_data, $conn);
    }catch(ePDOException $e){
      ReturnData(600, $cmd, $e->getMessage(), $rtn_access_token, "", $conn);
    }
    die();
    break;
  case "insert_notice" :
    // 폼데이터로 넘겨진 경우 처리를 위해 (php://input으로 처리 불가)
    $title = isset($_POST['title']) ? $_POST['title'] : "";
    $content = isset($_POST['content']) ? $_POST['content'] : "";
    $editor_file_name = isset($_POST['editor_file_name']) ? $_POST['editor_file_name'] : "";
    $uuid = isset($_POST['uuid']) ? $_POST['uuid'] : "";
    $main_result_file = isset($_POST['main_result_file']) ? $_POST['main_result_file'] : "";
    $writer = isset($_POST['writer']) ? $_POST['writer'] : "";
   
    
    // 파일을 저장할 디렉터리 경로
    $uploadDirectory = '../notice_file/' . $uuid . '/';
    
    // 업로드 디렉터리가 없으면 생성
    if (!file_exists($uploadDirectory)) {
        try {
            mkdir($uploadDirectory, 0777, true); // 폴더 생성
        } catch (ErrorException $e) {
            ReturnData(501, $cmd, $e->getMessage(), "", "", $conn);
            die();    
        }
    }
    
    // 파일 업로드 처리
    if (!empty($_FILES['main_files']['name'])) {
      handleFileUpload($uploadDirectory, $_FILES['main_files'], "main_files");
    }
    
    // 에디터 파일 처리
    $editorResult = "";
    if (!empty($editor_file_name)) {
      $editorResult = editorFileUpload($editor_file_name, $uploadDirectory);
    }
  

    $sql = "INSERT INTO notice_list (title, content, uuid, write_date, files, writer)";
    $sql = $sql . " VALUES (:title, :content, :uuid, now(), :main_result_file, :writer)";

    // 디자인 결과 업데이트
    try{
      // PDO 준비
      $conn->beginTransaction();     // 트랜잭션 시작
      $stmt = $conn->prepare($sql);

      // 파라미터 바인딩, ?로 할 경우 bindValue로 
      $stmt->bindValue(":title", $title, PDO::PARAM_STR);
      $stmt->bindValue(":content", $content, PDO::PARAM_STR);
      $stmt->bindValue(":uuid", $uuid, PDO::PARAM_STR);
      $stmt->bindValue(":main_result_file", $main_result_file, PDO::PARAM_STR);
      $stmt->bindValue(":writer", $writer, PDO::PARAM_STR);


      
      $stmt->execute();
      $insertedId = $conn->lastInsertId();
      $data = array(
        'page_idx' => $insertedId,
        'uuid' => $uuid,
        'editorResult' => $editorResult,
      );
      $json_data = json_encode($data);
      //$stmt->debugDumpParams();
      $count = $stmt->rowCount();
      if ($count == 1){
        $conn->commit();     // 트랜잭션 성공
        ReturnData(200, $cmd, "", $rtn_access_token, $json_data, $conn);
        die();
      }
      else{
         
          //$stmt->debugDumpParams();
          $conn->rollBack();     // 트랜잭션 실패
          ReturnData(502, $cmd, $sql, $rtn_access_token, $json_data, $conn);
      }
    }
    catch(PDOException $e){
        //$stmt->debugDumpParams();
        $conn->rollBack();     // 트랜잭션 실패
        ReturnData(600, $cmd, $e->getMessage(), $rtn_access_token, $json_data, $conn);
      }
  
  break; 
  case "update_notice" :
    $idx = isset($_POST['idx']) ? $_POST['idx'] : "";
    $title = isset($_POST['title']) ? $_POST['title'] : "";
    $content = isset($_POST['content']) ? $_POST['content'] : "";
    $editor_file_name = isset($_POST['editor_file_name']) ? $_POST['editor_file_name'] : "";
    $uuid = isset($_POST['uuid']) ? $_POST['uuid'] : "";
    $main_result_file = isset($_POST['main_result_file']) ? $_POST['main_result_file'] : "";
    $writer = isset($_POST['writer']) ? $_POST['writer'] : "";
  
  
    $uploadDirectory = '../notice_file/' . $uuid . '/';

   // 업로드 디렉터리가 없으면 생성
   if (!file_exists($uploadDirectory)) {
       try {
           mkdir($uploadDirectory, 0777, true); // 폴더 생성
       } catch (ErrorException $e) {
           ReturnData(501, $cmd, $e->getMessage(), "", "", $conn);
           die();    
       }
   }
   // 파일 업로드 처리
  if (!empty($_FILES['main_files']['name'])) {
    handleFileUpload($uploadDirectory, $_FILES['main_files'], "main_files");
  }
   
  // 에디터 파일 처리
  $editorResult = "";
  if (!empty($editor_file_name)) {
    $editorResult = editorFileUpload($editor_file_name, $uploadDirectory);
  }
  
  try{
    $conn->beginTransaction();

    $sql = "UPDATE notice_list SET title = :title, content = :content, uuid = :uuid, files = :main_result_file, writer = :writer WHERE idx = :idx";
    $stmt = $conn->prepare($sql);
    $stmt->bindValue(":idx", $idx, PDO::PARAM_INT);

    $stmt->bindValue(":title", $title, PDO::PARAM_STR);
    $stmt->bindValue(":content", $content, PDO::PARAM_STR);
    $stmt->bindValue(":uuid", $uuid, PDO::PARAM_STR);
    $stmt->bindValue(":main_result_file", $main_result_file, PDO::PARAM_STR);
    $stmt->bindValue(":writer", $writer, PDO::PARAM_STR);

    $stmt->execute();
      if ($stmt){
        $conn->commit();
        
        $data = array(
          'page_idx' => $idx,
          'uuid' => $uuid,
          'uuid' => $uuid,
        );
        $json_data = json_encode($data);
        ReturnData(200, $cmd, "", $rtn_access_token, $json_data, $conn); 
      }
      else{
        $conn->rollBack();
        ReturnData(501, $cmd, "수정 오류",
                $rtn_access_token, $json_data, $conn);
        die();  
      }
  }catch (PDOException $e) {
    $conn->rollBack();
    ReturnData(600, $cmd, $e->getMessage(), $rtn_access_token, $json_data, $conn);
  }

  break; 
  case "del_data":
    if (isset($request_body->tblname) && 
        isset($request_body->idx) &&
        isset($request_body->idxname) && 
        isset($request_body->dropdata)) {
      $tbl_name = $request_body->tblname;
      $idx_value = $request_body->idx;
      $idx_name = $request_body->idxname;     // 삭제할 키 값 (키값이 )
      // 테이블을 삭제해야 할 경우 dropdata에 포함되어 전송됨. ","로 구분된 문자열
      $dropdata = $request_body->dropdata;
    } else {
      ReturnData(500, $cmd, "파라미터 오류", $rtn_access_token, "", $conn);
      die();
    }
    $tmpErrorMessage = "";
    if (is_array($idx_value)) {
        $conn->beginTransaction();
        foreach ($idx_value as $idx) {
          if ($idx_name != ""){
            $sql = "DELETE FROM " . $tbl_name . " WHERE " . $idx_name . " = :idx";
            if ($b_searchdata != "")
              $sql = $sql . " AND " . $b_searchdata;
          }
          else{
            $sql = "DELETE FROM " . $tbl_name . " WHERE idx = :idx";
            if ($b_searchdata != "")
              $sql = $sql . " AND " . $b_searchdata;
          }
          try {
              $stmt = $conn->prepare($sql);
              $stmt->bindParam(":idx", $idx, PDO::PARAM_INT);
              $stmt->execute();
              $resultcount = $stmt->rowCount();
              // 영향을 받는 항목이 없을 경우 실패를 리턴
              if ($resultcount == 0) {
                  $tmpErrorMessage = "삭제할 데이터가 존재하지 않습니다.";
                  break;
              }
          } catch (PDOException $e) {
              $tmpResult = false;
              $tmpErrorMessage = $e->getMessage();
          }
        }
        if ($tmpErrorMessage == ""){
          $rtndropdata = "";
          $rtndropdata = DropTable($dropdata, $conn);
          if ($rtndropdata == ""){
            $conn->commit();
            ReturnData(200, $cmd, "", $rtn_access_token, "", $conn);    
          }
          else{
            $conn->rollBack();
            ReturnData(600, $cmd, $rtndropdat, $rtn_access_token, "", $conn);
          }
        }
        else{
            $conn->rollBack();
            ReturnData(600, $cmd, $tmpErrorMessage, $rtn_access_token, "", $conn);
        }
    } else {
        try {
          if ($idx_name != ""){
            $sql = "DELETE FROM " . $tbl_name . " WHERE " . $idx_name . " = :idx";
          }
          else{
            $sql = "DELETE FROM " . $tbl_name . " WHERE idx = :idx";
          }

          $conn->beginTransaction();
          $stmt = $conn->prepare($sql);
          $stmt->bindParam(":idx", $idx_value, PDO::PARAM_INT);
          $stmt->execute();
          $resultcount = $stmt->rowCount();
          if ($resultcount > 0) {
            $rtndropdata = "";
            $rtndropdata = DropTable($dropdata, $conn);
            if ($rtndropdata == ""){
              
              if ($tbl_name == "product_type"){
                $sql = "DELETE FROM product_list WHERE type_id = :idx";
                $stmt = $conn->prepare($sql);
                $stmt->bindParam(":idx", $idx_value, PDO::PARAM_INT);
                $stmt->execute();
              }
              $conn->commit();
              ReturnData(200, $cmd, "", $rtn_access_token, "", $conn);    
            }
            else{
              $conn->rollBack();
              ReturnData(600, $cmd, $rtndropdata, $rtn_access_token, "", $conn);
            }
          }else{
              //$stmt->debugDumpParams();
              ReturnData(500, $cmd, "삭제할 정보 없음", $rtn_access_token, "", $conn);
          }
        } catch (PDOException $e) {
            $conn->rollBack();
            ReturnData(600, $cmd, $e->getMessage(), $rtn_access_token, "", $conn);
        }
    }    
    die();
    break;
  default:
  break;
  }


  function ReturnData($status, $cmd, $message, $atoken, $data, $conn){
    $return_data = array();     // 결과값 리턴 배열 선언
    unset($return_data);
    $tmp_json["status"] = $status;
    $tmp_json["cmd"] = $cmd;
    $tmp_json["statusText"] = $message;
    $tmp_json["token"] = $atoken;
    $tmp_json["data"] = $data;
    $return_data = json_encode($tmp_json, JSON_UNESCAPED_UNICODE + JSON_PRETTY_PRINT);
    echo ($return_data);
    if (isset($conn)){
      $conn = null;
    }
  }

  function DropTable($dropdata, $dbcon){
    $rtnvalue = "";
    if ($dropdata == ""){
      return;
    }
    if (is_array($dropdata)){
      foreach ($dropdata as $tablename) {
        $resulttable = "";
        $checktable = "SHOW tables LIKE '" . $dropdata . "'";
        /*
        $checktable = "SELECT CONCAT('DROP TABLE ', TABLE_SCHEMA, '.', TABLE_NAME, ';')";
        $checktable = $checktable . " FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '";
        $checktable = $checktable . $dropdata . "%'";
        */
        $stmt = $dbcon->prepare($checktable);
        $stmt->execute();
        $resulttable = $stmt->fetchColumn();
        if ($resulttable != ""){
          while($row)
          $delsql = "DROP TABLE " . $tablename;
          try{
            $stmt = $dbcon->prepare($delsql);
            $stmt->execute();
            if (!$stmt){
              $rtnvalue = "테이블 삭제 오류 : " . $delsql;
              break;
            }
          }catch(PDOException $e){
            $rtnvalue = $e->getMessage();
          }
        }
      }
    }else{
      try{
        $resulttable = "";
        //테이블이 존재하는지 검사 후 삭제한다.
        $checktable = "SHOW tables LIKE '" . $dropdata . "'";
        $stmt = $dbcon->prepare($checktable);
        $stmt->execute();
        $resulttable = $stmt->fetchColumn();
        if ($resulttable != ""){
          $delsql = "DROP TABLE " . $dropdata;
          $stmt = $dbcon->prepare($delsql);
          $stmt->execute();
          if (!$stmt){
            $rtnvalue = "테이블 삭제 오류 : " . $delsql;
          }
        }
      }catch(PDOException $e){
        $rtnvalue = $e->getMessage();
      }
    }
    return $rtnvalue;
  }
?>