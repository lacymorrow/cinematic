import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const Tooltip = styled.div`
	position: relative;

	.tooltip-content {
		font-size: 11px;
		opacity: 0;
		transition: opacity .25s ease;
		background-color: black;
		color: #fff;
		text-align: center;
		padding: 5px;
		border-radius: 6px;
		width: 80px;
		position: absolute;
		z-index: 1;
		top: 100%;
		left: 50%;
		margin-left: -40px; /* Use half of the width (120/2 = 60), to center the tooltip */
	}

	.tooltip-content::after {
	  content: " ";
	  position: absolute;
	  bottom: 100%;  /* At the top of the tooltip */
	  left: 50%;
	  margin-left: -5px;
	  border-width: 5px;
	  border-style: solid;
	  border-color: transparent transparent black transparent;
	}

	/* Show the tooltip text when you mouse over the tooltip container */
	&:hover .tooltip-content {
	  opacity: 1;
	}
`

const WrapperX = styled.div`
	display: flex;
	align-items: center;

	input {
	  display: none;
	}

	em {
		margin-left: 10px;
		font-size: 1rem;
	}

	label {
		display: inline-block;
		height: 34px;
		position: relative;
		width: 60px;
	}
`

const ToggleX = styled.div`
	background-color: #ccc;
	bottom: 0;
	cursor: pointer;
	left: 0;
	position: absolute;
	right: 0;
	top: 0;
	transition: .4s;
	border-radius: 34px;

	&:before {
	  background-color: #fff;
	  bottom: 4px;
	  content: "";
	  height: 26px;
	  left: 4px;
	  position: absolute;
	  transition: .4s;
	  width: 26px;

	  border-radius: 50%;
	}

	// Active
	${props => props.active && `
		background-color: #66bb6a;

		&:before {
			transform: translateX(26px);
		}
	`}

`

const ThemeToggle = props => {

	const { data, isActive, handleChange } = props

	return (
		<WrapperX>
			<Tooltip>
				<label>
					<input type="checkbox" onClick={handleChange}/>
					<ToggleX active={isActive}/>
				</label>
				<span className="tooltip-content">{data} mode</span>
			</Tooltip>
		</WrapperX>
	)

}

ThemeToggle.propTypes = {
	data: PropTypes.string,
	isActive: PropTypes.bool,
	handleChange: PropTypes.func
}

ThemeToggle.defaultProps = {
	data: 'Dark',
	isActive: false
}

export default ThemeToggle
