export default function HealthPanel({
    objects
} : {
    objects: [string, boolean][]
}) {
    return (
        <div className="grid grid-cols-8 rounded-lg overflow-hidden border border-gray-300">
            {objects.map(([name, healthy], idx) => (
                <div key={name} className={
                    `${healthy ? "text-green-200 bg-green-800" : "text-red-200 bg-red-800"}
                    font-mono tracking-widest border-gray-300 px-2 text-center
                    ${idx < objects.length - 1 ? "border-r" : ""}`
                }>
                    {name}
                </div>
            ))}
        </div>
    );
}