<?php
set_time_limit(0);

error_reporting(E_ALL | E_STRICT);
ini_set('display_errors', true);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");


$dbconn = pg_connect("host=127.0.0.1 port=5432 user=test dbname=test_db  password=123456");

// takes raw data from the request
$json = file_get_contents('php://input');
// Converts it into a PHP object
$_DATA = json_decode($json, true);

if (isset($_GET['getPointsDotsDropdown'])) {
    
    $data = [];
    $error = '';
    
    $result = pg_query($dbconn, 'SELECT DISTINCT(facility_type) FROM "public"."ref_points_b"');
    if (!$result) {
	$error = "Query Error!";
    }
    while ($row = pg_fetch_assoc($result)) {
	$data['facility_types'][] = $row['facility_type'];
    }
    
    $result = pg_query($dbconn, 'SELECT DISTINCT(dry) FROM "public"."ref_points_p"');
    if (!$result) {
	$error = "Query Error!";
    }
    while ($row = pg_fetch_assoc($result)) {
	$data['dry_p'][] = $row['dry'];
    }
    
    $result = pg_query($dbconn, 'SELECT DISTINCT(facility_type) FROM "public"."ref_points_t"');
    if (!$result) {
	$error = "Query Error!";
    }
    while ($row = pg_fetch_assoc($result)) {
	$data['facility_type_t'][] = $row['facility_type'];
    }
    
    $result = pg_query($dbconn, 'SELECT DISTINCT(status) FROM "public"."ref_dots"');
    if (!$result) {
	$error = "Query Error!";
    }
    while ($row = pg_fetch_assoc($result)) {
	$data['status'][] = $row['status'];
    }
    
    $results = array(
	'error'=>$error,
	'data'=>$data
    );
    echo json_encode($results);	
}

if (isset($_DATA['removePolygonByTableId'])) {
    $table_name = $_DATA['table_name'];
    $table_id = $_DATA['removePolygonByTableId'];
    //echo $table_name, $table_id;
    
    if($table_name == "poly_b" || $table_name=="poly_an"){
	$result = pg_query_params($dbconn,'DELETE FROM "public"."poly_an" where poly_type=\''.$table_name.'\' and table_id = $1;', array($table_id));
    }else{
	$result = pg_query_params($dbconn,'DELETE FROM "public"."'.$table_name.'" where table_id = $1;', array($table_id));
    }
    
    $results = array("done" => "ok");
    echo json_encode($results);		
}

