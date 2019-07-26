SELECT 
    u.[ID] as 'User ID',
    ur.[ID] as 'User Record ID',
    urc.[Institution Address Organisation] as 'organization',
    urc.[Institution Address Suborganisation] as 'suborganization',
    urc.[Title] as 'title',
    urc.[Effective Date] as 'effective_date',
    urc.[Expiry Date] as 'expiry_date'
From [User Record Certification] urc 
inner join [User Record] ur on ur.[ID] = urc.[User Record ID]
inner join [User] u on ur.[User ID] = u.ID
WHERE u.[Primary Group Descriptor] LIKE '%lbl-%' AND u.[Primary Group Descriptor] NOT IN ('lbl-delegate','lbl-admin')
