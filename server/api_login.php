<?php

  function regen_password($param, $dbcon, $atoken, &$regenpassword)
  {
    try{
      if ($param->mem_id =='admin'){
        ReturnData(500, $param->cmd, "허용되지 않는 아이디입니다.", "", "", $dbcon);
        return false;    
      }

      // 아이디가 존재하는지 검사
      $sql = "SELECT * FROM webzine_member WHERE mem_id = :mem_id";
      $stmt = $dbcon->prepare($sql);
      $stmt->bindValue(":mem_id", $param->mem_id, PDO::PARAM_STR);
      $stmt->execute();
          
      $count = $stmt->rowCount();
      if ($count < 1){
        ReturnData(501, $param->cmd, "비밀번호 재발송 오류(1)", $atoken, "", $dbcon);
        return false;
      }

      $sql = "UPDATE webzine_member SET mem_password = :mem_password WHERE mem_id = :mem_id";
      $stmt = $dbcon->prepare($sql);

      // 랜덤 변수 발생
      $regenpassword = passwordGenerator(6);
      // 생성된 비밀번호는 sha256 해쉬로 인코딩한다.
      $change_password = hash("sha256", utf8_encode($regenpassword));

      $stmt->bindValue(":mem_id", $param->mem_id, PDO::PARAM_STR);
      $stmt->bindValue(":mem_password", $change_password, PDO::PARAM_STR);
      $stmt->execute();
          
      $count = $stmt->rowCount();
      if ($stmt){
        if ($count > 0){
          return true;
        }
        else{
          ReturnData(502, $param->cmd, "비밀번호 재발송 오류(2)", $atoken, "", $dbcon);
          return false;
        }
      }
      else{
        ReturnData(503, $param->cmd, pdo_debugStrParams($stmt, bDebug), $atoken, "", $dbcon);
        return false;
      }
    }catch (PDOException $e) {
      ReturnData(600, $param->cmd, pdo_debugStrParams($stmt, bDebug) . 
                $e->getMessage(), $atoken, "", $dbcon);
      return false;
    }
  }

?>