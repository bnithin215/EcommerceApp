import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

const MonitoringDashboard = () => {
    const [metrics, setMetrics] = useState([]);

    useEffect(() => {
        fetch('http://localhost:9100/metrics')
            .then(res => res.text())
            .then(data => setMetrics(data.split('\n')))
    }, []);

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">System Metrics</h2>
            <pre className="bg-gray-100 p-3 rounded text-xs">{metrics.join('\n')}</pre>
        </div>
    );
};
export default MonitoringDashboard;
