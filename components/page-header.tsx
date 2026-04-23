type pageHeaderProps = {
    title: string;
    description?: string;
}
const PageHeader = ({ title, description }: pageHeaderProps) => {
    return (
        <>
            <h1 className="text-2xl font-medium text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
        </>
    )
}

export default PageHeader