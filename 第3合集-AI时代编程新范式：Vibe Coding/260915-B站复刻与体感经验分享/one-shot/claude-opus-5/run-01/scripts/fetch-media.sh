#!/usr/bin/env bash
# 下载演示用的真实图片与真实视频素材到 server/public/media 下。
# 图片来源: picsum.photos(真实摄影图, 固定 seed 保证可复现)
# 视频来源: test-videos.co.uk(Big Buck Bunny / Jellyfish / Sintel 等公开示例片源)
set -u

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MEDIA="$ROOT/server/public/media"
mkdir -p "$MEDIA/covers" "$MEDIA/avatars" "$MEDIA/banners" "$MEDIA/videos"

fetch() { # url out
  if [ -s "$2" ]; then return 0; fi
  curl -sSL --max-time 60 --retry 2 -o "$2" "$1" || echo "FAIL $1"
}

echo "==> covers (120)"
for i in $(seq 1 120); do
  fetch "https://picsum.photos/seed/bili-cover-$i/672/378" "$MEDIA/covers/cover-$i.jpg" &
  if [ $((i % 12)) -eq 0 ]; then wait; fi
done
wait

echo "==> avatars (48)"
for i in $(seq 1 48); do
  fetch "https://picsum.photos/seed/bili-face-$i/160/160" "$MEDIA/avatars/avatar-$i.jpg" &
  if [ $((i % 12)) -eq 0 ]; then wait; fi
done
wait

echo "==> banners (5)"
for i in $(seq 1 5); do
  fetch "https://picsum.photos/seed/bili-banner-$i/1200/675" "$MEDIA/banners/banner-$i.jpg" &
done
wait

echo "==> videos (6)"
BASE="https://test-videos.co.uk/vids"
fetch "$BASE/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_5MB.mp4" "$MEDIA/videos/clip-1.mp4" &
fetch "$BASE/jellyfish/mp4/h264/720/Jellyfish_720_10s_5MB.mp4"          "$MEDIA/videos/clip-2.mp4" &
fetch "$BASE/sintel/mp4/h264/720/Sintel_720_10s_5MB.mp4"                "$MEDIA/videos/clip-3.mp4" &
fetch "$BASE/sintel/mp4/h264/360/Sintel_360_10s_2MB.mp4"                "$MEDIA/videos/clip-4.mp4" &
fetch "$BASE/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_2MB.mp4"  "$MEDIA/videos/clip-5.mp4" &
fetch "$BASE/jellyfish/mp4/h264/360/Jellyfish_360_10s_2MB.mp4"          "$MEDIA/videos/clip-6.mp4" &
wait

echo "==> done"
du -sh "$MEDIA"/* 2>/dev/null
ls "$MEDIA/covers" | wc -l
ls "$MEDIA/videos"
