import PropTypes from 'prop-types';

/**
 * StatCard component for the admin dashboard.
 * Displays a label, value, and icon with a configurable background color.
 *
 * @param {Object} props
 * @param {string} props.label - The stat label text (e.g., "Total Posts").
 * @param {number|string} props.value - The stat value to display.
 * @param {React.ReactNode} props.icon - The icon element to render.
 * @param {string} [props.bgColor='bg-violet-100'] - Tailwind background color class for the icon container.
 * @param {string} [props.textColor='text-violet-600'] - Tailwind text color class for the icon container.
 * @returns {JSX.Element}
 */
export function StatCard({ label, value, icon, bgColor = 'bg-violet-100', textColor = 'text-violet-600' }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex items-center space-x-4 hover:shadow-md transition-shadow">
      <div
        className={`${bgColor} ${textColor} w-12 h-12 rounded-lg inline-flex items-center justify-center flex-shrink-0`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-500 truncate">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  icon: PropTypes.node.isRequired,
  bgColor: PropTypes.string,
  textColor: PropTypes.string,
};

export default StatCard;