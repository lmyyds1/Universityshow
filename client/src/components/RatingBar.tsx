const CATEGORY_COLORS: Record<string, string> = {
  '宿舍条件': 'bg-orange-500',
  '食堂质量': 'bg-red-500',
  '师资水平': 'bg-blue-600',
  '校园环境': 'bg-green-500',
  '人文氛围': 'bg-purple-500',
  '就业支持': 'bg-indigo-500',
  '安全指数': 'bg-teal-500',
}

export default function RatingBar({ category, score }: { category: string; score: number }) {
  const pct = (score / 10) * 100
  const color = CATEGORY_COLORS[category] || 'bg-blue-500'

  return (
    <div className="flex items-center gap-3 mb-2.5">
      <span className="w-20 text-sm text-gray-600 shrink-0">{category}</span>
      <div className="flex-1 h-5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-10 text-right text-sm font-medium text-gray-800">{score}</span>
    </div>
  )
}
