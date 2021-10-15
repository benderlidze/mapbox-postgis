
1. 
ALTER TABLE public.poly_an ADD COLUMN poly_type varchar;
ALTER TABLE public.poly_an ADD COLUMN b_id integer;
ALTER TABLE public.poly_an ADD COLUMN b_name varchar;

2. 
UPDATE "public"."poly_an" SET poly_type = 'poly_an' where p_id >0
 
3. 
insert into poly_an (default_ops,	c_cat,	c_type,	recv_type,	p_name,	b_name,	user_name,	poly, b_id, poly_type) select default_ops,	c_cat,	c_type,	recv_type,	p_name,	b_name,	user_name,	poly, b_id,'poly_b' from poly_b;



UPDATE "public"."poly_an"
SET p_id=subquery.p_id
FROM (SELECT ref_points_b.p_id From ref_points_b JOIN "public"."poly_an" ON poly_an.b_id = ref_points_b.b_id) AS subquery
where poly_an.poly_type  = 'poly_b'


UPDATE "public"."poly_an"
SET p_id = ref_points_b.p_id
FROM ref_points_b
WHERE poly_an.b_id = ref_points_b.b_id and poly_an.b_id>0;