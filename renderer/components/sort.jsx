import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const WrapperX = styled.div`
	display: inline-block;
`

// TODO Styles
// const SelectX = styled.select`
// 	font-size: 10px;
// 	appearance: none;
// 	box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
// 	text-indent: 0.01px;
// 	text-overflow: '';
// 	padding: 0.5rem 3rem 0.5rem 0.5rem;
// 	border: 1px solid ${props => props.theme.borderColor};
// 	border-radius: 0;
// 	background-color: white;
// 	color: ${props => props.theme.selectColor};
// 	outline: none;
// 	display: inline-block;
// 	background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAACgUlEQVR4nO3cSW7bQBBGYd8n3ZTY1VplkVNl8CRlOEMWOYgXvpyVhdEAIUiySFbP7wO8L+p/sjcG7+4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEDzrMifwfnH3Hf0xjh3MM4dsh5hRX5v/O44iH8jgnSMc4eN3x03fne0IvssR4Txww8RpDEdP1sEdpRfp0cQQXznxg+fux3lOckRl8YngrgujZ80gsH5n9eOIII4Phr/JIKnKEfcOj4R6Lp1/KgRzD0iSZEdmPuli/Lls+P4ZckRRLDO0vGnn/un7fazyjFLfwMQwTIa46v/+SWCNIocPyCCuIoeP7AieyLQpzG+ce4hybFEoKuq8QMi0FHl+AERrFP1+AERLNPE+AERzNPU+IEV2Q/i34jguibHD+woz0RwWdPjB0Rwnsr4Ive5n+MmShGk+Q+XBD76J5qmxg+I4F2X4we9R9D1+EGvETD+RG8RMP4ZdpSnHiJg/Ctaj0BjfCvyI/dzRNVqBIw/Q2sRMP4CrUTA+CvUHgHjK6g1AsZXVFsEjB/B4PxjDRGojD/K99h3VkklgogvS2D8BEqN4PSNKIwf0doINl73tSmMn0EpETB+RrkjYPwC5IqA8QtinHtIGQHjFyhVBCrjO/8txWfSndgRMH4FYkXA+BXRjoDxK6QVAeNXTCMCxq+cEbnPEQHjFyR1BO9v43Jfcz83JlJFwPgFix0B41cgVgSMXxHtCBi/QloRMH7FrPP/1gZgnPub+zmwgtnK69LxrfiX3PdDwZIIGL8xcyJg/EbdEgHjN+5aBIzfiXMRMH5nphEwfqfMVl4ZHwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlO4/4NIPH7tR+MsAAAAASUVORK5CYII=);
// 	background-position: calc(100% - 10px) 50%;
// 	background-size: 15px;
// 	background-repeat: no-repeat;
// 	transition: all 0.3s ease-in-out;

// 	&:focus {
// 		border-color: ${props => props.theme.borderFocusColor};
// 		box-shadow: inset 0 0 4px ${props => props.theme.borderFocusColor};
// 	}

// 	&:hover {
// 		border-color: ${props => props.theme.borderHoverColor};
// 	}

// 	/* Targetting Webkit browsers only. FF will show the dropdown arrow with so much padding. */
// 	@media screen and (-webkit-min-device-pixel-ratio: 0) {
// 		padding-right: 3rem;
// 	}
// `

const SelectX = styled.select`
	border:0px;
    outline:0px;
    box-shadow: none;
	width: auto;
    font-size: 18px;
    display: inline-block;
	cursor: pointer;
	margin: 1rem;
    color: ${props => props.theme.displayColor};
    background-color: ${props => props.theme.displayBgColor};
`

const Sort = props => {

	const { current, data, handleChange } = props

	return (
		<WrapperX>
			{data && (
				<SelectX value={current} onChange={e => handleChange( e.target.value )}>
					{data.map( ( option, _ ) => <option key={option.key} value={option.key}>{option.value}</option> )}
				</SelectX>
			) }
		</WrapperX>
	)

}

Sort.propTypes = {
	current: PropTypes.string,
	data: PropTypes.array,
	handleChange: PropTypes.func
}

export default Sort
