import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import type { Todo } from "../hooks/useTodos";

interface TodoStatsProps {
    todos: Todo[];
};

export const TodoStats = ({ todos }: TodoStatsProps) => {
    // 完了・未完了の比率データを算出
    const pieData = useMemo(() => {
        const completed = todos.filter(t => t.is_completed).length;
        const active = todos.length - completed;
        return [
            { name: '完了', value: completed, color: '#22c55e'}, // green-500
            { name: '未完了', value: active, color: '#e5e7eb' }, // green-200
        ];
    }, [todos]);
    
    // 日別完了数のデータを算出(直近7日間)
    const barData = useMemo(() => {
        const stats: Record<string, number> = {};
        // 今日から7日前までの日付を初期化
        for (let i = 6; i >= 0; i-- ){
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
            stats[dateStr] = 0;
        }
        // 完了済みタスクを日付ごとにカウント
        todos.filter( t => t.is_completed).forEach(todo => {
            const d = new Date(todo.deadline);
            const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
            if(stats[dateStr] !== undefined){
                stats[dateStr]++;
            }
        });

        return Object.entries(stats).map(([date, count]) => ({ date, count}));
    }, [todos]);

    if (todos.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* 完了比率グラフ */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-grey-100 h-64">
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