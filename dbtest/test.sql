/* select * from [User Record] */

/*
select * from [System Log] sl
join [User] u on u.[ID] = sl.[User ID]
WHERE u.[Primary Group Descriptor] LIKE '%lbl-%'
*/


/*
SELECT *
-- select p.[title], p.[doi]
FROM [Publication] p                                                            
JOIN [Publication User Relationship] pur ON p.[ID] = pur.[Publication ID]       
JOIN [User] u on u.[ID] = pur.[User ID]                                         
WHERE u.[Primary Group Descriptor] LIKE '%lbl-%' AND u.[Primary Group Descriptor] NOT IN ('lbl-delegate','lbl-admin') 
AND pur.[Publication ID] = '1780820';
*/

/*
SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'
*/

/* 
select * from [Publication] p where p.[doi] = '10.5506/aphyspolb.49.103';
 */

/*
select * from [Publication User Relationship] pur where pur.[Publication ID] = '1780820';
*/

/*
select * from [User] u where u.[ID] = '20149';
*/


select * from [Publication OA Policy Exception]

-- select [Privacy Level], [User ID], [Publication ID] from [Publication User Relationship]
-- select COLUMN_NAME from information_schema.columns where table_name = 'System Log'; 
-- select COLUMN_NAME from information_schema.columns where table_name = 'User Publication Preferences'; 
-- select COLUMN_NAME from information_schema.columns where table_name = 'Publication OA Policy Exception'; 
