#!/bin/bash

gcalcli --tsv --calendar calendar1@gmail.com --calendar calendar2@gmail.com --details location agenda 2017/06/11 2017/06/17  | bash csv-parser.sh
