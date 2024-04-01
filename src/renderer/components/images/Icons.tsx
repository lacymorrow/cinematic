const browseIcon = ({ className }: { className?: string }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<rect width="7" height="7" x="3" y="3" rx="1" />
		<rect width="7" height="7" x="14" y="3" rx="1" />
		<rect width="7" height="7" x="14" y="14" rx="1" />
		<rect width="7" height="7" x="3" y="14" rx="1" />
	</svg>
);

const closeIcon = ({ className }: { className?: string }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="1"
			d="M6 18L18 6M6 6l12 12"
		/>
	</svg>
);

function PlayIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 1200 1200"
			enableBackground="new 0 0 1200 1200"
			// stroke="currentColor"
			fill="currentColor"
		>
			<path
				d="M600,0C268.65,0,0,268.65,0,600c0,331.35,268.65,600,600,600
	c331.35,0,600-268.65,600-600C1200,268.65,931.35,0,600,0z M600,139.16c254.499,0,460.84,206.341,460.84,460.84
	S854.499,1060.84,600,1060.84S139.16,854.499,139.16,600S345.501,139.16,600,139.16z M450,300.439V899.56L900,600L450,300.439z"
			/>
		</svg>
	);
}

const podcastIcon = ({ className }: { className?: string }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		stroke="currentColor"
		strokeLinecap="round"
		strokeLinejoin="round"
		strokeWidth="2"
		className={className}
		viewBox="0 0 24 24"
	>
		<circle cx="12" cy="11" r="1" />
		<path d="M11 17a1 1 0 0 1 2 0c0 .5-.34 3-.5 4.5a.5.5 0 0 1-1 0c-.16-1.5-.5-4-.5-4.5ZM8 14a5 5 0 1 1 8 0" />
		<path d="M17 18.5a9 9 0 1 0-10 0" />
	</svg>
);

const stacksIcon = ({ className }: { className?: string }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<path d="m16 6 4 14" />
		<path d="M12 6v14" />
		<path d="M8 8v12" />
		<path d="M4 4v16" />
	</svg>
);

export default {
	browseIcon,
	closeIcon,
	PlayIcon,
	podcastIcon,
	stacksIcon,
};
