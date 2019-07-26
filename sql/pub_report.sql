
SELECT DISTINCT(p.[ID]) as "system_id",
p.[doi] as "doi",
p.[Type] as "pub_type",
p.[number] as "lbnl_id",
REPLACE(REPLACE(p.[title], CHAR(13), ''), CHAR(10), '') as "title",

-- Lab Authors
(SELECT u.[Last Name] + ', ' + u.[First Name] + ' (' + u.[Primary Group Descriptor] + '); ' AS 'data()'  FROM [Publication User Relationship] pur
JOIN [User] u ON pur.[User ID] = u.[ID]
WHERE pur.[Publication ID] = p.[ID]
FOR XML PATH(''))
as "uc_authors",

REPLACE(REPLACE(p.[authors], CHAR(13), ''), CHAR(10), '') as "all_authors",

COALESCE(REPLACE(REPLACE(p.[parent-title], CHAR(13), ''), CHAR(10), ''), '') as "parent_title",
COALESCE(REPLACE(REPLACE(p.[journal], CHAR(13), ''), CHAR(10), ''), '') as "journal", 
COALESCE(p.[volume], '') as "volume", 
COALESCE(p.[issue], '') as "issue",

p.[publication-date] as "publication_date",

-- Imported
(SELECT COUNT(DISTINCT pur.[Publication ID]) FROM [Publication User Relationship] pur 
WHERE pur.[Publication ID] = p.[ID]
AND p.[Records Imported From] LIKE '%Local Source%')
as "imported",

-- Open Access Publication
(SELECT COUNT(DISTINCT(pur.[Publication ID])) FROM [Publication User Relationship] pur 
WHERE pur.[Publication ID] = p.[ID]
AND
p.[publication-date]  >= 20151001
AND
p.[Type] = 'Journal article')
as "seems_like_should_be_oa",

-- Claim Date (really earliest action date)
(SELECT MIN(pur.[Modified When]) FROM [Publication User Relationship] pur
WHERE pur.[Publication ID] = p.[ID])
as "claim_date",


-- favorites (for users who want a pub promoted)
(SELECT u.[LBL EPPN] + ',' AS 'data()'  FROM [User Publication Preferences] upp
JOIN [User] u on upp.[User ID] = u.[ID]
WHERE upp.[Publication ID] = p.[ID] AND upp.[Favourite] = 1
FOR XML PATH(''))
as "favorited",

-- hidden (for users who want a pub buried)
(SELECT u.[LBL EPPN] + ',' AS 'data()'  FROM [Publication User Relationship] pur 
JOIN [User] u on pur.[User ID] = u.[ID]
WHERE pur.[Publication ID] = p.[ID] AND pur.[Privacy Level] != 'Public' 
FOR XML PATH(''))
as "hidden",

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

-- Deposited
(SELECT COUNT(DISTINCT(pr.[Publication ID])) FROM [Publication Record] pr 
WHERE pr.[Publication ID] = p.[ID]
AND pr.[record-created-at-source-date] IS NOT NULL
AND pr.[Data Source] = N'eScholarship')
as "deposited",

-- Deposit Date
(SELECT MIN(pr.[record-created-at-source-date]) FROM [Publication Record] pr
WHERE pr.[Publication ID] = p.[ID]
AND pr.[Data Source] = N'eScholarship')
as "deposit_date",

-- Funding Linked
(SELECT COUNT(DISTINCT(gur.[Grant ID])) FROM [Grant Publication Relationship] gur
WHERE gur.[Publication ID] = p.[ID])
as "funding_linked",

-- First Funding Linked Date
(SELECT MIN(gur.[Modified When]) FROM [Grant Publication Relationship] gur
WHERE gur.[Publication ID] = p.[ID])
as "funding_linked_date",

-- Project Associations 
(SELECT name + '; ' as 'data()' FROM [Project Publication Relationship] pinfo 
JOIN [Project] pr ON pinfo.[Project ID] = pr.[ID]
WHERE pinfo.[Publication ID] = p.[ID]
FOR XML PATH(''))
as "project_name",

-- Funding Sources
(SELECT g.[funder-reference] + '; ' AS 'data()'  FROM [Grant Publication Relationship] gur
JOIN [Grant] g ON gur.[Grant ID] = g.[ID]
WHERE gur.[Publication ID] = p.[ID]
FOR XML PATH(''))
as "funding_source",

-- eschol link
(SELECT TOP 1 pr.[public-url] FROM [Publication Record] pr 
WHERE pr.[Publication ID] = p.[ID]
AND pr.[public-url] IS NOT NULL) 
as "escholarship_link",

-- author provided url
(SELECT TOP 1 pr.[author-url] from [Publication Record] pr
WHERE pr.[Publication ID] = p.[ID]
AND pr.[author-url] is NOT NULL)
as "author_link",

(SELECT MAX(pr.[Citation Count]) FROM [Publication Record] pr
WHERE pr.[Publication ID] = p.[ID])
as "citation_count",

p.[Web of Science Citation Count] as "wos_citation_count",
p.[Web of Science Lite Citation Count] as "wos_lite_citation_count",
p.[Scopus Citation Count] as "scopus_citation_count",
p.[Europe PubMed Central Citation Count] as "europe_pubmed_central_citation_count",
p.[Dimensions for Universities Citation Count] as "dimensions_citation_count",
p.[relative-citation-ratio] as "relative_citation_ratio",

p.[Flagged As Not Externally Funded] as 'not_externally_funded',
p.[abstract] as 'abstract',

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
JOIN [Publication User Relationship] pur ON p.[ID] = pur.[Publication ID]
JOIN [User] u on u.[ID] = pur.[User ID]
WHERE u.[Primary Group Descriptor] LIKE '%lbl-%' AND u.[Primary Group Descriptor] NOT IN ('lbl-delegate','lbl-admin')
