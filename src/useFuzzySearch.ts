import Fuse from 'fuse.js';
import { useCallback, useEffect, useRef } from 'react';
import { FinalResults, formatResults } from './formatResults';

type Options<T> = Fuse.IFuseOptions<T>;

const createFuse = <T>(options?: Options<T>) => {
    return new Fuse<T>([], {
        ...options,
        shouldSort: true,
        includeMatches: true
    });
}

export interface FuzzySearchProps<T> {
    data: ReadonlyArray<T>;
    options?: Options<T>;
}

export type Result<T> = Fuse.FuseResult<T>;
export type Results<T> = ReadonlyArray<Result<T>>;

export interface SearchResponse<T> {
    results: Results<T>;
    formattedResults: FinalResults<T>;
    timing: number;
}

type Cache<T> = { [query: string]: SearchResponse<T> }

const useFuzzySearch = <T>(
    { data, options }: FuzzySearchProps<T>
) => {

    const cacheRef = useRef<Cache<T>>({});

    const fuseRef = useRef<Fuse<T>>(createFuse(options));

    useEffect(() => {
        fuseRef.current = createFuse(options);
        cacheRef.current = {};
    }, [options]);

    useEffect(() => {
        fuseRef.current.setCollection(data);
        cacheRef.current = {};
    }, [data]);

    return useCallback((query: string): SearchResponse<T> => {
        const cache = cacheRef.current;

        if (query in cache) {
            return { ...cache[query], timing: 0 }
        }

        const start = window.performance.now();
        const results = fuseRef.current.search(query);
        const end = window.performance.now();
        const timing = parseFloat((end - start).toFixed(3));

        const response: SearchResponse<T> = {
            results,
            formattedResults: formatResults(results),
            timing
        }

        cacheRef.current[query] = response;

        return response;
    }, []);
}

export default useFuzzySearch;
