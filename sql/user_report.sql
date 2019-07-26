
SELECT [Last Name] as "last_name", 
[First Name] as "first_name", 
[Username] as "Username",
[ID] as "Elements ID",
[LBL EPPN] as "LBNL EPPN",
[UCNetID] as "UCNetId",
[Email] as "email", 
[Primary Group Descriptor] as "primary_group",
[Is Academic] as "academic",
[Is Current Staff] as "current",
[Is Login Allowed] as "login_allowed",

[Position] as "position",

(SELECT u2.[Last Name] + ', ' + u2.[First Name] + ' (' + u2.[Email] + '); ' AS 'data()'  FROM [User] u2
JOIN [Delegate] d ON d.[Delegate ID] = u2.[ID]
WHERE d.[User ID] = u.[ID]
FOR XML PATH(''))
as "delegates",

(SELECT [Author] FROM [User Search Term Defaults]
WHERE [User ID] = u.[ID])
as "search_names",

(SELECT [Affiliation] FROM [User Search Term Defaults]
WHERE [User ID] = u.[ID])
as "search_addresses",

(SELECT uia.[Identifier Value] FROM [User Identifier Association] uia
JOIN [Identifier Scheme] isc ON uia.[Identifier Scheme ID] = isc.[ID]
WHERE uia.[User ID] = u.[ID]
AND isc.[Name] = 'orcid')
as "ORCID",

(SELECT uia.[Identifier Value] FROM [User Identifier Association] uia
JOIN [Identifier Scheme] isc ON uia.[Identifier Scheme ID] = isc.[ID]
WHERE uia.[User ID] = u.[ID]
AND isc.[Name] = 'arxiv-author-id')
as "arXiv ID",

(SELECT uia.[Identifier Value] FROM [User Identifier Association] uia
JOIN [Identifier Scheme] isc ON uia.[Identifier Scheme ID] = isc.[ID]
WHERE uia.[User ID] = u.[ID]
AND isc.[Name] = 'researcherid')
as "Clarivate ResearcherID",

-- some people have multiple scopus IDs
(SELECT uia.[Identifier Value] + ', ' AS 'data()' FROM [User Identifier Association] uia
JOIN [Identifier Scheme] isc ON uia.[Identifier Scheme ID] = isc.[ID]
WHERE uia.[User ID] = u.[ID]
AND isc.[Name] = 'scopus-author-id'
FOR XML PATH(''))
as "Scopus ID",

(SELECT COUNT(DISTINCT [Publication ID]) FROM [Publication User Relationship]
WHERE [User ID] = u.[ID])
 as "pubs_claimed",

(SELECT COUNT(DISTINCT pur.[Publication ID]) FROM [Publication User Relationship] pur
JOIN [Repository Item] ri ON pur.[Publication ID] = ri.[Publication ID]
WHERE pur.[User ID] = u.[ID]
AND ri.[Created When] IS NOT NULL
AND ri.[Licence File Count] = 1) 
as "pubs_deposited",

(SELECT COUNT(DISTINCT pur.[Publication ID]) FROM [Publication User Relationship] pur
JOIN [Publication] p ON pur.[Publication ID] = p.[ID]
JOIN [Grant Publication Relationship] gur ON pur.[Publication ID] = gur.[Publication ID]
WHERE pur.[User ID] = u.[ID])
as "pubs_funding_linked" ,

(SELECT COUNT(DISTINCT [Publication ID]) FROM [Pending Publication] 
WHERE [User ID] = u.[ID])
as "pubs_pending",

(SELECT COUNT(DISTINCT [Publication ID]) FROM [Declined Publication] 
WHERE [User ID] = u.[ID])
as "pubs_declined",

(SELECT COUNT(DISTINCT pur.[Publication ID]) FROM [Publication User Relationship] pur
JOIN [Repository Item] ri ON pur.[Publication ID] = ri.[Publication ID]
JOIN [Publication] p ON ri.[Publication ID] = p.[ID]
WHERE pur.[User ID] = u.[ID]
AND ri.[Created When] IS NOT NULL
AND ri.[Licence File Count] IS NULL)
as "Incomplete Deposits",
[Department] as "primary_department",

(SELECT g.Name + ';' AS 'data()'  FROM [Group User Membership] gum
JOIN [Group] g ON gum.[Group ID]= g.ID
WHERE gum.[User ID] = u.[ID]
AND g.[Type] = 'auto'
ORDER BY g.[ID]
FOR XML PATH(''))
as "all_affiliations",

(SELECT COUNT([Time]) FROM [Login Log] WHERE [User ID] = u.[ID]) as "logins",

(SELECT MAX([Time]) FROM [Login Log] WHERE [User ID] = u.[ID]) as "last_login",

(SELECT [Profile Photo] FROM [User Photo] WHERE [User ID] = u.[ID])  as "photo_data",
(SELECT [Photo Mime Type] FROM [User Photo] WHERE [User ID] = u.[ID])  as "photo_type",

(SELECT [overview] FROM [User Record] ur where ur.[User ID] = u.[ID]) as "overview",

(SELECT [teaching-summary] FROM [User Record] ur where ur.[User ID] = u.[ID]) as "teaching_summary"

FROM [User] u
WHERE u.[Primary Group Descriptor] LIKE '%lbl-%' AND u.[Primary Group Descriptor] NOT IN ('lbl-delegate','lbl-admin')
ORDER BY u.[Last Name], u.[First Name]
