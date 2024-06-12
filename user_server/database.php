<?php
  // 데이터베이스 연결을 위한 class 생성
  class DatabaseService {

    private $db_host = "121.254.170.182";
    private $db_name = "snsmanager";
    private $db_user = "snsmanager";
    private $db_password = "!snsmanager2022#";
    private $db_charset = "utf8";
    private $db_port = 12237;

    private $connection;

    public function getConnection(){
      try{
        // PDO(PHP Data Objects)는 여러 종류의 데이터베이스를 같은 방식으로 사용 가능하게 해줌
        // PDOStatement와 데이터 바인딩을 통해 SQL 인젝션을 막아주고, 성능을 향상
        /*
          // 쿼리를 담은 PDOStatement 객체 생성
          $stmt = $pdo -> prepare("SELECT * FROM girl_group WHERE name = :name");
          // PDOStatement 객체가 가진 쿼리의 파라메터에 변수 값을 바인드
          $stmt -> bindValue(":name", "나연");
          // PDOStatement 객체가 가진 쿼리를 실행
          $stmt -> execute();
          // PDOStatement 객체가 실행한 쿼리의 결과값 가져오기
          $row = $stmt -> fetch();
          $print_r($row);
        */
        $db_dsn = "mysql:host=$this->db_host;dbname=$this->db_name;charset=$this->db_charset;port=$this->db_port";
        $this->connection = new PDO ($db_dsn, $this->db_user, $this->db_password);
      }catch(PDOException $exception){
        echo "Connection Failed : " . $exception->getMessage();
      }
      return $this->connection;
    }
  }

  class DatabaseService_2 {

    private $db_host = "localhost";
    private $db_name = "webzine_admin";
    private $db_user = "webzine";
    private $db_password = "Y0FWL2I9JPZx]a8[";
    private $db_charset = "utf8";
    private $db_port = 12237;

    private $connection;

    public function getConnection(){
      try{
        // PDO(PHP Data Objects)는 여러 종류의 데이터베이스를 같은 방식으로 사용 가능하게 해줌
        // PDOStatement와 데이터 바인딩을 통해 SQL 인젝션을 막아주고, 성능을 향상
        /*
          // 쿼리를 담은 PDOStatement 객체 생성
          $stmt = $pdo -> prepare("SELECT * FROM girl_group WHERE name = :name");
          // PDOStatement 객체가 가진 쿼리의 파라메터에 변수 값을 바인드
          $stmt -> bindValue(":name", "나연");
          // PDOStatement 객체가 가진 쿼리를 실행
          $stmt -> execute();
          // PDOStatement 객체가 실행한 쿼리의 결과값 가져오기
          $row = $stmt -> fetch();
          $print_r($row);
        */
        $db_dsn = "mysql:host=$this->db_host;dbname=$this->db_name;charset=$this->db_charset;port=$this->db_port";
        $this->connection = new PDO ($db_dsn, $this->db_user, $this->db_password);
      }catch(PDOException $exception){
        echo "Connection Failed : " . $exception->getMessage();
      }
      return $this->connection;
    }
  }
?>