import * as Aria2 from 'aria2'
import { parse } from 'url'

export interface FileData {
	completedLength: number
	length: number
	path: string
}

export interface ActiveData {
	files: FileData[]
	completedLength: number
	connections: number
	downloadSpeed: number
	gid: string
	totalLength: number
}

export interface StatusData {
	downloadSpeed: number
	uploadSpeed: number
	numActive: number
	numWaiting: number
	numStopped: number
}

export type ActiveDataCallback = (data: ActiveData) => void
export type StatusDataCallback = (data: StatusData) => void

export interface Aria2Client {
	addActiveReceiver(fn: ActiveDataCallback)
	removeActiveReceiver(fn: ActiveDataCallback)
	addGlobalStatusReceiver(fn: StatusDataCallback)
	removeGlobalStatusReceiver(fn: StatusDataCallback)
	close()
}

export default function createAria2(url: string, secret?: string): Aria2Client {
	let stopped = false
	const rpc = new Aria2(parseOption(url, secret))
	const openCB = (err) => {
		if (err) {
			console.warn(err)
		} else {
			startActiveReq()
			startStatusReq()
		}
	}
	rpc.open(openCB)
	rpc.onclose = () => {
		trigActiveCallback(null)
		trigstatusCallback(null)
		stopActiveReq()
		stopStatusReq()
		if (stopped) {
			return
		}
		setTimeout(() => {
			if (stopped) {
				return
			}
			rpc.open(openCB)
		}, 5000)
	}

	const activeDataCallbackList: ActiveDataCallback[] = []
	let activeTimer: any = null
	let activeProcessing = false
	const startActiveReq = () => {
		if (stopped) {
			return
		}
		const run = () => {
			if (activeProcessing) {
				return
			}
			activeProcessing = true
			rpc.send('tellActive', (err, r) => {
				trigActiveCallback(r)
				activeProcessing = false
			})
		}
		activeTimer = setInterval(run, 2000)
		run()
	}
	const stopActiveReq = () => {
		activeTimer && clearInterval(activeTimer)
		activeTimer = null
	}
	const trigActiveCallback = (r: any) => {
		if (!r) {
			activeDataCallbackList.forEach((cb) => cb(null))
			return
		}
		activeDataCallbackList.forEach((cb) => cb({
			completedLength: parseInt(r.completedLength),
			totalLength: parseInt(r.totalLength),
			connections: parseInt(r.connections),
			downloadSpeed: parseInt(r.downloadSpeed),
			files: r.files.map((f) => ({
				completedLength: parseInt(f.completedLength),
				length: parseInt(f.length),
				path: f.path
			})),
			gid: r.gid
		}))
	}

	const statusDataCallbackList: StatusDataCallback[] = []
	let statusTimer: any = null
	let statusProcessing = false
	const startStatusReq = () => {
		if (stopped) {
			return
		}
		const run = () => {
			if (statusProcessing) {
				return
			}
			statusProcessing = true
			rpc.send('getGlobalStat', (err, r) => {
				trigstatusCallback(r)
				statusProcessing = false
			})
		}
		statusTimer = setInterval(run, 2000)
		run()
	}
	const stopStatusReq = () => {
		statusTimer && clearInterval(statusTimer)
		statusTimer = null
	}
	const trigstatusCallback = (r: any) => {
		if (!r) {
			statusDataCallbackList.forEach((cb) => cb(null))
			return
		}
		statusDataCallbackList.forEach((cb) => cb({
			downloadSpeed: parseInt(r.downloadSpeed),
			uploadSpeed: parseInt(r.uploadSpeed),
			numActive: parseInt(r.numActive),
			numWaiting: parseInt(r.numWaiting),
			numStopped: parseInt(r.numStopped)
		}))
	}

	return {
		addActiveReceiver: (fn: ActiveDataCallback) => {
			const idx = activeDataCallbackList.indexOf(fn)
			if (idx === -1) {
				activeDataCallbackList.push(fn)
			}
		},
		removeActiveReceiver: (fn: ActiveDataCallback) => {
			const idx = activeDataCallbackList.indexOf(fn)
			if (idx > -1) {
				activeDataCallbackList.splice(idx, 1)
			}
		},
		addGlobalStatusReceiver: (fn: StatusDataCallback) => {
			const idx = statusDataCallbackList.indexOf(fn)
			if (idx === -1) {
				statusDataCallbackList.push(fn)
			}
		},
		removeGlobalStatusReceiver: (fn: StatusDataCallback) => {
			const idx = statusDataCallbackList.indexOf(fn)
			if (idx > -1) {
				statusDataCallbackList.splice(idx, 1)
			}
		},
		close: () => {
			if (stopped) {
				return
			}
			stopped = true
			rpc.close()
		}
	}
}

function parseOption(url: string, secret?: string) {
	const options: any = {
		secret
	}
	if (url) {
		const parsed = parse(url)
		options.secure = parsed.protocol === 'wss:'
		options.host = parsed.hostname
		options.port = parsed.port
		options.path = parsed.path
	}
	return options
}
