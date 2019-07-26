#!/bin/bash
MYNODE='/home/dgj/.nvm/versions/node/v10.9.0/bin/node'

cd /home/dgj/projects/library/scout
$MYNODE get_hr.js
$MYNODE get_osti.js
$MYNODE get_elements.js
$MYNODE make_divisions.js
$MYNODE copy_updates.js

