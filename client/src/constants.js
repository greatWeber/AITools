export const CHAT_TAGS = {
  SEARCH: {
    id: "search",
    name: "搜索",
  },
  DRAW: {
    id: "draw",
    name: "绘画",
  },
  NEWS: {
    id: "news",
    name: "AI新闻",
  },
  MM: {
    id: "mm",
    name: "MM",
  },
};

export const TAG_PLACEHOLDERS = {
  [CHAT_TAGS.SEARCH.id]: "输入问题...",
  [CHAT_TAGS.DRAW.id]: "描述你想要的图片...",
  [CHAT_TAGS.NEWS.id]: "输入新闻关键词...",
};

const HOST = import.meta.env.VITE_HOST;

export const API_URL = HOST + "/v1/chat/completions";
export const API_KEY = import.meta.env.VITE_API_KEY;
export const IMAGE_API_URL = HOST + "/v1/images/generations";

export const NEWS_TIP =
  "帮我从https://ai-bot.cn/daily-ai-news/,等网站中汇总今天有哪些AI热门新闻和博客给我,至少要10条新闻博客,每天都要详细介绍主要内容";

export const DRAW_TIP = "绘画一个可爱性感迷人的美女";

export const BG_IMAGE_TIP = [
  "随机生成风景壁纸",
  "随机生成星空壁纸",
  "随机生成海洋壁纸",
  "随机生成城市壁纸",
  "随机生成动漫壁纸",
];
