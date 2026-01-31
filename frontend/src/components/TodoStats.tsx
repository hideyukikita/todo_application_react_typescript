import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

interface TodoStatsProps {
    stats: {
        ratio: { completed: number; active: number};
        daily: { date: string; count: string | number }[];
    };
};

export const TodoStats = ({ stats }: TodoStatsProps) => {
    const total = stats.ratio.completed + stats.ratio.active;
    const completionRate = total > 0 ? Math.round((stats.ratio.completed / total) * 100) : 0;

    // データが全くない場合のエンプティステート
    if (total === 0) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center mb-8">
                <p className="text-gray-400">表示できる統計データがまだありません。</p>
            </div>
        );
    }

    const pieData = [
        { name: '完了', value: stats.ratio.completed, color: '#22c55e' }, // 緑
        { name: '未完了', value: stats.ratio.active, color: '#f1f5f9' }, // 薄いグレー
    ];
    
    const barData = stats.daily.map(d => ({
        date: d.date, 
        count: Number(d.count)
    }));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* 完了比率グラフ */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80 relative"> {/* h-80に拡大 */}
                <h3 className="text-gray-600 text-sm font-bold mb-4">タスク完了比率</h3>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none pt-4"> {/* mtからptに変更 */}
                    <span className="text-2xl font-bold text-gray-700">{completionRate}%</span>
                </div>
                <ResponsiveContainer width='100%' height='100%'>
                    {/* marginを追加して凡例のスペースを確保 */}
                    <PieChart margin={{ top: 0, right: 0, bottom: 20, left: 0 }}>
                        <Pie
                            data={pieData}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey='value'
                            animationDuration={1000}
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend iconType="circle" verticalAlign="bottom" wrapperStyle={{ paddingTop: '10px' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div> 

            {/* 日別完了数グラフ */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80"> {/* h-80に拡大 */}
                <h3 className="text-gray-600 text-sm font-bold mb-4">日別完了タスク (直近7日間)</h3>
                <ResponsiveContainer width='100%' height='100%'>
                    {/* margin.bottomを増やして日付の表示領域を確保 */}
                    <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 30 }}>
                        <XAxis 
                            dataKey='date' 
                            fontSize={11} 
                            tickLine={false} 
                            axisLine={false} 
                            dy={10} 
                            height={40} // 軸の高さを明示
                        />
                        <YAxis 
                            fontSize={11} 
                            tickLine={false} 
                            axisLine={false} 
                            allowDecimals={false} 
                        />
                        <Tooltip 
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar 
                            dataKey='count' 
                            fill="#22c55e" 
                            radius={[4, 4, 0, 0]} 
                            barSize={20}
                            animationDuration={1500}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )

}
