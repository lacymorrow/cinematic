export interface NotificationOptions {
	title: string;
	body?: string;
}

export interface RendererNotificationOptions {
	title: string;
	body?: string;
	action?: {
		label: string;
		onClick: () => void;
	};
}
