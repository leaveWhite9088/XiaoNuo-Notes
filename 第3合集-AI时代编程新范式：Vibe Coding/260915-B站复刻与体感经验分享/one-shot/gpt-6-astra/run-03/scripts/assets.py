import json, urllib.request, concurrent.futures, pathlib
root=pathlib.Path(__file__).resolve().parent.parent
ref=json.loads((root/'reference-data.json').read_text())
jobs=[('banner.png','https://i0.hdslb.com/bfs/archive/27cc73b1eb44368966ceca7583d41ec04c43375e.png'),('logo.png','https://i0.hdslb.com/bfs/archive/87a5d03581e326f4f818cab3212ce471d1f6a064.png')]
videos=[]
categories=['鬼畜','游戏','美食','科技','生活','动物圈','知识','游戏','数码','科技']
for i,c in enumerate(ref['cards']):
 name=f'cover-{i}.jpg';jobs.append((name,c['img'].split('@')[0]));lines=c['text'].split('\n');isad=lines[0]=='广告'
 videos.append({'id':f'BV1demo{i+1:03d}','title':c['title'],'cover':f'/media/{name}','category':categories[i],'views':lines[0] if not isad else '28.6万','danmaku':lines[1] if not isad else '1268','duration':lines[2] if not isad else '05:24','author':lines[-2] if not isad else lines[-1],'date':'2026-09-07','featured':i in [0,2,5],'description':'发现有趣的生活，记录每一份热爱。喜欢这期视频的话，记得点赞、投币、收藏，关注 UP 主，下次更新见！','source':'/media/sample.mp4'})
for i,c in enumerate(ref['carousels'][:5]): jobs.append((f'carousel-{i}.jpg',c['url'].split('@')[0]))
extra=[('山野、清风、日落。把生活调成喜欢的频道','生活','生活里的小美好','https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=85'),('真的会被治愈！一起去看这个世界的另一面','旅行','在路上的阿白','https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=85'),('一个人的周末厨房｜幸福就是好好吃饭','美食','小林的料理时间','https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=85'),('猫猫：今天也有在认真地发呆！','动物圈','猫猫观察日记','https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=85'),('在城市醒来之前，记录凌晨五点的东京','旅行','一只摄影师','https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=800&q=85'),('打开音乐，就拥有了自己的小小宇宙','音乐','耳机里的星球','https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=85'),('这就是我梦想中的桌面！极简工作室改造','数码','设计师小陈','https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=85'),('抬头看！你有多久没看过这样一片星空了','知识','宇宙观察员','https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=85')]
for i,(title,cat,author,url) in enumerate(extra):
 name=f'extra-{i}.jpg';jobs.append((name,url));videos.append({'id':f'BV1life{i+1:03d}','title':title,'cover':f'/media/{name}','category':cat,'views':f'{12+i*7}.8万','danmaku':str(123+i*87),'duration':f'{4+i:02}:28','author':author,'date':'2026-09-08','featured':False,'description':'在平凡的日子里寻找不平凡的风景，和你一起分享生活中的美好。','source':'/media/sample.mp4'})
(root/'server/data/videos.json').write_text(json.dumps(videos,ensure_ascii=False,indent=2))
(root/'server/data/banners.json').write_text(json.dumps([{'image':f'/media/carousel-{i}.jpg','title':c['alt'],'videoId':videos[[1,7,10,1,7][i]]['id']} for i,c in enumerate(ref['carousels'][:5])],ensure_ascii=False,indent=2))
def get(job):
 name,url=job
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0','Referer':'https://www.bilibili.com/'})
  with urllib.request.urlopen(req,timeout=40) as r: data=r.read()
  (root/'public/media'/name).write_bytes(data);return name,len(data)
 except Exception as e:return name,str(e)
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
 for result in pool.map(get,jobs):print(result)
