import Fuse from 'fuse.js';
import * as React from 'react';
import { useMemo } from 'react';
import { FinalResults } from './formatResults';
import useFuzzySearch, { FuzzySearchProps } from './useFuzzySearch';

export interface IFuzzyHighlighterProps<T> extends FuzzySearchProps<T> {
    query: string;
    children?: (params: {
        results: ReadonlyArray<Fuse.FuseResult<T>>;
        formattedResults: FinalResults<T>;
        timing: number;
    }) => React.ReactElement | null;
}

const FuzzyHighlighter = <T extends any>(
    { data, options, query, children }: IFuzzyHighlighterProps<T>
) => {
    const search = useFuzzySearch({ data, options });

    const results = useMemo(() => {
        return search(query);
    }, [data, options, query]);

    if (!children) return null;
    return children(results);
}

export default FuzzyHighlighter;
