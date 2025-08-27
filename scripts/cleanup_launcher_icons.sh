#!/bin/bash

ICON_NAMES=("ic_launcher.png" "ic_launcher_foreground.webp" "ic_launcher_round.webp")
RES_DIR="/home/babayaga/Documents/theventapp/android/app/src/main/res"
ASSETS_DIR="/home/babayaga/Documents/theventapp/assets"

echo "Cleaning up launcher icons..."

# Remove icons from all mipmap-* directories
for dir in "$RES_DIR"/mipmap-*; do
  for icon in "${ICON_NAMES[@]}"; do
    if [ -f "$dir/$icon" ]; then
      echo "Removing $dir/$icon"
      rm "$dir/$icon"
    fi
  done
done

# Remove icons from assets directory
for icon in "${ICON_NAMES[@]}"; do
  if [ -f "$ASSETS_DIR/$icon" ]; then
    echo "Removing $ASSETS_DIR/$icon"
    rm "$ASSETS_DIR/$icon"
  fi
done

echo "Cleanup complete."
