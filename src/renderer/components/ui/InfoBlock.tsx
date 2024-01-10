import { cn } from '@/lib/utils';

export const InfoBlock = ({
	title,
	value,
	className,
	...props
}: {
	title: string;
	value?: string | number;
	className?: string;
}) => {
	return (
		<div className={cn(`flex flex-col`, className)} {...props}>
			<h3 className="text-lg font-medium">{title}</h3>
			<div className="text-sm text-muted-foreground">{value}</div>
		</div>
	);
};
