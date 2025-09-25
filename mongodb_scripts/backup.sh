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

# Cleanup dump directory
if rm -rf "${DUMP_DIR}"; then
  echo "Removed dump directory $DUMP_DIR"
else
  echo "Failed to remove dump directory ${DUMP_DIR}" >&2
fi

echo "Backup created at $ARCHIVE_PATH"

# Upload to Dropbox using rclone
# Make sure rclone is configured with a remote named "Dropbox"
rclone copy $ARCHIVE_PATH Dropbox:$SERVER_PREFIX

