import React from 'react'
import styled from 'styled-components'

import { IoIosFolderOpen } from 'react-icons/io'

import ipc from '../helpers/safe-ipc'
import strings from '../helpers/strings'
import Button from './button'

const WrapperX = styled.div`
	flex: 1 1 180px;
	height: 40px;
	transition-property: color, background-color;
	color: ${props => props.theme.buttonColor};
	background-color: ${props => props.theme.buttonBgColor};

	position: relative;
`

const ButtonX = styled( Button )`
	padding: .5rem .5rem .5rem 2.5rem;
	height: 100%;
	color: ${props => props.theme.onPrimaryColor};
	background-color: ${props => props.theme.primaryColor};
`

const IconX = styled.div`
	position: absolute;
	top: 0;
	bottom: 0;
	left: .5rem;

	display: flex;
	align-items: center;
	flex-direction: row;
`

const FileInput = () => {

	const handleChooseDirectory = () => ipc.send( 'open-file-dialog' )

	return (
		<WrapperX>
			<ButtonX handleChange={handleChooseDirectory}>
				<IconX><IoIosFolderOpen size={24}/></IconX>
				{strings.directory.button}
			</ButtonX>
		</WrapperX>
	)

}

export default FileInput