if (isset($_DATA['polygon'])) {

    $selectedPolygonType = $_DATA['selectedPolygonType'];
    $userName = $_DATA['userName'];
    $polygon = json_encode($_DATA['polygon']);

    if($selectedPolygonType === "poly_an"){
	
	$poly_type = 'poly_an';
	// $poly_an_id = $_DATA['poly_an_id'];
	$poly_an_name = $_DATA['poly_an_name'];
	$p_id = $_DATA['p_id'];
	$working = $_DATA['working'];
	$default_ops = $_DATA['default_ops'];
	$c_cat = $_DATA['c_cat'];
	$c_type = $_DATA['c_type'];
	$recv_type = $_DATA['recv_type'];
	$p_name = $_DATA['p_name'];
	
	//if there is a table_id - then it is an update 
	if(isset($_DATA['table_id']) && $_DATA['table_id']!=""){
	    
	    $table_id = $_DATA['table_id'];
	    $result = pg_query_params($dbconn, 
		'UPDATE poly_an 
		SET
		(user_name, poly, poly_an_name, p_id, working,default_ops, c_cat,c_type, recv_type, p_name) 
		=  
		($1,ST_GeomFromGeoJSON($2), $3, $4, $5, $6, $7, $8, $9, $10)
		where table_id = $11 and poly_type=$12
		', 
		array($userName, $polygon, $poly_an_name, $p_id, $working, $default_ops, $c_cat, $c_type, $recv_type, $p_name, $table_id, $poly_type)
				
	    );
	}else{
	    $result = pg_query_params($dbconn, 
		'INSERT INTO poly_an 
		(user_name, poly,  poly_an_name, p_id, working,default_ops, c_cat,c_type, recv_type, p_name, poly_type) 
		VALUES 
		($1,ST_GeomFromGeoJSON($2), $3, $4, $5, $6, $7, $8, $9, $10,$11 )', 
		array($userName, $polygon,  $poly_an_name, $p_id, $working, $default_ops, $c_cat, $c_type, $recv_type, $p_name, $poly_type)
	    );
	}
    }
    
    if($selectedPolygonType === "poly_b"){
	$poly_type = 'poly_b';
	
	$b_id = $_DATA['b_id'];
	$default_ops = $_DATA['default_ops'];
	$c_cat = $_DATA['c_cat'];
	$c_type = $_DATA['c_type'];
	$recv_type = $_DATA['recv_type'];
	$b_name = $_DATA['b_name'];
	$p_name = $_DATA['p_name'];
	
	$insert_id = 0;
	
	if(isset($_DATA['table_id']) && $_DATA['table_id']!=""){
	    
	    $table_id = $_DATA['table_id'];
	    $result = pg_query_params($dbconn, 
		'UPDATE poly_an SET
		(user_name, poly, b_id, default_ops, c_cat,c_type, recv_type, b_name, p_name)
		= 
		($1,ST_GeomFromGeoJSON($2), $3, $4, $5, $6, $7, $8, $9)
		where table_id = $10 and poly_type = $11
		RETURNING table_id
		', 
		array($userName, $polygon,  $b_id, $default_ops, $c_cat, $c_type, $recv_type,$b_name, $p_name, $table_id, $poly_type)
	    );
	    $insert_row = pg_fetch_row($result);
	    $insert_id = $insert_row[0];
	}else{
	    
	    $result = pg_query_params($dbconn, 
		'INSERT INTO poly_an 
		(user_name, poly, b_id, default_ops, c_cat,c_type, recv_type, b_name, p_name, poly_type) 
		VALUES 
		($1,ST_GeomFromGeoJSON($2), $3, $4, $5, $6, $7, $8, $9,$10)
		RETURNING table_id
		', 
		array($userName, $polygon,  $b_id, $default_ops, $c_cat, $c_type, $recv_type,$b_name, $p_name,$poly_type)
	    );
	    $insert_row = pg_fetch_row($result);
	    $insert_id = $insert_row[0];
	}
	
	if($insert_id>0){
	    //update p_id from ref_points_b
	    $result = pg_query_params($dbconn,'UPDATE "public"."poly_an"
		SET p_id = ref_points_b.p_id
		FROM ref_points_b
		WHERE poly_an.b_id = ref_points_b.b_id and poly_an.table_id = $1;',
		array($insert_id)
		);
	}
	
    }
    
    if($selectedPolygonType === "poly_p"){
	
	$p_id = $_DATA['p_id'];
	$p_group = $_DATA['p_group'];
	$p_name = $_DATA['p_name'];
	
	if(isset($_DATA['table_id']) && $_DATA['table_id']!=""){
	    
	    $table_id = $_DATA['table_id'];
	    $result = pg_query_params($dbconn, 
		'UPDATE poly_p
		SET 
		(user_name, poly, p_id, p_group, p_name) 
		= 
		($1,ST_GeomFromGeoJSON($2), $3, $4, $5)
		where table_id = $6
		', 
		array($userName, $polygon,  $p_id, $p_group, $p_name, $table_id)
	    );
	}else{
	    $result = pg_query_params($dbconn, 
		'INSERT INTO poly_p 
		(user_name, poly, p_id, p_group, p_name) 
		VALUES 
		($1,ST_GeomFromGeoJSON($2), $3, $4, $5)', 
		array($userName, $polygon,  $p_id, $p_group, $p_name)
	    );
	}
    }
    
    if($selectedPolygonType === "poly_s_r"){
	
	$poly_s_r_name = $_DATA['poly_s_r_name'];
	$r_name = $_DATA['r_name'];
	
	if(isset($_DATA['table_id']) && $_DATA['table_id']!=""){
	    
	    $table_id = $_DATA['table_id'];
	    $result = pg_query_params($dbconn, 
		'UPDATE poly_s_r
		SET 
		(user_name, poly, poly_s_r_name, r_name) 
		= 
		($1,ST_GeomFromGeoJSON($2), $3, $4)
		where table_id = $5
		', 
		array($userName, $polygon,  $poly_s_r_name, $r_name, $table_id)
	    );
	}else{
	    $result = pg_query_params($dbconn, 
		'INSERT INTO poly_s_r 
		(user_name, poly, poly_s_r_name, r_name) 
		VALUES 
		($1,ST_GeomFromGeoJSON($2), $3, $4)', 
		array($userName, $polygon,  $poly_s_r_name, $r_name)
	    );
	}
    }
    if($selectedPolygonType === "poly_r"){
	
	$poly_r_name = $_DATA['poly_r_name'];
	
	if(isset($_DATA['table_id']) && $_DATA['table_id']!=""){
	     
	    $table_id = $_DATA['table_id'];
	    
	    //---------- UPDATE ALL poly_s_r rows with old name to new poly_r_name from poly_r -------------
	    $result = pg_query($dbconn, 'SELECT poly_r_name FROM "public"."poly_r" where table_id = '.$table_id.' limit 1 ');
	    if (!$result) {
		$error = "Query Error!";
	    }
	    while ($row = pg_fetch_assoc($result)) {
		$old_name = $row['poly_r_name'];
		
		$result = pg_query_params($dbconn, 
		'UPDATE "public"."poly_s_r" SET r_name = $1 where r_name = $2', 
		array($poly_r_name,$old_name)
		);
	    }

	    //---------- UPDATE ALL poly_s_r rows with old name to new poly_r_name from poly_r -------------
	    
	    $result = pg_query_params($dbconn, 
		'UPDATE poly_r SET
		(user_name, poly, poly_r_name) 
		= 
		($1,ST_GeomFromGeoJSON($2), $3)
		where table_id = $4
		', 
		array($userName, $polygon, $poly_r_name, $table_id)
	    );
	}else{
	    $result = pg_query_params($dbconn, 
		'INSERT INTO poly_r 
		(user_name, poly, poly_r_name) 
		VALUES 
		($1,ST_GeomFromGeoJSON($2), $3)', 
		array($userName, $polygon,  $poly_r_name)
	    );
	}
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
				where p_id ='.$p_id.'');
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
    
    if($table == "poly_b" || $table=="poly_an"){
	$result = pg_query($dbconn, 'SELECT *,ST_AsGeoJSON(poly) as poly FROM "public"."poly_an" where poly_type=\''.$table.'\'');
    }else{
	$result = pg_query($dbconn, 'SELECT *,ST_AsGeoJSON(poly) as poly FROM "public"."'.$table.'"');	
    }
    
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
    $names =[];
    //$result = pg_query($dbconn, 'SELECT * FROM "public"."ref_dots" where vsl_cat=\''.$type.'\'');
    $result = pg_query($dbconn, 'SELECT * FROM "public"."ref_dots" where vsl_cat=\''.$type.'\'');
    if (!$result) {
	$error = "Query Error!";
    }
    while ($row = pg_fetch_assoc($result)) {
	//$row['vsl_name'] = 'test';
	//$row['status'] = 'status_test';
	$names = array_keys($row);
	$data[] = $row;
    }
    
    array_unshift($data , $names);
    
    $results = array(
	'error'=>$error,
	'data'=>array2csv($data)
	
    );
    
    //echo json_encode($results,JSON_UNESCAPED_UNICODE);
    echo json_encode($results, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE);
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
    $poly_r_name = [];
    $p_group = [];
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
    // ------------------r_name----------------------
    $result = pg_query($dbconn, 'SELECT * FROM "public"."poly_r"');
    if (!$result) {
	$error = "Query Error!";
    }
    while ($row = pg_fetch_assoc($result)) {
	$poly_r_name[] = array(
		'poly_r_name'=>$row['poly_r_name'],
	);
    }
    $data['poly_r_name'] = $poly_r_name;
    
    // ------------------r_name----------------------
    $result = pg_query($dbconn, 'SELECT * FROM "public"."ref_p_group"');
    if (!$result) {
	$error = "Query Error!";
    }
    while ($row = pg_fetch_assoc($result)) {
	$p_group[] = array(
	
		'p_group_id'=>$row['p_group_id'],
		'p_group'=>$row['p_group'],
	);
    }
    $data['p_group'] = $p_group;
    
    
    $results = array(
	'error'=>$error,
	'data'=>$data
    );
    echo json_encode($results);
    
}

if (isset($_GET['getUniquePNameCountry'])) {
	
    $result = pg_query($dbconn, 'SELECT DISTINCT(p_id, p_name, country) FROM "public"."ref_points_p"');
	
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

function array2csv($data, $delimiter = ',', $enclosure = '"', $escape_char = "\\")
{
    $f = fopen('php://memory', 'r+');
    foreach ($data as $item) {
        fputcsv($f, $item, $delimiter, $enclosure, $escape_char);
    }
    rewind($f);
    return stream_get_contents($f);
}

/*
for ($i=0; $i < 20000; $i++) { 
    $c = generateRandomPoint(array(3.1528, 101.7038), 100);
    $lat = $c[0];
    $lon = $c[1];
    $result = pg_query_params($dbconn, 
		    'INSERT INTO ref_dots 
		    (vsl_id,	vsl_name,	vsl_type,	latitude,	longitude,	status,	sp,	dest, vsl_cat) 
		    VALUES 
		    ($1,$2, $3, $4, $5, $6, $7, $8, $9 )', 
		    array('123', 'test',  'ca', $lat, $lon, 'stat', 1, 'dest', 's')
		);
} 

function generateRandomPoint($centre, $radius) {
    $radius_earth = 3959; //miles

    //Pick random distance within $distance;
    $distance = lcg_value()*$radius;

    //Convert degrees to radians.
    $centre_rads = array_map( 'deg2rad', $centre );

    //First suppose our point is the north pole.
    //Find a random point $distance miles away
    $lat_rads = (pi()/2) -  $distance/$radius_earth;
    $lng_rads = lcg_value()*2*pi();


    //($lat_rads,$lng_rads) is a point on the circle which is
    //$distance miles from the north pole. Convert to Cartesian
    $x1 = cos( $lat_rads ) * sin( $lng_rads );
    $y1 = cos( $lat_rads ) * cos( $lng_rads );
    $z1 = sin( $lat_rads );


    //Rotate that sphere so that the north pole is now at $centre.

    //Rotate in x axis by $rot = (pi()/2) - $centre_rads[0];
    $rot = (pi()/2) - $centre_rads[0];
    $x2 = $x1;
    $y2 = $y1 * cos( $rot ) + $z1 * sin( $rot );
    $z2 = -$y1 * sin( $rot ) + $z1 * cos( $rot );

    //Rotate in z axis by $rot = $centre_rads[1]
    $rot = $centre_rads[1];
    $x3 = $x2 * cos( $rot ) + $y2 * sin( $rot );
    $y3 = -$x2 * sin( $rot ) + $y2 * cos( $rot );
    $z3 = $z2;


    //Finally convert this point to polar co-ords
    $lng_rads = atan2( $x3, $y3 );
    $lat_rads = asin( $z3 );

    return array_map( 'rad2deg', array( $lat_rads, $lng_rads ) );
}

*/
