import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

interface TodoStatsProps {
    stats: {
        ratio: { completed: number; active: number};
        daily: { date: string; count: string | number }[];
    };
};

export const TodoStats = ({ stats }: TodoStatsProps) => {
    // 全タスク0なら何も表示しない
    if(stats.ratio.completed === 0 && stats.ratio.active === 0){
        return null;
    }


    // 完了・未完了の比率データを算出
    const pieData = [
        { name: '完了', value: stats.ratio.completed, color: '#22c55e'},
        { name: '未完了', value: stats.ratio.active, color: '#e5e7eb' },
    ];
    
    // 日別完了数のデータを算出(直近7日間)
    const barData = stats.daily.map(d => ({
        date: d.date, 
        count: Number(d.count) //文字列の場合の考慮
    }));


    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* 完了比率グラフ */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-64">
                <h3 className="text-gray-600 text-sm font-bold mb-4">タスク完了比率</h3>
                <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                        <Pie
                            data={pieData}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey='value'
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip/>
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            </div> 

            {/* 日別完了数グラフ */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-64">
                <h3 className="text-gray-600 text-sm font-bold mb-4">日別完了タスク</h3>
                <ResponsiveContainer width='100%' height='100%'>
                    <BarChart data={barData}>
                        <XAxis dataKey='date' fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} allowDecimals={false} />
                        <Tooltip cursor={{fill: '#f3f4f6'}} />
                        <Bar dataKey='count' fill="#3b82f6" radius={[4,4,0,0]} barSize={30} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}