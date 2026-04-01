import { type CSSProperties, memo } from 'react'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function SortableChip({ id, label, onRemove }: { id: string; label: string; onRemove: (id: string) => void }) {
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
	const style: CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
		padding: '6px 8px',
		border: '1px solid #bbb',
		borderRadius: 16,
		display: 'inline-flex',
		alignItems: 'center',
		gap: 8,
		background: '#fefefe',
		cursor: 'grab'
	}
	return (
		<div ref={setNodeRef} style={style} {...attributes} {...listeners}>
			<span>{label}</span>
			<button onClick={() => onRemove(id)} style={{ border: 'none', background: '#eee', borderRadius: 12, padding: '2px 6px', cursor: 'pointer' }}>x</button>
		</div>
	)
}

interface SelectedListProps {
	title: string
	items: { id: string; label: string }[]
	onRemove: (id: string) => void
}

export const SelectedList = memo(function SelectedList({ title, items, onRemove }: SelectedListProps) {
	return (
		<section>
			<h3 style={{ marginTop: 2 }}>{title}</h3>
			{items.length === 0 ? (
				<p style={{ color: '#888' }}>None selected.</p>
			) : (
				<SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
					<div style={{ display: 'flex', gap: 8 }}>
						{items.map(it => (
							<SortableChip key={it.id} id={it.id} label={it.label} onRemove={onRemove} />
						))}
					</div>
				</SortableContext>
			)}
		</section>
	)
})
