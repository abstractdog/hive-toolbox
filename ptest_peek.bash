#!/bin/bash

QUEUE_FILE=/tmp/.asf_queue
wget -q -O $QUEUE_FILE "https://builds.apache.org/queue/api/xml?tree=items[actions[causes[userId],parameters[name,value]],task[name],id,inQueueSince]"

n=`xmlstarlet fo -t $QUEUE_FILE | grep PreCommit-HIVE-Build | wc -l`

echo "PQ:$n"
#> /tmp/.ptest_peek
