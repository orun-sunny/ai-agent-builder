import { PropsWithChildren } from 'react'
import { useDroppable } from '@dnd-kit/core'

interface DropZoneProps {
	id: string
	title?: string
	style?: React.CSSProperties
}

export function DropZone(props: PropsWithChildren<DropZoneProps>) {
	const { id, title, style, children } = props
	const { isOver, setNodeRef } = useDroppable({ id })
	return (
		<div
			ref={setNodeRef}
			style={{
				padding: '0.5rem',
				border: '1px dashed ' + (isOver ? '#00796b' : '#bbb'),
				borderRadius: 6,
				background: isOver ? '#e0f2f1' : 'transparent',
				...style
			}}
		>
			{title && <h3 style={{ marginTop: 0 }}>{title}</h3>}
			{children}
		</div>
	)
}

