SELECT 
    u.[ID] as 'User ID',
    ur.[ID] as 'User Record ID',
    urwa.[URL] as 'url',
    urwa.[Label] as 'label'
From [User Record Web Address] urwa 
inner join [User Record] ur on ur.[ID] = urwa.[User Record ID]
inner join [User] u on ur.[User ID] = u.ID
WHERE u.[Primary Group Descriptor] LIKE '%lbl-%' AND u.[Primary Group Descriptor] NOT IN ('lbl-delegate','lbl-admin')
ORDER BY u.[Last Name], u.[First Name]
