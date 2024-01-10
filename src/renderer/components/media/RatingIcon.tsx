export function RatingIcon({ rated }: { rated: string }) {
	return (
		<div className="inline-grid place-items-center px-2 py-1 border-4 font-bold text-xl border-foreground">
			<div className="">
				<span className="sr-only">Rated</span>
				{rated}
			</div>
		</div>
	);
}
