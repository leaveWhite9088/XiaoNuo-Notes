import type { ChapterDef } from "./types";
import Timeline from "../chapters/01-timeline/Timeline";
import { narrations as timelineNarrations } from "../chapters/01-timeline/narrations";
import Benchmark from "../chapters/02-benchmark/Benchmark";
import { narrations as benchmarkNarrations } from "../chapters/02-benchmark/narrations";
import Pricing from "../chapters/03-pricing/Pricing";
import { narrations as pricingNarrations } from "../chapters/03-pricing/narrations";
import Recommend from "../chapters/04-recommend/Recommend";
import { narrations as recommendNarrations } from "../chapters/04-recommend/narrations";

export const CHAPTERS: ChapterDef[] = [
  {
    id: "timeline",
    title: "模型发布时间线",
    narrations: timelineNarrations,
    Component: Timeline,
  },
  {
    id: "benchmark",
    title: "能力 Benchmark 与社区评价",
    narrations: benchmarkNarrations,
    Component: Benchmark,
  },
  {
    id: "pricing",
    title: "定价策略",
    narrations: pricingNarrations,
    Component: Pricing,
  },
  {
    id: "recommend",
    title: "使用推荐",
    narrations: recommendNarrations,
    Component: Recommend,
  },
];
