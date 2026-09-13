import { Text } from "@/components/ui/text";

type PageHeaderProps = {
    title: string;
    description?: string;
    actions?: React.ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
    return (
        <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
                <Text
                    variant="h3"
                    render={<h1 />}
                    className="text-xl tracking-tight text-foreground sm:text-xl"
                >
                    {title}
                </Text>
                {description && (
                    <Text variant="small" tone="muted" weight="normal" className="leading-normal">
                        {description}
                    </Text>
                )}
            </div>
            {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
    );
}
