export function truncate(str: string, n: number): string {
	return str.length > n ? `${str.slice(0, n - 1)}` : str;
}
