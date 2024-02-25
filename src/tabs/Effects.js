import {useContext, useEffect, useState} from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Heading,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack
} from "@chakra-ui/react";
import {ConnectionContext} from "../Contexts";

const animationModes = [
  "Static", "Marquee Left", "Marquee Right", "Flicker"
]

const screenTimeouts = [
  "Never", "30s", "1m", "2m", "5m"
]

export function Effects() {
  const [speed, setSpeed] = useState(20)
  const [animationMode, setAnimationMode] = useState(0)
  const [screenTimeout, setScreenTimeout] = useState(0);

  const connected = useContext(ConnectionContext);
  const { SGuai } = window;

  useEffect(() => {
    setAnimationMode(SGuai?.responses?.[0x23]?.getUint8(5));
    setSpeed(SGuai?.responses?.[0x24]?.getUint8(5));
    setScreenTimeout(SGuai?.responses?.[0x27]?.getUint8(5));
  }, [connected])

  const setAnimSpeed = async (value) => {
    setSpeed(value);
    try {
      await SGuai.send(0x24, [value]);
      await SGuai.read(0x24);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <>
      <Box>
        <Heading as='h4' size='md' my={4}>Screen Timeout</Heading>
        <ButtonGroup variant='outline' spacing='2' isAttached>
          {
            screenTimeouts.map((anim, _idx) => (
              <Button
                key={_idx}
                colorScheme={screenTimeout === _idx ? 'red' : null}
                onClick={async () => {
                  setScreenTimeout(_idx);
                  await SGuai.send(0x27, [_idx]);
                  await SGuai.read(0x27);
                }}
              >{anim}</Button>
            ))
          }
        </ButtonGroup>
      </Box>
      <Box>
        <Heading as='h4' size='md' my={4}>Animation Mode</Heading>
        <ButtonGroup variant='outline' spacing='2' isAttached>
          {
            animationModes.map((anim, _idx) => (
              <Button
                key={_idx}
                colorScheme={animationMode === _idx ? 'red' : null}
                onClick={async () => {
                  setAnimationMode(_idx);
                  await SGuai.send(0x23, [_idx]);
                  await SGuai.read(0x23);
                }}
              >{anim}</Button>
            ))
          }
        </ButtonGroup>
      </Box>
      <Box>
        <Heading as='h4' size='md' my={4}>Animation Speed</Heading>
        <Slider
          onChange={setSpeed}
          max={100}
          min={0}
          value={speed}
          my={8}
          onChangeEnd={setAnimSpeed}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderMark
            value={speed}
            textAlign='center'
            bg='blue.500'
            color='white'
            mt='-10'
            ml='-5'
            w='12'
            borderRadius={5}
          >
            {speed}
          </SliderMark>
          <SliderThumb />
        </Slider>
      </Box>
    </>
  )
}
