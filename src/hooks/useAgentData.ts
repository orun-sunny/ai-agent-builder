import { useEffect, useState, useCallback } from 'react'

export interface AgentProfile {
	id: string
	name: string
	description: string
}

export interface Skill {
	id: string
	name: string
	category: string
	description: string
}

export interface Layer {
	id: string
	name: string
	type: string
	description: string
}

export interface AgentData {
	agentProfiles: AgentProfile[]
	skills: Skill[]
	layers: Layer[]
}

export function useAgentData() {
	const [data, setData] = useState<AgentData | null>(null)
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | null>(null)

	const fetchOnce = useCallback(async () => {
		setLoading(true)
		setError(null)
		try {
			// Simulate small delay to preserve loading UX but keep deterministic
			await new Promise((r) => setTimeout(r, 400))
			const response = await fetch('/data.json', { cache: 'no-cache' })
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}
			const json = (await response.json()) as AgentData
			setData(json)
		} catch (e: any) {
			setError(e?.message ?? 'Failed to load data')
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		// fetch once on mount
		fetchOnce()
	}, [fetchOnce])

	return { data, loading, error, reload: fetchOnce }
}
