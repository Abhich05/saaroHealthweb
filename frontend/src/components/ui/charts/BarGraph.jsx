import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";

const BarGraph = ({ data }) => (
  <ResponsiveContainer width="100%" height={180}>
    <BarChart data={data}>
      <XAxis dataKey="type" tick={{ fontSize: 12 }} />
      <Tooltip />
      <Bar dataKey="count" fill="#8e72cf" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

export default BarGraph;
