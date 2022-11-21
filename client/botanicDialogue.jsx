import 'regenerator-runtime/runtime';
import {createRoot} from "react-dom/client";
import React, { useState, useEffect } from "react";
import SpeechRecognition, {useSpeechRecognition} from "react-speech-recognition";

function App(){
  let port;
  let moisture, light, touch;

  const [input, setInput] = useState();
  const [result, setResult] = useState(); 
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition();
  const synth = window.speechSynthesis;

  const gatherData = (transcript) => {
    let data = {};
    if(!transcript){
      data.prompt = `Write a generic greeting to a human from the perspective of a plant.`;
      return data;
    }

    data = {transcript, moisture, light, touch};

    return data;
  }

  useEffect( () => {
    const getCompletion = async() => {
      const data = gatherData(input);
      console.log(data);

      const completion = await fetch('/generateCompletion', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({data}),
      });
      let result = await completion.json();
      result = result.result.trim();
      console.log(result);
      
      resetTranscript();
      setResult(result);
      let utterance = new SpeechSynthesisUtterance(result);
      utterance.voice = synth.getVoices[1];
      utterance.pitch = 3;
      speechSynthesis.speak(utterance);
    }
    getCompletion();
  }, [input]);

  
  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  if(!isMicrophoneAvailable){
    return <span>Please allow microhphone access.</span>;
  }

  const setupPort = async() => {
    port = await navigator.serial.requestPort();
    console.log(port);

    const serialConnection = new Serial();
    
    serialConnection.on(SerialEvents.CONNECTION_OPENED, onSerialConnectionOpened);
    serialConnection.on(SerialEvents.CONNECTION_CLOSED, onSerialConnectionClosed);
    serialConnection.on(SerialEvents.DATA_RECEIVED, onSerialDataReceived);
    serialConnection.on(SerialEvents.ERROR_OCCURRED, onSerialErrorOccurred);

    await serialConnection.autoConnectAndOpenPreviouslyApprovedPort();
    document.getElementById('activateSerial').style.display="none";
    return;
  }

  const onSerialDataReceived = async(eventSender, newData) => {
    console.log("onSerialDataReceived", newData);
    const data = await JSON.parse(newData);
    moisture = data.moisture;
    light = data.light;
    touch = data.touch;
    return;
  }

  function onSerialErrorOccurred(eventSender, error) {
    console.log("onSerialErrorOccurred", error);
  }

  function onSerialConnectionOpened(eventSender) {
    console.log("onSerialConnectionOpened");
  }

  function onSerialConnectionClosed(eventSender) {
    console.log("onSerialConnectionClosed");
  }

  return (
    <div id="main">
      <button id="activateSerial" onClick={setupPort}>Connect Serial</button>
      <p>Microphone: {listening ? 'on' : 'off'}<br />Hold down to speak.</p>
      <h1>care to talk with me?</h1>
      <button id="micListen" onMouseDown={() => {SpeechRecognition.startListening({continuous: true})}} onMouseUp={SpeechRecognition.stopListening} onClick={() => {setInput(transcript)}}></button>
      <p>Transcript:<br /><i>{transcript}</i></p>
      <p>Result:<br /><i>{result}</i></p>
    </div>
  );

}

const init = () => {
  const container = document.getElementById('app');
  const root = createRoot(container);
  root.render(<App />);
}

window.onload = init;