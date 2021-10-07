     SELECT ST_CONTAINS(
       ST_GeomFromGeoJSON('{
        "type": "Polygon",
        "coordinates": [
          [
            [
              -22.148437499999996,
              60.23981116999893
            ],
            [
              -29.53125,
              34.30714385628804
            ],
            [
              34.80468749999999,
              28.92163128242129
            ],
            [
              36.5625,
              57.89149735271034
            ],
            [
              -22.148437499999996,
              60.23981116999893
            ]
          ]
        ]
      }'),ST_GeomFromGeoJSON('{
        "type": "Point",
        "coordinates": [
          36.54739379882812,
          57.88492731476436
        ]
      }'));



      INSERT INTO "public"."ref_dots" (vsl_id,	vsl_name,	vsl_type,	latitude,	longitude,	vsl_cat, status) VALUES ('2342',	'tim',	'ca',	1.237145,	103.879073,	'p',	'fresh');
INSERT INTO "public"."ref_dots" (vsl_id,	vsl_name,	vsl_type,	latitude,	longitude,	vsl_cat, status) VALUES ('2343',	'john',	'ca',	-5.988833,	105.936417,	'c',	'rotten');
INSERT INTO "public"."ref_dots" (vsl_id,	vsl_name,	vsl_type,	latitude,	longitude,	vsl_cat, status) VALUES ('2344',	'dan',	'fis',	-5.882543,	106.030252,	'h',	'yummy');
INSERT INTO "public"."ref_dots" (vsl_id,	vsl_name,	vsl_type,	latitude,	longitude,	vsl_cat, status) VALUES ('2345',	'greece',	'ca',	1.275533,	103.896567,	's',	'fresh');
INSERT INTO "public"."ref_dots" (vsl_id,	vsl_name,	vsl_type,	latitude,	longitude,	vsl_cat, status) VALUES ('2346',	'denmark',	'ca',	1.251118,	104.136427,	'p',	'rotten');
INSERT INTO "public"."ref_dots" (vsl_id,	vsl_name,	vsl_type,	latitude,	longitude,	vsl_cat, status) VALUES ('2347',	'italy',	'ca',	-5.517833,	105.343667,	'p',	'yummy');
INSERT INTO "public"."ref_dots" (vsl_id,	vsl_name,	vsl_type,	latitude,	longitude,	vsl_cat, status) VALUES ('2348',	'mary',	'ca',	-2.14025,	104.998733,	'p',	'fresh');
INSERT INTO "public"."ref_dots" (vsl_id,	vsl_name,	vsl_type,	latitude,	longitude,	vsl_cat, status) VALUES ('2349',	'tree',	'ca',	0.377383,	106.4739,	'p',	'rotten');
INSERT INTO "public"."ref_dots" (vsl_id,	vsl_name,	vsl_type,	latitude,	longitude,	vsl_cat, status) VALUES ('2350',	'putugal',	'ca',	1.486153,	104.818157,	'p',	'yummy');
INSERT INTO "public"."ref_dots" (vsl_id,	vsl_name,	vsl_type,	latitude,	longitude,	vsl_cat, status) VALUES ('2351',	'england',	'fis',	3.208333,	104.376667,	'h',	'fresh');
INSERT INTO "public"."ref_dots" (vsl_id,	vsl_name,	vsl_type,	latitude,	longitude,	vsl_cat, status) VALUES ('2352',	'norway',	'fis',	2.424533,	101.606877,	'c',	'rotten');
INSERT INTO "public"."ref_dots" (vsl_id,	vsl_name,	vsl_type,	latitude,	longitude,	vsl_cat, status) VALUES ('2353',	'seas',	'fis',	-10.55145,	98.128453,	'c',	'yummy');
INSERT INTO "public"."ref_dots" (vsl_id,	vsl_name,	vsl_type,	latitude,	longitude,	vsl_cat, status) VALUES ('2354',	'keke',	'fis',	1.258498,	104.111705,	's',	'fresh');
INSERT INTO "public"."ref_dots" (vsl_id,	vsl_name,	vsl_type,	latitude,	longitude,	vsl_cat, status) VALUES ('2355',	'tuohai',	'oct',	4.157267,	100.603983,	'h',	'rotten');
INSERT INTO "public"."ref_dots" (vsl_id,	vsl_name,	vsl_type,	latitude,	longitude,	vsl_cat, status) VALUES ('2356',	'ffa',	'oct',	10.567783,	107.019583,	'h',	'yummy');





INSERT INTO "public"."ref_points_b" ("b_id","t_id","p_id","b_name","b_operator","b_status","facility_type","latitude","longitude")	VALUES ('568',	'367',	'928',	'KJ1'	,'kedah'	,'Active'	,'dry'	,3.0505833	,101.3600333);
INSERT INTO "public"."ref_points_b" ("b_id","t_id","p_id","b_name","b_operator","b_status","facility_type","latitude","longitude")	VALUES ('130',	'367',	'491',	'No 08'	,'north'	,'Active'	,'dry'	,3.0159	,101.3568);
INSERT INTO "public"."ref_points_b" ("b_id","t_id","p_id","b_name","b_operator","b_status","facility_type","latitude","longitude")	VALUES ('131',	'367',	'491',	'No 09'	,'north'	,'Active'	,'dry'	,3.0183167	,101.3568833);
INSERT INTO "public"."ref_points_b" ("b_id","t_id","p_id","b_name","b_operator","b_status","facility_type","latitude","longitude")	VALUES ('132',	'367',	'491',	'No 10'	,'north'	,'Active'	,'dry'	,3.0212333	,101.35695);
INSERT INTO "public"."ref_points_b" ("b_id","t_id","p_id","b_name","b_operator","b_status","facility_type","latitude","longitude")	VALUES ('133',	'367',	'491',	'No 11'	,'north'	,'Active'	,'dry'	,3.0235833	,101.3570167);
INSERT INTO "public"."ref_points_b" ("b_id","t_id","p_id","b_name","b_operator","b_status","facility_type","latitude","longitude")	VALUES ('166',	'367',	'495',	'B01'	,'west'	,'Active'	,'dry'	,2.95795	,101.3078167);
INSERT INTO "public"."ref_points_b" ("b_id","t_id","p_id","b_name","b_operator","b_status","facility_type","latitude","longitude")	VALUES ('167',	'367',	'495',	'B02'	,'west'	,'Active'	,'dry'	,2.9563667	,101.3069167);
INSERT INTO "public"."ref_points_b" ("b_id","t_id","p_id","b_name","b_operator","b_status","facility_type","latitude","longitude")	VALUES ('168',	'367',	'495',	'B03'	,'west'	,'Active'	,'dry'	,2.9547833	,101.3059833);
INSERT INTO "public"."ref_points_b" ("b_id","t_id","p_id","b_name","b_operator","b_status","facility_type","latitude","longitude")	VALUES ('169',	'367',	'495',	'B04'	,'west'	,'Active'	,'dry'	,2.9532167	,101.3051);
INSERT INTO "public"."ref_points_b" ("b_id","t_id","p_id","b_name","b_operator","b_status","facility_type","latitude","longitude")	VALUES ('170',	'367',	'495',	'B05'	,'west'	,'Active'	,'dry'	,2.9516667	,101.3042167);
INSERT INTO "public"."ref_points_b" ("b_id","t_id","p_id","b_name","b_operator","b_status","facility_type","latitude","longitude")	VALUES ('171',	'367',	'495',	'B06'	,'west'	,'Active'	,'dry'	,2.9499333	,101.3032333);
