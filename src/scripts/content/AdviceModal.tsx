import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import adviceApi from '../features/advice/advice.api'

const AdviceModal = ({ caseId, onSelect, onClose, selectedAdvice }) => {
    const [adviceOptions, setAdviceOptions] = useState([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(selectedAdvice || [])
    const [adviceVariables, setAdviceVariables] = useState({})

    useEffect(() => {
        const fetchAdvice = async () => {
            try {
                const response = await adviceApi.getList(caseId)
                setAdviceOptions(response.data.advices)
                
                // Initialize variables for each advice
                const initialVariables = {}
                response.data.advices.forEach(advice => {
                    initialVariables[advice.id] = extractVariables(advice.content)
                })
                setAdviceVariables(initialVariables)
                
                setLoading(false)
            } catch (error) {
                console.error('Failed to fetch advice:', error)
                setLoading(false)
            }
        }
        fetchAdvice()
    }, [caseId])

    const extractVariables = (content) => {
        const variableRegex = /{{Variable:([\w]+)}}/g
        const variables = {}
        let match
        while ((match = variableRegex.exec(content)) !== null) {
            variables[match[1]] = ''
        }
        return variables
    }

    const handleSelect = advice => {
        setSelected(prev =>
            prev.includes(advice.id) ? prev.filter(id => id !== advice.id) : [...prev, advice.id]
        )
    }

    const handleVariableChange = (adviceId, varName, value) => {
        setAdviceVariables(prev => ({
            ...prev,
            [adviceId]: {
                ...prev[adviceId],
                [varName]: value
            }
        }))
    }

    const handleInsert = () => {
        const selectedAdviceContent = adviceOptions
            .filter(advice => selected.includes(advice.id))
            .map(advice => {
                let content = advice.content
                Object.entries(adviceVariables[advice.id]).forEach(([varName, value]) => {
                    const regex = new RegExp(`{{Variable:${varName}}}`, 'g')
                    content = content.replace(regex, value || `[${varName}]`)
                })
                return content
            })
            .join('\n\n')
        onSelect(selectedAdviceContent)
    }

    const renderAdviceContent = (advice) => {
        const parts = advice.content.split(/(\{\{Variable:[\w]+\}\})/g)
        return parts.map((part, index) => {
            if (part.startsWith('{{Variable:')) {
                const varName = part.match(/{{Variable:([\w]+)}}/)[1]
                return (
                    <span key={index} className="inline-flex items-center">
                        <input
                            type="text"
                            value={adviceVariables[advice.id][varName] || ''}
                            onChange={(e) => handleVariableChange(advice.id, varName, e.target.value)}
                            className="inline-block px-2 py-1 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder={varName}
                        />
                    </span>
                )
            } else {
                return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />
            }
        })
    }

    return (
        <div className="isolation fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800">Select advice</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="text-center">Loading advice options...</div>
                    ) : (
                        <ul className="space-y-6">
                            {adviceOptions.map(advice => (
                                <li key={advice.id} className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 mt-1">
                                        <input
                                            type="checkbox"
                                            id={`advice-${advice.id}`}
                                            checked={selected.includes(advice.id)}
                                            onChange={() => handleSelect(advice)}
                                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                    </div>
                                    <label htmlFor={`advice-${advice.id}`} className="flex-grow">
                                        <div className="font-semibold text-lg text-gray-800 mb-2">
                                            {advice.title}
                                        </div>
                                        <div className="prose max-w-none text-gray-600">
                                            {renderAdviceContent(advice)}
                                        </div>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleInsert}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        Insert
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AdviceModal