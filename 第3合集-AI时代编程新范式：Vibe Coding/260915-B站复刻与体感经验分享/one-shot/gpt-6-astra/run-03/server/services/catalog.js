import { readFileSync } from 'node:fs';
const read = name => JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url), 'utf8'));
export const videos = read('videos');
export const banners = read('banners');
export const categories = ['全部','番剧','国创','综艺','动画','鬼畜','舞蹈','娱乐','科技','美食','汽车','运动','电影','电视剧','纪录片','游戏','音乐','影视','知识','资讯','生活','动物圈','数码','旅行'];
export function getVideos({q='',category='全部',page=1,limit=18,sort='recommend'}={}) {
 let list = videos.filter(v => (category === '全部' || v.category === category) && `${v.title} ${v.author} ${v.category}`.toLowerCase().includes(q.trim().toLowerCase()));
 if(sort === 'popular') list.sort((a,b)=>parseFloat(b.views)-parseFloat(a.views));
 if(sort === 'latest') list.reverse();
 return { items:list.slice((page-1)*limit,page*limit), total:list.length, page, hasMore:page*limit<list.length };
}
export function suggestions(q='') {
 if(!q.trim()) return ['我的世界','日食记','生活','科技','音乐','猫'];
 return [...new Set(videos.flatMap(v=>[v.title,v.author,v.category]))].filter(x=>x.toLowerCase().includes(q.toLowerCase())).slice(0,7);
}
