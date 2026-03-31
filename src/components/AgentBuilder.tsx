import { useMemo, useState } from 'react'
import { useAgentData } from '../hooks/useAgentData'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { SavedAgent } from '../types'
import { Palette } from './Palette'
import { SelectedList } from './SelectedList'
import { ProviderSelect } from './ProviderSelect'
import { SaveAgentForm } from './SaveAgentForm'

export function AgentBuilder() {
  const { data, loading, error, reload } = useAgentData()
  const [savedAgents, setSavedAgents] = useLocalStorage<SavedAgent[]>('savedAgents', [])

  const [selectedProfile, setSelectedProfile] = useState<string>('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedLayers, setSelectedLayers] = useState<string[]>([])
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [agentName, setAgentName] = useState<string>('')

  const canSave = useMemo(() => agentName.trim().length > 0, [agentName])

  const addSkill = (id: string) => {
    if (!selectedSkills.includes(id)) {
      setSelectedSkills(prev => [...prev, id])
    }
  }
  const addLayer = (id: string) => {
    if (!selectedLayers.includes(id)) {
      setSelectedLayers(prev => [...prev, id])
    }
  }
  const removeSkill = (id: string) => {
    setSelectedSkills(prev => prev.filter(s => s !== id))
  }
  const removeLayer = (id: string) => {
    setSelectedLayers(prev => prev.filter(l => l !== id))
  }

  const saveAgent = () => {
    if (!canSave) {
      alert('Please enter a name for your agent.')
      return
    }
    const newAgent: SavedAgent = {
      name: agentName.trim(),
      profileId: selectedProfile,
      skillIds: selectedSkills,
      layerIds: selectedLayers,
      provider: selectedProvider
    }
    const updated = [...savedAgents, newAgent]
    setSavedAgents(updated)
    setAgentName('')
    alert(`Agent "${newAgent.name}" saved successfully!`)
  }

  const loadAgent = (agent: SavedAgent) => {
    setSelectedProfile(agent.profileId || '')
    setSelectedSkills(agent.skillIds || [])
    setSelectedLayers([...(agent.layerIds || [])])
    setAgentName(agent.name)
    setSelectedProvider(agent.provider || '')
  }
  const clearAllSaved = () => {
    if (confirm('Are you sure you want to clear all saved agents?')) {
      setSavedAgents([])
      localStorage.removeItem('savedAgents')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '1rem', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '1rem' }}>
        <h1 style={{ margin: 0 }}>AI Agent Builder</h1>
        <p style={{ marginTop: '0.25rem', color: '#555' }}>Design your custom AI personality and capability set.</p>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button onClick={reload} disabled={loading}>
            {loading ? 'Loading Configuration...' : 'Reload Configuration'}
          </button>
          {error && <span style={{ color: '#c62828' }}>Error: {error}</span>}
        </div>
      </header>

      <main style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1.5rem', flex: 1 }}>
        <section style={{ borderRight: '1px solid #eee', paddingRight: '1rem' }}>
          {data ? (
            <Palette
              profiles={data.agentProfiles}
              skills={data.skills}
              layers={data.layers}
              onAddSkill={addSkill}
              onAddLayer={addLayer}
              onSelectProfile={setSelectedProfile}
              selectedProfileId={selectedProfile}
            />
          ) : (
            <p style={{ color: '#888' }}>{loading ? 'Loading...' : 'No data loaded.'}</p>
          )}
        </section>

        <section>
          <div style={{ background: '#f7f9fb', padding: '1rem', border: '1px solid #e3e8ef', borderRadius: 8 }}>
            <h2 style={{ marginTop: 0 }}>Current Agent Configuration</h2>
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ marginTop: 0 }}>Profile</h3>
              {selectedProfile && data ? (
                <p>
                  <strong>{data.agentProfiles.find(p => p.id === selectedProfile)?.name}</strong>{' '}
                  {data.agentProfiles.find(p => p.id === selectedProfile)?.description ? (
                    <span style={{ color: '#666' }}>
                      – {data.agentProfiles.find(p => p.id === selectedProfile)?.description}
                    </span>
                  ) : null}
                </p>
              ) : (
                <p style={{ color: '#888' }}>No profile selected.</p>
              )}
            </div>

            {data && (
              <SelectedList
                selectedSkillIds={selectedSkills}
                selectedLayerIds={selectedLayers}
                allSkills={data.skills}
                allLayers={data.layers}
                onReorderSkills={setSelectedSkills}
                onReorderLayers={setSelectedLayers}
                onRemoveSkill={removeSkill}
                onRemoveLayer={removeLayer}
              />
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginTop: '1rem' }}>
              <ProviderSelect provider={selectedProvider} onChange={setSelectedProvider} />
              <SaveAgentForm name={agentName} onNameChange={setAgentName} onSave={saveAgent} disabled={!canSave} />
            </div>
          </div>
        </section>
      </main>

      {savedAgents.length > 0 && (
        <section style={{ padding: '1rem 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h2 style={{ margin: 0 }}>Saved Agents</h2>
            <button onClick={clearAllSaved} style={{ padding: '0.5rem 1rem', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Clear All
            </button>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {savedAgents.map((agent, index) => (
              <div key={`${agent.name}-${index}`} style={{ padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid #e3e8ef', minWidth: '240px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <h3 style={{ marginTop: 0 }}>{agent.name}</h3>
                <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                  <strong>Profile:</strong> {data?.agentProfiles.find(p => p.id === agent.profileId)?.name || 'None'}
                </p>
                <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                  <strong>Skills:</strong> {agent.skillIds?.length || 0}
                </p>
                <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                  <strong>Layers:</strong> {agent.layerIds?.length || 0}
                </p>
                <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                  <strong>Provider:</strong> {agent.provider || 'None'}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button onClick={() => loadAgent(agent)} style={{ flex: 1, padding: '0.5rem', background: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Load
                  </button>
                  <button
                    onClick={() => {
                      const updated = savedAgents.filter((_, i) => i !== index)
                      setSavedAgents(updated)
                    }}
                    style={{ padding: '0.5rem', background: '#b71c1c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

