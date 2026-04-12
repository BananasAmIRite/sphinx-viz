export default function VecReadout({
    label,
    values
} : {
    label: string;
    values: [string, number][];
}) {
    return (
        <div className="flex w-full flex-col items-center space-y-3 rounded-lg border border-gray-700 p-2">
            <div className={`text-sm tracking-widest text-gray-200 m-0 uppercase`}>{label}</div>
            <div className="flex space-x-4">
                {values.map(([name, value]) => (
                    <div key={name} className="flex flex-col items-center">
                        <div className="text-xs tracking-widest text-gray-200">{name}</div>
                        <div className="text-lg font-mono tracking-widest">{value.toFixed(2)}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}