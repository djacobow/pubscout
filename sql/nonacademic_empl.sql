SELECT 
    u.ID as 'User ID',
    ur.ID as 'User Record ID',
    nae.[Employer Address Organisation] as 'organization',
    nae.[Employer Address Suborganisation] as 'suborganization',
    nae.[Position] as 'position',
    nae.[Start Date] as 'start_date',
    nae.[End Date] as 'end_date'

From [User Record Non-Academic Employment] nae 
inner join [User Record] ur on ur.[ID] = nae.[User Record ID]
inner join [User] u on ur.[User ID] = u.ID
WHERE u.[Primary Group Descriptor] LIKE '%lbl-%' AND u.[Primary Group Descriptor] NOT IN ('lbl-delegate','lbl-admin')
ORDER BY u.[Last Name], u.[First Name]
