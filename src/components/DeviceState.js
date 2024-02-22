import {useContext, useEffect, useState} from "react";
import {Box, Button, HStack, Text} from "@chakra-ui/react";
import {LinkIcon} from "@chakra-ui/icons";
import {ConnectionContext} from "../Contexts";
import { FaBatteryThreeQuarters } from "react-icons/fa6";
export function DeviceState() {

  const [connecting, setConnecting] = useState(false);
  const connected = useContext(ConnectionContext);
  const { SGuai } = window;

  const connect = () => {
    SGuai.setConnected(false);
    setConnecting(true);
    window.SGuai.connect(null, () => {
      console.log("device disconnected!");
      SGuai.setConnected(false);
    }).then(() => {
      SGuai.setConnected(true);
      setConnecting(false);
    }).catch((e) => {
      console.log(e);
      setConnecting(false);
    });
  }

  const [battery, setBattery] = useState(100);
  const [temperature, setTemperature] = useState(0);
  const [temperatureMode, setTemperatureMode] = useState("C");

  useEffect(() => {
    setBattery(SGuai?.responses?.[2]?.getUint8(5));
    setTemperature(SGuai?.responses?.[1]?.getUint8(5));
    setTemperatureMode(SGuai?.responses?.[0xb]?.getUint8(5));
  }, [connected])

  if (connected) {
    return (
      <Box p='4'>
        <Box>
          Connected to {SGuai.device.name}
          <br />
            <HStack>
              <Text as='u' color='blue.200' onClick={async () => {
                const t= 1 - temperatureMode;
                await SGuai.send(0xb, [t]);
                setTemperatureMode(t);
                setTemperature("-");
                await SGuai.refresh();
              }}>{temperature} °{temperatureMode ? "F" : "C"}</Text>
              <Text>
                <FaBatteryThreeQuarters style={{ display: "inline-block", verticalAlign: "middle"}} /> {battery}%
              </Text>
            </HStack>
          <Text as='u' onClick={connect}>Re-connect</Text>
          <br />
        </Box>
      </Box>
    )
  }


  return (
    <Box p='4'>
      <Button
        isLoading={connecting}
        colorScheme='teal'
        variant='solid'
        size='lg'
        onClick={connect}
      >
        <LinkIcon mr={2} />{" "}Connect Device
      </Button>
    </Box>
  )
}
