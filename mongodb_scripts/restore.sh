#!/bin/bash
set -e

# Dump of data should be unpacked in mongodb_data/dump
# Remember about changing permissions to those files if needed:
# sudo chown -R 1001:1001 mongodb_data/dump
# OR: sudo chmod -R 777 mongodb_data/dump

# Variables
DUMP_PATH="/bitnami/mongodb/dump"
MONGO_URI="mongodb://appuser:DariahHub2025user@ethnopedia-mongodb:27017/ethnopedia?replicaSet=rs0"

if [ -z "$DUMP_PATH" ]; then
  echo "Usage: ./restore.sh <path_to_dump_directory> is missing argument - provide path to dump directory"
  exit 1
fi

# Restore from dump
docker exec -it ethnopedia-mongodb mongorestore --uri "$MONGO_URI" "$DUMP_PATH"

echo "Restore completed from $DUMP_PATH (mongodb_data/dump on host machine)"

