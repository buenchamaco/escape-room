import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const ESCAPE_ROOM_URL = "https://www.thinglink.com/card/1917747089962435046"; // Replace with your actual URL

  const TONGUE_TWISTERS = [
    { language: "en-US", text: "She sells seashells by the seashore" },
    { language: "en-US", text: "Peter Piper picked a peck of pickled peppers" },
    { language: "es-ES", text: "Tres tristes tigres comen trigo en un trigal" },
    {
      language: "es-ES",
      text: "El amor es una locura que solo el cura lo cura",
    },
  ];

  const normalizeText = (text) =>
    text
      .toLowerCase()
      .replace(/[.,?¿!¡]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const [state, setState] = useState({
    currentIndex: 0,
    message: "Welcome! Click 'Start Challenge' to begin.",
    transcript: "",
    isListening: false,
    browserSupport: false,
  });

  const [recognition, setRecognition] = useState(null);
  const currentTwisterRef = useRef("");

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setState((prev) => ({
        ...prev,
        message: "Speech recognition not supported in this browser",
        browserSupport: false,
      }));
      return;
    }

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = false;
    recognitionInstance.lang = TONGUE_TWISTERS[state.currentIndex].language;
    recognitionInstance.interimResults = false;

    recognitionInstance.onstart = () => {
      setState((prev) => ({
        ...prev,
        isListening: true,
        transcript: "",
        message: `Listen carefully and say: "${currentTwisterRef.current}"`,
      }));
    };

    recognitionInstance.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim().toLowerCase();
      const confidence = event.results[0][0].confidence;

      const normalizedExpected = normalizeText(currentTwisterRef.current);
      const normalizedTranscript = normalizeText(transcript);

      const isCorrect =
        normalizedTranscript === normalizedExpected && confidence >= 0.7;

      if (isCorrect) {
        const nextIndex = state.currentIndex + 1;

        if (nextIndex >= TONGUE_TWISTERS.length) {
          setState((prev) => ({
            ...prev,
            transcript: transcript,
            message: "Redirecting to the next stage...",
          }));

          // Redirect to the escape room URL
          setTimeout(() => {
            window.location.href = ESCAPE_ROOM_URL;
          }, 2000); // 2-second delay for UX
        } else {
          setState((prev) => ({
            ...prev,
            currentIndex: nextIndex,
            transcript: transcript,
            message:
              "Correct! Click 'Start Challenge' for the next tongue twister.",
          }));
        }
      } else {
        setState((prev) => ({
          ...prev,
          transcript: transcript,
          message: "The Mask remains still. Try again and speak more clearly!",
        }));
      }
    };

    recognitionInstance.onerror = (event) => {
      setState((prev) => ({
        ...prev,
        message: `Speech recognition error: ${event.error}`,
        isListening: false,
      }));
    };

    recognitionInstance.onend = () => {
      setState((prev) => ({
        ...prev,
        isListening: false,
      }));
    };

    setRecognition(recognitionInstance);
    setState((prev) => ({ ...prev, browserSupport: true }));
  }, [state.currentIndex]);

  const startChallenge = () => {
    const currentTwister = TONGUE_TWISTERS[state.currentIndex];
    currentTwisterRef.current = currentTwister.text;

    setState((prev) => ({
      ...prev,
      message: `Your tongue twister is: "${currentTwister.text}". Click 'Speak' to begin.`,
      transcript: "",
    }));
  };

  const startListening = () => {
    if (recognition && currentTwisterRef.current) {
      try {
        recognition.lang = TONGUE_TWISTERS[state.currentIndex].language;
        recognition.start();
      } catch (error) {
        setState((prev) => ({
          ...prev,
          message: `Error starting recognition: ${error.message}`,
        }));
      }
    } else {
      setState((prev) => ({
        ...prev,
        message: "Please start the challenge first!",
      }));
    }
  };

  return (
    <div className="app-container">
      <div className="content-box">
        <h1>The Mask of Babel</h1>
        <div className="image-container">
          <img
            src="/statue.jpeg" // Ensure this path is correct
            alt="The Mask of Babel"
            className="mask-image"
          />
          <p className="image-caption">
            The Mask of Babel pulses with energy, awaiting those who dare to
            unlock its secrets.
          </p>
        </div>

        <div className="message-box">
          {state.message}
          {state.transcript && (
            <div
              style={{
                marginTop: "10px",
                fontStyle: "italic",
                color: "#aaaaaa",
              }}
            >
              You said: "{state.transcript}"
            </div>
          )}
        </div>

        <div>
          <button
            className="start-button"
            onClick={startChallenge}
            disabled={
              state.currentIndex >= TONGUE_TWISTERS.length || state.isListening
            }
          >
            {state.currentIndex >= TONGUE_TWISTERS.length
              ? "Challenge Completed"
              : "Start Challenge"}
          </button>

          <button
            className="speak-button"
            onClick={startListening}
            disabled={
              !state.browserSupport ||
              state.isListening ||
              state.currentIndex >= TONGUE_TWISTERS.length
            }
          >
            {state.isListening ? "Listening..." : "Speak"}
          </button>
        </div>

        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${
                  (state.currentIndex / TONGUE_TWISTERS.length) * 100
                }%`,
              }}
            ></div>
          </div>
          <div style={{ marginTop: "10px", color: "#bbbbbb" }}>
            Progress: {state.currentIndex}/{TONGUE_TWISTERS.length}
          </div>
        </div>

        <div className="footer">
          <div>Browser Support: {state.browserSupport ? "Yes" : "No"}</div>
        </div>
      </div>
    </div>
  );
}

export default App;
