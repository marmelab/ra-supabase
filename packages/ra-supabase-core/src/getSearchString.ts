export function getSearchString() {
    const search = window.location.search;
    const hash = window.location.hash.substring(1);

    return search && search !== ''
        ? search
        : hash.includes('?')
        ? hash.split('?')[1]
        : hash;
}
