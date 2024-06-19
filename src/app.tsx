import { PomodoroTimer } from './components/pomodoro-timer';

export function App() {
  return (
    <div
      className={`bg-teal-300 w-screen h-screen flex justify-center items-center transition-colors duration-500`}
    >
      <PomodoroTimer
        pomodoroTime={1500}
        shortRestTime={300}
        longRestTime={1800}
        cycles={4}
      />
    </div>
  );
}
