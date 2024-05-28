import React, { useState, useRef, useEffect } from "react";
import { Container, VStack, Text, Input, Button, Box, IconButton } from "@chakra-ui/react";
import { FaUpload } from "react-icons/fa";

const Index = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [waveform, setWaveform] = useState([]);
  const audioRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAudioFile(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    if (audioFile) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioElement = audioRef.current;
      const source = audioContext.createMediaElementSource(audioElement);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      analyser.fftSize = 2048;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const drawWaveform = () => {
        analyser.getByteTimeDomainData(dataArray);
        const canvas = canvasRef.current;
        const canvasCtx = canvas.getContext("2d");
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        canvasCtx.fillStyle = "rgb(200, 200, 200)";
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = "rgb(0, 0, 0)";
        canvasCtx.beginPath();
        const sliceWidth = (canvas.width * 1.0) / bufferLength;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * canvas.height) / 2;
          if (i === 0) {
            canvasCtx.moveTo(x, y);
          } else {
            canvasCtx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
        requestAnimationFrame(drawWaveform);
      };

      audioElement.onplay = () => {
        audioContext.resume().then(() => {
          drawWaveform();
        });
      };
    }
  }, [audioFile]);

  return (
    <Container centerContent maxW="container.md" height="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
      <VStack spacing={4}>
        <Text fontSize="2xl">Upload Audio File and See Waveform</Text>
        <Input type="file" accept="audio/*" onChange={handleFileUpload} display="none" id="audio-upload" />
        <label htmlFor="audio-upload">
          <Button as="span" leftIcon={<FaUpload />}>
            Upload Audio
          </Button>
        </label>
        {audioFile && (
          <>
            <audio ref={audioRef} controls src={audioFile} />
            <Box border="1px" borderColor="gray.200" width="100%" height="200px">
              <canvas ref={canvasRef} width="600" height="200"></canvas>
            </Box>
          </>
        )}
      </VStack>
    </Container>
  );
};

export default Index;
