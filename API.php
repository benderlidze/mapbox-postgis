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

	$userName = $_DATA['userName'];
	$polygon = json_encode($_DATA['polygon']);

	$result = pg_query_params($dbconn, 'INSERT INTO poly_an (poly_an_name, poly) VALUES ($1,ST_GeomFromGeoJSON($2))', array($userName, $polygon));

	$results = array("done" => "ok");
	echo json_encode($results);
}

if (isset($_GET['getPolygons'])) {

	//$result = pg_query_params($dbconn, 'SELECT * FROM "public"."poly_an"', array("param"));
	$data = [];
	$error = '';
	
	$result = pg_query($dbconn, 'SELECT *,ST_AsGeoJSON(poly) as poly FROM "public"."poly_an"');
	if (!$result) {
		$error = "Query Error!";
	}

	while ($row = pg_fetch_assoc($result)) {
			
		$poly = array(
		'type'=>'Feature',
		'properties'=>array(
				'name'=>$row['poly_an_name'],
				'id'=>$row['p_id']
			),
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
