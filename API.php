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
		//echo ($row['poly']);
		//echo '<hr>';
		
		$data[] = array(
			'name'=>"Some name",
			'geometry'=>json_decode($row['poly'])
		);
	}
	
	
	$results = array(
		'error'=>$error,
		'data'=>$data
	);
	echo json_encode($results);
	
}

/*
 $result = pg_query_params($dbconn, 'INSERT INTO poly_an (poly_an_name, poly) VALUES ($1,ST_GeomFromGeoJSON($2))',
 array("NAME",'{
 "type":"Polygon",
 "coordinates":
 [
 [
 [-91.23046875,45.460130637921],
 [-79.8046875,49.837982453085],
 [-69.08203125,43.452918893555],
 [-88.2421875,32.694865977875],
 [-91.23046875,45.460130637921]
 ]
 ],
 "crs":{"type":"name","properties":{"name":"EPSG:3857"}}
 }'));
 */
?>
