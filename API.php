<?
error_reporting(E_ALL | E_STRICT);
ini_set('display_errors', true);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

$dbconn = pg_connect("host=127.0.0.1 port=5432 user=test_user dbname=test_polygons  password=bender123");

// takes raw data from the request
$json = file_get_contents('php://input');
// Converts it into a PHP object
$_DATA = json_decode($json, true);

if (isset($_DATA['polygon'])) {

	$selectedPolygonType = $_DATA['selectedPolygonType'];
	$userName = $_DATA['userName'];
	$polygon = json_encode($_DATA['polygon']);

	if($selectedPolygonType === "poly_an"){
		
		$poly_an_id = $_DATA['poly_an_id'];
		$poly_an_name = $_DATA['poly_an_name'];
		$p_id = $_DATA['p_id'];
		$working = $_DATA['working'];
		$default_ops = $_DATA['default_ops'];
		$c_cat = $_DATA['c_cat'];
		$c_type = $_DATA['c_type'];
		$recv_type = $_DATA['recv_type'];
		/*
			poly_an_id	integer	
			poly_an_name	text	
			p_id	integer	
			working	boolean	
			default_ops	text	
			c_cat	text	
			c_type	text	
			recv_type
		*/
		$result = pg_query_params($dbconn, 
			'INSERT INTO poly_an 
			(user_name, poly, poly_an_id, poly_an_name, p_id, working,default_ops, c_cat,c_type, recv_type) 
			VALUES 
			($1,ST_GeomFromGeoJSON($2), $3, $4, $5, $6, $7, $8, $9, $10)', 
			array($userName, $polygon, $poly_an_id, $poly_an_name, $p_id, $working, $default_ops, $c_cat, $c_type, $recv_type)
		);
	}
	
	if($selectedPolygonType === "poly_b"){
		
		$b_id = $_DATA['b_id'];
		$default_ops = $_DATA['default_ops'];
		$c_cat = $_DATA['c_cat'];
		$c_type = $_DATA['c_type'];
		$recv_type = $_DATA['recv_type'];
		$b_name = $_DATA['b_name'];
		$p_name = $_DATA['p_name'];
		
		$result = pg_query_params($dbconn, 
			'INSERT INTO poly_b 
			(user_name, poly, b_id, default_ops, c_cat,c_type, recv_type, b_name, p_name) 
			VALUES 
			($1,ST_GeomFromGeoJSON($2), $3, $4, $5, $6, $7, $8, $9)', 
			array($userName, $polygon,  $b_id, $default_ops, $c_cat, $c_type, $recv_type,$b_name, $p_name)
		);
	}
	
	if($selectedPolygonType === "poly_p"){
		
		$p_id = $_DATA['p_id'];
		$p_group = $_DATA['p_group'];
		$p_name = $_DATA['p_name'];
		
		$result = pg_query_params($dbconn, 
			'INSERT INTO poly_p 
			(user_name, poly, p_id, p_group, p_name) 
			VALUES 
			($1,ST_GeomFromGeoJSON($2), $3, $4, $5)', 
			array($userName, $polygon,  $p_id, $p_group, $p_name)
		);
	}
	
	if($selectedPolygonType === "poly_s_r"){
		
		$poly_s_r_name = $_DATA['poly_s_r_name'];
		$r_name = $_DATA['r_name'];
		
		$result = pg_query_params($dbconn, 
			'INSERT INTO poly_s_r 
			(user_name, poly, poly_s_r_name, r_name) 
			VALUES 
			($1,ST_GeomFromGeoJSON($2), $3, $4)', 
			array($userName, $polygon,  $poly_s_r_name, $r_name)
		);
	}
	if($selectedPolygonType === "poly_r"){
		
		$poly_r_name = $_DATA['poly_r_name'];
		
		$result = pg_query_params($dbconn, 
			'INSERT INTO poly_r 
			(user_name, poly, poly_r_name) 
			VALUES 
			($1,ST_GeomFromGeoJSON($2), $3)', 
			array($userName, $polygon,  $poly_r_name)
		);
	}

	$results = array("done" => "ok");
	echo json_encode($results);
}

