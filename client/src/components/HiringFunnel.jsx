// Renders an ordered hiring funnel as horizontal bars.
// `funnel` is an array of { stage, count } in stage order.
const HiringFunnel = ({ funnel }) => {
  const max = Math.max(1, ...funnel.map((f) => f.count));
  return (
    <div>
      {funnel.map(({ stage, count }) => (
        <div className='funnel-row' key={stage}>
          <span className='funnel-label'>{stage}</span>
          <div
            className='funnel-bar'
            style={{ width: `${(count / max) * 100}%` }}
          />
          <span className='funnel-count'>{count}</span>
        </div>
      ))}
    </div>
  );
};
export default HiringFunnel;
