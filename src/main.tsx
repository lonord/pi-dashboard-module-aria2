import { FullSizeWrap, LoadingText, Title, withHTTPClient, withSSEClient } from '@lonord/pi-dashboard-components'
import { Dialog, FlexItemAdaptive, withFlexVertical } from '@lonord/react-electron-components'
import * as React from 'react'
import styled from 'styled-components'
import { name as displayName } from './index'

interface MainPropsMap {
	aria2Url: string
	aria2Secret: string
}

interface MainProps extends MainPropsMap {
	updateProps: <K extends keyof MainPropsMap>(props: Pick<MainPropsMap, K>) => void
}

interface MainState {
	isDetailOpen: boolean
}

class Main extends React.Component<MainProps, MainState> {

	state: MainState = {
		isDetailOpen: false
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

	render() {
		const { isDetailOpen } = this.state
		return (
			<FullSizeWrap onClick={this.openDetail}>
				<Title borderColor="#00897B">{displayName}</Title>
				<div>123</div>
				<Dialog isOpen={isDetailOpen} onClose={this.closeDetail} title={displayName}>
					123
				</Dialog>
			</FullSizeWrap>
		)
	}
}

export default Main
