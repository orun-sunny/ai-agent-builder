import { useMemo, useState, useEffect, useCallback } from 'react'
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useAgentData } from './hooks/useAgentData'
import { useLocalStorage } from './hooks/useLocalStorage'
import { ConfigBox } from './components/ConfigBox'
import { SelectedList } from './components/SelectedList'
import { ProviderSelect } from './components/ProviderSelect'
import { SaveAgentForm } from './components/SaveAgentForm'
import type { SavedAgent } from './types'
import { DropZone } from './components/DropZone'

function App() {
  const { data, loading, error, reload } = useAgentData()

  const [selectedProfile, setSelectedProfile] = useState<string>('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedLayers, setSelectedLayers] = useState<string[]>([])
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [agentName, setAgentName] = useState('')
  const [savedAgents, setSavedAgents] = useLocalStorage<SavedAgent[]>('savedAgents', [])

  const [sessionTime, setSessionTime] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setSessionTime((s) => s + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  // DnD sensors
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  // Derived lookup maps to avoid repeated .find in render
  const profilesById = useMemo(() => {
    const map = new Map<string, string>()
    if (data) data.agentProfiles.forEach(p => map.set(p.id, p.name))
    return map
  }, [data])
  const skillsById = useMemo(() => {
    const map = new Map<string, string>()
    if (data) data.skills.forEach(s => map.set(s.id, `${s.name}`))
    return map
  }, [data])
  const layersById = useMemo(() => {
    const map = new Map<string, string>()
    if (data) data.layers.forEach(l => map.set(l.id, `${l.name}`))
    return map
  }, [data])

  const handleSaveAgent = useCallback(() => {
    if (!agentName.trim()) {
      alert('Please enter a name for your agent.')
      return
    }
    const newAgent: SavedAgent = {
      name: agentName,
      profileId: selectedProfile,
      skillIds: selectedSkills,
      layerIds: selectedLayers,
      provider: selectedProvider
    }
    const updated = [...savedAgents, newAgent]
    setSavedAgents(updated)
    setAgentName('')
    alert(`Agent "${newAgent.name}" saved successfully!`)
  }, [agentName, selectedLayers, selectedProfile, selectedProvider, selectedSkills, savedAgents, setSavedAgents])

  const handleLoadAgent = (agent: SavedAgent) => {
    setSelectedProfile(agent.profileId || '')
    setSelectedSkills(agent.skillIds || [])
    setSelectedLayers([...(agent.layerIds || [])])
    setAgentName(agent.name)
    setSelectedProvider(agent.provider || '')
  }

  const handleDeleteAgent = (indexToRemove: number) => {
    const updated = savedAgents.filter((_, idx) => idx !== indexToRemove)
    setSavedAgents(updated)
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return
    // From config box to selections
    const [type, id] = String(active.id).includes(':') ? String(active.id).split(':') : [undefined as any, String(active.id)]
    if (over.id === 'drop:skills' && type === 'skill') {
      setSelectedSkills((prev) => (prev.includes(id) ? prev : [...prev, id]))
      return
    }
    if (over.id === 'drop:layers' && type === 'layer') {
      setSelectedLayers((prev) => (prev.includes(id) ? prev : [...prev, id]))
      return
    }
    if (over.id === 'drop:profile' && type === 'profile') {
      setSelectedProfile(id)
      return
    }

    // Reorder within lists (sortable)
    const overId = String(over.id)
    if (type === 'skill' && selectedSkills.includes(id) && selectedSkills.includes(overId)) {
      setSelectedSkills((prev) => {
        const from = prev.indexOf(id)
        const to = prev.indexOf(overId)
        if (from === -1 || to === -1) return prev
        return arrayMove(prev, from, to)
      })
    }
    if (type === 'layer' && selectedLayers.includes(id) && selectedLayers.includes(overId)) {
      setSelectedLayers((prev) => {
        const from = prev.indexOf(id)
        const to = prev.indexOf(overId)
        if (from === -1 || to === -1) return prev
        return arrayMove(prev, from, to)
      })
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '1rem', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1>AI Agent Builder</h1>
        <p>Design your custom AI personality and capability set.</p>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={reload} disabled={loading}>
            {loading ? 'Fetching Configuration...' : 'Reload Configuration Data'}
          </button>
          <span style={{ fontSize: '0.9rem', color: '#666' }}>
            Session Active: {sessionTime}s
          </span>
        </div>
        {error && <div style={{ color: 'red', marginTop: '0.75rem' }}>Error: {error}</div>}
      </header>

      <main style={{ display: 'flex', flexDirection: 'column', gap: '2rem', flex: 1 }}>
        {!data && !loading && !error && <p>No data loaded.</p>}
        {data && (
          <DndContext sensors={sensors} onDragEnd={onDragEnd}>
            <div style={{ display: 'flex', gap: '2rem', flexDirection: 'row' }}>
              <section style={{ flex: '1 1 50%', borderRight: '1px solid #ccc', paddingRight: '1rem' }}>
                <h2>Configuration Options</h2>
                <ConfigBox data={data} />
              </section>

              <section style={{ flex: '1 1 50%', paddingLeft: '1rem' }}>
                <h2>Current Agent Configuration</h2>

                <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px', minHeight: '300px' }}>
                  <DropZone id="drop:profile" title="Profile (drop one here)" style={{ marginBottom: '1rem' }}>
                    {selectedProfile ? (
                      <p><strong>{profilesById.get(selectedProfile)}</strong></p>
                    ) : (
                      <p style={{ color: '#888' }}>No profile selected.</p>
                    )}
                  </DropZone>

                  <DropZone id="drop:skills" title="Skills (drag here; sortable)" style={{ marginBottom: '1rem' }}>
                    <SelectedList
                      title=""
                      items={selectedSkills.map(id => ({ id: id, label: skillsById.get(id) || id }))}
                      onRemove={(id) => setSelectedSkills((prev) => prev.filter(sid => sid !== id))}
                    />
                  </DropZone>

                  <DropZone id="drop:layers" title="Layers (drag here; sortable)" style={{ marginBottom: '1rem' }}>
                    <SelectedList
                      title=""
                      items={selectedLayers.map(id => ({ id: id, label: layersById.get(id) || id }))}
                      onRemove={(id) => setSelectedLayers((prev) => prev.filter(lid => lid !== id))}
                    />
                  </DropZone>

                  <ProviderSelect value={selectedProvider} onChange={setSelectedProvider} />

                  <div style={{ marginTop: '2rem', borderTop: '1px solid #ddd', paddingTop: '1rem' }}>
                    <h3 style={{ marginTop: 0 }}>Save This Agent</h3>
                    <SaveAgentForm agentName={agentName} onNameChange={setAgentName} onSave={handleSaveAgent} />
                  </div>
                </div>
              </section>
            </div>

            {savedAgents.length > 0 && (
              <section style={{ padding: '1.5rem', background: '#e0f7fa', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h2 style={{ margin: 0 }}>Saved Agents</h2>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to clear all saved agents?')) {
                        setSavedAgents([])
                      }
                    }}
                    style={{ padding: '0.5rem 1rem', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Clear All
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  {savedAgents.map((agent, index) => (
                    <div key={index} style={{ padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid #b2ebf2', minWidth: '220px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                      <h3 style={{ marginTop: 0, color: '#006064' }}>{agent.name}</h3>
                      <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
                        <strong>Profile:</strong> {profilesById.get(agent.profileId) || 'None Selected'}
                      </p>
                      <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
                        <strong>Skills:</strong> {agent.skillIds?.length || 0} included
                      </p>
                      <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
                        <strong>Layers:</strong> {agent.layerIds?.length || 0} included
                      </p>
                      <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
                        <strong>Provider:</strong> {agent.provider || 'None'}
                      </p>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <button
                          onClick={() => handleLoadAgent(agent)}
                          style={{ flex: 1, padding: '0.5rem', background: '#00838f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Load
                        </button>
                        <button
                          onClick={() => handleDeleteAgent(index)}
                          style={{ padding: '0.5rem', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </DndContext>
        )}
      </main>
    </div>
  )
}

export default App
