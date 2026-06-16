import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/app/today",
    name: "MiniPM",
    short_name: "MiniPM",
    description: "美术 PM 每日学习助手",
    start_url: "/app/today",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    background_color: "#e9fbff",
    theme_color: "#18bd62",
    lang: "zh-CN",
    dir: "ltr",
    orientation: "portrait",
    categories: ["education", "productivity"],
    prefer_related_applications: false,
    shortcuts: [
      {
        name: "今日学习",
        short_name: "今日",
        description: "打开 MiniPM 今日学习路线",
        url: "/app/today",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }]
      },
      {
        name: "PMP 挑战",
        short_name: "挑战",
        description: "直接开始今日 PMP 练习",
        url: "/app/quiz",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }]
      },
      {
        name: "错题复习",
        short_name: "复习",
        description: "打开 MiniPM 错题复习",
        url: "/app/review",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }]
      }
    ],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml"
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png"
      },
      {
        src: "/maskable-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/maskable-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
}
