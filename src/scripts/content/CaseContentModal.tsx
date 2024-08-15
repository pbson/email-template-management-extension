import React, { useState, useEffect } from 'react'
import { X, Edit3 } from 'lucide-react'
import AdviceModal from './AdviceModal' // Adjust the import path as needed
import caseResponseApi from '../features/case-response/case-response.api' // Adjust the import path as needed
import toast from 'react-hot-toast'

const CaseContentModal = ({ caseData, onClose, onInsert }) => {
    const [content, setContent] = useState(caseData.content)
    const [variables, setVariables] = useState({})
    const [selectedAdvice, setSelectedAdvice] = useState({})
    const [showAdviceModal, setShowAdviceModal] = useState(false)
    const [currentAdviceSection, setCurrentAdviceSection] = useState('')

    useEffect(() => {
        const variableRegex = /{{Variable:([\w]+)(?:::([^}]+))?}}/g
        let match
        const newVariables = {}
        while ((match = variableRegex.exec(content)) !== null) {
            const [, name, defaultValue] = match
            newVariables[name] = defaultValue || ''
        }
        setVariables(newVariables)
    }, [content])

    const handleVariableChange = (name, value) => {
        setVariables({ ...variables, [name]: value })
    }

    const handleAdviceClick = sectionIndex => {
        setCurrentAdviceSection(sectionIndex)
        setShowAdviceModal(true)
    }

    const handleAdviceSelection = advice => {
        setSelectedAdvice({ ...selectedAdvice, [currentAdviceSection]: advice })
        setShowAdviceModal(false)
    }

    const generateFinalContent = () => {
        let finalContent = content

        finalContent = finalContent.replace(/<p><\/p>/g, '<br />')

        finalContent = finalContent.replace(
            /{{Variable:([\w]+)(?:::([^}]+))?}}/g,
            (match, name, defaultValue) => {
                return variables[name] || defaultValue || `[${name}]`
            }
        )

        finalContent = finalContent.replace(/{{AdviceSection}}/g, () => {
            const advice = selectedAdvice[currentAdviceSection]
            return advice || '[Advice]'
        })

        return finalContent
    }

    const handleInsert = async () => {
        const finalContent = generateFinalContent()

        try {
            const caseResponseData = {
                caseId: caseData.id,
                select_advices: selectedAdvice,
                content: finalContent
            }

            const response = await caseResponseApi.add(caseResponseData)

            if (response.data) {
                toast.success('Case response saved successfully')
                onInsert(finalContent)
            } else {
                throw new Error('Failed to save case response')
            }
        } catch (error) {
            console.error('Error saving case response:', error)
            toast.error('Failed to save case response. Please try again.')
        }
    }

    const renderHTML = html => {
        return { __html: html }
    }

    const renderContent = () => {
        const parts = content.split(/({{Variable:[\w]+(?:::[^}]+)?}}|{{AdviceSection}})/g)
        return parts.map((part, index) => {
            if (part.startsWith('{{Variable:')) {
                const match = part.match(/{{Variable:([\w]+)(?:::([^}]+))?}}/)
                const [, varName, defaultValue] = match
                if (defaultValue) {
                    return <span key={index}>{defaultValue}</span>
                } else {
                    return (
                        <span key={index} className="inline-flex items-center">
                            <input
                                type="text"
                                value={variables[varName] || ''}
                                onChange={e => handleVariableChange(varName, e.target.value)}
                                className="inline-block px-2 py-1 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                placeholder={varName}
                            />
                        </span>
                    )
                }
            } else if (part === '{{AdviceSection}}') {
                const advice = selectedAdvice[index]
                return (
                    <div
                        key={index}
                        className="my-4 p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm"
                    >
                        {advice ? (
                            <>
                                <div
                                    className="prose max-w-none mb-3"
                                    dangerouslySetInnerHTML={renderHTML(advice)}
                                />
                                <button
                                    onClick={() => handleAdviceClick(index)}
                                    className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors duration-150 ease-in-out"
                                >
                                    <Edit3 size={16} className="mr-1" />
                                    Change Advice
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => handleAdviceClick(index)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Select Advice
                            </button>
                        )}
                    </div>
                )
            } else {
                return (
                    <span
                        key={index}
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={renderHTML(part)}
                    />
                )
            }
        })
    }

    return (
        <div className="isolation fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Fill in the variables and select advice
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="prose max-w-none">{renderContent()}</div>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
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
            {showAdviceModal && (
                <AdviceModal
                    caseId={caseData.id}
                    onSelect={handleAdviceSelection}
                    onClose={() => setShowAdviceModal(false)}
                    selectedAdvice={selectedAdvice[currentAdviceSection]}
                />
            )}
        </div>
    )
}

export default CaseContentModal
