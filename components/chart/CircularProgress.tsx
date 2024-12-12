import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface CircularProgressProps {
    value?: number;
    label?: string;
    size?: number;
    strokeWidth?: number;
    trailColor?: string;
    textColor?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ value = 0, label = "", size = 60, strokeWidth = 8, trailColor = '#e0e0e0', textColor = '#616161' }) => {
    return (
        <div className='flex flex-col justify-center items-center'>
            <div style={{ width: size, height: size }}>
                <CircularProgressbar
                    value={value}
                    text={`${value}%`}
                    styles={buildStyles({
                        rotation: 0.25,
                        strokeLinecap: 'round',
                        textSize: '24px',
                        pathTransitionDuration: 0.5,
                        pathColor: `rgba(77, 233, 130, ${value / 100})`,
                        trailColor: trailColor,
                        textColor: textColor,
                    })}
                />
            </div>
            <p className='text-xs text-gray-500 mt-2'>{label}</p>
        </div>

    );
};

export default CircularProgress;