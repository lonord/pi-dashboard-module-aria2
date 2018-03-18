import {
	FullSizeWrap,
	LoadingText,
	Title,
	withHTTPClient,
	withSSEClient
} from '@lonord/pi-dashboard-components'
import { Dialog, FlexItemAdaptive, withFlexVertical } from '@lonord/react-electron-components'
import * as React from 'react'
import styled from 'styled-components'
import createAria2, { Aria2Client, StatusData } from './aria2-client'
import { name as displayName } from './index'
import { formatBytesPerSec } from './util'

interface MainPropsMap {
	aria2Url: string
	aria2Secret?: string
}

interface MainProps extends MainPropsMap {
	updateProps: <K extends keyof MainPropsMap>(props: Pick<MainPropsMap, K>) => void
}

interface MainState {
	isDetailOpen: boolean
	status: StatusData
}

class Main extends React.Component<MainProps, MainState> {

	rpc: Aria2Client = null

	state: MainState = {
		isDetailOpen: false,
		status: null
	}

	openDetail = () => {
		this.setState({
			isDetailOpen: true
		})
	}

	closeDetail = () => {
		this.setState({
			isDetailOpen: false
		})
	}

	initAria2 = () => {
		const { aria2Url, aria2Secret } = this.props
		if (aria2Url) {
			this.rpc = createAria2(aria2Url, aria2Secret)
			this.rpc.addGlobalStatusReceiver(this.onStatusUpdate)
		}
	}

	stopAria2 = () => {
		if (this.rpc) {
			this.rpc.removeGlobalStatusReceiver(this.onStatusUpdate)
			this.rpc.close()
			this.rpc = null
		}
		this.setState({
			status: null
		})
	}

	onStatusUpdate = (status: StatusData) => {
		this.setState({
			status
		})
	}

	componentDidUpdate(prevProps: MainProps) {
		if (prevProps.aria2Url !== this.props.aria2Url
			|| prevProps.aria2Secret !== this.props.aria2Secret) {
			this.stopAria2()
			this.initAria2()
		}
	}

	componentDidMount() {
		this.initAria2()
	}

	componentWillUnmount() {
		this.stopAria2()
	}

	render() {
		const { isDetailOpen, status } = this.state
		return (
			<FullSizeWrap onClick={this.openDetail}>
				<Title borderColor="#00897B">{displayName}</Title>
				{!status
					? <LoadingText>{this.rpc ? '正在连接...' : '未连接'}</LoadingText>
					: <div>
						<DetailTextWrap>
							<span>&nbsp;&nbsp;下载中</span>
							<TaskCountText>{status.numActive}</TaskCountText>
							<span>| 等待中</span>
							<TaskCountText>{status.numWaiting}</TaskCountText>
							<span>| 已停止</span>
							<TaskCountText>{status.numStopped}</TaskCountText>
						</DetailTextWrap>
						<DetailTextWrap>
							<BlueSpan>&nbsp;&nbsp;↓</BlueSpan>
							<SpeedText>{formatBytesPerSec(status.downloadSpeed)}</SpeedText>
							<span>|</span>
							<GreenSpan>&nbsp;&nbsp;↑</GreenSpan>
							<SpeedText>{formatBytesPerSec(status.uploadSpeed)}</SpeedText>
						</DetailTextWrap>
					</div>}
				{/* <Dialog isOpen={isDetailOpen} onClose={this.closeDetail} title={displayName}>
					123
				</Dialog> */}
			</FullSizeWrap>
		)
	}
}

export default Main

const DetailTextWrap = styled.div`
	font-size: 12px;
	margin-top: 16px;
	color: #9E9E9E;
`

const TaskCountText = styled.span`
	display: inline-block;
	width: 28px;
	text-align: center;
	color: #616161;
	padding: 0 4px;
`

const SpeedText = styled.span`
	display: inline-block;
	width: 84px;
	text-align: right;
	color: #616161;
	padding: 0 20px 0 4px;
`

const BlueSpan = styled.span`
	color: #03A9F4;
`

const GreenSpan = styled.span`
	color: #4CAF50;
`