if (isset($_GET['getBName'])) {

	$b_id = $_GET['getBName'];
	$data = '';
	$error = '';
	$result = pg_query($dbconn, 'SELECT b_name, p_name FROM "public"."ref_points_b" 
								LEFT JOIN "public"."ref_points_p" ON ref_points_p.p_id = ref_points_b.p_id
								where b_id = '.$b_id.'');
	if (!$result) {
		$error = "Query Error!";
	}
	while ($row = pg_fetch_assoc($result)) {
		$data = $row;
	}
	$results = array(
		'error'=>$error,
		'data'=>$data
	);
	echo json_encode($results);
}

if (isset($_GET['getPName'])) {

	$p_id = $_GET['getPName'];
	$data = '';
	$error = '';
	$result = pg_query($dbconn, 'SELECT p_name FROM "public"."ref_points_p" 						
								where p_id = '.$p_id.'');
	if (!$result) {
		$error = "Query Error!";
	}
	while ($row = pg_fetch_assoc($result)) {
		$data = $row;
	}
	$results = array(
		'error'=>$error,
		'data'=>$data
	);
	echo json_encode($results);
}


if (isset($_GET['getPolygons'])) {

	$table = $_GET['layerId'];
	$data = [];
	$error = '';
	
	$result = pg_query($dbconn, 'SELECT *,ST_AsGeoJSON(poly) as poly FROM "public"."'.$table.'"');
	if (!$result) {
		$error = "Query Error!";
	}

	while ($row = pg_fetch_assoc($result)) {
			
		$poly = array(
		'type'=>'Feature',
		'properties'=>$row,
		'geometry'=>json_decode($row['poly'])
		); 
		
		$data[] = $poly;
	}
	
	
	$results = array(
		'error'=>$error,
		'data'=>$data
	);
	echo json_encode($results);
	
}


if (isset($_GET['getDOTS'])) {
	$type = $_GET['typeId'];
	$data = [];
	$error = '';
	
	$result = pg_query($dbconn, 'SELECT * FROM "public"."ref_dots" where vsl_cat=\''.$type.'\'');
	if (!$result) {
		$error = "Query Error!";
	}
	while ($row = pg_fetch_assoc($result)) {
		$poly = $row;
		$data[] = $poly;
	}
	
	$results = array(
		'error'=>$error,
		'data'=>$data
	);
	echo json_encode($results);
}

if (isset($_GET['getPOINTS'])) {
	$type = $_GET['typeId'];
	$data = [];
	$error = '';
	
	$result = pg_query($dbconn, 'SELECT * FROM "public"."ref_points_'.$type.'" ');
	if (!$result) {
		$error = "Query Error!";
	}
	while ($row = pg_fetch_assoc($result)) {
		$poly = $row;
		$data[] = $poly;
	}
	
	$results = array(
		'error'=>$error,
		'data'=>$data
	);
	echo json_encode($results);
}


//OPTIONS FOR DROP DOW LIST
if (isset($_GET['getDataForDropdown'])) {

	$cgo = [];
	$default_ops = [];
	$recv_type = [];
	$data = [];
	$error = '';

	// ------------- CGO -----------------------	
	$result = pg_query($dbconn, 'SELECT * FROM "public"."ref_cgo"');
	if (!$result) {
		$error = "Query Error!";
	}
	while ($row = pg_fetch_assoc($result)) {
		$cgo[] = array(
				'cgo_id'=>$row['cgo_id'],
				'cgo_value'=>$row['cgo_value'],
				'cgo_type'=>$row['cgo_type'],
		);
	}
	$data['cgo'] = $cgo;
	
	// ------------- CGO -----------------------	
	$result = pg_query($dbconn, 'SELECT * FROM "public"."ref_default_ops"');
	if (!$result) {
		$error = "Query Error!";
	}
	while ($row = pg_fetch_assoc($result)) {
		$default_ops[] = array(
				'default_ops_id'=>$row['default_ops_id'],
				'default_ops_value'=>$row['default_ops_value'],
		);
	}
	$data['default_ops'] = $default_ops;
	
	// ------------- CGO -----------------------	
	$result = pg_query($dbconn, 'SELECT * FROM "public"."ref_recv_type"');
	if (!$result) {
		$error = "Query Error!";
	}
	while ($row = pg_fetch_assoc($result)) {
		$recv_type[] = array(
				'recv_type_id'=>$row['recv_type_id'],
				'recv_type'=>$row['recv_type'],
		);
	}
	$data['recv_type'] = $recv_type;
	
	
	
	$results = array(
		'error'=>$error,
		'data'=>$data
	);
	echo json_encode($results);
	
}
?>
