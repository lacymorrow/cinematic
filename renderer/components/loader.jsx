import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const WrapperX = styled.div`
	opacity: 0;
	${props => props.isActive && `
		opacity: 1;
	`}

	transition: opacity .4s ease;

	padding: 0 2rem;
	transform: scale(0.5, 0.5);

	@keyframes ball-scale-ripple-multiple {
		0% {
            transform: scale(0.1);
	    	opacity: 1;
		}
		70% {
	        transform: scale(1);
	    	opacity: 0.7;
		}
		100% {
	    	opacity: 0.0;
		}
	}

	.ball-scale-ripple-multiple {
		position: relative;
		transform: translateY(-25px);
	}
	.ball-scale-ripple-multiple > div:nth-child(0) {
    	animation-delay: -0.8s;
    }
	.ball-scale-ripple-multiple > div:nth-child(1) {
    	animation-delay: -0.6s;
	}
	.ball-scale-ripple-multiple > div:nth-child(2) {
	    animation-delay: -0.4s;
	}
	.ball-scale-ripple-multiple > div:nth-child(3) {
	    animation-delay: -0.2s;
	}
	.ball-scale-ripple-multiple > div {
        animation-fill-mode: both;
		position: absolute;
		top: -2px;
		left: -26px;
		width: 50px;
		height: 50px;
		border-radius: 100%;
		border: 2px solid ${props => props.theme.primaryColor};
        animation: ball-scale-ripple-multiple 1.25s 0s infinite cubic-bezier(0.21, 0.53, 0.56, 0.8);
	}

`

const Loader = props => {

	return (
		<WrapperX {...props}>
			<div className="ball-scale-ripple-multiple">
				<div/>
				<div/>
				<div/>
			</div>
		</WrapperX>
	)

}

Loader.propTypes = {
	isActive: PropTypes.bool
}

Loader.defaultProps = {
	isActive: false
}

export default Loader
