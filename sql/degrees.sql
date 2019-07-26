SELECT 
    u.[ID] as 'User ID',
    ur.[ID] as 'User Record ID',
    urd.[Field of Study] as 'Field of Study',
    urd.[Name] as 'degree',
    urd.[Thesis] as 'thesis',
    urd.[Institution Address Organisation] as 'organization',
    urd.[Institution Address Suborganisation] as 'suborganization',
    urd.[End Date] as 'end_date'
From [User Record Degree] urd
inner join [User Record] ur on ur.[ID] = urd.[User Record ID]
inner join [User] u on ur.[User ID] = u.ID
WHERE u.[Primary Group Descriptor] LIKE '%lbl-%' AND u.[Primary Group Descriptor] NOT IN ('lbl-delegate','lbl-admin')
