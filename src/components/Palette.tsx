import { memo, useMemo } from 'react'
import type { AgentData, Skill, Layer, AgentProfile } from '../hooks/useAgentData'
import { useDroppable, useDraggable } from '@dnd-kit/core'

interface PaletteProps {
	data: AgentData
}

function DraggableItem({ id, label, type }: { id: string; label: string; type: 'skill' | 'layer' | 'profile' }) {
	const { attributes, listeners, setNodeRef } = useDraggable({
		id: `${type}:${id}`,
		data: { id, type }
	})
	return (
		<li ref={setNodeRef} {...listeners} {...attributes} style={{ padding: '6px 8px', border: '1px solid #ddd', borderRadius: 6, background: 'white', cursor: 'grab' }}>
			{label}
		</li>
	)
}

export const Palette = memo(function Palette({ data }: PaletteProps) {
	const profiles = useMemo<AgentProfile[]>(() => data.agentProfiles, [data])
	const skills = useMemo<Skill[]>(() => data.skills, [data])
	const layers = useMemo<Layer[]>(() => data.layers, [data])

	// A passive droppable to show palette area
	const { setNodeRef } = useDroppable({ id: 'palette' })

	return (
		<div ref={setNodeRef} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
			<section>
				<h3 style={{ margin: '0 0 8px 0' }}>Profiles</h3>
				<ul style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, listStyle: 'none', padding: 0, margin: 0 }}>
					{profiles.map(p => (
						<DraggableItem key={p.id} id={p.id} type="profile" label={p.name} />
					))}
				</ul>
			</section>
			<section>
				<h3 style={{ margin: '0 0 8px 0' }}>Skills</h3>
				<ul style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, listStyle: 'none', padding: 0, margin: 0 }}>
					{skills.map(s => (
						<DraggableItem key={s.id} id={s.id} type="skill" label={`${s.name} (${s.category})`} />
					))}
				</ul>
			</section>
			<section>
				<h3 style={{ margin: '0 0 8px 0' }}>Layers</h3>
				<ul style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, listStyle: 'none', padding: 0, margin: 0 }}>
					{layers.map(l => (
						<DraggableItem key={l.id} id={l.id} type="layer" label={`${l.name} (${l.type})`} />
					))}
				</ul>
			</section>
		</div>
	)
})
