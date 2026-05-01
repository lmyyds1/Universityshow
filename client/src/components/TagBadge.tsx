import type { FeatureTag } from '../types'

export default function TagBadge({ tag }: { tag: FeatureTag }) {
  const isYes = tag.status === 1
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border bg-white shadow-sm group relative cursor-default" title={tag.description}>
      <span className={`text-lg font-bold ${isYes ? 'text-green-600' : 'text-red-500'}`}>
        {isYes ? '✓' : '✗'}
      </span>
      <span className="text-sm text-gray-700">{tag.tag_name}</span>
      {tag.description && (
        <span className="hidden group-hover:block absolute -top-9 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
          {tag.description}
        </span>
      )}
    </div>
  )
}
