import { FormEvent } from 'react'

interface SaveAgentFormProps {
	agentName: string
	onNameChange: (v: string) => void
	onSave: () => void
}

export function SaveAgentForm({ agentName, onNameChange, onSave }: SaveAgentFormProps) {
	function submit(e: FormEvent) {
		e.preventDefault()
		onSave()
	}
	return (
		<form onSubmit={submit} style={{ display: 'flex', gap: '0.5rem' }}>
			<input
				type="text"
				placeholder="Enter agent name..."
				value={agentName}
				onChange={e => onNameChange(e.target.value)}
				style={{ flex: 1, padding: '0.5rem' }}
			/>
			<button type="submit" style={{ padding: '0.5rem 1rem' }}>Save Agent</button>
		</form>
	)
}

