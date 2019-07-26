SELECT 
    u.ID as 'User ID',
    ur.ID as 'User Record ID',
    aa.[Institution Address Organisation] as 'organization',
    aa.[Institution Address Suborganisation] as 'suborganization',
    aa.[Position] as 'position',
    aa.[Start Date] as 'start_date',
    aa.[End Date] as 'end_date'

From [User Record Academic Appointment] aa
inner join [User Record] ur on ur.[ID] = aa.[User Record ID]
inner join [User] u on ur.[User ID] = u.ID
WHERE u.[Primary Group Descriptor] LIKE '%lbl-%' AND u.[Primary Group Descriptor] NOT IN ('lbl-delegate','lbl-admin')
