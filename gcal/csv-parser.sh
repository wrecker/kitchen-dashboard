#!/bin/bash
# CSV to JSON converter using BASH
# original script from http://blog.secaserver.com/2013/12/convert-csv-json-bash/
# thanks SecaGuy!
# Usage ./csv2json.sh input.csv > output.json

c=0
echo "["
while IFS=$'\t' read -t 20 -r -a array
do
        if [ $c -ne 0 ]
        then
                echo "    },"
        fi
        start_date=`date -d "${array[0]} ${array[1]}" -Iseconds`
        end_date=`date -d "${array[2]} ${array[3]}" -Iseconds`
        title=${array[4]//\"/\\\"}
        location=${array[5]//\"/\\\"}
        echo "    {"
        if [ ${#location} -eq 0 ]
        then
                echo "        \"title\": \"$title\"",
        else
                echo "        \"title\": \"$title | $location\"",
        fi
        echo "        \"start\": \"${start_date}\"",
        echo "        \"end\": \"${end_date}\""
        c=$(($c+1))
done < "${1:-/dev/stdin}"
echo "    }"
echo "]"
