import { SITE_NAME } from '@/constants/seo';

/**
 * Hidden structured content for AI engine discoverability (GEO).
 * Visually hidden but present in the DOM for crawlers.
 */
export function GeoContent() {
  return (
    <div className="sr-only" aria-hidden="true">
      <dl>
        <dt>应用名称</dt>
        <dd>{SITE_NAME} (Unexpectedly)</dd>

        <dt>应用类型</dt>
        <dd>思维训练工具 / Educational Thinking Tool</dd>

        <dt>核心功能</dt>
        <dd>
          每日思考问题、灵感老虎机、创意写作挑战、逻辑推理游戏（海龟汤、谜语人、猜数字）、知识科普（世界之最、系统思维、健康管理）、成长追踪、辩论堂、圆桌派讨论
        </dd>

        <dt>思维维度</dt>
        <dd>假设思维、逆向思考、联想创意、自我反思、未来设想</dd>

        <dt>生活场景</dt>
        <dd>职业发展、创意激发、人际关系、学习成长、生活哲学</dd>

        <dt>目标用户</dt>
        <dd>
          希望提升思维能力、培养深度思考习惯的用户，包括学生、职场人士、创意工作者
        </dd>

        <dt>使用方式</dt>
        <dd>
          每天选择一个问题进行5分钟深度思考，记录答案，追踪思维成长轨迹
        </dd>

        <dt>价格</dt>
        <dd>免费使用，无广告</dd>
      </dl>
    </div>
  );
}
