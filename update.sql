
1. 
ALTER TABLE public.poly_an ADD COLUMN poly_type varchar;
ALTER TABLE public.poly_an ADD COLUMN b_id integer;
ALTER TABLE public.poly_an ADD COLUMN b_name integer;

2. 
UPDATE "public"."poly_an" SET poly_type = 'poly_an' where p_id >0
 
3. 
insert into poly_an (default_ops,	c_cat,	c_type,	recv_type,	p_name,	b_name,	user_name,	poly, b_id, poly_type) select default_ops,	c_cat,	c_type,	recv_type,	p_name,	b_name,	user_name,	poly, b_id,'poly_b' from poly_b;