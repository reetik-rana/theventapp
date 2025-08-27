#!/bin/bash

RES_DIR="/home/babayaga/Documents/theventapp/android/app/src/main/res"
ICON_PATTERNS=("ic_launcher*" "ic_launcher_foreground*" "ic_launcher_round*")

echo "Cleaning up launcher icons from mipmap directories..."

for dir in "$RES_DIR"/mipmap-*; do
  for pattern in "${ICON_PATTERNS[@]}"; do
    for file in "$dir"/$pattern; do
      if [ -f "$file" ]; then
        echo "Removing $file"
        rm "$file"
      fi
    done
  done
done

echo "Cleanup complete."
for icon in "${ICON_NAMES[@]}"; do
  if [ -f "$ASSETS_DIR/$icon" ]; then
    echo "Removing $ASSETS_DIR/$icon"
    rm "$ASSETS_DIR/$icon"
  fi
done

echo "Cleanup complete."
