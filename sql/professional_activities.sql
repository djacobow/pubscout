SELECT 
    u.[ID] as 'User ID',
    pa.[ID] as 'User Record ID',
    pa.[description] as 'description',
    pa.[title] as 'title',
    pa.[Computed Title] as 'Computed Title',
    pa.[institution] as 'institution',
    pa.[start-date] as 'start-date',
    pa.[event-start-date] as 'event-start-date',
    pa.[Reporting Date 1] as 'Reporting Date 1',
    pa.[Reporting Date 2] as 'Reporting Date 2',
    pa.[event-type] as 'event-type',
    pa.[Type] as 'Type'
FROM [Professional Activity] pa
JOIN [Professional Activity User Relationship] pur ON pa.[ID] = pur.[Professional Activity ID]
JOIN [User] u on u.[ID] = pur.[User ID]
WHERE u.[Primary Group Descriptor] LIKE '%lbl-%' AND u.[Primary Group Descriptor] NOT IN ('lbl-delegate','lbl-admin')
ORDER BY u.[Last Name], u.[First Name]
