/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { FaXmark, FaGear } from 'react-icons/fa6';
import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useInterval } from '../hooks/use-interval';
import { buttonCSS } from '../globalStyle/button-css';
import { Button } from './button';
import { secondsToHour } from '../utils/seconds-to-hour';
import { secondsToMinutes } from '../utils/seconds-to-minutes';

const bellStartPromise = import('../sounds/bell-start.mp3');
const bellFinishPromise = import('../sounds/bell-finish.mp3');

let audioStartWorking = new Audio();
let audioStartResting = new Audio();

// Os audios só funcionam se esperarmos as promises dele serem concluidas
Promise.all([bellStartPromise, bellFinishPromise]).then(
  ([bellStart, bellFinish]) => {
    audioStartWorking = new Audio(bellStart.default) as HTMLAudioElement;
    audioStartResting = new Audio(bellFinish.default) as HTMLAudioElement;
  },
);

interface Props {
  pomodoroTime: number;
  shortRestTime: number;
  longRestTime: number;
  cycles: number;
}

export function PomodoroTimer(props: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pomodoroTimeRef = useRef<HTMLInputElement>(null);
  const shortRestTimeRef = useRef<HTMLInputElement>(null);
  const longRestTimeRef = useRef<HTMLInputElement>(null);

  const [pomodoroTime, setPomodoroTime] = useState(props.pomodoroTime);
  const [mainTime, setMaintime] = useState(pomodoroTime);
  const [shortRestTime, setShortRestTime] = useState(props.shortRestTime);
  const [longRestTime, setLongRestTime] = useState(props.longRestTime);
  const [timeCounting, setTimeCounting] = useState(false);
  const [status, setStatus] = useState('paused');
  const [cycles, setCycles] = useState(0);
  const [previousStatus, setPreviousStatus] = useState('paused');
  const [pomodoros, setPomodoros] = useState(0);
  const [workingTime, setWorkingTime] = useState(0);
  const [color, setColor] = useState('bg-teal-300');
  const [configurationMode, setConfigurationMode] = useState(false);
  const [previewPomodoroTime, setPreviewPomodoroTime] = useState(pomodoroTime);
  const [previewShortRestTime, setPreviewShortRestTime] =
    useState(shortRestTime);
  const [previewLongRestTime, setPreviewLongRestTime] = useState(longRestTime);

  useInterval(
    () => {
      setMaintime(mainTime - 1);
      if (status === 'working') setWorkingTime(workingTime + 1);
    },
    timeCounting ? 1000 : null,
  );

  const startWork = (status: string) => {
    let temporaryPreviousStatus: string = '';

    if (status === 'resting') {
      temporaryPreviousStatus = 'working-after-resting';
    }
    if (status === 'paused') {
      temporaryPreviousStatus = 'working-after-paused';
    }

    if (temporaryPreviousStatus) {
      setPreviousStatus(temporaryPreviousStatus);

      if (
        temporaryPreviousStatus === 'working-after-resting' ||
        previousStatus === 'paused-after-resting'
      ) {
        setMaintime(pomodoroTime);
      }

      setTimeCounting(true);
      setStatus('working');
      changeParentColor('bg-red-300');
      audioStartWorking.play();
    }
  };

  const stopTimer = (status: string) => {
    if (status === 'working') setPreviousStatus('paused-after-working');
    if (status === 'resting') setPreviousStatus('paused-after-resting');

    setTimeCounting(false);
    setStatus('paused');
    changeParentColor('bg-teal-300');
  };

  const rest = (status: string) => {
    let temporaryPreviousStatus: string = '';

    if (status === 'working') {
      temporaryPreviousStatus = 'resting-after-working';
    }
    if (status === 'paused') {
      temporaryPreviousStatus = 'resting-after-paused';
    }

    if (temporaryPreviousStatus) {
      setPreviousStatus(temporaryPreviousStatus);

      if (
        temporaryPreviousStatus === 'resting-after-working' ||
        previousStatus === 'paused' ||
        previousStatus === 'paused-after-working'
      ) {
        setMaintime(shortRestTime);
      }

      setTimeCounting(true);
      setStatus('resting');
      changeParentColor('bg-purple-300');
      audioStartResting.play();
    }
  };

  // Código dentro de useEffect só vai ser executado se houver alguma alteração na variável mainTime (Como a cada segundo ela está sendo alterada, então o código é executado a cada segundo)
  useEffect(() => {
    if (status === 'working') {
      if (mainTime <= 0) {
        rest(status);
        setPomodoros(pomodoros + 1);
        setMaintime((pomodoros + 1) % 4 === 0 ? longRestTime : shortRestTime);
      }
    }

    if (status === 'resting') {
      if (mainTime <= 0) {
        startWork(status);
        setMaintime(pomodoroTime);
      }
    }
  }, [mainTime]);

  // Código dentro de useEffect só vai ser executado se houver alguma alteração na variável "pomodoros"
  useEffect(() => {
    if (pomodoros > 0 && pomodoros % props.cycles === 0) setCycles(cycles + 1);
  }, [pomodoros]);

  const changeParentColor = (color: string) => {
    if (containerRef.current) {
      setColor(color);

      const element = containerRef.current.parentNode as HTMLDivElement;

      if (element.classList.contains('bg-teal-300')) {
        element.classList.replace('bg-teal-300', color);
        return;
      }

      if (element.classList.contains('bg-red-300')) {
        element.classList.replace('bg-red-300', color);
        return;
      }

      if (element.classList.contains('bg-purple-300')) {
        element.classList.replace('bg-purple-300', color);
        return;
      }
    }
  };

  const newPomodoroConfig = (
    newPomodoroTime: number,
    newShortRestTime: number,
    newLongRestTime: number,
  ): void => {
    setPomodoroTime(newPomodoroTime);
    setShortRestTime(newShortRestTime);
    setLongRestTime(newLongRestTime);
  };

  // Se a variável pomodorotime mudar, executa o código dentro de useEffect
  useEffect(() => {
    setMaintime(pomodoroTime);
  }, [pomodoroTime]);

  return (
    <>
      <div
        className={`container bg-white flex flex-col gap-8 border rounded p-4 w-4/5 max-w-2xl shadow-3xl shadow-black relative`}
        ref={containerRef}
      >
        <h1 className="text-2xl font-semibold text-center">
          You are: {status}
        </h1>

        <p className="text-8xl font-semibold text-center">
          {secondsToMinutes(mainTime)}{' '}
        </p>

        <div className="flex gap-4 justify-around  ">
          <Button
            text="Work"
            className={`work ${buttonCSS(color)}`}
            onClick={() => startWork(status)}
          ></Button>
          <Button
            text="Rest"
            className={`${buttonCSS(color)} `}
            onClick={() => rest(status)}
          ></Button>
          <Button
            text="Pause"
            className={`${buttonCSS(color)} ${timeCounting ? '' : 'hidden'}`}
            onClick={() => stopTimer(status)}
          ></Button>
        </div>

        <div>
          <h2 className="font-semibold">Details:</h2>
          <p>Cycles: {cycles}</p>
          <p className="flex gap-1">
            Total working time: {secondsToHour(workingTime)}
          </p>
          <p>Time blocks (pomodoros): {pomodoros}</p>
        </div>

        <FaGear
          className={`text-5xl p-2 absolute top-0 right-0 cursor-pointer focus:outline-none  focus:fill-blue-600 hover:fill-blue-600 hover:rotate-180 transition-all duration-500 `}
          onClick={() => setConfigurationMode(true)}
          onKeyDown={(event: KeyboardEvent) => {
            if (event.key === 'Enter') setConfigurationMode(true);
          }}
          tabIndex={0}
        />
      </div>

      <div
        className={`${configurationMode ? 'flex' : 'hidden'} items-center justify-center absolute top-0 left-0 w-screen h-screen bg-black-transparent`}
      >
        <div className="bg-slate-500 p-4 rounded w-1/4 min-w-96 relative">
          <h2 className="font-semibold text-center text-xl">
            Configure o Pomodoro:
          </h2>

          <div className={`flex flex-col gap-4 my-2 `}>
            <div className="flex flex-col gap-2">
              <label htmlFor="pomodoro-time">Pomodoro-time</label>

              <div className="flex flex-row items-center gap-2">
                <input
                  type="number"
                  className="focus:ring-0 focus:border-black border"
                  id="pomodoro-time"
                  defaultValue={pomodoroTime}
                  ref={pomodoroTimeRef}
                  onChange={(event) =>
                    setPreviewPomodoroTime(Number(event.target.value))
                  }
                />
                <p>{secondsToMinutes(previewPomodoroTime)}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="short-rest-time">Short-rest-time</label>

              <div className="flex flex-row items-center gap-2">
                <input
                  type="number"
                  className="focus:ring-0 focus:border-black border"
                  id="short-rest-time"
                  defaultValue={shortRestTime}
                  ref={shortRestTimeRef}
                  onChange={(event) =>
                    setPreviewShortRestTime(Number(event.target.value))
                  }
                />
                <p>{secondsToMinutes(previewShortRestTime)}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="long-rest-time">Long-rest-time</label>

              <div className="flex flex-row items-center gap-2">
                <input
                  type="number"
                  className="focus:ring-0 focus:border-black border"
                  id="long-rest-time"
                  defaultValue={longRestTime}
                  ref={longRestTimeRef}
                  onChange={(event) =>
                    setPreviewLongRestTime(Number(event.target.value))
                  }
                />
                <p>{secondsToMinutes(previewLongRestTime)}</p>
              </div>
            </div>

            <Button
              text="Confirm"
              className={`${buttonCSS(color)} w-fit `}
              onClick={() => {
                if (
                  pomodoroTimeRef.current &&
                  shortRestTimeRef.current &&
                  longRestTimeRef.current
                ) {
                  const p1 = Number(pomodoroTimeRef.current.value);
                  const p2 = Number(shortRestTimeRef.current.value);
                  const p3 = Number(longRestTimeRef.current.value);

                  newPomodoroConfig(p1, p2, p3);
                  setConfigurationMode(false);
                }
              }}
            />

            <FaXmark
              className="focus:outline-none text-5xl p-2 absolute top-0 right-0 cursor-pointer focus:fill-red-600 hover:fill-red-600 transition-colors duration-500"
              onClick={() => setConfigurationMode(false)}
              onKeyDown={(event: KeyboardEvent) => {
                if (event.key === 'Enter') setConfigurationMode(false);
              }}
              tabIndex={configurationMode ? 0 : 1}
            />
          </div>
        </div>
      </div>
    </>
  );
}
