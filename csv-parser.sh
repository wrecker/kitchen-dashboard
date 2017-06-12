#!/bin/bash
# CSV to JSON converter using BASH
# original script from http://blog.secaserver.com/2013/12/convert-csv-json-bash/
# thanks SecaGuy!
# Usage ./csv2json.sh input.csv > output.json

input=$1

[ -z $1 ] && echo "No CSV input file specified" && exit 1
[ ! -e $input ] && echo "Unable to locate $1" && exit 1

#read first_line < $input
a=0
#headings=`echo $first_line | awk -F, {'print NF'}`
lines=`cat $input | wc -l`
#while [ $a -lt $headings ]
#do
#        head_array[$a]=$(echo $first_line | awk -v x=$(($a + 1)) -F"," '{print $x}')
#        a=$(($a+1))
#done

c=0
echo "["
while IFS=',' read -r -a array
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
done < $input
echo "    }"
echo "]"
