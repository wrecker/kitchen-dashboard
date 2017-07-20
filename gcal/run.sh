#!/bin/bash

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

gcalcli --tsv --calendar calendar1@gmail.com --calendar calendar3@gmail.com --details location agenda 2017/06/11 2017/06/17  | bash csv-parser.sh
