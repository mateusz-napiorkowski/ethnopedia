#!/bin/bash
set -e

# Variables
SERVER_PREFIX="music_put_lab_dariah_pl"
#SERVER_PREFIX="ckc_uw_edu_pl"
#SERVER_PREFIX="metadata_music_put_lab_dariah_pl"
DUMP_DIR="mongodb_data/dump"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
ARCHIVE_NAME="$SERVER_PREFIX-ethnopedia-backup-$TIMESTAMP.tar.gz"
ARCHIVE_PATH="backups/$ARCHIVE_NAME"
MONGO_URI="mongodb://ethnopedia-mongodb:27017d"

# Create dump
#mongodump --uri "$MONGO_URI" --out "$DUMP_DIR"
docker exec -it ethnopedia-mongodb mongodump --uri="mongodb://root:DariahHub2025root@localhost:27017/?replicaSet=rs0" --out /bitnami/mongodb/dump

# Compress dump
mkdir -p backups
tar -czvf "$ARCHIVE_PATH" -C "$DUMP_DIR" .

# Clean up dump directory
rm -rf "$DUMP_DIR"

echo "Backup created at $ARCHIVE_PATH"

rclone copy $ARCHIVE_PATH remote:$SERVER_PREFIX

