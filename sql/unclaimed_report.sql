
SELECT DISTINCT(p.[ID]) as "system_id",
p.[doi] as "doi",
p.[Type] as "pub_type",
p.[number] as "lbnl_id",
REPLACE(REPLACE(p.[title], CHAR(13), ''), CHAR(10), '') as "title",

-- UC Authors
(SELECT u.[Last Name] + ', ' + u.[First Name] + ' (' + u.[Primary Group Descriptor] + '); ' AS 'data()'  FROM [Pending Publication] pp
JOIN [User] u ON pp.[User ID] = u.[ID]
WHERE pp.[Publication ID] = p.[ID]
FOR XML PATH(''))
as "uc_authors",

REPLACE(REPLACE(p.[authors], CHAR(13), ''), CHAR(10), '') as "all_authors",

COALESCE(REPLACE(REPLACE(p.[parent-title], CHAR(13), ''), CHAR(10), ''), '') as "parent_title",
COALESCE(REPLACE(REPLACE(p.[journal], CHAR(13), ''), CHAR(10), ''), '') as "journal", 
COALESCE(p.[volume], '') as "volume", 
COALESCE(p.[issue], '') as "issue",

p.[publication-date] as "publication_date",

-- Imported
(SELECT COUNT(DISTINCT pp.[Publication ID]) FROM [Pending Publication] pp 
WHERE pp.[Publication ID] = p.[ID]
AND p.[Records Imported From] LIKE '%Local Source%')
as "imported",

-- Open Access Publication
(SELECT COUNT(DISTINCT(pp.[Publication ID])) FROM [Pending Publication] pp 
WHERE pp.[Publication ID] = p.[ID]
AND
p.[publication-date]  >= 20151001
AND
p.[Type] = 'Journal article')
as "seems_like_should_be_oa",

-- Claimed By
(SELECT u.[LBL EPPN] + ',' AS 'data()'  FROM [Publication User Relationship] pur
JOIN [User] u ON pur.[User ID] = u.[ID]
WHERE pur.[Publication ID] = p.[ID]
FOR XML PATH(''))
as "claimed_by",

-- Awaiting Claim By
(SELECT u.[LBL EPPN] + ',' AS 'data()' FROM [Pending Publication] pp
JOIN [User] u ON pp.[User ID] = u.[ID]
WHERE pp.[Publication ID] = p.[ID]
FOR XML PATH(''))
as "awaiting_claim_by",

-- OA policy exception
(select oaex.[Type] AS 'data()' from [Publication OA Policy Exception] oaex
    where p.[ID] = oaex.[Publication ID]
for XML PATH(''))
as 'oa_policy_exception',


-- OA status 
(SELECT DISTINCT [Compliance Status] AS 'data()' from [Publication OA Policy] poap where
    poap.[Publication ID] = p.[ID] FOR XML PATH(''))
as 'oa_status'

FROM [Publication] p
JOIN [Pending Publication] pp ON p.[ID] = pp.[Publication ID]
JOIN [User] u on u.[ID] = pp.[User ID]
WHERE u.[Primary Group Descriptor] LIKE '%lbl-%' AND u.[Primary Group Descriptor] NOT IN ('lbl-delegate','lbl-admin')

--JOIN [Group User Membership] gum ON pp.[User ID] = gum.[User ID]
--WHERE gum.[Group ID] in (
-- 685, 686, 687, 759, 760, 761, 762, 763, 764, 765, 766, 767, 768
--)
