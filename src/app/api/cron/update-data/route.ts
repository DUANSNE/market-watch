import { NextResponse } from "next/server";

/**
 * Vercel 每日数据更新入口
 *
 * 在 Vercel Dashboard → Deploy → Cron Jobs 中配置：
 *   URL:  /api/cron/update-data
 *   频率: 每天一次（如每天 9:00）
 *
 * 可选：设置环境变量 CRON_SECRET，
 * 并通过请求头 Authorization: Bearer <secret> 验证。
 */
export const maxDuration = 120;

export async function GET() {
  try {
    const origin = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    const response = await fetch(`${origin}/api/snapshot`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: `快照 API 返回 ${response.status}` },
        { status: 500 },
      );
    }

    const data = await response.json();
    const financeCount = data?.finance?.length ?? 0;
    const contentCount = data?.content?.length ?? 0;
    const insightCount = data?.insights?.length ?? 0;

    return NextResponse.json({
      success: true,
      message: "每日数据更新完成",
      detail: {
        finance: financeCount,
        content: contentCount,
        insights: insightCount,
        generatedAt: data.generatedAt,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "未知错误";
    console.error("Cron 更新失败:", msg);
    return NextResponse.json(
      { success: false, message: msg },
      { status: 500 },
    );
  }
}
