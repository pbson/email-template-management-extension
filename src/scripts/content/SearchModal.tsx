import React, { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash.debounce';
import caseApi from '../features/case/case.api';
import tagApi from '../features/tag/tag.api';
import toast from 'react-hot-toast';
import { Search, Clock, X, Trash2, AlertCircle, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import CaseContentModal from './CaseContentModal';

interface SearchModalProps {
  setShowModal: (value: boolean) => void;
}

const CASES_PER_PAGE = 5;

const Pagination: React.FC<{
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
}> = ({ total, page, limit, onPageChange }) => {
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex items-center justify-between mt-6">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(Number(page) - 1)}
          disabled={page === 1}
          className="p-2 rounded-md bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm text-gray-700">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Number(page) + 1)}
          disabled={page === totalPages}
          className="p-2 rounded-md bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="text-sm text-gray-700">
        Showing {Math.min((page - 1) * limit + 1, total)} to{' '}
        {Math.min(page * limit, total)} of {total} items
      </div>
    </div>
  );
};

const SearchModal: React.FC<SearchModalProps> = ({ setShowModal }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [defaultCases, setDefaultCases] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showDefaultCases, setShowDefaultCases] = useState(false);
  const [tags, setTags] = useState([]);
  const [selectedTagId, setSelectedTagId] = useState<number | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [recentSearchesResponse, defaultCasesResponse, tagsResponse] = await Promise.all([
          caseApi.getRecentSearches(),
          caseApi.getList({ limit: CASES_PER_PAGE }),
          tagApi.getList()
        ]);
        setRecentSearches(recentSearchesResponse.data);
        setDefaultCases(defaultCasesResponse.data.cases);
        setTotalItems(defaultCasesResponse.data.total);
        setTags(tagsResponse.data);
      } catch (error) {
        toast.error('Failed to fetch initial data');
      }
    };

    fetchInitialData();
  }, []);

  const fetchCases = useCallback(async (query: string, tagId: number | undefined, page: number) => {
    setIsSearching(true);
    try {
      const response = await caseApi.getList({
        title: query,
        tagId: tagId,
        page: page,
        limit: CASES_PER_PAGE,
      });
      setSearchResults(response.data.cases);
      setTotalItems(response.data.total);
    } catch (error) {
      toast.error('Failed to fetch cases');
    } finally {
      setIsSearching(false);
    }
  }, []);

  const debouncedSearch = useCallback(
    debounce((query: string, tagId: number | undefined) => {
      setCurrentPage(1);
      fetchCases(query, tagId, 1);
    }, 500),
    [fetchCases]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    debouncedSearch(e.target.value, selectedTagId);
  };

  const handleTagSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const tagId = event.target.value ? Number(event.target.value) : undefined;
    setSelectedTagId(tagId);
    setCurrentPage(1);
    fetchCases(searchQuery, tagId, 1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchCases(searchQuery, selectedTagId, newPage);
  };

  const handleSelectCase = async (caseItem) => {
    try {
      await caseApi.addRecentSearch(caseItem.id);
      setSelectedCase(caseItem);
    } catch (error) {
      toast.error('Failed to add to recent searches');
    }
  };

  const handleDeleteRecentSearch = async (searchId: number) => {
    try {
      await caseApi.deleteRecentSearch(searchId);
      setRecentSearches((prev) => prev.filter((item) => item.id !== searchId));
      toast.success('Recent search deleted successfully');
    } catch (error) {
      toast.error('Failed to delete recent search');
    }
  };

  const insertContentIntoEmail = (htmlContent: string) => {
    const composeBox = document.querySelector(
      'div[role="textbox"][aria-label="Message body, press Alt+F10 to exit"]'
    ) as HTMLElement;

    const subjectInput = document.querySelector(
      'input[aria-label="Add a subject"]'
    ) as HTMLInputElement;

    if (subjectInput) {
      subjectInput.value = selectedCase.title;
      subjectInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (composeBox) {
      if (composeBox.innerHTML.trim() === '<br>') {
        composeBox.innerHTML = '';
      }

      composeBox.innerHTML += htmlContent;

      composeBox.dispatchEvent(new Event('input', { bubbles: true }));

      toast.success('Content inserted successfully!');
      setShowModal(false);
    }
  };

  const displayedItems = searchQuery || selectedTagId
    ? searchResults
    : showDefaultCases
    ? defaultCases
    : recentSearches.length > 0
    ? recentSearches
    : defaultCases;

  return (
    <div className="isolation fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Select a Case</h2>
          <button
            onClick={() => setShowModal(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="relative flex-grow">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search for a case..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setShowDefaultCases(true)}
                className="w-full p-2 pl-10 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              />
            </div>
            <div className="relative">
              <select
                value={selectedTagId || ''}
                onChange={handleTagSelect}
                className="appearance-none bg-white border border-gray-300 rounded-md pl-8 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150 ease-in-out text-sm"
              >
                <option value="">All Tags</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
              {selectedTagId && (
                <div
                  style={{
                    backgroundColor: tags.find((t) => t.id === selectedTagId)?.color,
                  }}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full"
                ></div>
              )}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            {searchQuery || selectedTagId ? (
              <>
                <Search size={20} className="mr-2" />
                Search Results
              </>
            ) : !showDefaultCases && recentSearches.length > 0 ? (
              <>
                <Clock size={20} className="mr-2" />
                Recent Searches
              </>
            ) : (
              <>
                <FileText size={20} className="mr-2" />
                Suggested Cases
              </>
            )}
          </h3>
          {isSearching ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Searching...</p>
            </div>
          ) : displayedItems.length > 0 ? (
            displayedItems.map((item, index) => (
              <div
                key={index}
                className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer relative group hover:bg-blue-50 transition duration-150 ease-in-out"
                onClick={() => handleSelectCase(item.case || item)}
              >
                <div className="font-semibold text-lg mb-1">
                  {item.case ? item.case.title : item.title}
                </div>
                <div
                  className="text-sm text-gray-600 line-clamp-2"
                  dangerouslySetInnerHTML={{
                    __html: item.case ? item.case.content : item.content,
                  }}
                ></div>
                {!searchQuery && !showDefaultCases && recentSearches.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRecentSearch(item.id);
                    }}
                    className="absolute right-2 top-2 p-1 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Remove recent search"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle size={48} className="mx-auto mb-4" />
              <p className="text-lg">No results found</p>
              <p className="mt-2">Try a different search term</p>
            </div>
          )}
        </div>
        {(searchQuery || selectedTagId) && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              total={totalItems}
              page={currentPage}
              limit={CASES_PER_PAGE}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
      {selectedCase && (
        <CaseContentModal
          caseData={selectedCase}
          onClose={() => setSelectedCase(null)}
          onInsert={(content) => {
            insertContentIntoEmail(content);
          }}
        />
      )}
    </div>
  );
};

export default SearchModal;