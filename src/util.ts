export function formatBytesPerSec(n: number) {
	if (n < 0) {
		return '- KB/s'
	}
	n = n / 1024
	if (n < 1024) {
		return `${Math.floor(n)} KB/s`
	}
	n = n / 1024
	if (n < 1024) {
		return `${formatNumber(n)} MB/s`
	}
	n = n / 1024
	return `${formatNumber(n)} GB/s`
}

function formatNumber(n: number) {
	let s: string
	if (n < 10) {
		s = n + ''
		if (s.indexOf('.') >= 0) {
			s = s.substr(0, s.indexOf('.') + 2)
		}
	} else {
		s = Math.floor(n) + ''
	}
	return s
}
