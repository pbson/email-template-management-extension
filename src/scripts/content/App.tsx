import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from '@/styles/index.css?inline';
import iconSrc from '@/assets/icon-128.png';
import SearchModal from './SearchModal';

const App = () => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [editorParent, setEditorParent] = useState<HTMLElement | null>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('jwt');
        if (token) {
            chrome.runtime.sendMessage({ command: 'SET_JWT', token: token }, response => {
            });
        }

        const findEditorParent = () => {
            const editorParentDiv = document.querySelector('div[id^="editorParent_"]');
            if (editorParentDiv && editorParentDiv !== editorParent) {
                (editorParentDiv as HTMLElement).style.position = 'relative';
                setEditorParent(editorParentDiv as HTMLElement);
            }
        };

        findEditorParent();

        const observer = new MutationObserver(() => {
            findEditorParent();
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            observer.disconnect();
        };
    }, [editorParent]);

    const IconComponent = () => (
        <div className="isolation absolute top-7 right-2.5 z-50">
            <style >{styles.toString()}</style>
            <div
                id="select-case-icon"
                className="cursor-pointer w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md transition-all duration-300 ease-in-out hover:bg-gray-100"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowModal(true)}
            >
                <img
                    src={iconSrc}
                    alt="Select Case"
                    className={`w-5 h-5 transition-transform duration-300 ease-in-out ${showTooltip ? 'scale-110' : ''}`}
                />
                <div
                    className={`absolute bottom-full right-0 bg-gray-800 text-white px-3 py-2 rounded text-sm font-medium transition-all duration-300 ease-in-out mb-2 whitespace-nowrap ${
                        showTooltip ? 'opacity-100 visible' : 'opacity-0 invisible'
                    }`}
                >
                    Select a case
                    <div className="absolute -bottom-1 right-3 w-2 h-2 bg-gray-800 transform rotate-45"></div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {editorParent && createPortal(<IconComponent />, editorParent)}
            {showModal && createPortal(<SearchModal setShowModal={setShowModal} />, document.body)}
        </>
    );
};

export default App;
