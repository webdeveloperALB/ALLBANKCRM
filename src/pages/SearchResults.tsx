import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { searchContent, SearchContent } from '../data/searchIndex';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchContent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (query) {
      const searchResults = searchContent(query);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  }, [query]);

  const categories = ['all', ...Array.from(new Set(results.map(r => r.category)))];

  const filteredResults = selectedCategory === 'all'
    ? results
    : results.filter(r => r.category === selectedCategory);

  const highlightText = (text: string, query: string) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={index} className="bg-yellow-300 text-gray-900 px-1 rounded">
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Search Results
          </h1>

          {query && (
            <p className="text-lg text-gray-600">
              {results.length > 0 ? (
                <>
                  Found <span className="font-semibold text-gray-900">{results.length}</span> result{results.length !== 1 ? 's' : ''} for{' '}
                  <span className="font-semibold text-gray-900">"{query}"</span>
                </>
              ) : (
                <>
                  No results found for <span className="font-semibold text-gray-900">"{query}"</span>
                </>
              )}
            </p>
          )}
        </div>

        {results.length > 0 && (
          <div className="mb-8 flex gap-3 flex-wrap">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-[#0a7f8f] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? 'All Categories' : category}
                {category !== 'all' && (
                  <span className="ml-2 text-xs">
                    ({results.filter(r => r.category === category).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {!query ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">
              Start searching
            </h2>
            <p className="text-gray-500">
              Enter a search term to find relevant content
            </p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">
              No results found
            </h2>
            <p className="text-gray-500 mb-6">
              Try different keywords or browse our main categories
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0a7f8f] text-white hover:bg-[#096a78] transition-colors"
            >
              Go to Homepage
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredResults.map(result => (
              <Link
                key={result.id}
                to={result.path}
                className="block bg-white border border-gray-200 p-6 hover:border-[#0a7f8f] hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-semibold text-[#0a7f8f] uppercase tracking-wide">
                        {result.category}
                      </span>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {highlightText(result.title, query)}
                    </h2>

                    <p className="text-gray-600 mb-4">
                      {highlightText(result.description, query)}
                    </p>

                    <div className="space-y-1">
                      {result.content.slice(0, 3).map((item, index) => {
                        const itemLower = item.toLowerCase();
                        const queryLower = query.toLowerCase();

                        if (itemLower.includes(queryLower)) {
                          return (
                            <div key={index} className="text-sm text-gray-500 flex items-start gap-2">
                              <span className="text-[#0a7f8f] mt-1">•</span>
                              <span>{highlightText(item, query)}</span>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>

                  <ArrowRight className="w-5 h-5 text-[#0a7f8f] flex-shrink-0 mt-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
