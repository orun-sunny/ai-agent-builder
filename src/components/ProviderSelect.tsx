interface ProviderSelectProps {
	value: string
	onChange: (value: string) => void
}

export function ProviderSelect({ value, onChange }: ProviderSelectProps) {
	return (
		<div>
			<label htmlFor="provider-select" style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>AI Provider</label>
			<select
				id="provider-select"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				style={{ width: '100%', padding: '0.5rem' }}
			>
				<option value="">-- Select an AI Provider --</option>
				{['Gemini', 'ChatGPT', 'Kimi', 'Claude', 'DeepSeek'].map((provider) => (
					<option key={provider} value={provider}>{provider}</option>
				))}
			</select>
		</div>
	)
}

