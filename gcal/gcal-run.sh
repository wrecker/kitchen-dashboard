#!/bin/bash

source /srv/dashboard/venv/bin/activate
# Calculate start & end date
dow=$(date +%A)
if [[ "$dow" == "Sunday" ]]
then
    start=$(date "+%Y/%m/%d")
    end=$(date "+%Y/%m/%d" -d "+14 days")
else
    start=$(date "+%Y/%m/%d" -d "Last Sunday")
    end=$(date "+%Y/%m/%d" -d "Last Sunday +14 days")
fi

gcalcli --nocache --tsv --calendar Mahesh --details location agenda $start $end | bash csv-parser.sh > ../www/json/mahesh.json
gcalcli --nocache --tsv --calendar "Chitra Ramaswamy" --details location agenda $start $end | bash csv-parser.sh > ../www/json/chitra.json
gcalcli --nocache --tsv --calendar Events --details location agenda $start $end | bash csv-parser.sh > ../www/json/events.json
gcalcli --nocache --tsv --calendar Reminders --details location agenda $start $end | bash csv-parser.sh > ../www/json/reminders.json
gcalcli --nocache --tsv --calendar "Holidays in United States" --details location agenda $start $end | bash csv-parser.sh > ../www/json/us-holidays.json

