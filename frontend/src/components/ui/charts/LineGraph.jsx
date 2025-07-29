import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts";

const LineGraph = ({ data }) => (
  <ResponsiveContainer width="100%" height={180}>
    <LineChart data={data}>
      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
      <Tooltip />
      <Line type="monotone" dataKey="growth" stroke="#8e72cf" strokeWidth={2} />
    </LineChart>
  </ResponsiveContainer>
);

export default LineGraph;
